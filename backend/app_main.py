# backend/app_main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import csv, io, os, sys, importlib.util
from typing import Optional

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

# ---------- Inlined Etsy Login (no import from routes) ----------
from playwright.async_api import async_playwright, TimeoutError as PWTimeout

_ETSY_STORAGE_STATE: Optional[dict] = None  # session persists while container lives

def _need_env(name: str) -> str:
    v = os.getenv(name, "")
    if not v:
        raise HTTPException(status_code=400, detail=f"Missing env var: {name}")
    return v

async def _etsy_login_with_email_password(email: str, password: str, otp_code: Optional[str] = None):
    """
    Robust Etsy login handler:
      - Handles cookie banners
      - Tries multiple selectors (labels/roles/CSS)
      - Optional ETSY_LOGIN_URL (default Etsy signin)
      - Optional ETSY_USER_AGENT to mimic your browser
      - Saves /tmp/etsy_*.png and .html on failure + /tmp/etsy-trace.zip
    """
    ua = os.getenv("ETSY_USER_AGENT", "")
    login_url = os.getenv("ETSY_LOGIN_URL", "https://www.etsy.com/signin")
    launch_args = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}

    async with async_playwright() as p:
        browser = await p.chromium.launch(**launch_args)
        context_kwargs = {"locale": "en-GB", "timezone_id": "Europe/London"}
        if ua:
            context_kwargs["user_agent"] = ua
        context = await browser.new_context(**context_kwargs)
        page = await context.new_page()

        # Helper: dump screenshot + HTML + trace for debugging
        async def _debug_dump(prefix="etsy"):
            try:
                await page.screenshot(path=f"/tmp/{prefix}.png", full_page=True)
                html = await page.content()
                with open(f"/tmp/{prefix}.html", "w", encoding="utf-8") as f:
                    f.write(html)
            except Exception:
                pass
            try:
                await context.tracing.stop(path="/tmp/etsy-trace.zip")
            except Exception:
                pass

        try:
            # Start tracing (best effort)
            try:
                await context.tracing.start(screenshots=True, snapshots=True, sources=False)
            except Exception:
                pass

            # Navigate to login
            await page.goto(login_url, wait_until="domcontentloaded", timeout=60000)
            try:
                await page.wait_for_load_state("networkidle", timeout=15000)
            except Exception:
                pass

            # Cookie/GDPR banners (best effort)
            cookie_selectors = [
                "button:has-text('Accept all')",
                "button:has-text('Accept')",
                "[data-gdpr-single-accept]",
                "#gdpr-single-accept",
                "button[aria-label*='Accept']",
            ]
            for sel in cookie_selectors:
                try:
                    loc = page.locator(sel).first
                    if await loc.is_visible(timeout=1000):
                        await loc.click()
                        break
                except Exception:
                    pass

            # EMAIL: try several locators
            email_locators = [
                page.get_by_label("Email", exact=False),
                page.get_by_role("textbox", name=lambda n: n and "email" in n.lower()),
                page.locator("input[type='email']"),
                page.locator("input[name='email']"),
                page.locator("#join_neu_email_field"),
            ]
            filled_email = False
            for loc in email_locators:
                try:
                    await loc.wait_for(timeout=8000)
                    await loc.fill(email, timeout=8000)
                    filled_email = True
                    break
                except Exception:
                    continue
            if not filled_email:
                await _debug_dump("etsy_email_fail")
                await browser.close()
                return {
                    "ok": False, "twofa_required": False, "storage_state": None,
                    "message": "Email field not found (saved /tmp/etsy_email_fail.png/.html)"
                }

            # CONTINUE after email (not every flow shows this, so best effort)
            continue_buttons = [
                page.get_by_role("button", name=lambda n: n and ("continue" in n.lower() or "next" in n.lower())),
                page.locator("button[type='submit']"),
                page.locator("button:has-text('Continue')"),
                page.locator("button:has-text('Sign in')"),
            ]
            for btn in continue_buttons:
                try:
                    if await btn.is_visible(timeout=1500):
                        await btn.click()
                        break
                except Exception:
                    continue

            # Short pause; then look for password
            try:
                await page.wait_for_timeout(1200)
            except Exception:
                pass

            # PASSWORD: try several locators
            password_locators = [
                page.get_by_label("Password", exact=False),
                page.locator("input[type='password']"),
                page.locator("#join_neu_password_field"),
                page.locator("input[name='password']"),
            ]
            filled_pass = False
            for loc in password_locators:
                try:
                    await loc.wait_for(timeout=8000)
                    await loc.fill(password, timeout=8000)
                    filled_pass = True
                    break
                except Exception:
                    continue
            if not filled_pass:
                await _debug_dump("etsy_password_fail")
                await browser.close()
                return {
                    "ok": False, "twofa_required": False, "storage_state": None,
                    "message": "Password field not found (saved /tmp/etsy_password_fail.png/.html)"
                }

            # Click Sign in / Submit
            signin_buttons = [
                page.get_by_role("button", name=lambda n: n and ("sign in" in n.lower() or "log in" in n.lower())),
                page.locator("button[type='submit']"),
                page.locator("button:has-text('Sign in')"),
                page.locator("button:has-text('Log in')"),
            ]
            for btn in signin_buttons:
                try:
                    if await btn.is_visible(timeout=2000):
                        await btn.click()
                        break
                except Exception:
                    continue

            # Check for logged-in indicator or 2FA prompt
            logged_in = page.locator("[data-id='your-account-panel-toggle'], a[href*='your/account']")
            otp_input = page.locator("input[type='text'][name*='code'], input[name='code'], input[id*='code']")

            # If account UI appears, we're done
            try:
                await logged_in.first.wait_for(timeout=8000)
                state = await context.storage_state()
                await context.tracing.stop(path="/tmp/etsy-trace.zip")
                await browser.close()
                return {"ok": True, "twofa_required": False, "storage_state": state, "message": "Logged in"}
            except Exception:
                pass

            # 2FA flow
            requires_2fa = False
            try:
                requires_2fa = await otp_input.first.is_visible(timeout=4000)
            except Exception:
                requires_2fa = False

            if requires_2fa:
                if not otp_code:
                    await context.tracing.stop(path="/tmp/etsy-trace.zip")
                    await browser.close()
                    return {"ok": False, "twofa_required": True, "storage_state": None, "message": "2FA required"}

                await otp_input.first.fill(otp_code)
                verify_buttons = [
                    page.get_by_role("button", name=lambda n: n and ("verify" in n.lower() or "confirm" in n.lower())),
                    page.locator("button:has-text('Confirm')"),
                    page.locator("button:has-text('Verify')"),
                    page.locator("button[type='submit']"),
                ]
                for btn in verify_buttons:
                    try:
                        if await btn.is_visible(timeout=1500):
                            await btn.click()
                            break
                    except Exception:
                        continue

                try:
                    await logged_in.first.wait_for(timeout=20000)
                    state = await context.storage_state()
                    await context.tracing.stop(path="/tmp/etsy-trace.zip")
                    await browser.close()
                    return {"ok": True, "twofa_required": False, "storage_state": state, "message": "Logged in with 2FA"}
                except Exception:
                    await _debug_dump("etsy_2fa_fail")
                    await browser.close()
                    return {
                        "ok": False, "twofa_required": True, "storage_state": None,
                        "message": "2FA failed/timed out (saved /tmp/etsy_2fa_fail.png/.html)"
                    }

            # Neither logged in nor 2FA appeared
            await _debug_dump("etsy_login_unknown")
            await browser.close()
            return {
                "ok": False, "twofa_required": False, "storage_state": None,
                "message": "Login flow did not reach expected state (saved /tmp/etsy_login_unknown.png/.html)"
            }

        except Exception as e:
            await _debug_dump("etsy_login_error")
            try:
                await browser.close()
            except Exception:
                pass
            return {"ok": False, "twofa_required": False, "storage_state": None, "message": f"Error: {e}"}

# ---------- FastAPI app ----------
app = FastAPI()

# Lock CORS to your frontend(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://phantom-foundry-frontend.vercel.app",  # your Vercel UI
        "https://phantom-foundry.onrender.com",         # optional: backend origin for direct testing
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
        # 428 = Precondition Required (signals UI to ask for OTP)
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
