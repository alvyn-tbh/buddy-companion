'use client';

// CRITICAL: Apply WebRTC compatibility BEFORE any Speech SDK code loads
import '@/lib/webrtc-compatibility';

import { EventEmitter } from 'events';

// Avatar character and style options
export const AVATAR_CHARACTERS = {
  lisa: { 
    name: 'Lisa',
    description: 'Professional female presenter',
    supportedStyles: ['graceful-sitting', 'technical-sitting', 'casual-sitting']
  },
  michael: {
    name: 'Michael',
    description: 'Professional male presenter',
    supportedStyles: ['graceful-standing', 'technical-standing', 'casual-standing']
  },
  sam: {
    name: 'Sam',
    description: 'Casual male presenter',
    supportedStyles: ['casual-sitting', 'technical-sitting']
  },
  kate: {
    name: 'Kate',
    description: 'Friendly female presenter',
    supportedStyles: ['graceful-sitting', 'casual-sitting']
  }
} as const;

export const AVATAR_BACKGROUNDS = {
  default: { name: 'Default', value: '#f0f0f0' },
  office: { name: 'Office', value: 'url(/backgrounds/office.jpg)' },
  studio: { name: 'Studio', value: 'url(/backgrounds/studio.jpg)' },
  home: { name: 'Home', value: 'url(/backgrounds/home.jpg)' },
  nature: { name: 'Nature', value: 'url(/backgrounds/nature.jpg)' },
  gradient: { name: 'Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
} as const;

// Emotion mapping for avatar expressions
export const AVATAR_EMOTIONS = {
  neutral: { avatarStyle: 'neutral', intensity: 0.5 },
  happy: { avatarStyle: 'happy', intensity: 0.8 },
  sad: { avatarStyle: 'sad', intensity: 0.7 },
  angry: { avatarStyle: 'angry', intensity: 0.9 },
  surprised: { avatarStyle: 'surprised', intensity: 0.8 },
  thoughtful: { avatarStyle: 'thoughtful', intensity: 0.6 }
} as const;

export interface AvatarServiceConfig {
  speechKey: string;
  speechRegion: string;
  avatarCharacter?: keyof typeof AVATAR_CHARACTERS;
  avatarStyle?: string;
  voice?: string;
  background?: keyof typeof AVATAR_BACKGROUNDS;
  customBackground?: string;
  enableEmotions?: boolean;
  streamingMode?: boolean;
}

export interface AvatarStreamOptions {
  text: string;
  emotion?: keyof typeof AVATAR_EMOTIONS;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export type AvatarServiceEvents = {
  'initialized': () => void;
  'connected': () => void;
  'disconnected': () => void;
  'speaking-started': () => void;
  'speaking-completed': () => void;
  'viseme': (visemeId: number) => void;
  'error': (error: Error) => void;
  'state-changed': (state: AvatarState) => void;
};

export interface AvatarState {
  isInitialized: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  currentEmotion: keyof typeof AVATAR_EMOTIONS;
  error: Error | null;
}

// Type definitions for Azure Speech SDK
interface SpeechConfig {
  fromSubscription(key: string, region: string): SpeechConfig;
  speechSynthesisVoiceName: string;
}

interface AvatarConfig {
  character: string;
  style: string;
}

// Constructor interface for test compatibility
interface AvatarConfigConstructor {
  new(): AvatarConfig;
  new(character: string, style: string): AvatarConfig;
}

interface AvatarSynthesizer {
  // Modern promise-based API
  startAvatarAsync(videoElement: HTMLVideoElement): Promise<MediaStream>;
  stopAvatarAsync(): Promise<void>;
  speakSsmlAsync(ssml: string): Promise<void>;
  // Legacy callback-based API for compatibility
  startAvatarAsync(videoElement: HTMLVideoElement, success: () => void, error: (err: string) => void): void;
  speakTextAsync(text: string, success: () => void, error: (err: string) => void): void;
  // Event handlers
  avatarEventReceived?: (sender: AvatarSynthesizer, event: AvatarEvent) => void;
  synthesisCompleted?: () => void;
  visemeReceived?: (sender: AvatarSynthesizer, event: VisemeEvent) => void;
}

interface AvatarEvent {
  offset: number;
  visemeId: number;
}

interface VisemeEvent {
  visemeId: number;
}

export class AzureAvatarService extends EventEmitter {
  private config: AvatarServiceConfig;
  private state: AvatarState;
  private speechConfig: SpeechConfig | null = null;
  private avatarConfig: AvatarConfig | null = null;
  private avatarSynthesizer: AvatarSynthesizer | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private streamConnection: MediaStream | null = null;
  private visemeAnimationFrame: number | null = null;

  constructor(config: AvatarServiceConfig) {
    super();
    this.config = config;
    this.state = {
      isInitialized: false,
      isConnected: false,
      isConnecting: false,
      isSpeaking: false,
      currentEmotion: 'neutral',
      error: null
    };
  }

  // Emit typed events
  emit<K extends keyof AvatarServiceEvents>(
    event: K,
    ...args: Parameters<AvatarServiceEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof AvatarServiceEvents>(
    event: K,
    listener: AvatarServiceEvents[K]
  ): this {
    return super.on(event, listener);
  }

  private updateState(updates: Partial<AvatarState>) {
    this.state = { ...this.state, ...updates };
    this.emit('state-changed', this.state);
  }

  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    try {
      this.videoElement = videoElement;

      // Validate required config
      if (!this.config.avatarCharacter) {
        throw new Error('avatarCharacter is required in AvatarServiceConfig');
      }

      // Load Speech SDK
      await this.loadSpeechSDK();

      // Create speech config
      const SpeechSDK = window.SpeechSDK;
      this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        this.config.speechKey,
        this.config.speechRegion
      );

      // Configure avatar
      this.avatarConfig = new SpeechSDK.AvatarConfig(
        this.config.avatarCharacter,
        this.config.avatarStyle || 'casual-sitting'
      );
      
      if (this.config.voice) {
        this.speechConfig.speechSynthesisVoiceName = this.config.voice;
      }

      // Set background
      this.applyBackground();

      // Create avatar synthesizer
      this.avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(
        this.speechConfig,
        this.avatarConfig
      );

      // Set up event handlers
      this.setupEventHandlers();

      this.updateState({ isInitialized: true });
      this.emit('initialized');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize avatar service');
      this.updateState({ error: err });
      this.emit('error', err);
      throw err;
    }
  }

  private async loadSpeechSDK(): Promise<void> {
    if (window.SpeechSDK) return;

    // WebRTC compatibility is already applied via the import at the top of this file
    console.log('🔄 Loading Azure Speech SDK...');

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
      script.async = true;

      script.onload = () => {
        if (window.SpeechSDK) {
        console.log('✅ Speech SDK loaded successfully');
        // Emergency patch for getConfiguration after SDK load
        if (typeof RTCPeerConnection !== 'undefined' && typeof RTCPeerConnection.prototype.getConfiguration !== 'function') {
          console.warn('⚠️ getConfiguration missing after SDK load, applying emergency patch');
          RTCPeerConnection.prototype.getConfiguration = function() {
            console.log('📤 Emergency getConfiguration called');
            return {
              iceServers: [],
              iceTransportPolicy: 'all',
              bundlePolicy: 'balanced',
              rtcpMuxPolicy: 'require',
              certificates: []
            };
          };
        }
        resolve();
      } else {
        reject(new Error('Speech SDK loaded but not available'));
      }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Speech SDK'));
      };

      document.head.appendChild(script);
    });
  }

  private applyBackground(): void {
    if (!this.videoElement) return;

    const background = this.config.customBackground || 
      (this.config.background && AVATAR_BACKGROUNDS[this.config.background]?.value) ||
      AVATAR_BACKGROUNDS.default.value;

    if (background.startsWith('url(') || background.includes('gradient')) {
      this.videoElement.style.backgroundImage = background;
      this.videoElement.style.backgroundColor = 'transparent';
    } else {
      this.videoElement.style.backgroundColor = background;
      this.videoElement.style.backgroundImage = 'none';
    }

    this.videoElement.style.backgroundSize = 'cover';
    this.videoElement.style.backgroundPosition = 'center';
  }

  private setupEventHandlers(): void {
    if (!this.avatarSynthesizer) return;

    this.avatarSynthesizer.avatarEventReceived = (_sender: AvatarSynthesizer, event: AvatarEvent) => {
      if (event.offset === 0 && event.visemeId === 0) {
        this.emit('speaking-started');
        this.updateState({ isSpeaking: true });
      }
    };

    this.avatarSynthesizer.synthesisCompleted = () => {
      this.emit('speaking-completed');
      this.updateState({ isSpeaking: false });
    };

    this.avatarSynthesizer.visemeReceived = (_sender: AvatarSynthesizer, event: VisemeEvent) => {
      this.emit('viseme', event.visemeId);
      this.animateViseme(event.visemeId);
    };
  }

  private animateViseme(visemeId: number): void {
    // Implement viseme animation logic here
    // This would typically involve updating avatar mouth shapes
    // based on the viseme ID
    console.debug('Viseme received:', visemeId);
  }

  private peerConnection: RTCPeerConnection | null = null;
  private audioElement: HTMLAudioElement | null = null;

  private async fetchIceToken(): Promise<{ Urls: string[]; Username: string; Password: string }> {
    const endpoint = `https://${this.config.speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`;
    const response = await fetch(endpoint, {
      headers: { 'Ocp-Apim-Subscription-Key': this.config.speechKey }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ICE token: ${response.statusText}`);
    }
    return await response.json();
  }

  async connect(): Promise<void> {
    if (!this.state.isInitialized || !this.avatarSynthesizer || !this.videoElement) {
      throw new Error('Avatar service not initialized');
    }

    try {
      this.updateState({ isConnecting: true });

      // Fetch ICE servers
      const iceInfo = await this.fetchIceToken();
      const iceServers = [{
        urls: iceInfo.Urls,
        username: iceInfo.Username,
        credential: iceInfo.Password
      }];

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({ iceServers });

      // Handle tracks
      this.peerConnection.ontrack = (event) => {
        if (event.track.kind === 'video') {
          if (this.videoElement) {
            this.videoElement.srcObject = event.streams[0];
          }
        } else if (event.track.kind === 'audio') {
          this.audioElement = new Audio();
          this.audioElement.srcObject = event.streams[0];
          this.audioElement.autoplay = true;
          this.audioElement.play().catch(e => console.error('Audio play error:', e));
        }
      };

      // Add transceivers
      this.peerConnection.addTransceiver('video', { direction: 'recvonly' });
      this.peerConnection.addTransceiver('audio', { direction: 'recvonly' });

      // Start avatar
      await this.avatarSynthesizer.startAvatarAsync(this.videoElement);

      this.updateState({ isConnected: true, isConnecting: false });
      this.emit('connected');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to connect avatar');
      this.updateState({ error: err, isConnecting: false });
      this.emit('error', err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.avatarSynthesizer) return;

    try {
      await this.avatarSynthesizer.stopAvatarAsync();

      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.srcObject = null;
        this.audioElement = null;
      }

      if (this.videoElement && this.videoElement.srcObject) {
        const stream = this.videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        this.videoElement.srcObject = null;
      }

      if (this.visemeAnimationFrame) {
        cancelAnimationFrame(this.visemeAnimationFrame);
        this.visemeAnimationFrame = null;
      }

      this.updateState({ isConnected: false, isSpeaking: false });
      this.emit('disconnected');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to disconnect avatar');
      this.emit('error', err);
    }
  }

  async speak(options: AvatarStreamOptions): Promise<void> {
    if (!this.state.isConnected || !this.avatarSynthesizer) {
      throw new Error('Avatar not connected');
    }

    try {
      // Apply emotion if enabled
      if (this.config.enableEmotions && options.emotion) {
        this.applyEmotion(options.emotion);
      }

      // Configure speech synthesis parameters
      const ssml = this.buildSSML(options);

      // Start speaking
      await this.avatarSynthesizer.speakSsmlAsync(ssml);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to speak');
      this.emit('error', err);
      throw err;
    }
  }

  private buildSSML(options: AvatarStreamOptions): string {
    const rate = options.rate || 1.0;
    const pitch = options.pitch || 1.0;
    const volume = options.volume || 1.0;

    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${this.config.voice || 'en-US-JennyNeural'}">
          <prosody rate="${rate}" pitch="${pitch}%" volume="${volume}">
            ${options.text}
          </prosody>
        </voice>
      </speak>
    `;
  }

  private applyEmotion(emotion: keyof typeof AVATAR_EMOTIONS): void {
    if (!this.avatarConfig) return;

    // Update avatar style for emotion
    // This would typically involve updating the avatar's expression
    // through the Azure API
    this.updateState({ currentEmotion: emotion });
  }

  changeAvatar(character: keyof typeof AVATAR_CHARACTERS, style?: string): void {
    if (!this.avatarConfig) return;

    this.config.avatarCharacter = character;
    this.avatarConfig.character = character;
    
    if (style && (AVATAR_CHARACTERS[character].supportedStyles as readonly string[]).includes(style)) {
      this.config.avatarStyle = style;
      this.avatarConfig.style = style;
    }

    // Reconnect with new avatar if connected
    if (this.state.isConnected) {
      this.disconnect().then(() => this.connect());
    }
  }

  changeBackground(background: keyof typeof AVATAR_BACKGROUNDS | string): void {
    if (typeof background === 'string' && background in AVATAR_BACKGROUNDS) {
      this.config.background = background as keyof typeof AVATAR_BACKGROUNDS;
      this.config.customBackground = undefined;
    } else {
      this.config.customBackground = background;
      this.config.background = undefined;
    }

    this.applyBackground();
  }

  getState(): AvatarState {
    return { ...this.state };
  }

  isReady(): boolean {
    return this.state.isInitialized && this.state.isConnected && !this.state.error;
  }

  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
    this.speechConfig = null;
    this.avatarConfig = null;
    this.avatarSynthesizer = null;
    this.videoElement = null;
  }
}

// Declare global window type for Speech SDK
declare global {
  interface Window {
    SpeechSDK: {
      SpeechConfig: {
        fromSubscription(key: string, region: string): SpeechConfig;
      };
      AvatarConfig: AvatarConfigConstructor;
      AvatarSynthesizer: new(config: SpeechConfig, avatarConfig: AvatarConfig) => AvatarSynthesizer;
      // Additional types for compatibility with existing code
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SpeechSynthesizer?: any;
      SDK_VERSION?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
  }
}
