import Link from 'next/link';

export default function Navbar(){
  const demo = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';
  const api = process.env.NEXT_PUBLIC_API_BASE || '(not set)';
  return (
    <header style={{position:'sticky', top:0, zIndex:1000, background:'#0b0e12', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
      <nav style={{display:'flex', gap:16, alignItems:'center', padding:'12px 16px', fontFamily:'system-ui'}}>
        <Link href="/" style={{fontWeight:700, textDecoration:'none'}}>Phantom Foundry</Link>
        <Link href="/niche">Niche Finder</Link>
        <Link href="/prompts">AI Prompts</Link>
        <Link href="/uploads">Uploads</Link>
        <Link href="/compliance">Compliance</Link>
        <Link href="/settings">Settings</Link>
        <span style={{marginLeft:'auto', fontSize:12, opacity:.75}}>
          {demo ? '🟡 Demo' : '🟢 Live'} · API: {api}
        </span>
      </nav>
    </header>
  );
}
