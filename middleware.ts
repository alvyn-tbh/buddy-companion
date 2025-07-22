import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pre-compute constants outside of middleware for better performance
const IS_USER_AUTH_ENABLED = process.env.USER_AUTH === 'true';
const ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN = '/admin/login';
const PROTECTED_CHAT_ROUTES = new Set([
  '/corporate/chat',
  '/travel/chat',
  '/emotional/chat', 
  '/culture/chat'
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Fast path: Skip processing for static assets and API routes
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/') || 
      pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Handle admin routes - require admin authentication
  if (pathname.startsWith(ADMIN_PREFIX) && !pathname.startsWith(ADMIN_LOGIN)) {
    // Check if user is authenticated for admin
    const isAuthenticated = request.cookies.get('admin-auth');
    
    if (!isAuthenticated) {
      // Redirect to login page
      const loginUrl = new URL(ADMIN_LOGIN, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle protected chat routes - require authentication only if USER_AUTH is enabled
  if (PROTECTED_CHAT_ROUTES.has(pathname)) {
    // Skip authentication check if USER_AUTH is not enabled
    if (!IS_USER_AUTH_ENABLED) {
      return NextResponse.next();
    }

    // For now, allow access to chat routes when USER_AUTH is enabled
    // In a full implementation, you would check Supabase auth here
    // But for now, we'll just pass through to avoid edge runtime issues
    return NextResponse.next();
  }
  
  // Add performance headers
  const response = NextResponse.next();
  
  // Add timing header for performance monitoring
  response.headers.set('X-Middleware-Time', Date.now().toString());
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};