import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { usageTracker } from '@/lib/usage-tracker';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    
    if (!user) {
      console.log('No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User found:', user.email);

    // Check if user is admin (you can implement your own admin check)
    const { data: adminCheck, error: adminError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email)
      .single();

    if (adminError) {
      console.error('Admin check error:', adminError);
      return NextResponse.json({ error: 'Admin check failed' }, { status: 403 });
    }

    if (!adminCheck) {
      console.log('User not found in admin_users table:', user.email);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Admin access granted for:', user.email);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Calculate previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(start.getTime());

    console.log('Fetching usage stats for period:', { start, end, previousStart, previousEnd });

    // Get current period stats
    const currentStats = await usageTracker.getUsageStats({
      startDate: start,
      endDate: end,
      userId: userId || undefined,
    });

    // Get previous period stats for comparison
    const previousStats = await usageTracker.getUsageStats({
      startDate: previousStart,
      endDate: previousEnd,
      userId: userId || undefined,
    });

    console.log('Usage stats fetched successfully');

    return NextResponse.json({
      current: currentStats,
      previous: previousStats,
    });

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 