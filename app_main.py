
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import csv, io
from compliance import run_compliance_checks
from prompts import generate_prompts
from etsy_worker import queue_draft
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

@app.get('/health')
def health(): return {'status':'ok'}

@app.post('/niche/find')
def niche_find(body: dict):
    return {'results': [{'name':'Funny Cat Dad Mugs','demand':82,'competition':35,'profit':48}]}

@app.post('/design/prompts')
def design_prompts(body: dict):
    return {'prompts': generate_prompts(body.get('niche'))}

@app.post('/etsy/drafts')
async def etsy_drafts(file: UploadFile = File(...)):
    text = (await file.read()).decode('utf-8','ignore')
    rows = list(csv.DictReader(io.StringIO(text)))
    results = run_compliance_checks(rows)
    logs = []
    for i,r in enumerate(rows):
        if results[i]['ok']:
            queue_draft(r)
            logs.append(f'Queued draft for {r.get("title")}')
        else:
            logs.append(f'Compliance fail for {r.get("title")} -> {results[i]["reasons"]}')
    return {'logs': logs}
