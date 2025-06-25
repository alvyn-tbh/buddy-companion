# WebRTC Voice Mode Implementation

This document describes the implementation of real-time speech-to-speech functionality using OpenAI's Realtime API with WebRTC.

## Overview

The voice mode feature provides real-time conversational AI using OpenAI's Realtime API, which enables:
- Real-time speech recognition
- Live AI responses with voice synthesis
- Low-latency communication via WebRTC
- Natural conversation flow

## Architecture

### Components

1. **RealtimeWebRTC Class** (`lib/realtime-webrtc.ts`)
   - Manages WebRTC peer connection with OpenAI
   - Handles session creation and lifecycle
   - Processes real-time events and audio streams

2. **Session API** (`app/api/realtime/session/route.ts`)
   - Creates OpenAI Realtime sessions
   - Returns ephemeral client secrets for WebRTC connection

3. **Textarea Component** (`components/textarea.tsx`)
   - Integrates voice mode button
   - Manages connection state and UI feedback
   - Displays real-time transcripts

4. **Test Page** (`app/realtime-test/page.tsx`)
   - Standalone testing interface
   - Demonstrates WebRTC functionality

## Implementation Details

### WebRTC Connection Flow

1. **Session Creation**
   ```typescript
   const session = await realtime.createSession({
     model: 'gpt-4o-realtime-preview-2024-12-17',
     voice: 'alloy',
     instructions: "You are a helpful AI assistant..."
   });
   ```

2. **WebRTC Setup**
   - Initialize RTCPeerConnection with STUN servers
   - Get user media for microphone access
   - Create data channel for event communication

3. **Connection Establishment**
   - Create and send SDP offer to OpenAI
   - Receive and set SDP answer
   - Establish peer-to-peer connection

4. **Real-time Communication**
   - Send audio streams to OpenAI
   - Receive AI voice responses
   - Handle session events and transcripts

### Event Handling

The system handles various real-time events:

- `session.created` - Session initialization
- `session.updated` - Configuration changes
- `input_audio_buffer.speech_started` - User begins speaking
- `input_audio_buffer.speech_stopped` - User stops speaking
- `response.audio_transcript.delta` - Streaming transcript updates
- `response.done` - AI response completion

### Audio Processing

- **Input**: Microphone audio stream via getUserMedia()
- **Output**: AI voice responses played through HTML audio element
- **Format**: PCM16 audio format for optimal quality
- **Sample Rate**: 16kHz for efficient processing

## Usage

### In Chat Interface

The voice mode button is integrated into the textarea component:

```typescript
<Button
  variant={isVoiceModeActive ? "default" : "ghost"}
  size="icon"
  onClick={toggleVoiceMode}
  disabled={isLoading || isRecording || isTranscribing || isConnecting}
>
  {isVoiceModeActive ? (
    <MessageCircleOff className="h-5 w-5 text-white" />
  ) : (
    <MessageCircle className="h-5 w-5" />
  )}
</Button>
```

### Voice Mode States

1. **Inactive** - Default state, button shows voice mode icon
2. **Connecting** - Establishing WebRTC connection, shows spinner
3. **Active** - Connected and ready for conversation, button shows stop icon
4. **Error** - Connection failed, shows error message

### Status Indicators

- **Connection Status**: Real-time display of connection state
- **Transcript Display**: Live transcription of user speech
- **Visual Feedback**: Color-coded status indicators and animations

## Configuration

### Supported Models

- `gpt-4o-realtime-preview-2024-12-17` (Recommended)
- `gpt-4o-mini-realtime-preview-2024-12-17` (Faster, lower cost)

### Supported Voices

- `alloy` - Balanced, neutral voice
- `echo` - Clear, professional voice
- `fable` - Warm, storytelling voice
- `onyx` - Deep, authoritative voice
- `nova` - Bright, energetic voice
- `shimmer` - Soft, gentle voice

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Testing

### Test Page

Visit `/realtime-test` to test the WebRTC implementation:

1. Select desired voice
2. Click "Connect" to establish connection
3. Speak into microphone
4. Listen to AI responses
5. Click "Disconnect" to end session

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Limited support (HTTPS required)

## Troubleshooting

### Common Issues

1. **Microphone Access Denied**
   - Ensure browser has microphone permissions
   - Check HTTPS requirement for getUserMedia()

2. **Connection Failed**
   - Verify OpenAI API key is valid
   - Check network connectivity
   - Ensure Realtime API access is enabled

3. **Audio Not Playing**
   - Check browser audio settings
   - Verify audio element is properly initialized
   - Check for autoplay restrictions

4. **High Latency**
   - Use recommended model for better performance
   - Check network connection quality
   - Consider using STUN servers closer to user location

### Debug Information

Enable console logging to debug issues:

```typescript
// In RealtimeWebRTC class
console.log('WebRTC connection state:', this.peerConnection?.connectionState);
console.log('Data channel state:', this.dataChannel?.readyState);
```

## Security Considerations

1. **API Key Protection**
   - Never expose API keys in client-side code
   - Use server-side session creation
   - Implement proper authentication

2. **WebRTC Security**
   - Use STUN servers for NAT traversal
   - Implement proper session management
   - Handle connection cleanup

3. **Audio Privacy**
   - Inform users about audio recording
   - Implement proper consent mechanisms
   - Handle audio data securely

## Performance Optimization

1. **Audio Quality**
   - Use appropriate sample rates (16kHz)
   - Implement noise suppression
   - Optimize audio codec settings

2. **Connection Management**
   - Implement connection pooling
   - Handle reconnection scenarios
   - Optimize session lifecycle

3. **Memory Management**
   - Properly cleanup audio streams
   - Release WebRTC resources
   - Handle component unmounting

## Future Enhancements

1. **Advanced Features**
   - Multi-language support
   - Custom voice training
   - Emotion detection
   - Background noise reduction

2. **Integration Improvements**
   - WebSocket fallback
   - Offline mode support
   - Progressive web app features

3. **User Experience**
   - Voice activity detection
   - Automatic conversation flow
   - Contextual responses
   - Personalization options 