# HeyGen Interactive Avatar Integration

This document describes the HeyGen Speech Avatar WebRTC integration with the Buddy AI Corporate Wellness Chat.

## Overview

The integration adds real-time interactive video avatars to the corporate wellness chat, enabling users to have face-to-face conversations with AI-powered avatars using speech recognition and synthesis.

## Features

- **Interactive Video Avatars**: Real-time streaming avatars that respond to user speech
- **Speech-to-Text**: Automatic transcription of user speech using Deepgram
- **Text-to-Speech**: Natural voice synthesis with multiple voice options
- **WebRTC Support**: Low-latency video streaming
- **Customizable Avatars**: Multiple avatar options with different appearances
- **Voice Emotions**: Configurable voice emotions (Friendly, Professional, Calm, Energetic)

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# HeyGen API Configuration
HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_HEYGEN_BASE_API_URL=https://api.heygen.com
```

### 2. Obtaining HeyGen API Key

1. Sign up for a HeyGen account at [app.heygen.com](https://app.heygen.com)
2. Navigate to Settings > Subscriptions & API
3. Copy your API key
4. Note: You need an Enterprise API key for Interactive Avatar functionality

### 3. Installation

The required dependencies are already installed:
```bash
pnpm add @heygen/streaming-avatar
```

## Usage

### Accessing the Avatar Feature

1. Navigate to `/corporate/chat`
2. Click on the "Video Avatar" tab
3. Configure your avatar settings:
   - Select an avatar from the dropdown
   - Choose voice emotion
   - Adjust video quality
   - Set language preference
   - Configure speaking rate

4. Start a session:
   - Click "Start Voice Chat" for speech-based interaction
   - Click "Start Text Chat" for text-based interaction with avatar

### Available Avatars

- **Anna (Public)** - Professional female avatar (default)
- **Susan** - Friendly female avatar
- **Angela** - Business professional female avatar
- **Nisha** - Casual female avatar
- **Lara** - Modern female avatar
- **Wayne** - Professional male avatar
- **Tyler (Business)** - Male avatar in business suit
- **Josh (Casual)** - Casual male avatar
- **Alex (Casual)** - Friendly male avatar

### Voice Configuration

The system supports multiple voice emotions:
- **Friendly** - Warm and approachable tone
- **Professional** - Formal business tone
- **Calm** - Soothing and relaxed tone
- **Energetic** - Enthusiastic and upbeat tone

## Technical Architecture

### Components

1. **InteractiveAvatar** (`/components/heygen/InteractiveAvatar.tsx`)
   - Main component managing avatar sessions
   - Handles token fetching and session initialization

2. **AvatarVideo** (`/components/heygen/AvatarVideo.tsx`)
   - Video display component with WebRTC stream handling

3. **AvatarControls** (`/components/heygen/AvatarControls.tsx`)
   - UI controls for voice chat, text chat, and session management

4. **AvatarConfig** (`/components/heygen/AvatarConfig.tsx`)
   - Configuration interface for avatar settings

### Hooks

1. **useStreamingAvatarSession** - Manages avatar session lifecycle
2. **useVoiceChat** - Handles voice chat functionality
3. **StreamingAvatarContext** - Provides session state and controls

### API Integration

- **Token Generation**: `/api/heygen/get-access-token`
  - Generates secure access tokens for client-side avatar sessions
  - Tokens are short-lived for security

## Best Practices

1. **Session Management**
   - Always properly end sessions when done
   - Handle disconnections gracefully
   - Monitor connection quality

2. **Performance**
   - Use appropriate video quality based on network conditions
   - Consider using lower quality for mobile users
   - Implement proper loading states

3. **User Experience**
   - Provide clear visual feedback for speaking/listening states
   - Show connection status indicators
   - Offer fallback to text chat if video fails

## Troubleshooting

### Common Issues

1. **Avatar not appearing**
   - Check if API key is correctly set
   - Verify you have an Enterprise HeyGen account
   - Check browser console for errors

2. **Voice chat not working**
   - Ensure microphone permissions are granted
   - Check if browser supports WebRTC
   - Verify STT provider (Deepgram) is accessible

3. **Poor video quality**
   - Check network connection
   - Try reducing video quality setting
   - Ensure sufficient bandwidth

### Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited WebRTC support, may have issues
- Mobile browsers: Variable support, test thoroughly

## Security Considerations

1. **API Key Protection**
   - Never expose API keys in client-side code
   - Use server-side token generation
   - Implement rate limiting

2. **Session Security**
   - Tokens expire automatically
   - Sessions timeout after inactivity
   - Implement proper authentication

## Future Enhancements

1. **Multi-language Support**
   - Expand language options
   - Add real-time translation

2. **Custom Avatars**
   - Allow users to create custom avatars
   - Integrate with HeyGen's avatar creation API

3. **Advanced Features**
   - Background removal (chroma key)
   - Gesture recognition
   - Emotion detection

## Resources

- [HeyGen Documentation](https://docs.heygen.com)
- [Streaming Avatar SDK Reference](https://docs.heygen.com/docs/streaming-avatar-sdk-reference)
- [Interactive Avatar 101](https://help.heygen.com/en/articles/9182113-interactive-avatar-101-your-ultimate-guide)
- [Demo Repository](https://github.com/HeyGen-Official/InteractiveAvatarNextJSDemo)