import { useEffect, useState } from 'react';

function Status({label, ok, message}){
  return (
    <div className="card">
      <h3 style={{marginTop:0}}>{label}</h3>
      <div className={ok ? 'toast ok' : 'toast err'} style={{marginTop:8}}>
        {ok ? 'Connected' : 'Not connected'}{message ? ' — '+message : ''}
      </div>
    </div>
  );
}

export default function Integrations(){
  const api = process.env.NEXT_PUBLIC_API_BASE || '';
  const [health, setHealth] = useState({ok:false, msg:''});
  const [services, setServices] = useState([]);

  useEffect(()=>{
    async function run(){
      try{
        const r = await fetch(`${api}/health`);
        const j = await r.json().catch(()=>({}));
        setHealth({ok:r.ok, msg: j.status || r.statusText});
      }catch(e){ setHealth({ok:false, msg:String(e)}); }

      try{
        const r = await fetch(`${api}/integrations/status`);
        if(!r.ok){
          setServices([{label:'Backend Integrations', ok:false, message:`${r.status} ${r.statusText} (endpoint optional)`}]);
        } else {
          const j = await r.json();
          const list = Array.isArray(j) ? j : (Array.isArray(j.services) ? j.services : []);
          setServices(list.map(x=>({label:x.label||'Service', ok:!!x.ok, message:x.message||''})));
        }
      }catch(e){
        setServices([{label:'Backend Integrations', ok:false, message:String(e)}]);
      }
    }
    if(api) run();
  },[api]);

  return (
    <main className="container" style={{paddingTop:24}}>
      <h2>Integrations</h2>
      <p className="help">Checks your backend and services. API Base: <code>{api||'(not set)'}</code></p>

      <div className="grid" style={{marginTop:16}}>
        <Status label="Backend /health" ok={health.ok} message={health.msg} />
        {services.length ? services.map((s,i)=>(
          <Status key={i} label={s.label} ok={s.ok} message={s.message} />
        )) : <div className="card"><h3>No services reported</h3><p className="small">If your backend doesn’t expose <code>/integrations/status</code>, this is normal.</p></div>}
      </div>
    </main>
  );
}
