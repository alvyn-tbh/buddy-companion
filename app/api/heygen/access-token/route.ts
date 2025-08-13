const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  console.log('🔍 [HeyGen API] Access token request received');
  console.log('🔍 [HeyGen API] Environment check:', {
    hasApiKey: !!HEYGEN_API_KEY,
    apiKeyLength: HEYGEN_API_KEY?.length || 0,
    apiKeyPreview: HEYGEN_API_KEY?.substring(0, 10) + '...' || 'undefined'
  });

  try {
    if (!HEYGEN_API_KEY) {
      console.error('❌ [HeyGen API] API key is missing from .env');
      return new Response('API key is missing', {
        status: 500,
      });
    }

    console.log('🔍 [HeyGen API] Making request to HeyGen API...');
    const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      },
    });

    console.log('🔍 [HeyGen API] HeyGen API response status:', res.status);
    console.log('🔍 [HeyGen API] HeyGen API response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ [HeyGen API] HeyGen API request failed:', {
        status: res.status,
        statusText: res.statusText,
        errorText,
        url: res.url
      });
      return new Response(`HeyGen API error: ${res.status} ${res.statusText}`, {
        status: res.status,
      });
    }

    let data;
    try {
      const responseText = await res.text();
      console.log('🔍 [HeyGen API] HeyGen API response text:', responseText);
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('❌ [HeyGen API] Error parsing JSON response:', jsonError);
      return new Response('Invalid response from HeyGen API', {
        status: 500,
      });
    }

    console.log('✅ [HeyGen API] Successfully parsed HeyGen API response:', {
      hasData: !!data,
      hasToken: !!data.data?.token,
      tokenLength: data.data?.token?.length || 0,
      tokenPreview: data.data?.token?.substring(0, 20) + '...' || 'undefined'
    });

    // Return token as plain text, matching the official demo format
    console.log('✅ [HeyGen API] Returning token as plain text to client');

    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error) {
    console.error('❌ [HeyGen API] Error retrieving access token:', error);
    console.error('❌ [HeyGen API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return new Response('Failed to retrieve access token', {
      status: 500,
    });
  }
}
