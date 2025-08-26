# === BEGIN backend/app_main.py ===
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import csv, io, os, sys, importlib.util
from typing import Optional
from playwright.async_api import async_playwright, TimeoutError as PWTimeout

# ---------- Utility: safe fallback import from file ----------
def _fallback_import(module_name: str, file_path: str):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec and spec.loader:
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        sys.modules[module_name] = mod
        return mod
    raise ModuleNotFoundError(f"Could not load module {module_name} from {file_path}")

# ---------- Try normal imports first; fallback to file paths ----------
try:
    from compliance import run_compliance_checks
except ModuleNotFoundError:
    run_compliance_checks = _fallback_import(
        "compliance", os.path.join(os.path.dirname(__file__), "compliance.py")
    ).run_compliance_checks

try:
    from prompts import generate_prompts
except ModuleNotFoundError:
    generate_prompts = _fallback_import(
        "prompts", os.path.join(os.path.dirname(__file__), "prompts.py")
    ).generate_prompts

try:
    from etsy_worker import queue_draft
except ModuleNotFoundError:
    queue_draft = _fallback_import(
        "etsy_worker", os.path.join(os.path.dirname(__file__), "etsy_worker.py")
    ).queue_draft

# ---------- Global session store ----------
_ETSY_STORAGE_STATE: Optional[dict] = None  # session persists while container lives

def _need_env(name: str) -> str:
    v = os.getenv(name, "")
    if not v:
        raise HTTPException(status_code=400, detail=f"Missing env var: {name}")
    return v

# ---------- Etsy login via Playwright ----------
async def _etsy_login_with_email_password(email: str, password: str, otp_code: Optional[str] = None):
    ua = os.getenv("ETSY_USER_AGENT", "")
    launch_args = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
    async with async_playwright() as p:
        browser = await p.chromium.launch(**launch_args)
        context_kwargs = {}
        if ua:
            context_kwargs["user_agent"] = ua
        context_kwargs.update({"locale": "en-GB", "timezone_id": "Europe/London"})
        context = await browser.new_context(**context_kwargs)
        page = await context.new_page()
        try:
            await page.goto("https://www.etsy.com/signin", timeout=60000)

            # Accept cookie banner if present (best effort)
            for sel in [
                "button:has-text('Accept all')",
                "button:has-text('Accept')",
                "[data-gdpr-single-accept]",
                "#gdpr-single-accept"
            ]:
                try:
                    if await page.locator(sel).first.is_visible(timeout=1500):
                        await page.locator(sel).first.click()
                        break
                except Exception:
                    pass

            # Email
            await page.wait_for_selector("input[name='email'], #join_neu_email_field", timeout=30000)
            await page.fill("input[name='email'], #join_neu_email_field", email)
            await page.locator("button:has-text('Continue'), button[type='submit']").first.click()

            # Password
            await page.wait_for_selector("input[name='password'], #join_neu_password_field", timeout=30000)
            await page.fill("input[name='password'], #join_neu_password_field", password)
            await page.locator("button:has-text('Sign in'), button[type='submit']").first.click()

            # Detect logged in or 2FA
            logged_in = page.locator("[data-id='your-account-panel-toggle'], a[href*='your/account']")
            otp_input = page.locator("input[type='text'][name*='code'], input[name='code'], input[id*='code']")

            await page.wait_for_timeout(1200)
            if await logged_in.count() > 0:
                state = await context.storage_state()
                await browser.close()
                return {"ok": True, "twofa_required": False, "storage_state": state, "message": "Logged in"}

            twofa = False
            try:
                twofa = await otp_input.first.is_visible(timeout=4000)
            except Exception:
                twofa = False

            if twofa:
                if not otp_code:
                    await browser.close()
                    return {"ok": False, "twofa_required": True, "storage_state": None, "message": "2FA required"}
                await otp_input.first.fill(otp_code)
                for sel in ["button:has-text('Confirm')", "button:has-text('Verify')", "button[type='submit']"]:
                    try:
                        if await page.locator(sel).first.is_visible(timeout=1500):
                            await page.locator(sel).first.click()
                            break
                    except Exception:
                        pass
                try:
                    await logged_in.first.wait_for(timeout=30000)
                    state = await context.storage_state()
                    await browser.close()
                    return {"ok": True, "twofa_required": False, "storage_state": state, "message": "Logged in with 2FA"}
                except PWTimeout:
                    await browser.close()
                    return {"ok": False, "twofa_required": True, "storage_state": None, "message": "2FA failed/timed out"}

            await browser.close()
            return {"ok": False, "twofa_required": False, "storage_state": None, "message": "Login failed"}
        except Exception as e:
            try:
                await browser.close()
            except Exception:
                pass
            return {"ok": False, "twofa_required": False, "storage_state": None, "message": f"Error: {e}"}

# ---------- FastAPI app ----------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://phantom-foundry-frontend.vercel.app",  # your Vercel frontend
        "https://phantom-foundry.onrender.com"          # your Render backend
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Etsy login endpoints (UI can call these)
@app.post("/etsy/try-login")
async def etsy_try_login(payload: dict = Body(default={})):
    email = _need_env("ETSY_EMAIL")
    password = _need_env("ETSY_PASSWORD")
    otp_code = (payload or {}).get("otp_code")
    result = await _etsy_login_with_email_password(email, password, otp_code=otp_code)
    global _ETSY_STORAGE_STATE
    if result.get("ok") and result.get("storage_state"):
        _ETSY_STORAGE_STATE = result["storage_state"]
    if result.get("twofa_required") and not result.get("ok"):
        raise HTTPException(status_code=428, detail="2FA required")
    return result

@app.get("/etsy/session-status")
async def etsy_session_status():
    ok = _ETSY_STORAGE_STATE is not None
    return {"service": "Etsy", "ok": ok, "message": "Session cached" if ok else "Not logged in"}

# Integrations tile for the frontend
@app.get("/integrations/status")
async def integrations_status():
    items = []
    items.append({
        "label": "OpenAI",
        "ok": bool(os.getenv("OPENAI_API_KEY")),
        "message": "API key present" if os.getenv("OPENAI_API_KEY") else "Missing OPENAI_API_KEY"
    })
    items.append({
        "label": "Etsy",
        "ok": _ETSY_STORAGE_STATE is not None,
        "message": "Session cached" if _ETSY_STORAGE_STATE else "Not logged in"
    })
    return items

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/niche/find")
def niche_find(body: dict):
    niche = (body or {}).get("niche") or "Funny Cat Dad Mugs"
    return {"results": [{"name": niche, "demand": 82, "competition": 35, "profit": 48}]}

@app.post("/design/prompts")
def design_prompts(body: dict):
    return {"prompts": generate_prompts((body or {}).get("niche", "cats"))}

@app.post("/etsy/drafts")
async def etsy_drafts(file: UploadFile = File(...)):
    text = (await file.read()).decode("utf-8", "ignore")
    rows = list(csv.DictReader(io.StringIO(text)))
    results = run_compliance_checks(rows)
    logs = []
    for i, r in enumerate(rows):
        title = r.get("title") or f"Item #{i+1}"
        if results[i]["ok"]:
            queue_draft(r)  # stubbed; implement real Playwright worker later
            logs.append(f"Queued draft for {title}")
        else:
            reasons = results[i].get("reasons") or []
            logs.append(f"Compliance fail for {title} -> {', '.join(reasons) if reasons else 'unknown reason'}")
    return {"logs": logs}
# === END backend/app_main.py ===
