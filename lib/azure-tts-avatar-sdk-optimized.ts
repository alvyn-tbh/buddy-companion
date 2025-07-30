'use client';

// CRITICAL: Apply WebRTC compatibility BEFORE any Speech SDK code loads
import '@/lib/webrtc-compatibility';

/**
 * Optimized Azure Text-to-Speech Avatar Service
 * Features:
 * - SDK preloading and caching
 * - Parallel initialization
 * - Connection pooling
 * - Fast fallback to TTS mode
 * - Lazy avatar connection with immediate TTS availability
 */

// Global types are declared in azure-avatar-service.ts
declare global {
  interface Window {
    AzureSDKPreloaded?: boolean;
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
  enableFastStart?: boolean; // New option for fast start mode
  preloadSDK?: boolean; // Preload SDK in background
}

export interface AvatarState {
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  connectionStatus: string;
  error: string | null;
  mode: 'avatar' | 'tts' | 'fallback';
}

// SDK URLs for preloading
const SDK_URLS = [
  'https://aka.ms/csspeech/jsbrowserpackageraw',
  'https://csspeechstorage.blob.core.windows.net/drop/1.36.0/microsoft.cognitiveservices.speech.sdk.bundle-min.js'
];

// Preload SDK in background
export function preloadAzureSDK(): Promise<void> {
  if (window.AzureSDKPreloaded || window.SpeechSDK) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = SDK_URLS[0];
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      window.AzureSDKPreloaded = true;
      console.log('✅ [Azure SDK] Preloaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.warn('⚠️ [Azure SDK] Preload failed, will retry on demand');
      resolve(); // Don't block, we'll retry later
    };
    
    document.head.appendChild(script);
  });
}

export class AzureTTSAvatarSDKOptimized extends EventTarget {
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
  private initPromise: Promise<void> | null = null;
  private avatarInitPromise: Promise<void> | null = null;

