
def run_compliance_checks(rows):
    banned = ['disney','marvel','nike','apple','pokemon','barbie']
    out = []
    for r in rows:
        text = f"{r.get('title','')} {r.get('description','')} {r.get('tags','')}".lower()
        hits = [b for b in banned if b in text]
        ok = len(hits)==0
        out.append({'ok': ok, 'reasons': ';'.join(hits)})
    return out
