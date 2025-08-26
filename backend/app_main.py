from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import csv, io, os, sys, importlib.util

def _fallback_import(module_name: str, file_path: str):
    """
    Safe loader that imports a module from a specific file path if the normal
    package import isn't available. Returns the loaded module.
    """
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec and spec.loader:
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        sys.modules[module_name] = mod
        return mod
    raise ModuleNotFoundError(f"Could not load module {module_name} from {file_path}")

# --- Import local modules (package style first, then file fallback) ---

# compliance / prompts / worker
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

# routers
try:
    from routes.etsy_login import router as etsy_login_router
except ModuleNotFoundError:
    etsy_login_router = _fallback_import(
        "routes.etsy_login", os.path.join(os.path.dirname(__file__), "routes", "etsy_login.py")
    ).router

try:
    from routes.integrations import router as integrations_router
except ModuleNotFoundError:
    integrations_router = _fallback_import(
        "routes.integrations", os.path.join(os.path.dirname(__file__), "routes", "integrations.py")
    ).router

# --- FastAPI app ---

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(etsy_login_router)
app.include_router(integrations_router)

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
            queue_draft(r)
            logs.append(f"Queued draft for {title}")
        else:
            reasons = results[i].get("reasons") or []
            logs.append(f"Compliance fail for {title} -> {', '.join(reasons) if reasons else 'unknown reason'}")
    return {"logs": logs} 
