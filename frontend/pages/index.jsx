import Link from 'next/link';
export default function Home(){
  return (
    <div style={{fontFamily:'system-ui', padding:24, maxWidth:1000, margin:'0 auto'}}>
      <h1>Phantom Foundry v6 — Dashboard (UK)</h1>
      <p>Draft-only uploads by default. Use Settings to connect APIs.</p>
      <ul>
        <li><Link href="/niche">Niche Finder</Link></li>
        <li><Link href="/uploads">Uploads</Link></li>
        <li><Link href="/settings">Settings</Link></li>
      </ul>
    </div>
  );
}
