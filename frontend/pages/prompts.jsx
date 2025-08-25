import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

function useQuery(){
  const [q, setQ] = useState({});
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    const obj = {}; u.searchParams.forEach((v,k)=>obj[k]=v);
    setQ(obj);
  },[]);
  return q;
}

export default function Prompts(){
  const q = useQuery();
  const [niche, setNiche] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ if (q.niche) setNiche(q.niche); },[q.niche]);

  function copy(text){ navigator.clipboard.writeText(text); }

  async function generate(){
    if(!niche) return;
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
    <>
      <section className="panel" style={{margin:'16px 0'}}>
        <h2 style={{marginTop:0}}>AI Prompt Engine</h2>
        <div className="row">
          <input className="input" value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g., retro cat astronaut" style={{minWidth:320}} />
          <button className="btn" onClick={generate}>Generate</button>
        </div>
        <p className="help">Simple mode; Pro mode adds size/style/negative prompts later.</p>
      </section>

      {error && <div className="toast err">{error}</div>}
      {loading && <div className="toast warn">Generating prompts…</div>}

      <div className="grid" style={{marginTop:16}}>
        {(result?.prompts || []).map((p, i) => (
          <Card key={i} title={`Prompt ${i+1}`}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
              <div className="small" style={{whiteSpace:'pre-wrap'}}>{p}</div>
              <button className="copy" onClick={()=>copy(p)}>Copy</button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
