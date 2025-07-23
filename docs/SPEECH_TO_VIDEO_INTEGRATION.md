# Speech-to-Video Integration Documentation

## Overview

The Speech-to-Video system provides a complete conversational experience where users speak naturally, their speech is processed by GPT using the corporate wellness system prompt, and responses are delivered via lifelike Azure Text-to-Speech avatars.

## Complete Flow

```
🎤 User Speech → 📝 Text Conversion → 🧠 GPT Processing → 🎬 Avatar Response
```

### 1. Speech Recognition (Browser-based)
- Uses Web Speech API (`SpeechRecognition`)
- Continuous listening with interim results
- Automatic speech detection and processing
- Supports English language recognition

### 2. Corporate GPT Integration
- Text sent to `/api/corporate` endpoint
- Processed with corporate wellness system prompt
- Maintains conversation context
- Streaming response handling

### 3. Azure TTS Avatar Generation
- Converts AI response to lifelike video
- Synchronized lip movements
- Multiple avatar characters available
- Real-time video generation

## Architecture

### Core Components

#### 1. `SpeechToVideoService` (`lib/speech-to-video-service.ts`)
The main orchestrator that handles the complete flow:

```typescript
interface SpeechToVideoConfig {
  speechKey: string;
  speechRegion: string;
  avatarCharacter?: string;
  avatarStyle?: string;
  voice?: string;
  corporateApiUrl?: string;
}
```

**Key Methods:**
- `initialize(videoElement)` - Sets up avatar and speech recognition
- `startListening()` - Begins speech recognition
- `processSpeech(transcript)` - Handles speech-to-GPT-to-avatar flow
- `disconnect()` - Cleanup and shutdown

#### 2. Enhanced Textarea Component (`components/textarea.tsx`)
- Integrated speech-to-video button (purple video icon)
- Real-time status indicators
- Floating avatar video display
- State management and event handling

#### 3. Corporate API (`app/api/corporate/route.ts`)
- Processes text with corporate wellness system prompt
- Streams GPT responses
- Maintains conversation context
- Usage tracking integration

### State Management

```typescript
interface SpeechToVideoState {
  isActive: boolean;        // Overall system active
  isListening: boolean;     // Currently listening for speech
  isProcessing: boolean;    // Processing speech through GPT
  isSpeaking: boolean;      // Avatar currently speaking
  isConnecting: boolean;    // Initializing connection
  connectionStatus: string; // Status message
  error: string | null;     // Error state
  transcript: string;       // Current speech transcript
  aiResponse: string;       // AI response text
}
```

## Usage

### Basic Integration

1. **Environment Setup**
```env
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_azure_speech_key
NEXT_PUBLIC_AZURE_SPEECH_REGION=your_azure_region
OPENAI_API_KEY=your_openai_api_key
```

2. **Start Speech-to-Video**
- Click the purple video icon in the textarea
- Grant microphone permissions when prompted
- Start speaking naturally when "Ready - Start speaking!" appears

3. **Conversation Flow**
- Speak your question or concern
- Watch as your speech appears as text
- AI processes with corporate wellness context
- Avatar delivers personalized video response
- System continues listening for follow-up

### Corporate Chat Integration

The system is specifically designed for corporate wellness conversations:

#### System Prompt Features
- **Emotionally intelligent responses** for workplace stress
- **Micro-coaching moments** for decision support
- **Overwhelm mode** for stress relief
- **Venting mode** for emotional processing
- **Loop interruption** for overthinking patterns

#### Example Conversations

**Stress Management:**
```
User: "I'm feeling overwhelmed with back-to-back meetings"
AI: "That sounds exhausting. Let's take a moment to breathe together. 
     Would you like a 2-minute breathing rhythm to help you reset?"
```

**Decision Support:**
```
User: "Should I speak up about this issue or stay quiet?"
AI: "It sounds like you're weighing important options. What matters 
     most to you in this choice? We can practice a brief script if helpful."
```

## Technical Implementation

### Speech Recognition Setup

```typescript
// Initialize browser speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
this.recognition = new SpeechRecognition();
this.recognition.continuous = true;
this.recognition.interimResults = true;
this.recognition.lang = 'en-US';
```

### Corporate API Integration

```typescript
// Send to corporate API with conversation context
const response = await fetch('/api/corporate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: conversationHistory,
    existingThreadId: `speech-to-video-${timestamp}`
  })
});
```

### Avatar Video Display

The avatar video is automatically positioned as a floating overlay:

