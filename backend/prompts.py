from typing import List

def generate_prompts(niche: str) -> List[str]:
    niche = (niche or "cats").strip()
    # Lightweight local generator to avoid API dependency; swap to OpenAI if desired.
    templates = [
        "Create a minimalist {niche} quote design in bold sans-serif, high contrast, centered layout.",
        "Vintage distressed badge for {niche}, circular emblem, subtle texture, limited 3-color palette.",
        "Cute cartoon vector for {niche}, soft outlines, friendly vibes, print-ready on white or black.",
        "Modern typographic stack for {niche}, alternating weights, playful kerning, poster-ready.",
        "Geometric pattern inspired by {niche}, repeating tiles, seamless, suitable for wrapping paper."
    ]
    return [t.format(niche=niche) for t in templates]
