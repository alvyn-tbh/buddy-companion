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
  private isInitializing = false;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isDestroyed = false;

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
    if (!this.isDestroyed) {
      this.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
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
        const error = 'Azure Speech SDK loading timeout (15s)';
        console.error('❌ [Azure Avatar SDK]', error);
        this.updateState({ error, connectionStatus: 'SDK Load Timeout' });
        reject(new Error(error));
      }, 15000); // 15 second timeout

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
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          clearTimeout(loadTimeout);
          
          // Verify SDK is properly loaded
          if (window.SpeechSDK && window.SpeechSDK.SpeechConfig) {
            console.log(`✅ [Azure Avatar SDK] Speech SDK loaded from: ${sdkUrls[currentUrlIndex]}`);
            this.isSDKLoaded = true;
            resolve();
          } else {
            console.warn(`⚠️ [Azure Avatar SDK] SDK loaded but not properly initialized from: ${sdkUrls[currentUrlIndex]}`);
            document.head.removeChild(script);
            currentUrlIndex++;
            setTimeout(tryLoadSDK, 200);
          }
        };

        script.onerror = () => {
          console.warn(`⚠️ [Azure Avatar SDK] Failed to load SDK from: ${sdkUrls[currentUrlIndex]}`);
          document.head.removeChild(script);
          currentUrlIndex++;
          setTimeout(tryLoadSDK, 200); // Small delay before trying next URL
        };

        document.head.appendChild(script);
      };

      tryLoadSDK();
    });
  }

  public async initialize(videoElement: HTMLVideoElement): Promise<void> {
    if (this.isInitializing) {
      throw new Error('Avatar is already initializing');
    }

    if (this.isDestroyed) {
      throw new Error('Avatar instance has been destroyed');
    }

    this.isInitializing = true;

    try {
      console.log('🎬 [Azure Avatar SDK] Initializing avatar...');
      this.updateState({ 
        isConnecting: true, 
        error: null,
        connectionStatus: 'Initializing...'
      });

      this.videoElement = videoElement;

      // Clear any existing connection timeout
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }

      // Try to load Azure Speech SDK with enhanced error handling
      try {
        await Promise.race([
          this.loadSpeechSDK(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('SDK loading timeout')), 20000)
          )
        ]);
      } catch (sdkError) {
        console.warn('⚠️ [Azure Avatar SDK] SDK loading failed, using fallback mode:', sdkError);
        this.initializeFallbackMode();
        return;
      }

      // Enhanced credential validation
      if (!this.config.speechKey || this.config.speechKey.length < 32) {
        throw new Error('Invalid Azure Speech Key - must be at least 32 characters');
      }

      if (!this.config.speechRegion || !/^[a-z]+[a-z0-9]*$/.test(this.config.speechRegion)) {
        throw new Error('Invalid Azure Speech Region format');
      }

      console.log('🔑 [Azure Avatar SDK] Creating speech config...');
      this.updateState({ connectionStatus: 'Creating speech configuration...' });

      // Create speech configuration with enhanced error handling
      try {
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

        // Enhanced configuration for better performance and reliability
        this.speechConfig.speechSynthesisOutputFormat = window.SpeechSDK.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;
        
        // Add timeout and connection properties based on Azure troubleshooting guide
        this.speechConfig.setProperty(window.SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "10000");
        this.speechConfig.setProperty(window.SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "5000");
        
      } catch (configError) {
        console.error('❌ [Azure Avatar SDK] Failed to create speech config:', configError);
        throw new Error(`Failed to create speech configuration: ${configError}`);
      }

      console.log('🎭 [Azure Avatar SDK] Creating avatar config...');
      this.updateState({ connectionStatus: 'Creating avatar configuration...' });

      // Create avatar configuration
      try {
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
      } catch (avatarConfigError) {
        console.error('❌ [Azure Avatar SDK] Failed to create avatar config:', avatarConfigError);
        throw new Error(`Failed to create avatar configuration: ${avatarConfigError}`);
      }

      console.log('🔗 [Azure Avatar SDK] Creating avatar synthesizer...');
      this.updateState({ connectionStatus: 'Creating avatar synthesizer...' });

      // Create avatar synthesizer
      try {
        this.avatarSynthesizer = new window.SpeechSDK.AvatarSynthesizer(
          this.speechConfig,
          this.avatarConfig
        );
      } catch (synthesizerError) {
        console.error('❌ [Azure Avatar SDK] Failed to create avatar synthesizer:', synthesizerError);
        throw new Error(`Failed to create avatar synthesizer: ${synthesizerError}`);
      }

      // Set up event handlers
      this.setupEventHandlers();

      console.log('🎯 [Azure Avatar SDK] Starting avatar session...');
      this.updateState({ connectionStatus: 'Starting avatar session...' });

      // Start avatar session with enhanced timeout handling
      await new Promise<void>((resolve, reject) => {
        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          const error = 'Avatar session startup timeout (45s)';
          console.error('❌ [Azure Avatar SDK]', error);
          this.updateState({
            error,
            isConnecting: false,
            connectionStatus: 'Connection Timeout'
          });
          reject(new Error(error));
        }, 45000); // 45 second timeout

        this.avatarSynthesizer.startAvatarAsync(
          this.videoElement,
          () => {
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
              this.connectionTimeout = null;
            }
            
            console.log('✅ [Azure Avatar SDK] Avatar session started successfully');
            this.updateState({
              isConnected: true,
              isConnecting: false,
              connectionStatus: 'Connected',
              error: null
            });
            this.reconnectAttempts = 0; // Reset reconnect attempts on success
            this.emit('connected');
            resolve();
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error: any) => {
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
              this.connectionTimeout = null;
            }
            
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
      
      // Cleanup resources on initialization failure
      this.cleanup();
      
      this.emit('error', new Error(errorMessage));
      throw error;
    } finally {
      this.isInitializing = false;
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

    // Connection lost handler
    this.avatarSynthesizer.connectionEstablished = () => {
      console.log('🔗 [Azure Avatar SDK] Connection established');
      this.updateState({ connectionStatus: 'Connected', error: null });
    };

    this.avatarSynthesizer.connectionClosed = () => {
      console.log('🔌 [Azure Avatar SDK] Connection closed');
      this.updateState({ 
        isConnected: false,
        connectionStatus: 'Disconnected' 
      });
      
      // Attempt to reconnect if not destroyed
      if (!this.isDestroyed && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    };
  }

  private async attemptReconnect(): Promise<void> {
    if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 [Azure Avatar SDK] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.updateState({ connectionStatus: `Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...` });

    try {
      // Wait before attempting reconnect
      await new Promise(resolve => setTimeout(resolve, 2000 * this.reconnectAttempts));
      
      if (this.videoElement && !this.isDestroyed) {
        await this.initialize(this.videoElement);
      }
    } catch (error) {
      console.error(`❌ [Azure Avatar SDK] Reconnect attempt ${this.reconnectAttempts} failed:`, error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.updateState({ 
          error: 'Maximum reconnection attempts reached',
          connectionStatus: 'Connection Failed'
        });
        this.emit('error', new Error('Failed to reconnect after maximum attempts'));
      }
    }
  }

  private initializeFallbackMode(): void {
    console.log('🔄 [Azure Avatar SDK] Initializing fallback mode...');
    this.updateState({
      isConnected: true,
      isConnecting: false,
      connectionStatus: 'Connected (Fallback Mode)',
      error: null
    });

    // Show enhanced placeholder in video element
    if (this.videoElement) {
      this.videoElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.videoElement.style.display = 'flex';
      this.videoElement.style.alignItems = 'center';
      this.videoElement.style.justifyContent = 'center';
      this.videoElement.style.color = 'white';
      this.videoElement.style.fontSize = '16px';
      this.videoElement.style.textAlign = 'center';
      this.videoElement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      this.videoElement.innerHTML = `
        <div style="padding: 20px; text-align: center; max-width: 280px;">
          <div style="font-size: 48px; margin-bottom: 16px; animation: pulse 2s infinite;">🎭</div>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">AI Avatar</div>
          <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
            Azure SDK unavailable<br>
            Using audio-only mode
          </div>
          <div style="margin-top: 16px; padding: 8px 12px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 12px;">
            Speech synthesis active
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        </style>
      `;
    }

    this.emit('connected');
    
    // Auto-speak intro message
    setTimeout(async () => {
      if (!this.isDestroyed) {
        try {
          const { corporate } = await import('@/lib/intro-prompt');
          console.log('🎤 [Azure Avatar SDK] Speaking intro message (fallback)...');
          await this.speakText(corporate);
        } catch (error) {
          console.error('❌ [Azure Avatar SDK] Failed to speak intro message:', error);
        }
      }
    }, 1000);
  }

  public async speakText(text: string): Promise<void> {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    console.log('🎤 [Azure Avatar SDK] Speaking text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

    // Check if we're in fallback mode (no Azure SDK)
    if (!this.avatarSynthesizer && this.state.connectionStatus.includes('Fallback')) {
      console.log('🔊 [Azure Avatar SDK] Using fallback audio synthesis');
      
      this.updateState({ isSpeaking: true });
      this.emit('synthesisStarted');

      return new Promise((resolve, reject) => {
        try {
          // Use Web Speech API with enhanced options
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure speech synthesis for better quality
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            // Try to find a high-quality voice
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
              voice.name.includes('Neural') || 
              voice.name.includes('Premium') ||
              voice.name.includes('Enhanced') ||
              (voice.lang.startsWith('en') && voice.localService === false)
            );
            
            if (preferredVoice) {
              utterance.voice = preferredVoice;
              console.log('🎤 [Azure Avatar SDK] Using voice:', preferredVoice.name);
            }

            utterance.onstart = () => {
              console.log('🗣️ [Azure Avatar SDK] Fallback speech started');
            };
            
            utterance.onend = () => {
              console.log('✅ [Azure Avatar SDK] Fallback speech completed');
              this.updateState({ isSpeaking: false });
              this.emit('synthesisCompleted');
              resolve();
            };
            
            utterance.onerror = (event) => {
              console.error('❌ [Azure Avatar SDK] Fallback speech failed:', event.error);
              this.updateState({ isSpeaking: false, error: 'Speech synthesis failed' });
              this.emit('error', new Error(`Speech synthesis failed: ${event.error}`));
              reject(new Error(`Speech synthesis failed: ${event.error}`));
            };
            
            // Cancel any existing speech and start new one
            speechSynthesis.cancel();
            setTimeout(() => {
              speechSynthesis.speak(utterance);
            }, 100);
          } else {
            reject(new Error('Speech synthesis not supported in this browser'));
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
      // Set a timeout for speech synthesis
      const speechTimeout = setTimeout(() => {
        console.error('❌ [Azure Avatar SDK] Speech synthesis timeout');
        this.updateState({ 
          isSpeaking: false, 
          error: 'Speech synthesis timeout' 
        });
        reject(new Error('Speech synthesis timeout'));
      }, 30000); // 30 second timeout

      this.avatarSynthesizer.speakTextAsync(
        text,
        () => {
          clearTimeout(speechTimeout);
          console.log('✅ [Azure Avatar SDK] Text spoken successfully');
          resolve();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => {
          clearTimeout(speechTimeout);
          console.error('❌ [Azure Avatar SDK] Speech synthesis failed:', error);
          const errorMessage = `Speech synthesis failed: ${error}`;
          this.updateState({ error: errorMessage, isSpeaking: false });
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
      const speechTimeout = setTimeout(() => {
        console.error('❌ [Azure Avatar SDK] SSML synthesis timeout');
        reject(new Error('SSML synthesis timeout'));
      }, 30000);

      this.avatarSynthesizer.speakSsmlAsync(
        ssml,
        () => {
          clearTimeout(speechTimeout);
          console.log('✅ [Azure Avatar SDK] SSML spoken successfully');
          resolve();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => {
          clearTimeout(speechTimeout);
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

    // For fallback mode
    if (this.state.connectionStatus.includes('Fallback') && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      this.updateState({ isSpeaking: false });
    }
  }

  private cleanup(): void {
    console.log('🧹 [Azure Avatar SDK] Cleaning up resources...');

    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Close synthesizer
    if (this.avatarSynthesizer) {
      try {
        this.avatarSynthesizer.close();
      } catch (error) {
        console.warn('Warning during synthesizer cleanup:', error);
      }
      this.avatarSynthesizer = null;
    }

    // Close speech config
    if (this.speechConfig) {
      try {
        this.speechConfig.close();
      } catch (error) {
        console.warn('Warning during speech config cleanup:', error);
      }
      this.speechConfig = null;
    }

    this.avatarConfig = null;
    this.videoElement = null;
  }

  public disconnect(): void {
    console.log('🔌 [Azure Avatar SDK] Disconnecting avatar...');
    this.isDestroyed = true;

    try {
      // Stop any ongoing speech
      this.stopSpeaking();

      // Cleanup resources
      this.cleanup();

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
    return !this.isDestroyed &&
           this.state.isConnected && 
           (this.avatarSynthesizer !== null || this.state.connectionStatus.includes('Fallback')) && 
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