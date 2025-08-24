
def generate_prompts(niche):
    name = niche.get('name','General') if isinstance(niche, dict) else str(niche)
    return [f"{name} — flat vector, vivid palette, playful vibe, POD-ready, 3000x3000", f"{name} — line art, minimal, high contrast, POD-ready, 3000x3000"]
