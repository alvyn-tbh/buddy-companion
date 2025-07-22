import { OpenAI } from 'openai';
import { getAudioProcessingQueue, JOB_TYPES } from './queue/bull-queue';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('CRITICAL: OPENAI_API_KEY is not configured');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionResult {
  transcription: string;
  confidence?: number;
  language?: string;
  duration?: number;
  requestId: string;
}

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

interface VerboseTranscriptionResponse {
  text: string;
  language: string;
  duration: number;
  segments: Array<{
    avg_logprob: number;
    [key: string]: unknown;
  }>;
}

interface JsonTranscriptionResponse {
  text: string;
}

/**
 * Transcribe audio using OpenAI's Whisper API
 * @param audioBuffer - The audio data as a Buffer
 * @param options - Transcription options
 * @returns Promise<TranscriptionResult>
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    const {
      language = 'en',
      prompt,
      responseFormat = 'verbose_json',
      temperature = 0
    } = options;

    console.log('Starting audio transcription with OpenAI Whisper API...');

    // Create a File object from the buffer for the OpenAI API
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language,
      prompt,
      response_format: responseFormat,
      temperature,
    });

    // Handle different response formats
    if (responseFormat === 'verbose_json') {
      const verboseResult = transcription as unknown as VerboseTranscriptionResponse;
      return {
        transcription: verboseResult.text,
        confidence: verboseResult.segments?.[0]?.avg_logprob || 0,
        language: verboseResult.language,
        duration: verboseResult.duration,
        requestId: generateRequestId(),
      };
    } else if (responseFormat === 'json') {
      const jsonResult = transcription as unknown as JsonTranscriptionResponse;
      return {
        transcription: jsonResult.text,
        requestId: generateRequestId(),
      };
    } else {
      // For text, srt, vtt formats
      return {
        transcription: transcription as unknown as string,
        requestId: generateRequestId(),
      };
    }

  } catch (error) {
    console.error('Audio transcription failed:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Queue audio transcription for processing
 * @param audioBuffer - The audio data as a Buffer
 * @param options - Transcription options
 * @returns Promise<string> - The job ID
 */
export async function queueAudioTranscription(
  audioBuffer: Buffer,
  options: TranscriptionOptions = {}
): Promise<string> {
  try {
    const audioProcessingQueue = await getAudioProcessingQueue();
    
    const job = await audioProcessingQueue.add(JOB_TYPES.AUDIO_TRANSCRIPTION, {
      audioBuffer: audioBuffer.toString('base64'), // Convert to base64 for queue storage
      options,
      requestId: generateRequestId(),
      timestamp: Date.now(),
    });

    console.log(`Audio transcription queued with job ID: ${job.id}`);
    return job.id.toString();

  } catch (error) {
    console.error('Failed to queue audio transcription:', error);
    throw new Error(`Failed to queue transcription: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert audio blob to buffer for transcription
 * @param audioBlob - The audio blob from MediaRecorder
 * @returns Promise<Buffer>
 */
export async function audioBlobToBuffer(audioBlob: Blob): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const buffer = Buffer.from(arrayBuffer);
        resolve(buffer);
      } catch (error) {
        console.error('Failed to convert audio blob to buffer:', error);
        reject(new Error('Failed to convert audio blob to buffer'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read audio blob'));
    reader.readAsArrayBuffer(audioBlob);
  });
}

/**
 * Convert base64 string back to buffer
 * @param base64String - The base64 encoded audio data
 * @returns Buffer
 */
export function base64ToBuffer(base64String: string): Buffer {
  return Buffer.from(base64String, 'base64');
}

/**
 * Generate a unique request ID
 * @returns string
 */
function generateRequestId(): string {
  return `transcription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate audio format and size
 * @param audioBuffer - The audio data as a Buffer
 * @returns boolean
 */
export function validateAudioInput(audioBuffer: Buffer): boolean {
  // Check if buffer is not empty
  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error('Audio buffer is empty');
  }

  // Check file size (OpenAI Whisper has a 25MB limit)
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (audioBuffer.length > maxSize) {
    throw new Error('Audio file is too large. Maximum size is 25MB');
  }

  return true;
}

/**
 * Get supported audio formats for Whisper API
 * @returns string[]
 */
export function getSupportedAudioFormats(): string[] {
  return [
    'mp3',
    'mp4',
    'mpeg',
    'mpga',
    'm4a',
    'wav',
    'webm'
  ];
} 