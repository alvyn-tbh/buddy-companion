import { NextRequest, NextResponse } from 'next/server';
import { typedSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { total_size_bytes, table_count, active_connections, cache_hit_ratio } = await request.json();
    
    if (typeof total_size_bytes !== 'number' || typeof table_count !== 'number' || 
        typeof active_connections !== 'number' || typeof cache_hit_ratio !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: total_size_bytes, table_count, active_connections, cache_hit_ratio' },
        { status: 400 }
      );
    }

    // Determine environment
    const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

    // Insert database metric
    const { data, error } = await typedSupabaseAdmin
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
        { error: 'Failed to track database metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Database metrics tracked successfully' 
    });

  } catch (error) {
    console.error('Error in database metrics tracking:', error);
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

    // Get database metrics summary using the database function
    const { data, error } = await typedSupabaseAdmin
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

    // Also get recent metrics for charting
    const { data: recentMetrics, error: recentError } = await typedSupabaseAdmin
      .from('database_metrics')
      .select('*')
      .eq('environment', environment)
      .order('created_at', { ascending: false })
      .limit(30);

    if (recentError) {
      console.error('Error fetching recent database metrics:', recentError);
    }

    return NextResponse.json({ 
      success: true, 
      summary: data[0] || null,
      recentMetrics: recentMetrics || []
    });

  } catch (error) {
    console.error('Error fetching database metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 