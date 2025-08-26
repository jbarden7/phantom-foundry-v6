from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import csv, io

from compliance import run_compliance_checks
from prompts import generate_prompts
from etsy_worker import queue_draft

from routes.etsy_login import router as etsy_login_router
from routes.integrations import router as integrations_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*']
)

app.include_router(etsy_login_router)
app.include_router(integrations_router)

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/niche/find')
def niche_find(body: dict):
    """
    Lightweight placeholder for niche finder; your frontend
    calls this to render cards. Replace with your real logic when ready.
    """
    niche = (body or {}).get('niche') or 'Funny Cat Dad Mugs'
    return {
        'results': [
            {'name': niche, 'demand': 82, 'competition': 35, 'profit': 48}
        ]
    }

@app.post('/design/prompts')
def design_prompts(body: dict):
    """
    Generates design prompt ideas for the given niche.
    """
    return {'prompts': generate_prompts((body or {}).get('niche', 'cats'))}

@app.post('/etsy/drafts')
async def etsy_drafts(file: UploadFile = File(...)):
    """
    Receives a CSV of draft listings, runs compliance checks, and queues drafts.
    - Draft-only by default (safe).
    - queue_draft is a stub; wire to real Playwright actions later.
    CSV columns typically include: title, description, tags, price, etc.
    """
    text = (await file.read()).decode('utf-8', 'ignore')
    rows = list(csv.DictReader(io.StringIO(text)))
    results = run_compliance_checks(rows)
    logs = []
    for i, r in enumerate(rows):
        title = r.get("title") or f"Item #{i+1}"
        if results[i]['ok']:
            queue_draft(r) 
            logs.append(f'Queued draft for {title}')
        else:
            reasons = results[i].get("reasons") or []
            logs.append(f'Compliance fail for {title} -> {", ".join(reasons) if reasons else "unknown reason"}')
    return {'logs': logs}
