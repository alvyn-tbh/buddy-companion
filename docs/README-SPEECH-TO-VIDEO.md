# Speech-to-Video Implementation

A comprehensive implementation of Azure Text-to-Speech Avatar functionality integrated into a Next.js React application, providing real-time speech-to-video AI conversations.

## 🌟 Features

- **🎭 Real-time Avatar Generation**: Lifelike video responses with synchronized lip movements
- **🎤 Speech Recognition**: Advanced voice input with OpenAI Whisper integration
- **🧠 State Management**: Comprehensive state tracking and management system
- **🔄 Context Provider**: Global state management across components
- **⚛️ Custom Hooks**: Reusable hooks for avatar functionality
- **🛡️ Error Recovery**: Robust error handling with automatic retry mechanisms
- **🎨 Multiple Avatars**: Various characters and presentation styles available
- **🗣️ Neural Voices**: High-quality Azure neural voice synthesis

## 📁 File Structure

```
├── components/
│   ├── textarea.tsx                    # Enhanced textarea with speech-to-video button
│   ├── video-avatar.tsx                # Video avatar component
│   └── speech-to-video-example.tsx     # Complete demo component
├── lib/
│   ├── azure-tts-avatar.ts             # Azure TTS Avatar service
│   ├── hooks/
│   │   └── use-speech-to-video.tsx     # Custom hook for state management
│   └── context/
│       └── speech-to-video-context.tsx # Context provider
├── app/
│   └── speech-to-video-demo/
│       └── page.tsx                    # Demo page
├── docs/
│   └── AZURE_TTS_AVATAR_SETUP.md       # Setup documentation
└── __tests__/
    └── speech-to-video.test.tsx        # Comprehensive tests
```

## 🚀 Quick Start

### 1. Environment Setup

Add to your `.env.local`:

```env
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_azure_speech_key
NEXT_PUBLIC_AZURE_SPEECH_REGION=your_azure_region
```

### 2. Basic Usage

```tsx
import { useSpeechToVideo } from '@/lib/hooks/use-speech-to-video';

function MyComponent() {
  const { state, startSpeechToVideo, speakText } = useSpeechToVideo();

  return (
    <div>
      <button onClick={() => startSpeechToVideo()}>
        Start Avatar
      </button>
      <p>Status: {state.connectionStatus}</p>
    </div>
  );
}
```

### 3. With Context Provider

```tsx
import { SpeechToVideoProvider } from '@/lib/context/speech-to-video-context';

function App() {
  return (
    <SpeechToVideoProvider>
      <MyAvatarComponents />
    </SpeechToVideoProvider>
  );
}
```

## 🎛️ State Management

### State Interface

```typescript
interface SpeechToVideoState {
  isActive: boolean;        // Avatar mode active
  isConnecting: boolean;    // Connection in progress
  connectionStatus: string; // Current status
  isSpeaking: boolean;      // Avatar speaking
  error: string | null;     // Error messages
  isReady: boolean;         // Ready to speak
}
```

### Status Values

- `''` - Inactive/Disconnected
- `'Connected'` - Avatar ready
- `'Speaking'` - Currently speaking
- `'Error'` - Connection error
- `'Disconnected'` - Manual disconnect

## 🎨 Available Avatars

### Characters
- **Lisa** - Female avatar (default)
- **Anna** - Female avatar
- **James** - Male avatar
- **Michelle** - Female avatar
- **William** - Male avatar

### Styles
- **casual-sitting** - Casual seated pose (default)
- **business-sitting** - Professional seated
- **friendly-standing** - Friendly standing
- **newscast-sitting** - News anchor style
- **technical-standing** - Technical presentation

### Voices
- **en-US-JennyNeural** - Jenny (default)
- **en-US-GuyNeural** - Guy
- **en-US-AriaNeural** - Aria
- **en-US-DavisNeural** - Davis
- And many more...

## 🔧 API Reference

### useSpeechToVideo Hook

```typescript
const {
  state,                    // Current state
  avatar,                   // Avatar instance
  startSpeechToVideo,       // Start function
  stopSpeechToVideo,        // Stop function
  speakText,               // Speak function
  isAvailable              // Availability check
} = useSpeechToVideo();
```

### Configuration Options

```typescript
await startSpeechToVideo({
  speechKey: 'custom-key',
  speechRegion: 'custom-region',
  avatarCharacter: 'anna',
  avatarStyle: 'business-sitting',
  voice: 'en-US-AriaNeural'
});
```

## 🧪 Testing

The implementation includes comprehensive tests covering:

- Hook functionality
- Context provider behavior
- Error handling scenarios
- State transitions
- Integration testing

Run tests with:
```bash
npm test speech-to-video
```

## 🎯 Demo

Visit the demo page at `/speech-to-video-demo` to see the complete implementation in action.

## 🔄 Integration with Existing Components

The speech-to-video button is already integrated into the main textarea component:

```tsx
<Textarea
  // ... existing props
  onSpeechToVideoStateChange={(state) => {
    console.log('Avatar state:', state);
  }}
/>
```

## 🛠️ Architecture

### Component Architecture
```
SpeechToVideoProvider (Context)
├── Textarea (Main Interface)
│   ├── Speech-to-Video Button
│   └── Status Indicators
├── VideoAvatar (Display)
│   ├── Video Element
│   ├── Controls
│   └── Status Overlay
└── SpeechToVideoExample (Demo)
    ├── Chat Interface
    ├── Status Cards
    └── Instructions
```

### Data Flow
1. User clicks speech-to-video button
2. Azure TTS Avatar initializes
3. State updates propagate through context
4. UI reflects current status
5. User speaks → AI responds → Avatar speaks
6. Real-time state management throughout

## 📚 References

- [Azure Text-to-Speech Avatar Documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/real-time-synthesis-avatar)
- [Azure Speech Service](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/)
- [React Custom Hooks](https://reactjs.org/docs/hooks-custom.html)
- [Context API](https://reactjs.org/docs/context.html)

## 🤝 Contributing

1. Follow the existing code patterns
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure proper error handling
5. Test with actual Azure credentials

## 📋 Todo Checklist

- [x] ✅ Add Azure TTS Avatar button to textarea component
- [x] ✅ Create Azure TTS Avatar service integration
- [x] ✅ Add environment variables for Azure credentials
- [x] ✅ Implement video avatar component
- [x] ✅ Add speech-to-video mode state management
- [x] ✅ Update textarea to use Azure TTS Avatar for responses
- [x] ✅ Create example usage documentation
- [x] ✅ Build comprehensive demo page
- [x] ✅ Add context provider for global state
- [x] ✅ Create custom hooks for reusability
- [x] ✅ Implement comprehensive testing suite

## 🎉 Completion

All todos have been completed! The speech-to-video implementation is now fully functional with:

- Complete Azure integration
- Comprehensive state management
- Reusable components and hooks
- Full documentation and examples
- Production-ready error handling
- Extensive testing coverage

The implementation demonstrates modern React patterns and provides a solid foundation for speech-to-video AI conversations. 