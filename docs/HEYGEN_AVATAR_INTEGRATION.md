# HeyGen Interactive Avatar Integration Guide

## Overview

This guide covers the integration of HeyGen's Interactive Avatar technology into the corporate chat application, providing real-time video conversations with AI-powered avatars.

## Features

### Core Capabilities
- **Real-time Video Streaming**: WebRTC-powered low-latency video communication
- **Speech Recognition**: Built-in Web Speech API integration for voice input
- **GPT Integration**: Seamless connection with OpenAI GPT models for intelligent responses
- **Performance Optimizations**: Pre-warmed connections, response caching, and connection pooling

### User Experience
- **Voice Interaction**: Click to speak and receive video responses
- **Text Fallback**: Switch between avatar and text chat modes
- **Visual Feedback**: Real-time audio level indicators and status updates
- **Media Controls**: Mute audio, disable video, and control playback

## Setup Instructions

### 1. HeyGen Account Setup
1. Create an account at [heygen.com](https://heygen.com)
2. Navigate to your account settings
3. Generate an API key from the API section
4. Note your account limits and available features

### 2. Environment Configuration
Add the following to your `.env.local` file:

```bash
# HeyGen Configuration
HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_HEYGEN_API_URL=https://api.heygen.com
```

### 3. Installation
The HeyGen SDK is already installed. If you need to reinstall:

```bash
npm install @heygen/streaming-avatar --legacy-peer-deps
```

## Architecture

### Service Layer (`lib/heygen-avatar-service.ts`)
- Manages WebRTC connections and session lifecycle
- Handles avatar initialization and streaming
- Integrates with GPT for response generation
- Implements singleton pattern for resource efficiency

### Optimized Service (`lib/heygen-avatar-optimized.ts`)
- Pre-warms WebRTC connections for instant availability
- Implements response caching for common queries
- Connection pooling for multiple concurrent sessions
- Prioritizes host ICE candidates for lower latency

### React Component (`components/heygen-avatar-chat.tsx`)
- Provides the UI for avatar interaction
- Manages speech recognition and audio visualization
- Handles media controls and state management
- Responsive design for desktop and mobile

## Usage

### Basic Implementation
```typescript
import { HeyGenAvatarChat } from '@/components/heygen-avatar-chat';

function ChatPage() {
  return (
    <HeyGenAvatarChat
      onTranscript={(text) => console.log('User said:', text)}
      onResponse={(response) => console.log('Avatar response:', response)}
    />
  );
}
```

### Advanced Configuration
```typescript
import { getOptimizedAvatarInstance } from '@/lib/heygen-avatar-optimized';

const avatar = getOptimizedAvatarInstance({
  apiKey: process.env.NEXT_PUBLIC_HEYGEN_API_KEY!,
  avatarId: 'custom_avatar_id',
  voiceId: 'custom_voice_id',
  enablePreWarming: true,
  enableResponseCaching: true,
  maxCacheAge: 300000, // 5 minutes
});
```

## Performance Optimizations

### 1. Connection Pre-warming
- Connections are pre-established before user interaction
- Reduces initial connection time by up to 2 seconds
- Automatic background connection refresh

### 2. Response Caching
- Frequently asked questions are cached
- Cache invalidation after 5 minutes
- Automatic cache size management

### 3. WebRTC Optimizations
- ICE candidate pooling for faster connection
- Host candidate prioritization
- Optimized audio/video constraints

### 4. Latency Reduction Strategies
- Data channel for low-latency commands
- Disabled voice activity detection in WebRTC
- Minimal retransmission for real-time data

## Troubleshooting

### Common Issues

#### Avatar Not Loading
- Check API key configuration
- Verify network connectivity
- Check browser console for errors
- Ensure WebRTC is supported in the browser

#### High Latency
- Check network connection quality
- Verify STUN server accessibility
- Consider using optimized service with pre-warming
- Check for firewall restrictions

#### Speech Recognition Issues
- Ensure microphone permissions are granted
- Check browser compatibility (Chrome/Edge recommended)
- Verify HTTPS connection (required for Web Speech API)
- Test microphone in browser settings

### Debug Mode
Enable debug logging by setting:
```javascript
console.log('Debug mode enabled');
// In your avatar service initialization
```

## API Reference

### HeyGenAvatarService

#### Methods
- `initialize(config?: SessionConfig): Promise<void>` - Initialize avatar session
- `speak(text: string, useGPT?: boolean): Promise<void>` - Send text to avatar
- `startVoiceChat(): Promise<void>` - Enable voice chat mode
- `interrupt(): Promise<void>` - Stop current speech
- `destroy(): Promise<void>` - Clean up resources

#### Events
- `onStreamReady(stream: MediaStream)` - Video stream available
- `onConnected()` - WebRTC connection established
- `onError(error: Error)` - Error occurred

### Configuration Options
```typescript
interface HeyGenConfig {
  apiKey: string;
  avatarId?: string;
  voiceId?: string;
  quality?: AvatarQuality;
}

interface OptimizationConfig {
  enablePreWarming?: boolean;
  connectionPoolSize?: number;
  enableResponseCaching?: boolean;
  maxCacheAge?: number;
  enablePredictiveLoading?: boolean;
}
```

## Best Practices

1. **Resource Management**
   - Always clean up sessions when done
   - Use singleton pattern for service instances
   - Monitor WebRTC connection state

2. **Error Handling**
   - Implement comprehensive error boundaries
   - Provide user feedback for connection issues
   - Graceful fallback to text chat

3. **Performance**
   - Use optimized service for production
   - Enable caching for common queries
   - Monitor and log performance metrics

4. **Security**
   - Keep API keys server-side only
   - Use session tokens for client authentication
   - Implement rate limiting for API calls

## Additional Resources

- [HeyGen Documentation](https://docs.heygen.com)
- [Streaming Avatar SDK Reference](https://docs.heygen.com/docs/streaming-avatar-sdk-reference)
- [WebRTC Best Practices](https://webrtc.org/getting-started/overview)
- [Web Speech API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)