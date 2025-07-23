# Setup Guide

## Environment Variables

To use the audio features (transcription and text-to-speech), you need to set up the following environment variables:

### 1. Create Environment File

Create a `.env.local` file in the root directory of your project:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Redis Configuration (for queue system)
REDIS_URL=redis://localhost:6379
```

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to "API Keys" in your account settings
4. Create a new API key
5. Copy the key and paste it in your `.env.local` file

### 3. Restart Development Server

After setting up the environment variables, restart your development server:

```bash
npm run dev
# or
pnpm dev
```

## Audio Features

### Speech-to-Text (Transcription)
- Uses OpenAI's Whisper API (`whisper-1` model)
- Supports multiple audio formats (mp3, mp4, mpeg, mpga, m4a, wav, webm)
- Maximum file size: 25MB
- High-quality transcription with confidence scores

### Text-to-Speech (TTS)
- Uses OpenAI's TTS API (`tts-1` model)
- Available voices: alloy, echo, fable, onyx, nova, shimmer
- Supports speed control (0.25x to 4.0x)
- Multiple output formats (mp3, opus, aac, flac)
- Maximum text length: 4096 characters

## Testing the Features

### Transcription Test
1. Visit `/transcribe-test` in your browser
2. Click "Start Recording" and speak into your microphone
3. Click "Stop Recording" to transcribe your audio
4. The transcribed text should appear below

### TTS Test
1. Use any chat page (e.g., `/corporate/chat`)
2. Send a message and wait for the assistant response
3. Click the play button next to the assistant's message
4. The text should be converted to speech using OpenAI's TTS

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Make sure you have created a `.env.local` file
   - Verify the `OPENAI_API_KEY` is set correctly
   - Restart your development server

2. **"OpenAI API authentication failed"**
   - Check that your API key is valid
   - Ensure you have sufficient credits in your OpenAI account

3. **"Audio file is too large" (Transcription)**
   - Keep recordings under 25MB
   - Try shorter recordings

4. **"Text is too long" (TTS)**
   - Keep text under 4096 characters
   - Split long text into smaller chunks

5. **"No audio data recorded"**
   - Check microphone permissions in your browser
   - Ensure your microphone is working
   - Try refreshing the page

### Browser Requirements

- Modern browser with MediaRecorder API support
- Microphone access permissions
- HTTPS connection (required for microphone access)

## Cost Information

### OpenAI API Pricing
- **Whisper API (Transcription)**: $0.006 per minute of audio
- **TTS API (Text-to-Speech)**: $0.015 per 1K characters

### Example Costs
- 1 hour of audio transcription: $0.36
- 1000 characters of TTS: $0.015
- 10,000 characters of TTS: $0.15

Monitor your usage at [OpenAI Platform](https://platform.openai.com/usage)

## Voice Options

### Available TTS Voices
- **Alloy**: Balanced, neutral voice
- **Echo**: Clear, professional voice  
- **Fable**: Warm, storytelling voice
- **Onyx**: Deep, authoritative voice
- **Nova**: Bright, energetic voice
- **Shimmer**: Soft, gentle voice

### Usage
You can specify a voice when using the TTS functionality:
```typescript
// In components
<AudioPlayer text="Hello world" voice="nova" />

// In hooks
playText("Hello world", "echo")
```
