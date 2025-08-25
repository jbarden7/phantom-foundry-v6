import { useState } from 'react';
import Button from '../components/Button';

const DEMO = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';

export default function Uploads(){
  const [logs, setLogs] = useState('');
  const [fileName, setFileName] = useState('');

  async function create(){
    if (DEMO) {
      setLogs('Demo Mode is ON — real uploads are disabled.\nSet NEXT_PUBLIC_DEMO_MODE=false in Vercel → Redeploy to enable real draft uploads.');
      return;
    }
    const inp = document.getElementById('csv');
    const f = inp?.files?.[0];
    if(!f) return alert('Choose CSV');
    const fd = new FormData(); fd.append('file', f);
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/etsy/drafts`, { method:'POST', body: fd });
    const j = await r.json();
    setLogs((j.logs || []).join('\n'));
  }

  function onPick(e){
    const f = e.target.files?.[0]; setFileName(f?.name || '');
  }

  return (
    <>
      <section className="panel" style={{margin:'16px 0'}}>
        <h2 style={{marginTop:0}}>Uploads {DEMO && <span className="badge warn" style={{marginLeft:8}}>Demo</span>}</h2>
        <div className="drop" onClick={()=>document.getElementById('csv').click()}>
          <p>Drop your CSV here or click to select</p>
          <p className="small">{fileName || 'etsy_products_template.csv'}</p>
        </div>
        <input id="csv" type="file" accept=".csv" onChange={onPick} style={{display:'none'}} />
        <div className="row" style={{marginTop:12}}>
          <Button onClick={create}>{DEMO ? 'Simulate Drafts' : 'Create Drafts'}</Button>
          <a className="btn ghost" href="/starter_csvs/etsy_products_template.csv" download>Download CSV Template</a>
        </div>
        <p className="help">Your backend runs full compliance checks before queuing drafts.</p>
      </section>
      <section className="panel">
        <h3 style={{marginTop:0}}>Logs</h3>
        <div className="logs">{logs}</div>
      </section>
    </>
  );
}
