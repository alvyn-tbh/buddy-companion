import { OpenAI } from 'openai';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('CRITICAL: OPENAI_API_KEY is not configured');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number; // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

export interface TTSResult {
  audioUrl: string;
  duration?: number;
  requestId: string;
}

/**
 * Convert text to speech using OpenAI's TTS API
 * @param text - The text to convert to speech
 * @param options - TTS options
 * @returns Promise<TTSResult>
 */
export async function textToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<TTSResult> {
  try {
    const {
      voice = 'alloy',
      model = 'tts-1',
      speed = 1.0,
      format = 'mp3'
    } = options;

    console.log('Starting TTS with OpenAI API...', { voice, model, speed, format });

    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      response_format: format,
      speed,
    });

    // Convert the response to a blob URL
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: `audio/${format}` });
    const audioUrl = URL.createObjectURL(blob);

    const result: TTSResult = {
      audioUrl,
      requestId: generateRequestId(),
    };

    console.log('TTS completed successfully');
    return result;

  } catch (error) {
    console.error('TTS failed:', error);
    throw new Error(`TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a unique request ID
 * @returns string
 */
function generateRequestId(): string {
  return `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get available TTS voices
 * @returns Array of voice options
 */
export function getAvailableVoices(): Array<{ value: string; label: string; description: string }> {
  return [
    { value: 'alloy', label: 'Alloy', description: 'Balanced, neutral voice' },
    { value: 'echo', label: 'Echo', description: 'Clear, professional voice' },
    { value: 'fable', label: 'Fable', description: 'Warm, storytelling voice' },
    { value: 'onyx', label: 'Onyx', description: 'Deep, authoritative voice' },
    { value: 'nova', label: 'Nova', description: 'Bright, energetic voice' },
    { value: 'shimmer', label: 'Shimmer', description: 'Soft, gentle voice' },
  ];
}

/**
 * Validate TTS options
 * @param options - TTS options to validate
 * @returns boolean
 */
export function validateTTSOptions(options: TTSOptions): boolean {
  if (options.speed && (options.speed < 0.25 || options.speed > 4.0)) {
    throw new Error('Speed must be between 0.25 and 4.0');
  }

  if (options.voice && !getAvailableVoices().some(v => v.value === options.voice)) {
    throw new Error('Invalid voice option');
  }

  return true;
} 