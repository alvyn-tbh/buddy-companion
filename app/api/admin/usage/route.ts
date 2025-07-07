import { NextRequest, NextResponse } from 'next/server';
import { usageTracker } from '@/lib/usage-tracker';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    
    // Check if user is admin using cookie-based auth
    const cookieStore = await cookies();
    const adminAuthCookie = cookieStore.get('admin-auth')?.value;
    
    if (!adminAuthCookie) {
      console.log('No admin auth cookie found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple token verification (you can enhance this)
    const tokenParts = adminAuthCookie.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid admin token format');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Admin access granted');

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