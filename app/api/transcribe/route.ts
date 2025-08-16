import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { usageTracker } from '@/lib/usage-tracker';
import { createClient } from '@/lib/supabase/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VerboseTranscriptionResponse {
  text: string;
  language: string;
  duration: number;
  segments: Array<{
    avg_logprob: number;
    [key: string]: unknown;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured', details: 'Please set OPENAI_API_KEY environment variable' },
        { status: 500 }
      );
    }

    // Get user ID for usage tracking
    let userId: string | undefined;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch (error) {
      console.warn('Could not get user for usage tracking:', error);
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';
    const responseFormat = formData.get('responseFormat') as string || 'verbose_json';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided', details: 'Please provide an audio file in the request' },
        { status: 400 }
      );
    }

    // Validate file size (25MB limit for OpenAI Whisper)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large', details: `File size must be less than 25MB. Current size: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/wav', 'audio/webm'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type', details: `Supported formats: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('Starting transcription with OpenAI Whisper...', {
      fileName: audioFile.name,
      fileSize: audioFile.size,
      fileType: audioFile.type,
      language,
      responseFormat
    });

    // Convert File to ArrayBuffer for OpenAI API
    const arrayBuffer = await audioFile.arrayBuffer();

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: new File([arrayBuffer], audioFile.name, { type: audioFile.type }),
      model: 'whisper-1',
      language: language,
      response_format: responseFormat as 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt',
      temperature: 0.2, // Lower temperature for more accurate transcription
    });

    console.log('Transcription completed successfully');

    // Track usage
    const requestId = `transcribe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate duration in minutes (estimate based on file size if not available)
    let durationMinutes = 0;
    if (responseFormat === 'verbose_json') {
      const verboseResponse = transcription as VerboseTranscriptionResponse;
      durationMinutes = verboseResponse.duration / 60;
    } else {
      // Estimate duration based on file size (rough approximation)
      const bytesPerSecond = 16000 * 2; // 16kHz, 16-bit audio
      durationMinutes = (audioFile.size / bytesPerSecond) / 60;
    }

    await usageTracker.trackUsage({
      user_id: userId,
      api_type: 'transcription',
      model: 'whisper-1',
      minutes_used: durationMinutes,
      request_id: requestId,
      metadata: {
        file_size: audioFile.size,
        file_type: audioFile.type,
        language,
        response_format: responseFormat,
      },
    });

    // Return the transcription result
    if (responseFormat === 'verbose_json') {
      // For verbose_json, the response includes additional metadata
      const verboseResponse = transcription as VerboseTranscriptionResponse;
      return NextResponse.json({
        transcription: verboseResponse.text,
        language: verboseResponse.language,
        duration: verboseResponse.duration,
        segments: verboseResponse.segments
      });
    } else {
      return NextResponse.json({
        transcription: transcription.text
      });
    }

  } catch (error) {
    console.error('Transcription error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'OpenAI API authentication failed', details: 'Please check your API key' },
          { status: 401 }
        );
      } else if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'OpenAI API rate limit exceeded', details: 'Please try again later' },
          { status: 429 }
        );
      } else if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded', details: 'Please check your account usage' },
          { status: 402 }
        );
      } else {
        return NextResponse.json(
          { error: 'Transcription failed', details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Transcription failed', details: 'An unexpected error occurred' },
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
