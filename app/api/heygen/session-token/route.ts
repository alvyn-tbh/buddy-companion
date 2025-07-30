import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      );
    }

    // Create session token using HeyGen API
    const response = await fetch('https://api.heygen.com/v1/session_token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('HeyGen API error:', error);
      return NextResponse.json(
        { error: 'Failed to create session token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      token: data.data.token,
      expiresAt: data.data.expired_at,
    });
  } catch (error) {
    console.error('Error creating HeyGen session token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}