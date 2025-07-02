import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Handle Supabase auth session updates
  const supabaseResponse = await updateSession(request);

  // Handle admin routes (existing logic)
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

  // Handle protected chat routes - require authentication
  const protectedChatRoutes = [
    '/corporate/chat',
    '/travel/chat',
    '/emotional/chat', 
    '/culture/chat'
  ];

  if (protectedChatRoutes.includes(request.nextUrl.pathname)) {
    // Create Supabase client to check authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Redirect to the corresponding service page if not authenticated
      const servicePath = request.nextUrl.pathname.split('/')[1]; // Get 'corporate', 'travel', etc.
      const redirectUrl = new URL(`/${servicePath}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return supabaseResponse;
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