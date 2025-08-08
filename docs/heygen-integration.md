# HeyGen Speech Avatar Integration

This document describes the integration of HeyGen's Interactive Avatar SDK with the corporate chat interface.

## Overview

The HeyGen integration adds a video-based conversational AI avatar to the corporate chat interface, allowing users to interact with the AI through speech and receive responses via a realistic digital avatar.

## Features

- **Real-time Avatar Streaming**: WebRTC-based streaming for low-latency avatar interactions
- **Speech-to-Text Input**: Browser-based speech recognition for voice input
- **Text Input Option**: Traditional text-based input as an alternative
- **Multiple Avatar Options**: Choose from different avatar appearances
- **Voice Selection**: Multiple voice options with different characteristics
- **Language Support**: Multi-language support for global users
- **Conversation History**: Full transcript of the conversation

## Setup

### 1. Environment Variables

Add your HeyGen API key to `.env.local`:

```bash
HEYGEN_API_KEY=your_heygen_api_key_here
```

### 2. API Key

To obtain a HeyGen API key:
1. Sign up at [HeyGen Platform](https://app.heygen.com)
2. Navigate to Settings > API Keys
3. Create a new API key
4. Copy and add it to your environment variables

## Architecture

### Components Structure

```
components/heygen/
├── InteractiveAvatar.tsx      # Main component orchestrating the avatar session
├── AvatarConfig/
│   ├── index.tsx             # Avatar configuration interface
│   └── Field.tsx             # Form field component
└── AvatarSession/
    ├── AvatarVideo.tsx       # Video display component
    ├── AudioInput.tsx        # Speech-to-text input
    ├── TextInput.tsx         # Text input component
    ├── MessageHistory.tsx    # Conversation transcript
    └── AvatarControls.tsx    # Session control buttons
```

### API Routes

- `/api/heygen/access-token` - Generates session tokens for avatar streaming

### Integration Points

The avatar is integrated into the corporate chat at `/corporate/chat` with:
- Tab-based interface switching between text chat and avatar chat
- Shared API backend for consistent responses
- Unified authentication and session management

## Usage

1. Navigate to `/corporate/chat`
2. Select the "Avatar Chat" tab
3. Configure your avatar preferences:
   - Select avatar appearance
   - Choose voice
   - Set language preference
   - Adjust video quality
4. Click "Start Avatar Session"
5. Interact via text or voice input

## Technical Details

### WebRTC Configuration

The avatar streaming uses WebRTC with the following configuration:
- High-quality video streaming
- Low-latency audio
- Automatic reconnection handling
- Network quality adaptation

### Speech Recognition

- Uses Web Speech API for browser-based speech recognition
- Continuous recognition mode for natural conversation
- Automatic language detection based on user settings

### Error Handling

- Graceful fallback for unsupported browsers
- Network error recovery
- Session timeout management
- Rate limit handling

## Best Practices

1. **Network Requirements**: Ensure stable internet connection for optimal video streaming
2. **Browser Compatibility**: Use modern browsers with WebRTC support (Chrome, Edge, Safari, Firefox)
3. **Microphone Access**: Grant microphone permissions for voice input
4. **Session Management**: End sessions when not in use to conserve resources

## Troubleshooting

### Common Issues

1. **Avatar not loading**
   - Check API key configuration
   - Verify network connectivity
   - Check browser console for errors

2. **Voice input not working**
   - Ensure microphone permissions are granted
   - Check if browser supports Web Speech API
   - Verify microphone is not muted

3. **Video quality issues**
   - Check network bandwidth
   - Try reducing quality setting
   - Close other bandwidth-intensive applications

## API Limits

- Session duration: 10 minutes per session
- Concurrent sessions: Based on your HeyGen plan
- API calls: Rate limited per your subscription tier

## Security Considerations

- API keys are kept server-side only
- Session tokens expire after use
- HTTPS required for WebRTC streaming
- No sensitive data stored in browser