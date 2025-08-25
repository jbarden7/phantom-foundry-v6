import { useState } from 'react';

export default function Prompts(){
  const [niche, setNiche] = useState('retro cat astronaut');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate(){
    setLoading(true); setError(''); setResult(null);
    try{
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/design/prompts`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ niche })
      });
      if(!r.ok){ throw new Error('Backend error ' + r.status); }
      const j = await r.json();
      setResult(j);
    }catch(e){ setError(String(e)); }
    finally{ setLoading(false); }
  }

  return (
    <div style={{padding:24, fontFamily:'system-ui'}}>
      <h2>AI Prompt Engine</h2>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:12}}>
        <input value={niche} onChange={e=>setNiche(e.target.value)} style={{padding:8, minWidth:320}} />
        <button onClick={generate} style={{padding:'8px 12px'}}>Generate</button>
      </div>
      {loading && <p>Generating…</p>}
      {error && <pre style={{whiteSpace:'pre-wrap', color:'#ffb4b4', background:'#2b1b1b', padding:12, borderRadius:8}}>{error}</pre>}
      {result && <pre style={{whiteSpace:'pre-wrap', background:'#0f1320', padding:12, borderRadius:8}}>{JSON.stringify(result, null, 2)}</pre>}
      <p style={{opacity:.8, marginTop:12}}>Backend: <code>{process.env.NEXT_PUBLIC_API_BASE || '(not set)'}</code></p>
    </div>
  );
}
