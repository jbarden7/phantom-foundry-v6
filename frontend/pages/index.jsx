export default function Home(){
  const demo = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';
  const api = process.env.NEXT_PUBLIC_API_BASE || '(not set)';
  return (
    <main style={{maxWidth:960,margin:'0 auto',padding:24,fontFamily:'system-ui'}}>
      <h1>Phantom Foundry — Dashboard</h1>
      <p>{demo ? 'Demo Mode is ON (safe, no real uploads).' :
                 'Live Mode. Draft-only is recommended.'}</p>
      <p>API Base: <code>{api}</code></p>
      <ul>
        <li><a href="/niche">Niche Finder</a></li>
        <li><a href="/uploads">Uploads</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </main>
  );
}
