# Avatar Integration Documentation

## Overview

The Avatar Integration feature provides real-time AI avatars powered by Azure Speech Services. This feature enables creating engaging, interactive experiences with customizable 3D avatars that can speak, express emotions, and interact with users in real-time.

## Features

### Phase 1: Core Avatar Integration
- ✅ **Azure Avatar Service Integration** - Full integration with Azure Text-to-Speech Avatar API
- ✅ **Avatar Selection UI** - Interactive UI for selecting avatar characters, styles, and voices
- ✅ **Video Playback Component** - Enhanced video player with controls and synchronization
- ✅ **Audio/Video Sync** - Perfect synchronization between avatar speech and video

### Phase 2: Enhanced Features
- ✅ **Real-time Avatar Streaming** - WebRTC-based streaming for low-latency interactions
- ✅ **Custom Avatar Backgrounds** - Choose from predefined or upload custom backgrounds
- ✅ **Avatar Emotion Mapping** - Dynamic emotion expression based on conversation context
- ✅ **Performance Optimization** - Monitoring and optimization for smooth playback

## Architecture

### Core Components

1. **AzureAvatarService** (`lib/azure-avatar-service.ts`)
   - Main service class for managing avatar interactions
   - Handles SDK initialization, connection management, and speech synthesis
   - Event-driven architecture for state management

2. **Avatar UI Components**
   - `AvatarSelector` - Configuration UI for avatar customization
   - `AvatarVideoPlayer` - Enhanced video player with synchronization
   - `AvatarStream` - Real-time streaming component with metrics

3. **Performance Monitoring** (`lib/avatar-performance-monitor.ts`)
   - Real-time FPS, latency, and quality metrics
   - Automatic optimization suggestions
   - Performance scoring system

## Setup

### Prerequisites

1. **Azure Speech Services Account**
   - Create an Azure account and Speech Services resource
   - Note your subscription key and region
   - Ensure your region supports Avatar feature (see supported regions below)

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_AZURE_SPEECH_KEY=your_azure_speech_key
   NEXT_PUBLIC_AZURE_SPEECH_REGION=westus2
   ```

### Supported Azure Regions
- Southeast Asia (`southeastasia`)
- North Europe (`northeurope`)
- West Europe (`westeurope`)
- Sweden Central (`swedencentral`)
- South Central US (`southcentralus`)
- East US 2 (`eastus2`)
- West US 2 (`westus2`)

## Usage

### Basic Implementation

```typescript
import { useAvatar } from '@/lib/hooks/use-avatar';
import { AvatarStream } from '@/components/avatar-stream';

function MyAvatarComponent() {
  const {
    avatarService,
    avatarState,
    isReady,
    initialize,
    connect,
    speak
  } = useAvatar({
    avatarCharacter: 'lisa',
    avatarStyle: 'casual-sitting',
    voice: 'en-US-JennyNeural',
    enableEmotions: true
  });

  const handleSpeak = async () => {
    await speak({
      text: 'Hello! I am your AI assistant.',
      emotion: 'happy'
    });
  };

  return (
    <AvatarStream
      avatarService={avatarService}
      onStreamReady={(stream) => console.log('Ready!', stream)}
    />
  );
}
```

### Avatar Customization

```typescript
// Available avatar characters
const characters = ['lisa', 'michael', 'sam', 'kate'];

// Character-specific styles
const styles = {
  lisa: ['graceful-sitting', 'technical-sitting', 'casual-sitting'],
  michael: ['graceful-standing', 'technical-standing', 'casual-standing'],
  // ... more styles
};

// Available voices
const voices = [
  'en-US-JennyNeural',   // Female, US
  'en-US-GuyNeural',     // Male, US
  'en-GB-SoniaNeural',   // Female, UK
  'en-GB-RyanNeural',    // Male, UK
  // ... more voices
];
```

### Emotion Mapping

```typescript
// Available emotions
const emotions = {
  neutral: 'Default expression',
  happy: 'Smiling and cheerful',
  sad: 'Concerned expression',
  angry: 'Serious expression',
  surprised: 'Wide-eyed expression',
  thoughtful: 'Contemplative expression'
};

// Apply emotion during speech
await avatarService.speak({
  text: 'I understand your concern.',
  emotion: 'thoughtful',
  rate: 0.9,  // Slower speech
  pitch: 0.95 // Slightly lower pitch
});
```

## Performance Optimization

### Best Practices

1. **Video Quality Settings**
   - Use appropriate resolution based on bandwidth
   - Enable hardware acceleration when available
   - Monitor dropped frames and adjust quality

2. **Network Optimization**
   - Use CDN for avatar assets
   - Implement adaptive bitrate streaming
   - Monitor latency and adjust accordingly

3. **Memory Management**
   - Properly dispose of avatar instances
   - Clear video elements when not in use
   - Monitor memory usage and implement cleanup

### Performance Metrics

The system monitors these key metrics:
- **FPS** - Target: 30fps minimum
- **Latency** - Target: <50ms for real-time interaction
- **Memory Usage** - Target: <300MB
- **Dropped Frames** - Target: <1%

## API Reference

### AzureAvatarService

```typescript
class AzureAvatarService {
  constructor(config: AvatarServiceConfig);
  
  // Lifecycle methods
  initialize(videoElement: HTMLVideoElement): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  destroy(): void;
  
  // Speech methods
  speak(options: AvatarStreamOptions): Promise<void>;
  
  // Customization methods
  changeAvatar(character: string, style?: string): void;
  changeBackground(background: string): void;
  
  // State methods
  getState(): AvatarState;
  isReady(): boolean;
  
  // Events
  on('initialized', () => void);
  on('connected', () => void);
  on('speaking-started', () => void);
  on('speaking-completed', () => void);
  on('error', (error: Error) => void);
}
```

### Configuration Options

```typescript
interface AvatarServiceConfig {
  speechKey: string;           // Azure Speech API key
  speechRegion: string;        // Azure region
  avatarCharacter?: string;    // Avatar character (default: 'lisa')
  avatarStyle?: string;        // Avatar style (default: 'casual-sitting')
  voice?: string;              // TTS voice (default: 'en-US-JennyNeural')
  background?: string;         // Background preset
  customBackground?: string;   // Custom background URL or CSS
  enableEmotions?: boolean;    // Enable emotion mapping (default: true)
  streamingMode?: boolean;     // Enable real-time streaming (default: false)
}
```

## Demo Application

Access the full demo at `/avatar-demo` which includes:
- Interactive avatar configuration
- Real-time streaming demo
- Text-to-speech interface
- Performance monitoring dashboard

## Troubleshooting

### Common Issues

1. **Avatar not connecting**
   - Verify Azure credentials are correct
   - Check if region supports Avatar feature
   - Ensure network allows WebSocket connections

2. **Poor performance**
   - Check performance metrics dashboard
   - Reduce video quality if needed
   - Close other browser tabs/applications

3. **Audio/Video sync issues**
   - Check network latency
   - Ensure stable internet connection
   - Try reducing video quality

### Debug Mode

Enable debug logging:
```javascript
window.localStorage.setItem('avatar-debug', 'true');
```

## Future Enhancements

- Multi-language support with automatic translation
- Custom avatar creation tools
- AR/VR integration
- Group video calls with avatars
- Advanced gesture recognition
- Voice cloning capabilities