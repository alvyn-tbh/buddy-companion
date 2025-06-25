import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { model, voice, instructions } = await request.json();

    if (!model || !voice) {
      return NextResponse.json(
        { error: 'Model and voice are required' },
        { status: 400 }
      );
    }

    console.log('Creating OpenAI Realtime session...', { model, voice });

    // Create a new Realtime session
    const session = await openai.beta.realtime.sessions.create({
      model: model || 'gpt-4o-realtime-preview-2024-12-17',
      voice: voice || 'alloy',
      instructions: instructions || "You are a helpful AI assistant. Respond naturally and conversationally to user input.",
    });

    console.log('Realtime session created successfully');

    return NextResponse.json(session);

  } catch (error) {
    console.error('Error creating Realtime session:', error);
    return NextResponse.json(
      { error: 'Failed to create Realtime session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OpenAI Realtime session endpoint is ready',
    supportedModels: [
      'gpt-4o-realtime-preview-2024-12-17',
      'gpt-4o-mini-realtime-preview-2024-12-17'
    ],
    supportedVoices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
  });
} 