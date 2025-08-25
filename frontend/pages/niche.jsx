import { useState } from 'react';

export default function Niche(){
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function find() {
    setLoading(true); setError(''); setRes(null);
    const seedEl = document.getElementById('seed');
    const regionEl = document.getElementById('region');
    if(!seedEl || !regionEl){ setError('Inputs not found'); setLoading(false); return; }

    const body = {
      seed: seedEl.value || '',
      region: regionEl.value || 'UK'
    };

    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/niche/find`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body)
      });
      if(!r.ok){
        const txt = await r.text();
        throw new Error(`Backend error ${r.status}: ${txt}`);
      }
      const j = await r.json();
      setRes(j);
    } catch (e){
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:24, fontFamily:'system-ui'}}>
      <h2>Niche Finder</h2>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:12}}>
        <input id="seed" defaultValue="cat dad jokes" placeholder="Enter a seed idea" style={{padding:8, minWidth:260}} />
        <select id="region" defaultValue="UK" style={{padding:8}}>
          <option>UK</option><option>EU</option><option>US</option>
        </select>
        <button onClick={find} style={{padding:'8px 12px'}}>Find</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <pre style={{whiteSpace:'pre-wrap', color:'#ffb4b4', background:'#2b1b1b', padding:12, borderRadius:8}}>{error}</pre>}
      {res && <pre style={{whiteSpace:'pre-wrap', background:'#0f1320', padding:12, borderRadius:8}}>{JSON.stringify(res, null, 2)}</pre>}

      <p style={{opacity:.8, marginTop:12}}>Backend: <code>{process.env.NEXT_PUBLIC_API_BASE || '(not set)'}</code></p>
    </div>
  );
}
