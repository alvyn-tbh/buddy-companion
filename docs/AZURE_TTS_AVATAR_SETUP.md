# Azure Text-to-Speech Avatar Setup

This document explains how to set up Azure Text-to-Speech Avatar functionality for speech-to-video responses in the AI Companion application.

## Prerequisites

1. **Azure Subscription**: You need an active Azure subscription
2. **Azure Speech Service**: Create a Speech service resource in Azure Portal

## Azure Speech Service Setup

### 1. Create Speech Service Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Speech" and select "Speech"
4. Configure the resource:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose a region (e.g., East US, West US 2)
   - **Name**: Your speech service name
   - **Pricing Tier**: Choose based on your needs (F0 for free tier)

### 2. Get Credentials

After creating the resource:
1. Go to your Speech service resource
2. Navigate to "Keys and Endpoint"
3. Copy:
   - **Key 1** (Speech Key)
   - **Region** (e.g., eastus, westus2)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Azure Speech Service Credentials
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_azure_speech_key_here
NEXT_PUBLIC_AZURE_SPEECH_REGION=your_azure_region_here
```

### Example:
```env
NEXT_PUBLIC_AZURE_SPEECH_KEY=1234567890abcdef1234567890abcdef
NEXT_PUBLIC_AZURE_SPEECH_REGION=eastus
```

## Available Avatar Configuration

### Characters
- `lisa` - Female avatar (default)
- `anna` - Female avatar
- `james` - Male avatar
- `michelle` - Female avatar
- `william` - Male avatar

### Styles
- `casual-sitting` - Casual seated pose (default)
- `business-sitting` - Professional seated pose
- `friendly-standing` - Friendly standing pose
- `newscast-sitting` - News anchor style
- `technical-standing` - Technical presentation style

### Voices
- `en-US-JennyNeural` - Jenny (US English) - default
- `en-US-GuyNeural` - Guy (US English)
- `en-US-AriaNeural` - Aria (US English)
- `en-US-DavisNeural` - Davis (US English)
- And many more...

## How to Use

### Basic Usage
1. **Enable Speech-to-Video Mode**: Click the video icon in the chat textarea
2. **Speak Your Message**: Use voice input or type your message
3. **Get Avatar Response**: The AI will respond with both text and avatar video

### Advanced Usage with State Management

#### Using the Custom Hook
```tsx
import { useSpeechToVideo } from '@/lib/hooks/use-speech-to-video';

function MyComponent() {
  const {
    state,
    startSpeechToVideo,
    stopSpeechToVideo,
    speakText,
    isAvailable
  } = useSpeechToVideo();

  const handleStart = async () => {
    try {
      await startSpeechToVideo({
        avatarCharacter: 'lisa',
        avatarStyle: 'business-sitting',
        voice: 'en-US-JennyNeural'
      });
    } catch (error) {
      console.error('Failed to start:', error);
    }
  };

  return (
    <div>
      <p>Status: {state.connectionStatus}</p>
      <p>Speaking: {state.isSpeaking ? 'Yes' : 'No'}</p>
      <button onClick={handleStart} disabled={!isAvailable}>
        Start Avatar
      </button>
    </div>
  );
}
```

#### Using the Context Provider
```tsx
import { SpeechToVideoProvider, useSpeechToVideoContext } from '@/lib/context/speech-to-video-context';

function App() {
  return (
    <SpeechToVideoProvider>
      <MyAvatarComponent />
    </SpeechToVideoProvider>
  );
}

function MyAvatarComponent() {
  const { state, speakText } = useSpeechToVideoContext();
  
  const handleSpeak = async () => {
    if (state.isReady) {
      await speakText("Hello, I'm your AI avatar!");
    }
  };

  return (
    <button onClick={handleSpeak} disabled={!state.isReady}>
      {state.isSpeaking ? 'Speaking...' : 'Say Hello'}
    </button>
  );
}
```

## Features

- **Real-time Avatar Generation**: Responses are generated in real-time
- **Lip Sync**: Avatar lip movements are synchronized with speech
- **Multiple Characters**: Choose from different avatar characters
- **Voice Variety**: Multiple neural voices available
- **Quality Control**: High-quality video output at 2 Mbps
- **State Management**: Comprehensive state tracking and management
- **Context Provider**: Global state management across components
- **Custom Hooks**: Reusable hooks for avatar functionality

## State Management

### Speech-to-Video State Interface
```typescript
interface SpeechToVideoState {
  isActive: boolean;        // Whether avatar mode is active
  isConnecting: boolean;    // Whether currently connecting
  connectionStatus: string; // Current connection status
  isSpeaking: boolean;      // Whether avatar is currently speaking
  error: string | null;     // Any error messages
  isReady: boolean;         // Whether avatar is ready to speak
}
```

### Available Status Values
- `''` - Inactive/Disconnected
- `'Connected'` - Avatar ready to speak
- `'Speaking'` - Avatar currently speaking
- `'Error'` - Connection or synthesis error
- `'Disconnected'` - Avatar disconnected

### State Transitions
1. **Inactive** → **Connecting** → **Connected** → **Ready**
2. **Ready** → **Speaking** → **Ready** (during speech)
3. **Any State** → **Error** (on failures)
4. **Any State** → **Disconnected** (on manual stop)

## Troubleshooting

### Common Issues

1. **"Azure Speech credentials not configured"**
   - Ensure environment variables are set correctly
   - Restart the development server after adding variables

2. **"Failed to load Azure Speech SDK"**
   - Check internet connection
   - Ensure the CDN link is accessible

3. **Avatar initialization fails**
   - Verify your Azure Speech service is active
   - Check if you have available quota
   - Ensure the region matches your Speech service region

4. **Video playback issues**
   - Ensure your browser supports HTML5 video
   - Check if WebRTC is enabled in your browser
   - Try refreshing the page

### Debugging

Enable debug logging by adding to your environment:
```env
NEXT_PUBLIC_DEBUG_AVATAR=true
```

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Required Features
- WebRTC support
- HTML5 video support
- JavaScript enabled

## Cost Considerations

Azure Text-to-Speech Avatar pricing:
- **Free Tier**: 500,000 characters per month
- **Standard**: $15 per 1M characters for neural voices
- **Avatar Enhancement**: Additional cost for video generation

Monitor usage in Azure Portal under your Speech service resource.

## Security Notes

1. **Environment Variables**: Keep your Speech keys secure
2. **Client-side Keys**: Using `NEXT_PUBLIC_` exposes keys to client
3. **Production**: Consider server-side proxy for production apps
4. **Rotation**: Regularly rotate your Azure keys

## Support

For Azure Speech service issues:
- [Azure Speech Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [Azure Support Portal](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)

For application issues:
- Check browser console for errors
- Verify environment variable configuration
- Test with different browsers 