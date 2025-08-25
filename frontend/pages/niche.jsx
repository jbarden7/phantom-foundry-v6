import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Niche(){
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function find() {
    setLoading(true); setError(''); setRes(null);
    const seed = document.getElementById('seed')?.value || '';
    const region = document.getElementById('region')?.value || 'UK';
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/niche/find`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ seed, region })
      });
      if(!r.ok){ throw new Error('Backend error ' + r.status); }
      const j = await r.json();
      setRes(j);
    } catch(e){ setError(String(e)); }
    finally{ setLoading(false); }
  }

  return (
    <>
      <section className="panel" style={{margin:'16px 0'}}>
        <h2 style={{marginTop:0}}>Niche Finder</h2>
        <div className="row">
          <input id="seed" className="input" placeholder="e.g., cat dad jokes" style={{minWidth:280}} />
          <select id="region" className="input"><option>UK</option><option>EU</option><option>US</option></select>
          <Button onClick={find}>Find</Button>
        </div>
        <p className="help">Tip: start with a hobby, profession, or meme.</p>
      </section>

      {error && <div className="toast err">{error}</div>}
      {loading && <div className="toast warn">Searching niches…</div>}

      <div className="grid" style={{marginTop:16}}>
        {(res?.results || []).map((r, i) => (
          <Card key={i} title={r.name} subtitle={`Demand ${r.demand} · Competition ${r.competition}`} />
        ))}
      </div>
    </>
  );
}
