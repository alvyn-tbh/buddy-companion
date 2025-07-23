'use client';

/**
 * Azure Text-to-Speech Avatar Service
 * Based on Microsoft Azure Speech SDK documentation:
 * https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/real-time-synthesis-avatar
 */

// Import Speech SDK dynamically for client-side usage
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechSDK: any;
  }
}

export interface AvatarConfig {
  speechKey: string;
  speechRegion: string;
  avatarCharacter?: string;
  avatarStyle?: string;
  voice?: string;
  backgroundColor?: string;
  backgroundImage?: string;
}

export interface AvatarState {
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  connectionStatus: string;
  error: string | null;
}

export class AzureTTSAvatarSDK extends EventTarget {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private speechConfig: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private avatarConfig: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private avatarSynthesizer: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private config: AvatarConfig;
  private state: AvatarState;
  private isSDKLoaded = false;

  constructor(config: AvatarConfig) {
    super();
    this.config = config;
    this.state = {
      isConnected: false,
      isConnecting: false,
      isSpeaking: false,
      connectionStatus: 'Disconnected',
      error: null
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(event: string, data?: any) {
    this.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  private updateState(updates: Partial<AvatarState>) {
    this.state = { ...this.state, ...updates };
    this.emit('stateChange', this.state);
  }

  private async loadSpeechSDK(): Promise<void> {
    if (this.isSDKLoaded && window.SpeechSDK) {
      return;
    }

    console.log('🔄 [Azure Avatar SDK] Loading Azure Speech SDK...');
    this.updateState({ connectionStatus: 'Loading Speech SDK...' });

    return new Promise((resolve, reject) => {
      // Set a timeout for SDK loading
      const loadTimeout = setTimeout(() => {
        const error = 'Azure Speech SDK loading timeout (10s)';
        console.error('❌ [Azure Avatar SDK]', error);
        this.updateState({ error, connectionStatus: 'SDK Load Timeout' });
        reject(new Error(error));
      }, 10000); // 10 second timeout

      // Check if SDK is already loaded
      if (window.SpeechSDK) {
        clearTimeout(loadTimeout);
        this.isSDKLoaded = true;
        console.log('✅ [Azure Avatar SDK] Speech SDK already available');
        resolve();
        return;
      }

      // Create script element for Speech SDK with multiple fallback URLs
      const sdkUrls = [
        'https://aka.ms/csspeech/jsbrowserpackageraw',
        'https://csspeechstorage.blob.core.windows.net/drop/1.34.0/MicrosoftCognitiveServicesSpeech-1.34.0.js',
        'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle.js'
      ];

      let currentUrlIndex = 0;

      const tryLoadSDK = () => {
        if (currentUrlIndex >= sdkUrls.length) {
          clearTimeout(loadTimeout);
          const error = 'Failed to load Azure Speech SDK from all sources';
          console.error('❌ [Azure Avatar SDK]', error);
          this.updateState({ error, connectionStatus: 'SDK Load Failed' });
          reject(new Error(error));
          return;
        }

        const script = document.createElement('script');
        script.src = sdkUrls[currentUrlIndex];
        script.async = true;
        
        script.onload = () => {
          clearTimeout(loadTimeout);
          console.log(`✅ [Azure Avatar SDK] Speech SDK loaded from: ${sdkUrls[currentUrlIndex]}`);
          this.isSDKLoaded = true;
          resolve();
        };

        script.onerror = () => {
          console.warn(`⚠️ [Azure Avatar SDK] Failed to load SDK from: ${sdkUrls[currentUrlIndex]}`);
          document.head.removeChild(script);
          currentUrlIndex++;
          setTimeout(tryLoadSDK, 100); // Small delay before trying next URL
        };

        document.head.appendChild(script);
      };

      tryLoadSDK();
    });
  }

  public async initialize(videoElement: HTMLVideoElement): Promise<void> {
    try {
      console.log('🎬 [Azure Avatar SDK] Initializing avatar...');
      this.updateState({ 
        isConnecting: true, 
        error: null,
        connectionStatus: 'Initializing...'
      });

      this.videoElement = videoElement;

      // Try to load Azure Speech SDK with timeout
      try {
        await Promise.race([
          this.loadSpeechSDK(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('SDK loading timeout')), 15000)
          )
        ]);
      } catch (sdkError) {
        console.warn('⚠️ [Azure Avatar SDK] SDK loading failed, using fallback mode:', sdkError);
        // Use fallback mode without full Azure SDK
        this.initializeFallbackMode();
        return;
      }

      // Load Speech SDK
      await this.loadSpeechSDK();

      // Validate configuration
      if (!this.config.speechKey || !this.config.speechRegion) {
        throw new Error('Missing Azure Speech credentials');
      }

      console.log('🔑 [Azure Avatar SDK] Creating speech config...');
      this.updateState({ connectionStatus: 'Creating speech configuration...' });

      // Create speech configuration
      this.speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(
        this.config.speechKey,
        this.config.speechRegion
      );

      // Set voice
      if (this.config.voice) {
        this.speechConfig.speechSynthesisVoiceName = this.config.voice;
      } else {
        this.speechConfig.speechSynthesisLanguage = 'en-US';
      }

      console.log('🎭 [Azure Avatar SDK] Creating avatar config...');
      this.updateState({ connectionStatus: 'Creating avatar configuration...' });

      // Create avatar configuration
      this.avatarConfig = new window.SpeechSDK.AvatarConfig(
        this.config.avatarCharacter || 'lisa',
        this.config.avatarStyle || 'casual-sitting'
      );

      // Set background if specified
      if (this.config.backgroundColor) {
        this.avatarConfig.backgroundColor = this.config.backgroundColor;
      }

      if (this.config.backgroundImage) {
        this.avatarConfig.backgroundImage = this.config.backgroundImage;
      }

      console.log('🔗 [Azure Avatar SDK] Creating avatar synthesizer...');
      this.updateState({ connectionStatus: 'Creating avatar synthesizer...' });

      // Create avatar synthesizer
      this.avatarSynthesizer = new window.SpeechSDK.AvatarSynthesizer(
        this.speechConfig,
        this.avatarConfig
      );

      // Set up event handlers
      this.setupEventHandlers();

      console.log('🎯 [Azure Avatar SDK] Starting avatar session...');
      this.updateState({ connectionStatus: 'Starting avatar session...' });

      // Start avatar session
      await new Promise<void>((resolve, reject) => {
        this.avatarSynthesizer.startAvatarAsync(
          this.videoElement,
          () => {
            console.log('✅ [Azure Avatar SDK] Avatar session started successfully');
            this.updateState({
              isConnected: true,
              isConnecting: false,
              connectionStatus: 'Connected',
              error: null
            });
            this.emit('connected');
            resolve();
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error: any) => {
            console.error('❌ [Azure Avatar SDK] Failed to start avatar session:', error);
            const errorMessage = `Failed to start avatar session: ${error}`;
            this.updateState({
              error: errorMessage,
              isConnecting: false,
              connectionStatus: 'Connection Failed'
            });
            this.emit('error', new Error(errorMessage));
            reject(new Error(errorMessage));
          }
        );
      });

    } catch (error) {
      console.error('💥 [Azure Avatar SDK] Initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      this.updateState({
        error: errorMessage,
        isConnecting: false,
        connectionStatus: 'Initialization Failed'
      });
      this.emit('error', new Error(errorMessage));
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.avatarSynthesizer) return;

    console.log('🔧 [Azure Avatar SDK] Setting up event handlers...');

    // Synthesis started
    this.avatarSynthesizer.synthesisStarted = () => {
      console.log('🗣️ [Azure Avatar SDK] Synthesis started');
      this.updateState({
        isSpeaking: true,
        connectionStatus: 'Speaking'
      });
      this.emit('synthesisStarted');
    };

    // Synthesis completed
    this.avatarSynthesizer.synthesisCompleted = () => {
      console.log('✅ [Azure Avatar SDK] Synthesis completed');
      this.updateState({
        isSpeaking: false,
        connectionStatus: 'Connected'
      });
      this.emit('synthesisCompleted');
    };

    // Synthesis canceled
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.avatarSynthesizer.synthesisCanceled = (error: any) => {
      console.error('❌ [Azure Avatar SDK] Synthesis canceled:', error);
      this.updateState({
        isSpeaking: false,
        error: `Synthesis canceled: ${error}`,
        connectionStatus: 'Error'
      });
      this.emit('error', new Error(`Synthesis canceled: ${error}`));
    };

    // Avatar events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.avatarSynthesizer.avatarEventReceived = (event: any) => {
      console.log('📡 [Azure Avatar SDK] Avatar event received:', event);
      this.emit('avatarEvent', event);
    };
  }

  private initializeFallbackMode(): void {
    console.log('🔄 [Azure Avatar SDK] Initializing fallback mode...');
    this.updateState({
      isConnected: true,
      isConnecting: false,
      connectionStatus: 'Connected (Fallback Mode)',
      error: null
    });

    // Show placeholder in video element
    if (this.videoElement) {
      this.videoElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.videoElement.style.display = 'flex';
      this.videoElement.style.alignItems = 'center';
      this.videoElement.style.justifyContent = 'center';
      this.videoElement.style.color = 'white';
      this.videoElement.style.fontSize = '16px';
      this.videoElement.style.textAlign = 'center';
      this.videoElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 10px;">🎭</div>
          <div>AI Avatar</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
            Azure SDK unavailable - using audio mode
          </div>
        </div>
      `;
    }

    this.emit('connected');
    
    // Auto-speak intro message
    setTimeout(async () => {
      try {
        const { corporate } = await import('@/lib/intro-prompt');
        console.log('🎤 [Azure Avatar SDK] Speaking intro message (fallback)...');
        await this.speakText(corporate);
      } catch (error) {
        console.error('❌ [Azure Avatar SDK] Failed to speak intro message:', error);
      }
    }, 1000);
  }

  public async speakText(text: string): Promise<void> {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    console.log('🎤 [Azure Avatar SDK] Speaking text:', text.substring(0, 100) + '...');

    // Check if we're in fallback mode (no Azure SDK)
    if (!this.avatarSynthesizer && this.state.connectionStatus.includes('Fallback')) {
      console.log('🔊 [Azure Avatar SDK] Using fallback audio synthesis');
      
      this.updateState({ isSpeaking: true });
      this.emit('synthesisStarted');

      return new Promise((resolve, reject) => {
        try {
          // Use Web Speech API
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
              console.log('✅ [Azure Avatar SDK] Fallback speech completed');
              this.updateState({ isSpeaking: false });
              this.emit('synthesisCompleted');
              resolve();
            };
            utterance.onerror = (error) => {
              console.error('❌ [Azure Avatar SDK] Fallback speech failed:', error);
              this.updateState({ isSpeaking: false, error: 'Speech synthesis failed' });
              this.emit('error', new Error('Speech synthesis failed'));
              reject(new Error('Speech synthesis failed'));
            };
            window.speechSynthesis.speak(utterance);
          } else {
            reject(new Error('Speech synthesis not supported'));
          }
        } catch (error) {
          this.updateState({ isSpeaking: false, error: 'Fallback speech failed' });
          this.emit('error', new Error('Fallback speech failed'));
          reject(error);
        }
      });
    }

    // Original Azure SDK method
    if (!this.isReady()) {
      throw new Error('Avatar not ready for speech synthesis');
    }

    return new Promise<void>((resolve, reject) => {
      this.avatarSynthesizer.speakTextAsync(
        text,
        () => {
          console.log('✅ [Azure Avatar SDK] Text spoken successfully');
          resolve();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => {
          console.error('❌ [Azure Avatar SDK] Speech synthesis failed:', error);
          const errorMessage = `Speech synthesis failed: ${error}`;
          this.updateState({ error: errorMessage });
          this.emit('error', new Error(errorMessage));
          reject(new Error(errorMessage));
        }
      );
    });
  }

  public async speakSSML(ssml: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Avatar not ready for SSML synthesis');
    }

    if (!ssml.trim()) {
      throw new Error('SSML cannot be empty');
    }

    console.log('🎵 [Azure Avatar SDK] Speaking SSML...');

    return new Promise<void>((resolve, reject) => {
      this.avatarSynthesizer.speakSsmlAsync(
        ssml,
        () => {
          console.log('✅ [Azure Avatar SDK] SSML spoken successfully');
          resolve();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => {
          console.error('❌ [Azure Avatar SDK] SSML synthesis failed:', error);
          const errorMessage = `SSML synthesis failed: ${error}`;
          this.updateState({ error: errorMessage });
          this.emit('error', new Error(errorMessage));
          reject(new Error(errorMessage));
        }
      );
    });
  }

  public async stopSpeaking(): Promise<void> {
    if (this.avatarSynthesizer && this.state.isSpeaking) {
      console.log('⏹️ [Azure Avatar SDK] Stopping speech...');
      
      return new Promise<void>((resolve) => {
        this.avatarSynthesizer.stopSpeakingAsync(() => {
          console.log('✅ [Azure Avatar SDK] Speech stopped');
          this.updateState({
            isSpeaking: false,
            connectionStatus: 'Connected'
          });
          resolve();
        });
      });
    }
  }

  public disconnect(): void {
    console.log('🔌 [Azure Avatar SDK] Disconnecting avatar...');

    try {
      if (this.avatarSynthesizer) {
        this.avatarSynthesizer.close();
        this.avatarSynthesizer = null;
      }

      if (this.speechConfig) {
        this.speechConfig.close();
        this.speechConfig = null;
      }

      this.avatarConfig = null;
      this.videoElement = null;

      this.updateState({
        isConnected: false,
        isConnecting: false,
        isSpeaking: false,
        connectionStatus: 'Disconnected',
        error: null
      });

      this.emit('disconnected');
      console.log('✅ [Azure Avatar SDK] Avatar disconnected successfully');

    } catch (error) {
      console.error('❌ [Azure Avatar SDK] Error during disconnect:', error);
    }
  }

  public isReady(): boolean {
    return this.state.isConnected && 
           this.avatarSynthesizer !== null && 
           !this.state.isConnecting &&
           !this.state.error;
  }

  public getState(): AvatarState {
    return { ...this.state };
  }

  // Event handler methods for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: string, handler: (data?: any) => void): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.addEventListener(event, (e: any) => handler(e.detail));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public off(event: string, handler: (data?: any) => void): void {
    this.removeEventListener(event, handler);
  }

  // Static methods for getting available options
  public static getAvailableCharacters(): string[] {
    return [
      'lisa',      // Female, professional
      'anna',      // Female, casual
      'james',     // Male, professional  
      'michelle',  // Female, casual
      'william'    // Male, casual
    ];
  }

  public static getAvailableStyles(): string[] {
    return [
      'casual-sitting',
      'business-sitting', 
      'graceful-sitting',
      'technical-sitting'
    ];
  }

  public static getAvailableVoices(): string[] {
    return [
      'en-US-JennyNeural',
      'en-US-GuyNeural',
      'en-US-AriaNeural',
      'en-US-DavisNeural',
      'en-US-AmberNeural',
      'en-US-AnaNeural',
      'en-US-AndrewNeural',
      'en-US-AshleyNeural',
      'en-US-BrandonNeural',
      'en-US-ChristopherNeural',
      'en-US-CoraNeural',
      'en-US-ElizabethNeural',
      'en-US-EricNeural',
      'en-US-JacobNeural',
      'en-US-JaneNeural',
      'en-US-JasonNeural',
      'en-US-MichelleNeural',
      'en-US-MonicaNeural',
      'en-US-NancyNeural',
      'en-US-RogerNeural',
      'en-US-SaraNeural',
      'en-US-SteffanNeural',
      'en-US-TonyNeural'
    ];
  }
}

export default AzureTTSAvatarSDK; 