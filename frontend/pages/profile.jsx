export default function Profile(){
  return (
    <main className="container" style={{paddingTop:24}}>
      <h2>Profile</h2>
      <p className="help">This is a placeholder. When you enable full authentication (e.g., NextAuth), we’ll show your user details, change password, and connected providers here.</p>
      <ul>
        <li>Name: (coming soon)</li>
        <li>Email: (coming soon)</li>
        <li>Roles: Owner (default)</li>
      </ul>
      <div className="hr"></div>
      <p className="small">Tip: For now, access is protected with Basic Auth middleware and an optional override key. You can update credentials in Vercel environment variables.</p>
    </main>
  );
}
