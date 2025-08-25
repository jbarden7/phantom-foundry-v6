export default function Button({children,onClick,variant}){
  const cls = variant==='ghost' ? 'btn ghost' : 'btn';
  return <button className={cls} onClick={onClick}>{children}</button>;
}
