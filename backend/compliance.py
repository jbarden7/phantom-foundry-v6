from typing import List, Dict

BANNED_TERMS = {
    "disney", "pixar", "marvel", "pokemon", "star wars", "harry potter",
    "nike", "adidas", "gucci", "apple", "tesla"
}
BANNED_PATTERNS = [
    "celebrity", "official logo", "movie quote"
]

def _fails_text(s: str) -> List[str]:
    reasons = []
    s_low = (s or "").lower()
    for term in BANNED_TERMS:
        if term in s_low:
            reasons.append(f"Contains possibly trademarked term: {term}")
    for pat in BANNED_PATTERNS:
        if pat in s_low:
            reasons.append(f"Potential IP risk pattern: {pat}")
    return reasons

def run_compliance_checks(rows: List[Dict]) -> List[Dict]:
    """
    Simple, fast offline checks to reduce obvious takedown risks.
    Real trademark checks (USPTO, etc.) should be done upstream or by a separate service.
    """
    out = []
    for r in rows:
        title = r.get("title", "")
        desc = r.get("description", "")
        tags = " ".join((r.get("tags") or "").split(","))

        reasons = []
        reasons += _fails_text(title)
        reasons += _fails_text(desc)
        reasons += _fails_text(tags)

        ok = len(reasons) == 0
        out.append({"ok": ok, "reasons": reasons})
    return out
