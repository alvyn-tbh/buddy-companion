import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio, audioBlobToBuffer, validateAudioInput } from '../../../lib/audio-transcription';

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

    // Parse the form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';
    const prompt = formData.get('prompt') as string;
    const responseFormat = formData.get('responseFormat') as string || 'verbose_json';

    // Validate audio file
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Audio file received:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });

    // Check file size (25MB limit for OpenAI Whisper)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'Audio file is too large. Maximum size is 25MB',
          details: `File size: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 400 }
      );
    }

    // Check if file size is too small (likely empty or corrupted)
    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: 'Audio file is empty or corrupted' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    console.log('Audio buffer created:', {
      bufferSize: audioBuffer.length,
      isValid: audioBuffer.length > 0
    });

    // Validate audio input
    try {
      validateAudioInput(audioBuffer);
    } catch (validationError) {
      console.error('Audio validation failed:', validationError);
      return NextResponse.json(
        { 
          error: 'Audio validation failed',
          details: validationError instanceof Error ? validationError.message : 'Unknown validation error'
        },
        { status: 400 }
      );
    }

    // Transcribe audio
    console.log('Starting transcription with options:', {
      language,
      prompt: prompt ? 'provided' : 'not provided',
      responseFormat
    });

    const result = await transcribeAudio(audioBuffer, {
      language,
      prompt,
      responseFormat: responseFormat as any,
    });

    console.log('Transcription completed successfully:', {
      transcriptionLength: result.transcription.length,
      confidence: result.confidence,
      language: result.language,
      duration: result.duration
    });

    return NextResponse.json({
      success: true,
      transcription: result.transcription,
      confidence: result.confidence,
      language: result.language,
      duration: result.duration,
      requestId: result.requestId,
    });

  } catch (error) {
    console.error('Transcription API error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Transcription failed';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // Check for specific OpenAI API errors
      if (error.message.includes('invalid_request_error')) {
        errorMessage = 'Invalid request to OpenAI API';
        errorDetails = 'The audio file format or content may not be supported';
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