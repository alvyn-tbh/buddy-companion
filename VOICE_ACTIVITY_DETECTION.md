# Voice Activity Detection (VAD) Implementation

This document describes the enhanced Voice Activity Detection system that has been implemented to improve speech detection in noisy environments.

## Overview

The speech-to-speech application now includes a robust Voice Activity Detection (VAD) system that can accurately detect when a user is speaking, even in noisy environments. This implementation includes:

1. **Advanced Voice Activity Detector**: Frequency-based speech detection with adaptive noise floor
2. **Audio Noise Reduction**: Multi-stage filtering and compression for cleaner audio
3. **Visual Feedback**: Real-time indicators showing voice activity and audio levels
4. **Configurable Settings**: Adjustable thresholds and parameters for different environments

## Key Features

### 1. Adaptive Noise Floor Detection

The VAD system continuously monitors background noise levels and adapts its detection threshold accordingly. This allows it to work effectively in:
- Quiet environments
- Offices with background chatter
- Environments with consistent background noise (fans, AC units)
- Dynamic environments where noise levels change

### 2. Frequency-Based Speech Detection

The system analyzes audio in the speech frequency range (80-1000 Hz) to better distinguish human speech from other sounds:
- Focuses on frequencies most common in human speech
- Reduces false positives from non-speech sounds
- Applies speech-specific weighting to detection algorithms

### 3. Multi-Stage Audio Processing

The audio pipeline includes several processing stages:
1. **High-pass filter**: Removes low-frequency rumble (<80 Hz)
2. **Low-pass filter**: Removes high-frequency noise (>8000 Hz)
3. **Notch filters**: Removes power line noise (50/60 Hz and harmonics)
4. **Speech enhancement**: Boosts clarity frequencies (around 2 kHz)
5. **Dynamic compression**: Normalizes audio levels
6. **Noise gate**: Additional gating for very noisy environments

### 4. Visual Indicators

The UI provides real-time feedback:
- **Voice activity bars**: Shows current audio level with 5-bar visualization
- **Speaking/Listening status**: Clear indication of current state
- **Noise floor indicator**: Shows current background noise level in dB
- **Mini indicator**: Compact indicator on the voice mode button

## Configuration

### VAD Parameters

The VAD system can be configured with the following parameters:

```typescript
{
  voiceThreshold: 8,        // dB above noise floor to trigger speech detection
  silenceThreshold: 3,      // dB above noise floor to maintain speech
  preSpeechPadding: 200,    // ms of audio to include before speech starts
  postSpeechPadding: 300,   // ms of silence before ending speech
  noiseFloorAdaptation: true,  // Enable adaptive noise floor
  adaptationSpeed: 0.03     // How quickly to adapt to noise changes
}
```

### Recommended Settings

**Quiet Environment:**
- voiceThreshold: 6-8 dB
- silenceThreshold: 2-3 dB
- Faster adaptation speed (0.05)

**Noisy Environment:**
- voiceThreshold: 10-12 dB
- silenceThreshold: 5-6 dB
- Slower adaptation speed (0.02)

**Dynamic Environment:**
- voiceThreshold: 8-10 dB
- silenceThreshold: 4-5 dB
- Medium adaptation speed (0.03)

## Usage

### In Voice Mode

When voice mode is activated, the VAD system automatically:
1. Monitors microphone input for speech
2. Provides visual feedback when speech is detected
3. Adapts to changing background noise levels
4. Filters out non-speech sounds

### Testing VAD

A dedicated test page is available at `/vad-test` where you can:
1. Test VAD in different noise conditions
2. Adjust parameters in real-time
3. See visual feedback of detection
4. Monitor noise floor adaptation

## Technical Implementation

### Core Components

1. **VoiceActivityDetector** (`lib/voice-activity-detector.ts`)
   - Base VAD implementation with adaptive noise floor
   - Real-time audio analysis using Web Audio API
   - Configurable detection parameters

2. **AdvancedVoiceActivityDetector** (extends VoiceActivityDetector)
   - Frequency-based analysis for better speech detection
   - Speech frequency range filtering
   - Enhanced detection algorithms

3. **AudioNoiseReduction** (`lib/audio-noise-reduction.ts`)
   - Multi-stage audio filtering
   - Dynamic compression
   - Optional noise gate

4. **VoiceActivityIndicator** (`components/voice-activity-indicator.tsx`)
   - Visual feedback components
   - Real-time audio level display
   - Status indicators

### Audio Processing Pipeline

```
Microphone Input
    ↓
Noise Reduction (optional)
    ├── High-pass Filter (80 Hz)
    ├── Low-pass Filter (8000 Hz)
    ├── Notch Filters (50/60 Hz)
    ├── Speech Enhancement
    └── Dynamic Compression
    ↓
Voice Activity Detection
    ├── Frequency Analysis
    ├── Energy Calculation
    ├── Noise Floor Adaptation
    └── Speech Detection
    ↓
WebRTC Connection
```

## Browser Compatibility

The VAD system uses Web Audio API features that are supported in:
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires user gesture for audio)
- Mobile browsers: Full support with HTTPS

## Performance Considerations

1. **CPU Usage**: The VAD system uses requestAnimationFrame for efficient processing
2. **Memory**: Minimal memory footprint with efficient buffer management
3. **Latency**: Near-zero additional latency for real-time communication

## Troubleshooting

### Common Issues

1. **VAD not detecting speech**
   - Check microphone permissions
   - Adjust voice threshold lower
   - Ensure noise floor adaptation is enabled

2. **Too many false positives**
   - Increase voice threshold
   - Adjust silence threshold
   - Check for consistent background noise

3. **Noise floor not adapting**
   - Ensure adaptation is enabled
   - Check adaptation speed setting
   - Allow time for calibration (10-20 seconds)

### Debug Mode

Enable console logging to see detailed VAD information:
```javascript
console.log('Noise floor:', vad.getNoiseFloor());
console.log('Is speaking:', vad.getIsSpeaking());
```

## Future Enhancements

1. **Machine Learning VAD**: Integrate ML models for more accurate detection
2. **Custom Noise Profiles**: Save and load noise profiles for different environments
3. **Advanced Filtering**: Implement spectral subtraction for better noise removal
4. **Echo Cancellation**: Enhanced echo cancellation for speaker scenarios
5. **Multi-language Support**: Optimize for different language characteristics

## References

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Audio Processing Best Practices](https://webaudio.github.io/web-audio-api/)
- [Speech Processing Fundamentals](https://www.speech.cs.cmu.edu/comp.speech/)
