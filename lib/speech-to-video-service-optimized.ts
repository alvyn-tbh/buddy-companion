'use client';

import { AzureTTSAvatarSDKOptimized, preloadAzureSDK } from './azure-tts-avatar-sdk-optimized';

export interface SpeechToVideoConfig {
  speechKey: string;
  speechRegion: string;
  avatarCharacter?: string;
  avatarStyle?: string;
  voice?: string;
  corporateApiUrl?: string;
  enableFastStart?: boolean;
  preloadSDK?: boolean;
}

export interface SpeechToVideoState {
  isActive: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isConnecting: boolean;
  connectionStatus: string;
  error: string | null;
  transcript: string;
  aiResponse: string;
  mode: 'avatar' | 'tts' | 'fallback';
}

// Preload SDK as soon as module is imported for faster startup
if (typeof window !== 'undefined') {
  preloadAzureSDK();
}

export class SpeechToVideoServiceOptimized extends EventTarget {
  private avatar: AzureTTSAvatarSDKOptimized | null = null;
  private recognition: SpeechRecognition | null = null;
  private config: SpeechToVideoConfig;
  private currentState: SpeechToVideoState;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private isInitialized = false;
  private processingQueue: string[] = [];
  private isProcessingQueue = false;

  constructor(config: SpeechToVideoConfig) {
    super();
    this.config = config;
    this.currentState = {
      isActive: false,
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      isConnecting: false,
      connectionStatus: '',
      error: null,
      transcript: '',
      aiResponse: '',
      mode: 'tts'
    };
  }

  public getState(): SpeechToVideoState {
    return { ...this.currentState };
  }

  private updateState(updates: Partial<SpeechToVideoState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.dispatchEvent(new CustomEvent('stateChange', { detail: this.currentState }));
  }

  private emitError(error: string) {
    this.updateState({ error, isProcessing: false, isListening: false });
    this.dispatchEvent(new CustomEvent('error', { detail: error }));
  }

