import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envStatus = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      NEXT_PUBLIC_AZURE_SPEECH_KEY: !!process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY,
      NEXT_PUBLIC_AZURE_SPEECH_REGION: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || null,
      REDIS_URL: !!process.env.REDIS_URL,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV
    };

    return NextResponse.json({
      status: 'success',
      environment: envStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking environment variables:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to check environment variables',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 