  constructor(config: AvatarConfig) {
    super();
    this.config = config;
    this.state = {
      isConnected: false,
      isConnecting: false,
      isSpeaking: false,
      connectionStatus: 'Disconnected',
      error: null,
      mode: 'avatar'
    };
    
    // Start preloading SDK immediately if requested
    if (config.preloadSDK) {
      preloadAzureSDK();
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

  /**
   * Fast initialization - immediately available for TTS, avatar loads in background
   */
  public async initializeFast(videoElement: HTMLVideoElement): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeFast(videoElement);
    return this.initPromise;
  }

  private async _initializeFast(videoElement: HTMLVideoElement): Promise<void> {
    console.log('🚀 [Azure Avatar Optimized] Fast initialization starting...');
    this.videoElement = videoElement;
    this.updateState({ 
      isConnecting: true, 
      connectionStatus: 'Fast Starting...',
      mode: 'tts'
    });

    try {
      // Step 1: Load SDK (if not already loaded)
      await this.ensureSDKLoaded();

      // Step 2: Create speech config immediately
      this.createSpeechConfig();

      // Step 3: Initialize TTS immediately for fast start
      await this.initializeTTSImmediate();

      // Step 4: Start avatar initialization in background
      if (this.config.enableFastStart !== false) {
        this.initializeAvatarBackground();
      }

    } catch (error) {
      console.error('❌ [Azure Avatar Optimized] Fast initialization failed:', error);
      // Fallback to browser speech synthesis
      this.initializeBrowserFallback();
    }
  }

  private async ensureSDKLoaded(): Promise<void> {
    if (window.SpeechSDK) return;

    console.log('📦 [Azure Avatar Optimized] Loading SDK...');

    // Try to load SDK with fallback URLs
    for (let i = 0; i < SDK_URLS.length; i++) {
      try {
        await this.loadSDKFromURL(SDK_URLS[i], i === 0 ? 5000 : 3000); // First URL gets more time
        console.log(`✅ [Azure Avatar Optimized] SDK loaded from: ${SDK_URLS[i]}`);
        return;
      } catch (error) {
        console.warn(`⚠️ [Azure Avatar Optimized] Failed to load from ${SDK_URLS[i]}:`, error);
        if (i === SDK_URLS.length - 1) {
          throw new Error(`Failed to load SDK from all ${SDK_URLS.length} sources`);
        }
      }
    }
  }

  private async loadSDKFromURL(url: string, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`SDK loading timeout (${timeoutMs}ms)`));
      }, timeoutMs);

      if (window.SpeechSDK) {
        clearTimeout(timeout);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        clearTimeout(timeout);
        if (window.SpeechSDK) {
          resolve();
        } else {
          reject(new Error('SDK not available after load'));
        }
      };
      
      script.onerror = (event) => {
        clearTimeout(timeout);
        reject(new Error(`SDK load failed: ${event}`));
      };
      
      try {
        document.head.appendChild(script);
      } catch (appendError) {
        clearTimeout(timeout);
        reject(new Error(`Failed to append script: ${appendError}`));
      }
    });
  }

  private createSpeechConfig(): void {
    // Basic credential validation
    if (!this.config.speechKey || this.config.speechKey.length < 32) {
      throw new Error('Invalid Azure Speech Key - key appears to be missing or too short');
    }
    
    if (!this.config.speechRegion || !/^[a-z]+[a-z0-9]*$/.test(this.config.speechRegion)) {
      throw new Error('Invalid Azure Speech Region format');
    }

    console.log('🔑 [Azure Avatar Optimized] Creating speech config...');
    this.speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(
      this.config.speechKey,
      this.config.speechRegion
    );

    if (this.config.voice) {
      this.speechConfig.speechSynthesisVoiceName = this.config.voice;
    }

    // Optimize connection settings for fast performance
    this.speechConfig.setProperty(
      window.SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, 
      "3000"
    );
    this.speechConfig.setProperty(
      window.SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, 
      "2000"
    );
    
    console.log('✅ [Azure Avatar Optimized] Speech config created successfully');
  }

  private async initializeTTSImmediate(): Promise<void> {
    console.log('🎤 [Azure Avatar Optimized] Initializing TTS for immediate availability...');
    
    this.speechSynthesizer = new window.SpeechSDK.SpeechSynthesizer(this.speechConfig);
    
    // Set up TTS event handlers
    this.speechSynthesizer.synthesisStarted = () => {
      this.updateState({ isSpeaking: true });
      this.emit('synthesisStarted');
    };

    this.speechSynthesizer.synthesisCompleted = () => {
      this.updateState({ isSpeaking: false });
      this.emit('synthesisCompleted');
    };

    // Mark as connected immediately for TTS
    this.updateState({
      isConnected: true,
      isConnecting: false,
      connectionStatus: 'Ready (TTS Mode)',
      mode: 'tts'
    });

    this.emit('connected');
    console.log('✅ [Azure Avatar Optimized] TTS ready for immediate use');
  }

  private async initializeAvatarBackground(): Promise<void> {
    if (!window.SpeechSDK.AvatarConfig || !window.SpeechSDK.AvatarSynthesizer) {
      console.log('ℹ️ [Azure Avatar Optimized] Avatar API not available, staying in TTS mode');
      return;
    }

    console.log('🎭 [Azure Avatar Optimized] Starting avatar initialization in background...');
    
    this.avatarInitPromise = (async () => {
      try {
        // Create avatar config
        this.avatarConfig = new window.SpeechSDK.AvatarConfig(
          this.config.avatarCharacter || 'lisa',
          this.config.avatarStyle || 'casual-sitting'
        );

        if (this.config.backgroundColor) {
          this.avatarConfig.backgroundColor = this.config.backgroundColor;
        }

        // Create avatar synthesizer
        this.avatarSynthesizer = new window.SpeechSDK.AvatarSynthesizer(
          this.speechConfig,
          this.avatarConfig
        );

        // Set up avatar event handlers
        this.setupAvatarEventHandlers();

        // Start avatar with shorter timeout
        await new Promise<void>((resolve, reject) => {
          const avatarTimeout = setTimeout(() => {
            reject(new Error('Avatar connection timeout'));
          }, 10000); // 10 second timeout

          this.avatarSynthesizer.startAvatarAsync(
            this.videoElement,
            () => {
              clearTimeout(avatarTimeout);
              console.log('✅ [Azure Avatar Optimized] Avatar connected successfully');
              this.updateState({
                connectionStatus: 'Connected (Avatar Ready)',
                mode: 'avatar'
              });
              this.emit('avatarReady');
              resolve();
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error: any) => {
              clearTimeout(avatarTimeout);
              console.warn('⚠️ [Azure Avatar Optimized] Avatar connection failed:', error);
              reject(error);
            }
          );
        });

      } catch (error) {
        console.warn('⚠️ [Azure Avatar Optimized] Avatar initialization failed, continuing with TTS:', error);
        // Stay in TTS mode
      }
    })();
  }

  private setupAvatarEventHandlers(): void {
    if (!this.avatarSynthesizer) return;

    this.avatarSynthesizer.synthesisStarted = () => {
      this.updateState({ isSpeaking: true });
      this.emit('synthesisStarted');
    };

    this.avatarSynthesizer.synthesisCompleted = () => {
      this.updateState({ isSpeaking: false });
      this.emit('synthesisCompleted');
    };
  }

  private initializeBrowserFallback(): void {
    console.log('🔄 [Azure Avatar Optimized] Using browser speech synthesis fallback');
    
    this.updateState({
      isConnected: true,
      isConnecting: false,
      connectionStatus: 'Ready (Browser Fallback)',
      mode: 'fallback'
    });

    // Show placeholder
    if (this.videoElement) {
      this.videoElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.videoElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center;">
          <div>
            <div style="font-size: 48px;">🎭</div>
            <div style="font-size: 16px; margin-top: 10px;">AI Assistant Ready</div>
          </div>
        </div>
      `;
    }

    this.emit('connected');
  }

  public async speakText(text: string): Promise<void> {
    if (!text.trim()) return;

    // Use browser fallback if in fallback mode
    if (this.state.mode === 'fallback') {
      return this.speakWithBrowserFallback(text);
    }

    // Check if avatar is ready
    if (this.avatarSynthesizer && this.state.mode === 'avatar') {
      return this.speakWithAvatar(text);
    }

    // Use TTS mode
    if (this.speechSynthesizer) {
      return this.speakWithTTS(text);
    }

    throw new Error('No speech synthesis available');
  }

  private async speakWithAvatar(text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.avatarSynthesizer.speakTextAsync(
        text,
        () => resolve(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => reject(new Error(`Avatar synthesis failed: ${error}`))
      );
    });
  }

  private async speakWithTTS(text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.speechSynthesizer.speakTextAsync(
        text,
        () => resolve(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any) => reject(new Error(`TTS synthesis failed: ${error}`))
      );
    });
  }

  private async speakWithBrowserFallback(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        this.updateState({ isSpeaking: false });
        this.emit('synthesisCompleted');
        resolve();
      };
      utterance.onstart = () => {
        this.updateState({ isSpeaking: true });
        this.emit('synthesisStarted');
      };
      utterance.onerror = () => reject(new Error('Browser speech synthesis failed'));
      
      window.speechSynthesis.speak(utterance);
    });
  }

  public async waitForAvatarReady(timeout = 30000): Promise<boolean> {
    if (this.state.mode === 'avatar') return true;
    if (!this.avatarInitPromise) return false;

    try {
      await Promise.race([
        this.avatarInitPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Avatar ready timeout')), timeout)
        )
      ]);
      return this.getState().mode === 'avatar';
    } catch {
      return false;
    }
  }

  public disconnect(): void {
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

    this.updateState({
      isConnected: false,
      isConnecting: false,
      isSpeaking: false,
      connectionStatus: 'Disconnected',
      error: null,
      mode: 'avatar'
    });

    this.emit('disconnected');
  }

  public isReady(): boolean {
    return this.state.isConnected && !this.state.isConnecting;
  }

  public getState(): AvatarState {
    return { ...this.state };
  }

  public getCurrentMode(): 'avatar' | 'tts' | 'fallback' {
    return this.state.mode;
  }

  // Event handler methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: string, handler: (data?: any) => void): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.addEventListener(event, (e: any) => handler(e.detail));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public off(event: string, handler: (data?: any) => void): void {
    this.removeEventListener(event, handler);
  }
}

// Auto-preload SDK when module is imported
if (typeof window !== 'undefined') {
  preloadAzureSDK();
}

export default AzureTTSAvatarSDKOptimized;
