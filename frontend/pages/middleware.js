// middleware.js (at repo root)
// Simple HTTP Basic Auth gate for ALL pages (frontend-only).
// Set env vars in Vercel: BASIC_AUTH_USER, BASIC_AUTH_PASS, OVERRIDE_KEY (optional).
import { NextResponse } from 'next/server';

const BASIC_USER = process.env.BASIC_AUTH_USER;
const BASIC_PASS = process.env.BASIC_AUTH_PASS;
const OVERRIDE_KEY = process.env.OVERRIDE_KEY; // optional: ?key=YOUR_OVERRIDE

export function middleware(req) {
  const url = new URL(req.url);

  // Allow health checks or public assets through un-gated (tweak as you like)
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/public') || url.pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Emergency override (add ?key=... once, then set a cookie for the session)
  if (OVERRIDE_KEY && url.searchParams.get('key') === OVERRIDE_KEY) {
    const res = NextResponse.next();
    res.cookies.set('pf_override', OVERRIDE_KEY, { httpOnly: true, sameSite: 'Lax', path: '/' });
    return res;
  }
  const cookieKey = req.cookies.get('pf_override')?.value;
  if (cookieKey && OVERRIDE_KEY && cookieKey === OVERRIDE_KEY) {
    return NextResponse.next();
  }

  // Basic Auth
  const auth = req.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString();
    const [user, pass] = decoded.split(':');
    if (user === BASIC_USER && pass === BASIC_PASS) {
      return NextResponse.next();
    }
  }

  // Ask browser to prompt for credentials
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Phantom Foundry"' }
  });
}

export const config = {
  matcher: ['/((?!api/health).*)'], // gate everything except /api/health
};
