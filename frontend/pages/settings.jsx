export default function Settings(){
  return (
    <div style={{padding:24, fontFamily:'system-ui'}}>
      <h2>Settings</h2>
      <p>Most settings are managed via Vercel Environment Variables.</p>
      <ul>
        <li><code>NEXT_PUBLIC_API_BASE</code> — Your Render backend URL</li>
        <li><code>NEXT_PUBLIC_DEMO_MODE</code> — <code>true</code> (Demo) or <code>false</code> (Live)</li>
        <li><code>BASIC_AUTH_USER</code> / <code>BASIC_AUTH_PASS</code> — For the login prompt (if middleware is enabled)</li>
      </ul>
      <p>After changing env vars, re-deploy the project to apply changes.</p>
    </div>
  );
}
