import { NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const BASE_API_URL = process.env.NEXT_PUBLIC_HEYGEN_BASE_API_URL || 'https://api.heygen.com';

export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("HEYGEN_API_KEY is missing from environment variables");
    }

    const res = await fetch(`${BASE_API_URL}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      },
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("HeyGen API error:", errorData);
      throw new Error(`Failed to create token: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({ token: data.data.token }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return NextResponse.json(
      { error: "Failed to retrieve access token" },
      { status: 500 }
    );
  }
}