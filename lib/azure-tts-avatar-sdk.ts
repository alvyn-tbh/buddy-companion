'use client';

/**
 * Azure Text-to-Speech Avatar Service
 * Based on Microsoft Azure Speech SDK documentation:
 * https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/real-time-synthesis-avatar
 * 
 * Note: Avatar feature is only available in specific regions:
 * - Southeast Asia
 * - North Europe  
 * - West Europe
 * - Sweden Central
 * - South Central US
 * - East US 2
 * - West US 2
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

// Regions that support Avatar feature
const AVATAR_SUPPORTED_REGIONS = [
  'southeastasia',
  'northeurope',
  'westeurope',
  'swedencentral',
  'southcentralus',
  'eastus2',
  'westus2'
];

export class AzureTTSAvatarSDK extends EventTarget {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private speechConfig: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private avatarConfig: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private avatarSynthesizer: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private speechSynthesizer: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private config: AvatarConfig;
  private state: AvatarState;
  private isSDKLoaded = false;
  private isAvatarSupported = false;
  private isFallbackMode = false;

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
    
    // Check if region supports Avatar
    if (!AVATAR_SUPPORTED_REGIONS.includes(config.speechRegion.toLowerCase())) {
      console.warn(`⚠️ [Azure Avatar SDK] Region '${config.speechRegion}' may not support Avatar feature. Supported regions: ${AVATAR_SUPPORTED_REGIONS.join(', ')}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(event: string, data?: any) {
    this.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  private updateState(updates: Partial<AvatarState>) {
    this.state = { ...this.state, ...updates };
    this.emit('stateChange', this.state);
  }

  private async validateAzureCredentials(): Promise<void> {
    // Based on Azure troubleshooting guide: validate credentials
    try {
      const response = await fetch(`https://${this.config.speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.speechKey,
          'Content-type': 'application/x-www-form-urlencoded',
          'Content-Length': '0'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid Azure Speech credentials - check your subscription key and region');
        }
        throw new Error(`Azure Speech Service error: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [Azure Avatar SDK] Credentials validated successfully');
    } catch (error) {
      console.error('❌ [Azure Avatar SDK] Credential validation failed:', error);
      throw new Error(`Azure credential validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
        this.checkAvatarSupport();
        resolve();
        return;
      }

      // Create script element for Speech SDK with multiple fallback URLs
      const sdkUrls = [
        // Use specific version that includes Avatar support
        'https://aka.ms/csspeech/jsbrowserpackageraw',
        'https://csspeechstorage.blob.core.windows.net/drop/1.36.0/microsoft.cognitiveservices.speech.sdk.bundle-min.js',
        'https://csspeechstorage.blob.core.windows.net/drop/1.35.0/microsoft.cognitiveservices.speech.sdk.bundle-min.js',
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
          
          // Log available SDK features
          if (window.SpeechSDK) {
            console.log('📦 [Azure Avatar SDK] Available SDK features:', {
              SpeechConfig: !!window.SpeechSDK.SpeechConfig,
              SpeechSynthesizer: !!window.SpeechSDK.SpeechSynthesizer,
              AvatarConfig: !!window.SpeechSDK.AvatarConfig,
              AvatarSynthesizer: !!window.SpeechSDK.AvatarSynthesizer,
              SpeechRecognizer: !!window.SpeechSDK.SpeechRecognizer,
              SDK_Version: window.SpeechSDK.SDK_VERSION || 'Unknown'
            });
            
            this.checkAvatarSupport();
          }
          
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

  private checkAvatarSupport(): void {
    if (window.SpeechSDK) {
      this.isAvatarSupported = !!(window.SpeechSDK.AvatarConfig && window.SpeechSDK.AvatarSynthesizer);
      console.log(`🎭 [Azure Avatar SDK] Avatar support: ${this.isAvatarSupported ? 'Available' : 'Not available'}`);
      
      if (!this.isAvatarSupported) {
        console.log('📋 [Azure Avatar SDK] Available SDK classes:', 
          Object.keys(window.SpeechSDK).filter(key => typeof window.SpeechSDK[key] === 'function')
        );
      }
    }
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

      // Enhanced credential validation based on Azure troubleshooting guide
      if (!this.config.speechKey || this.config.speechKey.length < 32) {
        throw new Error('Invalid Azure Speech Key - must be at least 32 characters');
      }

      if (!this.config.speechRegion || !/^[a-z]+[a-z0-9]*$/.test(this.config.speechRegion)) {
        throw new Error('Invalid Azure Speech Region format');
      }

      // Validate credentials with Azure service
      this.updateState({ connectionStatus: 'Validating Azure credentials...' });
      await this.validateAzureCredentials();

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

      // Add timeout properties based on Azure troubleshooting guide
      this.speechConfig.setProperty(window.SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "10000");
      this.speechConfig.setProperty(window.SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "5000");

      // Check if Avatar is supported
      if (!this.isAvatarSupported) {
        console.warn('⚠️ [Azure Avatar SDK] Avatar API not available, using TTS fallback mode');
        this.initializeTTSFallbackMode();
        return;
      }

      console.log('🎭 [Azure Avatar SDK] Creating avatar config...');
      this.updateState({ connectionStatus: 'Creating avatar configuration...' });

      // Create avatar configuration
      // Note: The Avatar API might be different in newer SDK versions
      // Using the approach from Azure samples
      const talkingAvatarCharacter = this.config.avatarCharacter || 'lisa';
      const talkingAvatarStyle = this.config.avatarStyle || 'casual-sitting';
      
      // Create avatar config
      this.avatarConfig = new window.SpeechSDK.AvatarConfig(
        talkingAvatarCharacter,
        talkingAvatarStyle
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
      
      // If avatar fails, try TTS fallback
      if (!this.isFallbackMode) {
        console.log('🔄 [Azure Avatar SDK] Attempting TTS fallback mode...');
        try {
          this.initializeTTSFallbackMode();
          return;
        } catch (fallbackError) {
          console.error('❌ [Azure Avatar SDK] Fallback mode also failed:', fallbackError);
        }
      }
      
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

  private initializeTTSFallbackMode(): void {
    console.log('🔄 [Azure Avatar SDK] Initializing TTS fallback mode...');
    this.isFallbackMode = true;
    
    try {
      // Create a regular speech synthesizer
      this.speechSynthesizer = new window.SpeechSDK.SpeechSynthesizer(this.speechConfig);
      
      // Set up TTS event handlers
      this.speechSynthesizer.synthesisStarted = () => {
        console.log('🗣️ [Azure Avatar SDK] TTS synthesis started');
        this.updateState({
          isSpeaking: true,
          connectionStatus: 'Speaking (TTS)'
        });
        this.emit('synthesisStarted');
      };

      this.speechSynthesizer.synthesisCompleted = () => {
        console.log('✅ [Azure Avatar SDK] TTS synthesis completed');
        this.updateState({
          isSpeaking: false,
          connectionStatus: 'Connected (TTS Mode)'
        });
        this.emit('synthesisCompleted');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.speechSynthesizer.synthesisCanceled = (error: any) => {
        console.error('❌ [Azure Avatar SDK] TTS synthesis canceled:', error);
        this.updateState({
          isSpeaking: false,
          error: `TTS synthesis canceled: ${error}`,
          connectionStatus: 'Error'
        });
        this.emit('error', new Error(`TTS synthesis canceled: ${error}`));
      };
      
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
            <div style="font-size: 48px; margin-bottom: 10px;">🎭</div>
            <div style="font-size: 20px; font-weight: bold;">AI Avatar</div>
            <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">
              TTS Mode - Visual avatar unavailable
            </div>
          </div>
        `;
      }
      
      this.updateState({
        isConnected: true,
        isConnecting: false,
        connectionStatus: 'Connected (TTS Mode)',
        error: null
      });

      this.emit('connected');
      console.log('✅ [Azure Avatar SDK] TTS fallback mode initialized successfully');
      
    } catch (error) {
      console.error('❌ [Azure Avatar SDK] Failed to initialize TTS fallback:', error);
      throw error;
    }
  }

  private initializeFallbackMode(): void {
    console.log('🔄 [Azure Avatar SDK] Initializing fallback mode...');
    this.isFallbackMode = true;
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
  }

  public async speakText(text: string): Promise<void> {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    console.log('🎤 [Azure Avatar SDK] Speaking text:', text.substring(0, 100) + '...');

    // Check if we're in fallback mode (no Azure SDK)
    if (this.isFallbackMode && !this.speechSynthesizer) {
      console.log('🔊 [Azure Avatar SDK] Using browser speech synthesis');
      
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

    // Use TTS mode if available
    if (this.speechSynthesizer && this.isFallbackMode) {
      return new Promise<void>((resolve, reject) => {
        this.speechSynthesizer.speakTextAsync(
          text,
          () => {
            console.log('✅ [Azure Avatar SDK] TTS synthesis completed');
            resolve();
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error: any) => {
            console.error('❌ [Azure Avatar SDK] TTS synthesis failed:', error);
            const errorMessage = `TTS synthesis failed: ${error}`;
            this.updateState({ error: errorMessage });
            this.emit('error', new Error(errorMessage));
            reject(new Error(errorMessage));
          }
        );
      });
    }

    // Original Azure Avatar method
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
    
    if (this.speechSynthesizer && this.state.isSpeaking) {
      console.log('⏹️ [Azure Avatar SDK] Stopping TTS speech...');
      
      return new Promise<void>((resolve) => {
        this.speechSynthesizer.stopSpeakingAsync(() => {
          console.log('✅ [Azure Avatar SDK] TTS speech stopped');
          this.updateState({
            isSpeaking: false,
            connectionStatus: 'Connected (TTS Mode)'
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

      if (this.speechSynthesizer) {
        this.speechSynthesizer.close();
        this.speechSynthesizer = null;
      }

      if (this.speechConfig) {
        this.speechConfig.close();
        this.speechConfig = null;
      }

      this.avatarConfig = null;
      this.videoElement = null;
      this.isFallbackMode = false;

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
           (this.avatarSynthesizer !== null || this.speechSynthesizer !== null || this.isFallbackMode) && 
           !this.state.isConnecting &&
           !this.state.error;
  }

  public getState(): AvatarState {
    return { ...this.state };
  }

  public isInFallbackMode(): boolean {
    return this.isFallbackMode;
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
  
  public static getSupportedRegions(): string[] {
    return AVATAR_SUPPORTED_REGIONS;
  }
}

export default AzureTTSAvatarSDK;
