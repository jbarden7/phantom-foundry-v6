export default function Badge({tone='ok', children}){
  return <span className={tone==='ok' ? 'badge ok':'badge warn'}>{children}</span>;
}
