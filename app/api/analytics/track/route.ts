import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { service_used, visitor_id, session_id } = await request.json();
    
    if (!service_used || !visitor_id || !session_id) {
      return NextResponse.json(
        { error: 'Missing required fields: service_used, visitor_id, session_id' },
        { status: 400 }
      );
    }

    // Get request headers for additional data
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Determine environment
    const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

    // Create Supabase client
    const supabase = await createClient();

    // Insert engagement metric
    const { data, error } = await supabase
      .from('engagement_metrics')
      .insert({
        visitor_id,
        session_id,
        service_used,
        environment,
        timestamp: new Date().toISOString(),
        user_agent: userAgent,
        ip_address: ipAddress,
        // Note: Country and city would require IP geolocation service
        country: null,
        city: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting engagement metric:', error);
      return NextResponse.json(
        { error: 'Failed to track engagement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Engagement tracked successfully' 
    });

  } catch (error) {
    console.error('Error in engagement tracking:', error);
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
    const days = parseInt(searchParams.get('days') || '30');

    // Create Supabase client
    const supabase = await createClient();

    // Get engagement analytics using the stored procedure
    const { data, error } = await supabase
      .rpc('get_engagement_analytics', {
        p_environment: environment,
        p_days: days
      });

    if (error) {
      console.error('Error fetching engagement analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch engagement analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Engagement analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Error in engagement analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 