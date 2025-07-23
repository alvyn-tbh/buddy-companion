import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const hasAzureKey = !!process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
  const hasAzureRegion = !!process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  const status = {
    azure: {
      configured: hasAzureKey && hasAzureRegion,
      hasKey: hasAzureKey,
      hasRegion: hasAzureRegion,
      region: hasAzureRegion ? process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION : null
    },
    openai: {
      configured: hasOpenAIKey
    },
    overall: hasAzureKey && hasAzureRegion && hasOpenAIKey
  };

  return NextResponse.json({
    success: status.overall,
    status,
    message: status.overall 
      ? 'All services configured correctly' 
      : 'Some services are not configured',
    missingServices: [
      !hasAzureKey && 'Azure Speech Key',
      !hasAzureRegion && 'Azure Speech Region',
      !hasOpenAIKey && 'OpenAI API Key'
    ].filter(Boolean)
  });
}