import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// Validate environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// Check if required environment variables are set
if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
  console.error('CRITICAL: Admin authentication credentials are not properly configured');
  console.error('Please set ADMIN_USERNAME, ADMIN_PASSWORD, and JWT_SECRET environment variables');
}

// Validate JWT secret strength
if (JWT_SECRET && JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET should be at least 32 characters long for security');
}

// Simple JWT-like token generation (in production, use a proper JWT library)
interface JWTPayload {
  username: string;
  role: string;
  exp: number;
}

function generateToken(payload: JWTPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token: string): boolean {
  try {
    if (!JWT_SECRET) {
      return false;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Check if credentials are configured
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
      return NextResponse.json(
        { error: 'Admin authentication is not properly configured' },
        { status: 503 }
      );
    }

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate token
      const token = generateToken({
        username,
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      });

      // Set secure cookie
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('admin-auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-auth')?.value;
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
