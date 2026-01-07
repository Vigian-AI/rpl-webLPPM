import { NextResponse, type NextRequest } from 'next/server';

// Session cookie name
const SESSION_COOKIE = 'lppm_session';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define protected routes
  const adminRoutes = pathname.startsWith('/admin');
  const dosenRoutes = pathname.startsWith('/dosen');
  const mahasiswaRoutes = pathname.startsWith('/mahasiswa');
  const authRoutes = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Get session from cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  let session: { userId: string; role: string } | null = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      session = null;
    }
  }

  // If user is not logged in and trying to access protected routes
  if (!session && (adminRoutes || dosenRoutes || mahasiswaRoutes)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in
  if (session) {
    const userRole = session.role;

    // Redirect logged-in users away from auth routes
    if (authRoutes) {
      const url = request.nextUrl.clone();
      url.pathname = userRole === 'admin' ? '/admin' : userRole === 'dosen' ? '/dosen' : '/mahasiswa';
      return NextResponse.redirect(url);
    }

    // Check role-based access
    if (adminRoutes && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }

    if (dosenRoutes && userRole !== 'dosen') {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }

    if (mahasiswaRoutes && userRole !== 'mahasiswa') {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
