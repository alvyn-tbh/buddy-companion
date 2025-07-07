import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if user is admin using cookie-based auth
    const cookieStore = await cookies();
    const adminAuthCookie = cookieStore.get('admin-auth')?.value;
    
    if (!adminAuthCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple token verification (you can enhance this)
    const tokenParts = adminAuthCookie.split('.');
    if (tokenParts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get users from auth.users table
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedUsers = users.users?.map(user => ({
      id: user.id,
      email: user.email || 'unknown@example.com',
      name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: user.created_at,
    })) || [];

    return NextResponse.json(transformedUsers);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 