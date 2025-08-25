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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function refresh(){
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

  useEffect(()=>{ if(api) refresh(); },[api]);

  async function loginEtsy(){
    if(!api){ alert('API base not set'); return; }
    setBusy(true); setMsg('Contacting Etsy…');
    try{
      const r = await fetch(`${api}/etsy/try-login`, { method:'POST' });
      const j = await r.json().catch(()=>({}));
      if(r.status === 428 || j?.detail === '2FA required' || j?.twofa_required){
        const code = prompt('Enter your Etsy 2FA code:');
        if(!code){ setMsg('2FA cancelled'); setBusy(false); return; }
        setMsg('Submitting 2FA…');
        const r2 = await fetch(`${api}/etsy/try-login`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ otp_code: code })
        });
        const j2 = await r2.json().catch(()=>({}));
        if(r2.ok && (j2.ok || j2.message?.includes('Logged in'))){
          setMsg('Logged in to Etsy ✅');
        } else {
          setMsg('2FA failed: ' + (j2.detail || j2.message || r2.statusText));
        }
      } else if (r.ok && (j.ok || j.message?.includes('Logged in'))) {
        setMsg('Logged in to Etsy ✅');
      } else {
        setMsg('Login failed: ' + (j.detail || j.message || r.statusText));
      }
    } catch(e){
      setMsg('Error: ' + String(e));
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  return (
    <main className="container" style={{paddingTop:24}}>
      <h2>Integrations</h2>
      <p className="help">Checks your backend and services. API Base: <code>{api||'(not set)'}</code></p>

      <div className="row" style={{gap:8, marginBottom:12}}>
        <button className="btn" disabled={busy} onClick={loginEtsy}>
          {busy ? 'Working…' : 'Login to Etsy'}
        </button>
        <button className="btn ghost" onClick={refresh}>Refresh</button>
        {msg && <span className="small" style={{marginLeft:8}}>{msg}</span>}
      </div>

      <div className="grid" style={{marginTop:16}}>
        <Status label="Backend /health" ok={health.ok} message={health.msg} />
        {services.length ? services.map((s,i)=>(
          <Status key={i} label={s.label} ok={s.ok} message={s.message} />
        )) : <div className="card"><h3>No services reported</h3><p className="small">If your backend doesn’t expose <code>/integrations/status</code>, this is normal.</p></div>}
      </div>
    </main>
  );
}