  public async initialize(videoElement: HTMLVideoElement): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 [SpeechToVideoOptimized] Already initialized, skipping...');
      return;
    }

    try {
      console.log('🚀 [SpeechToVideoOptimized] Fast initialization starting...');
      this.updateState({ isConnecting: true, connectionStatus: 'Fast Initializing...' });

      // Validate configuration
      if (!this.config.speechKey || !this.config.speechRegion) {
        throw new Error(`Missing required Azure configuration`);
      }

      // Step 1: Initialize speech recognition immediately (non-blocking)
      this.initializeSpeechRecognition();

      // Step 2: Create avatar with fast initialization
      this.updateState({ connectionStatus: 'Creating AI Assistant...' });
      this.avatar = new AzureTTSAvatarSDKOptimized({
        speechKey: this.config.speechKey,
        speechRegion: this.config.speechRegion,
        avatarCharacter: this.config.avatarCharacter || 'lisa',
        avatarStyle: this.config.avatarStyle || 'casual-sitting',
        voice: this.config.voice || 'en-US-JennyNeural',
        enableFastStart: this.config.enableFastStart !== false,
        preloadSDK: true
      });

      // Set up avatar event listeners
      this.setupAvatarEventListeners();

      // Step 3: Use fast initialization - immediately ready for TTS
      await this.avatar.initializeFast(videoElement);
      
      this.isInitialized = true;
      console.log('✅ [SpeechToVideoOptimized] Fast initialization complete!');
      
      // Step 4: Check if avatar upgraded in background
      if (this.avatar.getCurrentMode() === 'avatar') {
        console.log('🎭 [SpeechToVideoOptimized] Avatar mode already ready!');
      } else {
        console.log('🎤 [SpeechToVideoOptimized] Running in TTS mode, avatar loading in background...');
        
        // Optional: Wait for avatar to be ready (non-blocking)
        this.avatar.waitForAvatarReady(15000).then(isReady => {
          if (isReady) {
            console.log('🎭 [SpeechToVideoOptimized] Avatar upgraded successfully!');
            this.updateState({ mode: 'avatar' });
          }
        });
      }

    } catch (error) {
      console.error('❌ [SpeechToVideoOptimized] Initialization failed:', error);
      this.emitError(error instanceof Error ? error.message : 'Failed to initialize');
      throw error;
    }
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Optimize for faster response
      recognition.interimResults = true;

      recognition.onstart = () => {
        this.updateState({ isListening: true, connectionStatus: 'Listening' });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        this.updateState({ 
          transcript: finalTranscript || interimTranscript 
        });

        // Process final transcript
        if (finalTranscript.trim()) {
          this.queueSpeechProcessing(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          this.emitError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        this.updateState({ isListening: false });
        // Auto-restart if active and not processing
        if (this.currentState.isActive && !this.currentState.isProcessing) {
          setTimeout(() => this.startListening(), 100);
        }
      };

      this.recognition = recognition;
      console.log('✅ [SpeechToVideoOptimized] Speech recognition initialized');
    } else {
      console.warn('⚠️ [SpeechToVideoOptimized] Speech recognition not supported');
    }
  }

  private setupAvatarEventListeners(): void {
    if (!this.avatar) return;

    this.avatar.on('connected', () => {
      console.log('✅ [SpeechToVideoOptimized] Avatar connected');
      this.updateState({ 
        isActive: true, 
        isConnecting: false,
        connectionStatus: 'Ready',
        error: null,
        mode: this.avatar!.getCurrentMode()
      });
      this.dispatchEvent(new CustomEvent('ready'));
    });

    this.avatar.on('avatarReady', () => {
      console.log('🎭 [SpeechToVideoOptimized] Avatar fully ready!');
      this.updateState({ mode: 'avatar' });
    });

    this.avatar.on('error', (error: Error) => {
      console.error('❌ [SpeechToVideoOptimized] Avatar error:', error);
      this.emitError(`Avatar error: ${error.message}`);
    });

    this.avatar.on('synthesisStarted', () => {
      this.updateState({ isSpeaking: true, connectionStatus: 'Speaking' });
    });

    this.avatar.on('synthesisCompleted', () => {
      this.updateState({ isSpeaking: false, connectionStatus: 'Ready' });
      // Process next item in queue if any
      this.processNextInQueue();
    });

    this.avatar.on('stateChange', (state: { mode: 'avatar' | 'tts' | 'fallback' }) => {
      this.updateState({ mode: state.mode });
    });
  }

  public startListening(): void {
    if (!this.recognition || !this.currentState.isActive) {
      this.emitError('Service not ready for listening');
      return;
    }

    if (this.currentState.isListening) {
      return;
    }

    try {
      this.recognition.start();
      this.updateState({ transcript: '' });
    } catch (error) {
      console.error('Failed to start listening:', error);
      // Ignore if already started
    }
  }

  public stopListening(): void {
    if (this.recognition && this.currentState.isListening) {
      this.recognition.stop();
    }
    this.updateState({ isListening: false });
  }

  private queueSpeechProcessing(transcript: string): void {
    if (!transcript.trim()) return;
    
    // Add to queue
    this.processingQueue.push(transcript);
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processNextInQueue();
    }
  }

  private async processNextInQueue(): Promise<void> {
    if (this.processingQueue.length === 0 || this.currentState.isSpeaking) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const transcript = this.processingQueue.shift()!;
    
    try {
      await this.processSpeech(transcript);
    } catch (error) {
      console.error('Error processing speech:', error);
    }
    
    // Process next item if any
    if (this.processingQueue.length > 0 && !this.currentState.isSpeaking) {
      setTimeout(() => this.processNextInQueue(), 100);
    } else {
      this.isProcessingQueue = false;
    }
  }

  private async processSpeech(transcript: string): Promise<void> {
    if (!transcript.trim()) return;

    try {
      this.updateState({ 
        isProcessing: true, 
        isListening: false,
        connectionStatus: 'Processing...',
        transcript 
      });

      // Temporarily stop listening
      this.stopListening();

      // Add to conversation history
      this.conversationHistory.push({ role: 'user', content: transcript });

      // Get AI response
      const response = await this.callCorporateAPI(transcript);
      
      if (!response) {
        throw new Error('No response from AI');
      }

      this.conversationHistory.push({ role: 'assistant', content: response });
      this.updateState({ 
        aiResponse: response,
        connectionStatus: 'Speaking...'
      });

      // Speak response
      await this.speakResponse(response);

      // Reset and resume
      this.updateState({ 
        isProcessing: false,
        connectionStatus: 'Ready'
      });

      // Resume listening
      if (this.currentState.isActive) {
        setTimeout(() => this.startListening(), 500);
      }

    } catch (error) {
      console.error('Error processing speech:', error);
      this.emitError(error instanceof Error ? error.message : 'Failed to process speech');
      
      // Resume listening even on error
      if (this.currentState.isActive) {
        setTimeout(() => this.startListening(), 1000);
      }
    }
  }

  private async callCorporateAPI(userMessage: string): Promise<string> {
    const apiUrl = this.config.corporateApiUrl || '/api/corporate';
    
    const messages = [
      { role: 'system', content: 'You are a helpful AI assistant. Keep responses concise and natural for speech.' },
      ...this.conversationHistory.slice(-6), // Less context for faster processing
      { role: 'user', content: userMessage }
    ];

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        existingThreadId: `speech-to-video-${Date.now()}`
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let fullResponse = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() && line.startsWith('0:"')) {
            const match = line.match(/^0:"(.*)"/);
            if (match) {
              const content = match[1]
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t')
                .replace(/\\\\/g, '\\');
              fullResponse += content;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse.trim();
  }

  private async speakResponse(text: string): Promise<void> {
    if (!this.avatar || !this.avatar.isReady()) {
      throw new Error('Avatar not ready');
    }

    try {
      await this.avatar.speakText(text);
    } catch (error) {
      console.error('Error speaking response:', error);
      throw new Error('Failed to generate speech');
    }
  }

  public async disconnect(): Promise<void> {
    this.stopListening();

    if (this.avatar) {
      this.avatar.disconnect();
      this.avatar = null;
    }

    this.conversationHistory = [];
    this.processingQueue = [];
    this.isInitialized = false;

    this.updateState({
      isActive: false,
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      isConnecting: false,
      connectionStatus: 'Disconnected',
      error: null,
      transcript: '',
      aiResponse: '',
      mode: 'tts'
    });

    this.dispatchEvent(new CustomEvent('disconnected'));
  }

  public async speakText(text: string): Promise<void> {
    if (!this.avatar || !this.avatar.isReady()) {
      throw new Error('Avatar not ready');
    }

    await this.avatar.speakText(text);
  }

  public isReady(): boolean {
    return this.currentState.isActive && this.avatar?.isReady() === true;
  }

  public getCurrentMode(): 'avatar' | 'tts' | 'fallback' {
    return this.currentState.mode;
  }
}

export default SpeechToVideoServiceOptimized;