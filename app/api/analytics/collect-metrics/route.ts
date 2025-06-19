import { NextRequest, NextResponse } from 'next/server';
import { collectAndStoreMetrics, getRealDatabaseStats } from '@/lib/database-metrics-collector';
import { typedSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication (you might want to add admin-only access)
    const token = request.cookies.get('admin-auth')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Collect and store metrics
    await collectAndStoreMetrics();

    return NextResponse.json({ 
      success: true, 
      message: 'Database metrics collection completed' 
    });

  } catch (error) {
    console.error('Error in metrics collection API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('admin-auth')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current database stats
    const stats = await getRealDatabaseStats();
    
    // Store the stats
    const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    
    const { data, error } = await typedSupabaseAdmin
      .from('database_metrics')
      .insert({
        total_size_bytes: stats.total_size_bytes,
        table_count: stats.table_count,
        active_connections: stats.active_connections,
        cache_hit_ratio: stats.cache_hit_ratio,
        environment,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing metrics:', error);
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Database metrics collected and stored successfully' 
    });

  } catch (error) {
    console.error('Error in metrics collection API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
