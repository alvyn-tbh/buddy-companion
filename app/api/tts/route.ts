import { NextRequest, NextResponse } from 'next/server';
import { validateTTSOptions } from '../../../lib/tts-service';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        {
          error: 'OpenAI API key is not configured',
          details: 'Please set the OPENAI_API_KEY environment variable'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, voice, model, speed, format } = body;

    // Validate required fields
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum length is 4096 characters' },
        { status: 400 }
      );
    }

    // Validate TTS options
    try {
      validateTTSOptions({ voice, model, speed, format });
    } catch (validationError) {
      return NextResponse.json(
        {
          error: 'Invalid TTS options',
          details: validationError instanceof Error ? validationError.message : 'Unknown validation error'
        },
        { status: 400 }
      );
    }

    console.log('TTS request received:', {
      textLength: text.length,
      voice,
      model,
      speed,
      format
    });

    // Generate speech using OpenAI API
    const {
      voice: ttsVoice = 'alloy',
      model: ttsModel = 'tts-1',
      speed: ttsSpeed = 1.0,
      format: ttsFormat = 'mp3'
    } = { voice, model, speed, format };

    const response = await openai.audio.speech.create({
      model: ttsModel,
      voice: ttsVoice,
      input: text,
      response_format: ttsFormat,
      speed: ttsSpeed,
    });

    // Get the audio data as a buffer
    const audioBuffer = await response.arrayBuffer();

    console.log('TTS completed successfully');

    // Return the audio data directly
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': `audio/${ttsFormat}`,
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('TTS API error:', error);

    // Provide more specific error messages
    let errorMessage = 'TTS failed';
    let errorDetails = 'Unknown error';

    if (error instanceof Error) {
      errorDetails = error.message;

      // Check for specific OpenAI API errors
      if (error.message.includes('invalid_request_error')) {
        errorMessage = 'Invalid request to OpenAI API';
        errorDetails = 'The text content may not be supported';
      } else if (error.message.includes('authentication_error')) {
        errorMessage = 'OpenAI API authentication failed';
        errorDetails = 'Please check your API key configuration';
      } else if (error.message.includes('rate_limit_exceeded')) {
        errorMessage = 'OpenAI API rate limit exceeded';
        errorDetails = 'Please try again later';
      } else if (error.message.includes('quota_exceeded')) {
        errorMessage = 'OpenAI API quota exceeded';
        errorDetails = 'Please check your OpenAI account usage';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
