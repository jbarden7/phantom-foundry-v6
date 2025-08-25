import Link from 'next/link';

export default function Navbar(){
  const demo = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';
  const api = process.env.NEXT_PUBLIC_API_BASE || '(not set)';
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
      </nav>
    </header>
  );
}
