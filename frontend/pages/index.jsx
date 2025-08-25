import Card from '../components/Card';
import Button from '../components/Button';

export default function Home(){
  const demo = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';
  const api = process.env.NEXT_PUBLIC_API_BASE || '(not set)';
  return (
    <>
      <section className="panel" style={{margin:'16px 0'}}>
        <h1 style={{marginTop:0}}>Phantom Foundry</h1>
        <p className="small" style={{marginTop:4}}>
          {demo ? 'Demo Mode — safe to explore. Real uploads are disabled.'
                : 'Live Mode — proceed carefully. Draft-only recommended.'}
        </p>
        <p className="help">API Base: <code>{api}</code></p>
      </section>

      <div className="grid">
        <Card title="Niche Finder" subtitle="Discover profitable, low-competition ideas">
          <p className="help">Research niches using your backend. See demand & competition at a glance.</p>
          <div style={{marginTop:12}}><a className="btn" href="/niche">Open Niche Finder</a></div>
        </Card>
        <Card title="AI Prompt Engine" subtitle="Generate design prompts with one click">
          <p className="help">Simple mode by default; Pro mode available later.</p>
          <div style={{marginTop:12}}><a className="btn" href="/prompts">Open Prompt Engine</a></div>
        </Card>
        <Card title="Uploads" subtitle="Batch-create Etsy drafts">
          <p className="help">Upload a CSV to queue draft listings. Real uploads require Live Mode.</p>
          <div style={{marginTop:12}}><a className="btn" href="/uploads">Open Uploads</a></div>
        </Card>
        <Card title="Compliance" subtitle="Pre-flight checks">
          <p className="help">Run quick banned-term checks before you upload. Deeper checks run server-side.</p>
          <div style={{marginTop:12}}><a className="btn" href="/compliance">Open Compliance</a></div>
        </Card>
      </div>
    </>
  );
}
