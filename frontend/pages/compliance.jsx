import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const DEFAULT_BANNED = ['disney','marvel','nike','apple','pokemon','barbie'];

export default function Compliance(){
  const [text, setText] = useState('Funny Disney cat mug');
  const [hits, setHits] = useState([]);

  function check(){
    const t = (text || '').toLowerCase();
    const found = DEFAULT_BANNED.filter(b => t.includes(b));
    setHits(found);
  }

  return (
    <>
      <section className="panel" style={{margin:'16px 0'}}>
        <h2 style={{marginTop:0}}>Compliance Preview</h2>
        <textarea rows={6} className="input" value={text} onChange={e=>setText(e.target.value)} style={{width:'100%'}} />
        <div className="row" style={{marginTop:8}}>
          <Button onClick={check}>Scan</Button>
          <span className="help">Local check for common banned terms. Server performs deeper checks at upload time.</span>
        </div>
      </section>
      {hits.length ? (
        <Card title="Potential Issues" subtitle={`${hits.length} hits`}>
          <div className="row">
            {hits.map((h,i)=>(<span key={i} className="badge warn">{h}</span>))}
          </div>
        </Card>
      ) : (
        <div className="toast ok">No banned terms found locally.</div>
      )}
    </>
  );
}
