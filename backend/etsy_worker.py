import asyncio
from typing import Dict, List

# In-memory "queue" for demo; swap for real worker (e.g., RQ/Celery) later.
_queue: List[Dict] = []

def queue_draft(row: Dict):
    """
    Stub: queues a draft item. You can expand this to:
    - use Playwright with a logged-in context (see routes.etsy_login.get_logged_in_context)
    - navigate to Etsy's create listing page
    - fill fields (title, description, price) and save as draft
    For now, we add it to an in-memory queue to keep the endpoint responsive.
    """
    _queue.append(row)

async def _worker_loop():
    # This is where you'd implement real Playwright actions to create draft listings.
    # Kept as a no-op to stay draft-only and safe by default.
    while True:
        if _queue:
            item = _queue.pop(0)
            # TODO: implement real draft creation with Playwright here.
            # For now we just simulate processing time.
            await asyncio.sleep(0.5)
        else:
            await asyncio.sleep(1)

# Optional: launch the worker on startup if you wire it into FastAPI lifespan events.
