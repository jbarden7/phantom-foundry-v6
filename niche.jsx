import {useState} from 'react';
export default function Niche(){
  const [res,setRes]=useState(null);
  async function find(){ const r = await fetch('/api/niche/find',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seed:document.getElementById('seed').value,region:document.getElementById('region').value})}); const j=await r.json(); setRes(j); }
  return <div style={{padding:24}}><h2>Niche Finder</h2><input id="seed" defaultValue="cat dad jokes"/><select id="region"><option>UK</option><option>EU</option><option>US</option></select><button onClick={find}>Find</button><pre>{JSON.stringify(res,null,2)}</pre></div>
}
