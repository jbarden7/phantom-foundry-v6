import {useState} from 'react';
export default function Uploads(){
  const [logs,setLogs]=useState('');
  async function create(e){
    const f=document.getElementById('csv').files[0];
    if(!f) return alert('Choose CSV');
    const fd=new FormData(); fd.append('file', f);
    const r=await fetch(process.env.NEXT_PUBLIC_API_BASE + '/etsy/drafts',{method:'POST', body: fd});
    const j=await r.json(); setLogs(j.logs.join('\n'));
  }
  return <div style={{padding:24}}><h2>Uploads</h2><input id="csv" type="file"/><button onClick={create}>Create Drafts</button><pre>{logs}</pre></div>
}
