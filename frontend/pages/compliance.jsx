import { useState } from 'react';

const DEFAULT_BANNED = ['disney','marvel','nike','apple','pokemon','barbie'];

export default function Compliance(){
  const [text, setText] = useState('Funny Disney cat mug');
  const [banned, setBanned] = useState(DEFAULT_BANNED);
  const [hits, setHits] = useState([]);

  function check(){
    const t = (text || '').toLowerCase();
    const found = banned.filter(b => t.includes(b));
    setHits(found);
  }

  return (
    <div style={{padding:24, fontFamily:'system-ui'}}>
      <h2>Compliance Preview (local)</h2>
      <p>Quick local check before uploading. Backend runs deeper checks during /etsy/drafts.</p>
      <textarea rows={6} value={text} onChange={e=>setText(e.target.value)} style={{width:'100%', padding:8}} />
      <div style={{margin:'8px 0'}}>
        <button onClick={check} style={{padding:'8px 12px'}}>Scan</button>
      </div>
      {hits.length ? (
        <div style={{background:'#2b1b1b', color:'#ffb4b4', padding:12, borderRadius:8}}>
          <strong>Potential issues:</strong> {hits.join(', ')}
        </div>
      ) : (
        <div style={{background:'#132017', color:'#b8f7c2', padding:12, borderRadius:8}}>
          <strong>No banned terms found locally.</strong>
        </div>
      )}
      <p style={{opacity:.8, marginTop:12}}>Tip: final compliance runs server-side when creating drafts.</p>
    </div>
  );
}
