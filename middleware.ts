import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if user authentication is enabled (only when USER_AUTH=true)
  const isUserAuthEnabled = process.env.USER_AUTH === 'true';

  // Handle admin routes - require admin authentication
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Check if user is authenticated for admin
    const isAuthenticated = request.cookies.get('admin-auth');
    
    if (!isAuthenticated) {
      // Redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle protected chat routes - require authentication only if USER_AUTH is enabled
  const protectedChatRoutes = [
    '/corporate/chat',
    '/travel/chat',
    '/emotional/chat', 
    '/culture/chat'
  ];

  if (protectedChatRoutes.includes(request.nextUrl.pathname)) {
    // Skip authentication check if USER_AUTH is not enabled
    if (!isUserAuthEnabled) {
      return NextResponse.next();
    }

    // For now, allow access to chat routes when USER_AUTH is enabled
    // In a full implementation, you would check Supabase auth here
    // But for now, we'll just pass through to avoid edge runtime issues
    return NextResponse.next();
  }
  
  return NextResponse.next();
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