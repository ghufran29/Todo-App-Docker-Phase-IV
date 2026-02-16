import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = ['/tasks', '/profile', '/settings'];

// Define public routes that don't require authentication
const publicRoutes = ['/auth/signin', '/auth/signup', '/'];

export function authMiddleware(request: NextRequest) {
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Get the auth token from cookies or headers
  const token = request.cookies.get(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'auth_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  // If accessing a protected route without authentication, redirect to signin
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If accessing a public route but already authenticated and trying to access auth pages
  if (publicRoutes.includes(request.nextUrl.pathname) && token) {
    // If user is already logged in and trying to access signin/signup, redirect to dashboard
    if (request.nextUrl.pathname.startsWith('/auth/signin') ||
        request.nextUrl.pathname.startsWith('/auth/signup')) {
      return NextResponse.redirect(new URL('/tasks', request.url));
    }
  }

  // Continue to the requested page
  return NextResponse.next();
}

// Configuration for Next.js middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};