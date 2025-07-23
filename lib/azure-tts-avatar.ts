import { EventEmitter } from 'events';

// Global types are declared in azure-avatar-service.ts

interface AvatarConfig {
  speechKey: string;
  speechRegion: string;
  avatarCharacter?: string;
  avatarStyle?: string;
  voice?: string;
}

interface VideoElement extends HTMLVideoElement {
  captureStream?: () => MediaStream;
}

export class AzureTTSAvatar extends EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private synthesizer: any = null;
  private avatarConfig: AvatarConfig;
  private videoElement: VideoElement | null = null;
  private isConnected: boolean = false;

  constructor(config: AvatarConfig) {
    super();
    this.avatarConfig = {
      speechKey: config.speechKey,
      speechRegion: config.speechRegion,
      avatarCharacter: config.avatarCharacter || 'lisa',
      avatarStyle: config.avatarStyle || 'casual-sitting',
      voice: config.voice || 'en-US-JennyNeural'
    };
  }

  async initialize(videoElement: VideoElement): Promise<void> {
    try {
      console.log('🎬 Initializing Azure TTS Avatar...');
      console.log('Config:', { 
        speechRegion: this.avatarConfig.speechRegion,
        avatarCharacter: this.avatarConfig.avatarCharacter,
        avatarStyle: this.avatarConfig.avatarStyle,
        voice: this.avatarConfig.voice,
        hasKey: !!this.avatarConfig.speechKey
      });

      this.videoElement = videoElement;
      
      // Validate configuration
      if (!this.avatarConfig.speechKey || !this.avatarConfig.speechRegion) {
        throw new Error('Azure Speech key and region are required');
      }

      // Load Azure Speech SDK if not already loaded
      if (!window.SpeechSDK) {
        console.log('📦 Loading Azure Speech SDK...');
        await this.loadSpeechSDK();
        console.log('✅ Azure Speech SDK loaded successfully');
      }

      console.log('⚙️ Creating speech configuration...');
      const speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(
        this.avatarConfig.speechKey,
        this.avatarConfig.speechRegion
      );

      if (this.avatarConfig.voice) {
        speechConfig.speechSynthesisVoiceName = this.avatarConfig.voice;
      }
      
      // Enable detailed logging if available
      // These properties might not exist in the type definition
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configAny = speechConfig as any;
      configAny.enableAudioLogging = true;
      configAny.requestSnr = true;

      console.log('👤 Creating avatar configuration...');
      // Configure avatar
      const avatarConfig = new window.SpeechSDK.AvatarConfig(
        this.avatarConfig.avatarCharacter || 'lisa',
        this.avatarConfig.avatarStyle || 'casual-sitting'
      );

      // Set video format with more specific configuration
      const videoFormat = new window.SpeechSDK.AvatarVideoFormat();
      videoFormat.bitrate = 2000000; // 2 Mbps
      avatarConfig.videoFormat = videoFormat;

      console.log('🔧 Creating avatar synthesizer...');
      console.log('Avatar config:', {
        character: this.avatarConfig.avatarCharacter,
        style: this.avatarConfig.avatarStyle,
        voice: this.avatarConfig.voice,
        region: this.avatarConfig.speechRegion
      });

      // Create synthesizer
      this.synthesizer = new window.SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);

      // Set up event handlers
      this.setupEventHandlers();

      console.log('🎯 Starting avatar connection...');
      // Actually start the avatar session
      await this.startAvatarSession();

      this.isConnected = true;
      console.log('✅ Azure TTS Avatar initialized successfully!');
      this.emit('connected');
    } catch (error) {
      console.error('❌ Error initializing Azure TTS Avatar:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private async startAvatarSession(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesizer || !this.videoElement) {
        reject(new Error('Synthesizer or video element not available'));
        return;
      }

      console.log('🚀 Starting avatar session...');
      
      // Start the avatar session
      this.synthesizer.startAvatarAsync(
        this.videoElement,
        () => {
          console.log('✅ Avatar session started successfully');
          resolve();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => {
          console.error('❌ Failed to start avatar session:', error);
          reject(new Error(`Failed to start avatar session: ${error}`));
        }
      );
    });
  }

  private async loadSpeechSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.SpeechSDK) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
      script.onload = () => {
        console.log('✅ Azure Speech SDK loaded from CDN');
        // Wait a bit for the SDK to fully initialize
        setTimeout(() => {
          if (window.SpeechSDK) {
            console.log('✅ SpeechSDK available on window object');
            resolve();
          } else {
            reject(new Error('SpeechSDK not available after loading'));
          }
        }, 500);
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Azure Speech SDK from CDN:', error);
        reject(new Error('Failed to load Azure Speech SDK'));
      };
      console.log('📦 Loading Azure Speech SDK from CDN...');
      document.head.appendChild(script);
    });
  }

  private setupEventHandlers(): void {
    if (!this.synthesizer) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.synthesizer.avatarEventReceived = (_s: any, e: any) => {
      console.log('Avatar event:', e.description);
      this.emit('avatarEvent', e.description);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    this.synthesizer.synthesisStarted = (_s: any, _e: any) => {
      console.log('Synthesis started');
      this.emit('synthesisStarted');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.synthesizer.synthesizing = (_s: any, e: any) => {
      if (e.result.reason === window.SpeechSDK.ResultReason.SynthesizingAudio) {
        // Handle video data
        if (e.result.audioData && this.videoElement) {
          const videoData = new Uint8Array(e.result.audioData);
          this.processVideoFrame(videoData);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    this.synthesizer.synthesisCompleted = (_s: any, _e: any) => {
      console.log('Synthesis completed');
      this.emit('synthesisCompleted');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    this.synthesizer.synthesisStarted = (_s: any, _e: any) => {
      console.log('Synthesis started');
      this.emit('synthesisStarted');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.synthesizer.wordBoundary = (_s: any, e: any) => {
      this.emit('wordBoundary', {
        text: e.text,
        audioOffset: e.audioOffset,
        duration: e.duration
      });
    };
  }

  private processVideoFrame(videoData: Uint8Array): void {
    if (!this.videoElement) return;

    try {
      // Convert video data to blob and create object URL
      const blob = new Blob([videoData], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(blob);
      
      // Set video source
      this.videoElement.src = videoUrl;
      this.videoElement.play().catch(console.error);

      // Clean up previous URL
      this.videoElement.addEventListener('loadstart', () => {
        if (this.videoElement?.src && this.videoElement.src.startsWith('blob:')) {
          URL.revokeObjectURL(this.videoElement.src);
        }
      }, { once: true });
    } catch (error) {
      console.error('Error processing video frame:', error);
    }
  }

  async speakText(text: string): Promise<void> {
    if (!this.isConnected || !this.synthesizer) {
      throw new Error('Avatar not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        const ssml = this.buildSSML(text);
        
        this.synthesizer.speakSsmlAsync(
          ssml,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => {
            if (result.reason === window.SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              resolve();
            } else {
              reject(new Error(`Synthesis failed: ${result.errorDetails}`));
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error: any) => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  private buildSSML(text: string): string {
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${this.avatarConfig.voice}">
          <prosody rate="medium" pitch="medium">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
  }

  async stopSpeaking(): Promise<void> {
    if (this.synthesizer) {
      this.synthesizer.close();
    }
  }

  disconnect(): void {
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
    
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement = null;
    }

    this.isConnected = false;
    this.emit('disconnected');
  }

  isReady(): boolean {
    return this.isConnected && this.synthesizer !== null;
  }

  // Get available avatar characters
  static getAvailableCharacters(): string[] {
    return [
      'lisa',
      'anna',
      'james',
      'michelle',
      'william'
    ];
  }

  // Get available avatar styles
  static getAvailableStyles(): string[] {
    return [
      'casual-sitting',
      'business-sitting',
      'friendly-standing',
      'newscast-sitting',
      'technical-standing'
    ];
  }

  // Get available voices
  static getAvailableVoices(): { [key: string]: string } {
    return {
      'en-US-JennyNeural': 'Jenny (US English)',
      'en-US-GuyNeural': 'Guy (US English)',
      'en-US-AriaNeural': 'Aria (US English)',
      'en-US-DavisNeural': 'Davis (US English)',
      'en-US-AmberNeural': 'Amber (US English)',
      'en-US-AnaNeural': 'Ana (US English)',
      'en-US-BrandonNeural': 'Brandon (US English)',
      'en-US-ChristopherNeural': 'Christopher (US English)',
      'en-US-CoraNeural': 'Cora (US English)',
      'en-US-ElizabethNeural': 'Elizabeth (US English)'
    };
  }
}

export default AzureTTSAvatar;
