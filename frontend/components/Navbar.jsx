import Link from 'next/link';
import { useEffect, useState } from 'react';

function getTheme(){
  if (typeof document==='undefined') return 'dark';
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}
function applyTheme(t){
  try { document.documentElement.setAttribute('data-theme', t==='light'?'light':'dark'); } catch(e){}
}

export default function Navbar(){
  const demo = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';
  const api = process.env.NEXT_PUBLIC_API_BASE || '(not set)';
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(()=>{
    const saved = typeof localStorage!=='undefined' ? (localStorage.getItem('pf_theme') || 'dark') : 'dark';
    setTheme(saved); applyTheme(saved);
    const close = ()=>setMenuOpen(false);
    window.addEventListener('click', close);
    const sync = ()=>{ const t = getTheme(); setTheme(t); };
    window.addEventListener('pf:theme', sync);
    return ()=>{ window.removeEventListener('click', close); window.removeEventListener('pf:theme', sync); };
  },[]);

  function onMenuClick(e){ e.stopPropagation(); setMenuOpen(v=>!v); }

  function signOut(){
    try { document.cookie = 'pf_override=; Path=/; Max-Age=0; SameSite=Lax'; } catch(e){}
    alert('Signed out (placeholder). Full auth will wire this to your auth provider.');
    window.location.href = '/';
  }

  function toggleTheme(){
    const next = theme==='light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem('pf_theme', next); } catch(e){}
    applyTheme(next);
    try { window.dispatchEvent(new CustomEvent('pf:theme')); } catch(e){}
  }

  return (
    <header className="topbar">
      <nav className="nav container">
        <Link className="brand" href="/">Phantom Foundry</Link>
        <Link href="/niche">Niche</Link>
        <Link href="/prompts">AI Prompts</Link>
        <Link href="/uploads">Uploads</Link>
        <Link href="/compliance">Compliance</Link>
        <Link href="/settings">Settings</Link>
        <div className="spacer" />
        <button className="btn ghost" onClick={toggleTheme} title="Toggle theme">
          {theme==='light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <span className={demo ? 'badge warn' : 'badge ok'} style={{marginLeft:8}}>{demo ? 'Demo' : 'Live'}</span>
        <span className="small" style={{marginLeft:8}}>API: {api}</span>
        <div className="menu" style={{marginLeft:12}} onClick={e=>e.stopPropagation()}>
          <button className="menu-btn" onClick={onMenuClick}>
            <span style={{width:24,height:24,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:'color-mix(in oklab, var(--bg) 85%, #fff 15%)'}}>👤</span>
            <span className="small">Account</span>
          </button>
          {menuOpen && (
            <div className="menu-list" onClick={()=>setMenuOpen(false)}>
              <div className="menu-item"><Link href="/profile">Profile</Link></div>
              <div className="menu-item" onClick={()=>setAboutOpen(true)}>About</div>
              <div className="menu-item" onClick={signOut}>Sign out</div>
            </div>
          )}
        </div>
      </nav>

      {aboutOpen && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:1100}} onClick={()=>setAboutOpen(false)}>
          <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', minWidth:360, background:'var(--panel)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 20px 60px rgba(0,0,0,.35)'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{marginTop:0}}>About Phantom Foundry</h3>
            <p className="small">Version: UI 2025 preview</p>
            <p className="help">Frontend: Next.js on Vercel. Backend: FastAPI + Playwright on Render. Demo mode is safe (no real uploads). Switch to Live via Vercel env var.</p>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <button className="btn ghost" onClick={()=>setAboutOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
