import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Check if user is admin using cookie-based auth
    const cookieStore = await cookies();
    const adminAuthCookie = cookieStore.get('admin-auth')?.value;
    
    if (!adminAuthCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple token verification
    const tokenParts = adminAuthCookie.split('.');
    if (tokenParts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Return a simple response indicating admin access is working
    // In a production environment, you would implement proper user listing
    return NextResponse.json([
      {
        id: 'admin-user',
        email: 'admin@example.com',
        name: 'Administrator',
        avatar_url: null,
        created_at: new Date().toISOString(),
      }
    ]);

  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 