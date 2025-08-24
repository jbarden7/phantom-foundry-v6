export default function ModeBanner(){
  const demo = String(process.env.NEXT_PUBLIC_DEMO_MODE || 'true').toLowerCase() === 'true';
  const style = {
    position: 'sticky', top: 0, zIndex: 1000,
    padding: '8px 12px',
    textAlign: 'center',
    fontFamily: 'system-ui',
    fontWeight: 600,
    color: demo ? '#3a2b00' : '#063b1a',
    background: demo ? '#ffe8a3' : '#b7f7c2',
    borderBottom: '1px solid rgba(0,0,0,.1)'
  };
  return (
    <div style={style}>
      {demo ? '🟡 DEMO MODE — safe, draft uploads are simulated' :
              '🟢 LIVE MODE — proceed carefully (draft-only recommended)'}
    </div>
  );
}
