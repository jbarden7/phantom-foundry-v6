import { useState, useEffect } from 'react';

export default function SettingsSidebar(){
  const [open, setOpen] = useState(false);
  const demo = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';
  const api = process.env.NEXT_PUBLIC_API_BASE || '(not set)';
  const [compact, setCompact] = useState(false);

  useEffect(()=>{
    const v = localStorage.getItem('pf_compact_cards') === '1';
    setCompact(v);
  },[]);

  function toggleCompact(){
    const next = !compact;
    setCompact(next);
    localStorage.setItem('pf_compact_cards', next ? '1' : '0');
    window.dispatchEvent(new CustomEvent('pf:compact'));
  }

  return (
    <>
      <button className="btn ghost" style={{position:'fixed', right:16, bottom:16, zIndex:1001}} onClick={()=>setOpen(true)}>⚙️ Settings</button>
      {open && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:1000}} onClick={()=>setOpen(false)}>
          <aside style={{position:'absolute', top:0, right:0, width:'360px', height:'100%', background:'#0c111b', borderLeft:'1px solid rgba(255,255,255,.08)', padding:'20px', overflowY:'auto', boxShadow:'-20px 0 60px rgba(0,0,0,.35)'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{marginTop:0}}>Settings</h3>
            <div className="toast" style={{marginBottom:12}}>
              <div><strong>Mode:</strong> {demo ? '🟡 Demo (safe)' : '🟢 Live'}</div>
              <div className="small">Change in Vercel → Env Var <code>NEXT_PUBLIC_DEMO_MODE</code></div>
            </div>
            <div className="toast" style={{marginBottom:12}}>
              <div><strong>API Base</strong></div>
              <div className="small"><code>{api}</code></div>
              <div className="small">Edit in Vercel → <code>NEXT_PUBLIC_API_BASE</code></div>
            </div>
            <div className="hr"></div>
            <h4>UI Preferences</h4>
            <label className="small" style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="checkbox" checked={compact} onChange={toggleCompact} />
              Compact cards (Niche Finder)
            </label>
            <p className="help">Saved locally in your browser.</p>
            <div className="hr"></div>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/niche">Open Niche Finder</a></li>
              <li><a href="/prompts">Open AI Prompts</a></li>
              <li><a href="/uploads">Open Uploads</a></li>
              <li><a href="/compliance">Open Compliance</a></li>
            </ul>
          </aside>
        </div>
      )}
    </>
  );
}
