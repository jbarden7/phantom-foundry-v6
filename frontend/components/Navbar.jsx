import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar(){
  const demo = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';
  const api = process.env.NEXT_PUBLIC_API_BASE || '(not set)';
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    const close = ()=>setOpen(false);
    window.addEventListener('click', close);
    return ()=>window.removeEventListener('click', close);
  },[]);

  function onMenuClick(e){ e.stopPropagation(); setOpen(v=>!v); }

  function signOut(){
    // Placeholder for future full auth: NextAuth signOut() or your API endpoint.
    // For now, we try to clear the override cookie (if any) and reload.
    try {
      document.cookie = 'pf_override=; Path=/; Max-Age=0; SameSite=Lax';
    } catch(e){}
    alert('Signed out (placeholder). In full auth mode this calls your auth sign-out endpoint.');
    window.location.href = '/';
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
        <span className={demo ? 'badge warn' : 'badge ok'}>{demo ? 'Demo' : 'Live'}</span>
        <span className="small" style={{marginLeft:8}}>API: {api}</span>
        <div className="menu" style={{marginLeft:12}} onClick={e=>e.stopPropagation()}>
          <button className="menu-btn" onClick={onMenuClick}>
            <span style={{width:24,height:24,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:'color-mix(in oklab, var(--bg) 85%, #fff 15%)'}}>👤</span>
            <span className="small">Account</span>
          </button>
          {open && (
            <div className="menu-list">
              <div className="menu-item"><Link href="/settings">Settings</Link></div>
              <div className="menu-item" onClick={signOut}>Sign out</div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
