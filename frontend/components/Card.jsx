export default function Card({title, subtitle, children, footer}){
  return (
    <section className="card">
      {title && <h3>{title}</h3>}
      {subtitle && <div className="small" style={{marginBottom:8}}>{subtitle}</div>}
      <div>{children}</div>
      {footer && <div className="hr" />}
      {footer}
    </section>
  );
}