```css
.speech-to-video-avatar {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  height: 225px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 1000;
  background: #000;
}
```

## Configuration Options

### Avatar Characters
- **lisa** - Female avatar (default)
- **anna** - Female avatar
- **james** - Male avatar
- **michelle** - Female avatar
- **william** - Male avatar

### Avatar Styles
- **casual-sitting** - Casual seated pose (default)
- **business-sitting** - Professional seated
- **friendly-standing** - Friendly standing
- **newscast-sitting** - News anchor style
- **technical-standing** - Technical presentation

### Voice Options
- **en-US-JennyNeural** - Jenny (default)
- **en-US-GuyNeural** - Guy
- **en-US-AriaNeural** - Aria
- **en-US-DavisNeural** - Davis
- And many more Azure neural voices

## Error Handling

### Common Issues and Solutions

#### 1. Microphone Access Denied
```
Error: "Speech recognition not available"
Solution: Grant microphone permissions in browser settings
```

#### 2. Azure Credentials Missing
```
Error: "Azure Speech credentials not configured"
Solution: Set NEXT_PUBLIC_AZURE_SPEECH_KEY and NEXT_PUBLIC_AZURE_SPEECH_REGION
```

#### 3. Network Connectivity
```
Error: "Corporate API error: 500"
Solution: Check internet connection and API server status
```

#### 4. Speech Recognition Not Supported
```
Error: "Speech recognition not supported in this browser"
Solution: Use Chrome, Edge, or Safari (WebKit-based browsers)
```

## Performance Considerations

### Optimization Features
- **Lazy loading** of speech-to-video service
- **Conversation context limiting** (last 10 messages)
- **Automatic cleanup** of resources on disconnect
- **Efficient streaming** of API responses
- **Memory management** for audio processing

### Bandwidth Usage
- **Avatar video**: ~2 Mbps during active speech
- **API calls**: Minimal text-based requests
- **Audio processing**: Local browser processing

## Testing and Debugging

### Debug Mode
Enable console logging to track the speech-to-video flow:

```typescript
// Add to speech-to-video-service.ts for debugging
console.log('Speech recognized:', transcript);
console.log('GPT response:', aiResponse);
console.log('Avatar status:', state);
```

### Demo Page
Visit `/speech-to-video-demo` for:
- Complete demonstration
- Visual flow explanation
- Testing environment
- Configuration examples

## Security and Privacy

### Data Handling
- **Speech data**: Processed locally in browser, not stored
- **Conversation context**: Temporary, cleared on disconnect
- **Azure integration**: Follows Azure security standards
- **API calls**: Secure HTTPS communication

### Privacy Features
- No persistent storage of voice data
- Conversation history limited to session
- User can disconnect at any time
- Transparent data usage

## Future Enhancements

### Planned Features
- **Multi-language support** for international teams
- **Custom avatar training** for brand personalization
- **Voice emotion detection** for enhanced responses
- **Background noise reduction** for better recognition
- **Mobile app integration** for cross-platform use

### Advanced Integrations
- **Calendar integration** for meeting stress management
- **Slack/Teams integration** for workplace wellness
- **Analytics dashboard** for usage insights
- **Custom system prompts** for different departments

## Support and Troubleshooting

### Common Questions

**Q: Why isn't the avatar appearing?**
A: Check Azure credentials and browser console for errors.

**Q: Speech recognition is inaccurate**
A: Ensure quiet environment and clear speech. Check microphone settings.

**Q: Responses are too slow**
A: Check internet connection and OpenAI API rate limits.

**Q: Avatar video quality is poor**
A: Verify adequate bandwidth (2+ Mbps recommended).

### Getting Help
1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Test with the demo page first
4. Review Azure Speech Service status
5. Check OpenAI API quota and usage

## Integration Examples

### Basic Corporate Chat
```typescript
// In your component
import { Textarea } from '@/components/textarea';

<Textarea
  // ... other props
  onSpeechToVideoStateChange={(state) => {
    console.log('Speech-to-video state:', state);
  }}
/>
```

### Custom Implementation
```typescript
import { SpeechToVideoService } from '@/lib/speech-to-video-service';

const service = new SpeechToVideoService({
  speechKey: process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
  speechRegion: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!,
  corporateApiUrl: '/api/corporate'
});

await service.initialize(videoElement);
service.startListening();
```

This integration provides a seamless, professional-grade speech-to-video conversational experience optimized for corporate wellness and emotional support scenarios. 