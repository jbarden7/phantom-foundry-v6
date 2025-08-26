import os
from fastapi import APIRouter
from .etsy_login import _ETSY_STORAGE_STATE

router = APIRouter()

@router.get("/integrations/status")
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
