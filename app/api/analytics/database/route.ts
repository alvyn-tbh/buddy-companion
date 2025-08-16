import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { total_size_bytes, table_count, active_connections, cache_hit_ratio } = await request.json();

    if (typeof total_size_bytes !== 'number' || typeof table_count !== 'number' ||
      typeof active_connections !== 'number' || typeof cache_hit_ratio !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

    // Create Supabase client
    const supabase = await createClient();

    // Insert database metric
    const { data, error } = await supabase
      .from('database_metrics')
      .insert({
        total_size_bytes,
        table_count,
        active_connections,
        cache_hit_ratio,
        environment,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting database metric:', error);
      return NextResponse.json(
        { error: 'Failed to store database metric' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Database metric stored successfully'
    });

  } catch (error) {
    console.error('Error in database metric storage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment') || 'prod';
    const days = parseInt(searchParams.get('days') || '7');

    // Create Supabase client
    const supabase = await createClient();

    // Get database metrics summary using the stored procedure
    const { data, error } = await supabase
      .rpc('get_database_metrics_summary', {
        p_environment: environment,
        p_days: days
      });

    if (error) {
      console.error('Error fetching database metrics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch database metrics' },
        { status: 500 }
      );
    }

    // Get recent metrics for trend analysis
    const { data: recentMetrics, error: recentError } = await supabase
      .from('database_metrics')
      .select('*')
      .eq('environment', environment)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent metrics:', recentError);
    }

    return NextResponse.json({
      success: true,
      summary: data[0] || null,
      recentMetrics: recentMetrics || [],
      message: 'Database metrics retrieved successfully'
    });

  } catch (error) {
    console.error('Error in database metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
