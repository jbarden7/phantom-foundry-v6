import { useState } from 'react';

const DEMO = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';

export default function Uploads(){
  const [logs, setLogs] = useState('');

  async function create(){
    if (DEMO) {
      setLogs('Demo Mode is ON — real uploads are disabled.\nGo to Vercel → Env Vars → set NEXT_PUBLIC_DEMO_MODE = false and redeploy.');
      return;
    }
    const f = document.getElementById('csv').files[0];
    if(!f) return alert('Choose CSV');
    const fd = new FormData(); fd.append('file', f);
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/etsy/drafts`, { method:'POST', body: fd });
    const j = await r.json();
    setLogs((j.logs || []).join('\n'));
  }

  return (
    <div style={{padding:24}}>
      <h2>Uploads {DEMO && <span style={{fontSize:14, opacity:.7}}>(Demo Mode)</span>}</h2>
      <input id="csv" type="file" accept=".csv" />
      <div style={{marginTop:10}}>
        <button onClick={create} disabled={false} style={{padding:'8px 12px'}}>
          {DEMO ? 'Simulate Drafts' : 'Create Drafts'}
        </button>
      </div>
      <pre style={{marginTop:12}}>{logs}</pre>
    </div>
  );
}
