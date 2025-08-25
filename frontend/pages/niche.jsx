import { useEffect, useState } from 'react';

function useCompact(){
  const [compact, setCompact] = useState(false);
  useEffect(()=>{
    const v = localStorage.getItem('pf_compact_cards') === '1';
    setCompact(v);
    const h = ()=>setCompact(localStorage.getItem('pf_compact_cards') === '1');
    window.addEventListener('pf:compact', h);
    return ()=>window.removeEventListener('pf:compact', h);
  },[]);
  return compact;
}

function imgForTerm(term){
  const q = encodeURIComponent(term || 'print on demand');
  return `https://source.unsplash.com/600x400/?${q}`;
}
function fallbackImg(term){
  const q = encodeURIComponent(term || 'print on demand');
  return `https://picsum.photos/seed/${q}/600/400`;
}

function badge(text, type, title){
  const cls = type==='ok' ? 'badge ok' : type==='warn' ? 'badge warn' : 'badge err';
  return <span className={cls} style={{marginRight:6}} title={title} aria-label={title}>{text}</span>;
}

export default function Niche(){
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const compact = useCompact();

  async function find() {
    setLoading(true); setError(''); setRes(null);
    const seed = document.getElementById('seed')?.value || 'cat dad jokes';
    const region = document.getElementById('region')?.value || 'UK';
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/niche/find`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ seed, region })
      });
      if(!r.ok){ throw new Error('Backend error ' + r.status); }
      const j = await r.json();
      const results = Array.isArray(j.results) ? j.results.map(x=> (typeof x==='string' ? { name:x, demand:'—', competition:'—' } : x)) : [];
      setRes({results});
    } catch(e){ setError(String(e)); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ find(); },[]);

  function toPrompts(name){
    const url = `/prompts?niche=${encodeURIComponent(name)}`;
    if (typeof window !== 'undefined') window.location.href = url;
  }

  function demandBadge(val){
    if(val==='—') return badge('Demand —','warn','No demand data yet');
    const v = (''+val).toLowerCase();
    if(v.includes('high')) return badge('Demand 🟢 '+val,'ok','High demand (good)');
    if(v.includes('low')) return badge('Demand 🔴 '+val,'err','Low demand (risky)');
    return badge('Demand '+val,'warn','Moderate/unknown demand');
  }
  function compBadge(val){
    if(val==='—') return badge('Comp —','warn','No competition data yet');
    const v = (''+val).toLowerCase();
    if(v.includes('low')) return badge('Comp 🟢 '+val,'ok','Low competition (good)');
    if(v.includes('high')) return badge('Comp 🔴 '+val,'err','High competition (risky)');
    return badge('Comp '+val,'warn','Moderate/unknown competition');
  }

  return (
    <main className="container" style={{paddingTop:24}}>
      <section className="panel" style={{margin:'16px 0'}}>
        <h2 style={{marginTop:0}}>Niche Finder</h2>
        <div className="row">
          <input id="seed" className="input" defaultValue="cat dad jokes" placeholder="e.g., cat dad jokes" style={{minWidth:280}} />
          <select id="region" className="input"><option>UK</option><option>EU</option><option>US</option></select>
          <button className="btn" onClick={find}>Find</button>
        </div>
        <p className="help">Tip: try hobbies, professions, memes, occasions, or pet breeds.</p>
      </section>

      {error && <div className="toast err">{error}</div>}
      {loading && <div className="toast warn">Searching niches…</div>}

      <div className="grid" style={{marginTop:16}}>
        {(res?.results || []).map((r, i) => (
          <section key={i} className="card" style={{padding:0, overflow:'hidden'}}>
            <img
              src={imgForTerm(r.name)}
              alt={r.name}
              onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src = fallbackImg(r.name); }}
              style={{width:'100%', height: compact ? 140 : 200, objectFit:'cover', display:'block'}}
            />
            <div style={{padding:16}}>
              <h3 style={{margin:'0 0 4px 0'}}>{r.name}</h3>
              <div style={{marginBottom:8}}>
                {demandBadge(r.demand)} {compBadge(r.competition)}
              </div>
              <div className="row" style={{marginTop:12}}>
                <button className="btn" onClick={()=>toPrompts(r.name)}>Generate Prompts</button>
                <a className="btn ghost" href={`/uploads`}>Prepare Upload</a>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
