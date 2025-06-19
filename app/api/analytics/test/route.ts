import { NextRequest, NextResponse } from 'next/server';
import { typedSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Test basic Supabase connection
    const { data: testData, error: testError } = await typedSupabaseAdmin
      .from('engagement_metrics')
      .select('*')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        error: 'Supabase connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 });
    }

    // Test if the function exists
    const { data: functionData, error: functionError } = await typedSupabaseAdmin
      .rpc('get_engagement_analytics', {
        p_environment: 'prod',
        p_days: 30
      });

    if (functionError) {
      return NextResponse.json({
        error: 'Function call failed',
        details: functionError.message,
        code: functionError.code,
        hint: 'Make sure you ran the SQL schema in Supabase'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection and functions are working',
      testData,
      functionData
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 