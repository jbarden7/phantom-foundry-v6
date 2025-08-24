// frontend/middleware.js  (or repo-root/middleware.js if you build from root)
// Edge-safe Basic Auth gate for ALL pages (no Node APIs, uses atob).
import { NextResponse } from 'next/server';

const BASIC_USER = process.env.BASIC_AUTH_USER;
const BASIC_PASS = process.env.BASIC_AUTH_PASS;
const OVERRIDE_KEY = process.env.OVERRIDE_KEY; // optional ?key=... bypass

export function middleware(req) {
  const url = new URL(req.url);

  // Allow Next internals & static assets through
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname === '/favicon.ico' ||
    url.pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Allow health (adjust if your health route differs)
  if (url.pathname === '/api/health') {
    return NextResponse.next();
  }

  // One-time emergency override via query (?key=...) -> saves cookie
  if (OVERRIDE_KEY && url.searchParams.get('key') === OVERRIDE_KEY) {
    const res = NextResponse.redirect(url.origin + url.pathname); // clean the URL
    res.cookies.set('pf_override', OVERRIDE_KEY, {
      httpOnly: true, sameSite: 'Lax', path: '/', secure: true
    });
    return res;
  }
  const cookieKey = req.cookies.get('pf_override')?.value;
  if (cookieKey && OVERRIDE_KEY && cookieKey === OVERRIDE_KEY) {
    return NextResponse.next();
  }

  // Basic Auth using web APIs (no Buffer)
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Basic ')) {
    const encoded = authHeader.slice(6);
    try {
      const decoded = atob(encoded); // Edge runtime has atob
      const sep = decoded.indexOf(':');
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (user === BASIC_USER && pass === BASIC_PASS) {
        return NextResponse.next();
      }
    } catch (e) {
      // fall through to 401
    }
  }

  // Prompt browser for credentials
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Phantom Foundry"' },
  });
}

export const config = {
  // Gate everything except Next internals & health
  matcher: ['/((?!_next|favicon.ico|public|api/health).*)'],
};
