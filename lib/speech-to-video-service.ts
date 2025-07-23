'use client';

import { AzureTTSAvatarSDK } from './azure-tts-avatar-sdk';

export interface SpeechToVideoConfig {
  speechKey: string;
  speechRegion: string;
  avatarCharacter?: string;
  avatarStyle?: string;
  voice?: string;
  corporateApiUrl?: string;
  enableVAD?: boolean; // Voice Activity Detection
  silenceTimeout?: number; // Silence timeout in ms
  autoRestart?: boolean; // Auto restart after errors
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
  conversationTurn: number;
}

export class SpeechToVideoService extends EventTarget {
  private avatar: AzureTTSAvatarSDK | null = null;
  private recognition: SpeechRecognition | null = null;
  private config: SpeechToVideoConfig;
  private currentState: SpeechToVideoState;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private silenceTimer: NodeJS.Timeout | null = null;
  private restartAttempts = 0;
  private maxRestartAttempts = 3;
  private vadAudioContext: AudioContext | null = null;
  private vadAnalyser: AnalyserNode | null = null;
  private vadStream: MediaStream | null = null;
  private isDestroyed = false;

  constructor(config: SpeechToVideoConfig) {
    super();
    this.config = {
      enableVAD: true,
      silenceTimeout: 3000, // 3 seconds
      autoRestart: true,
      ...config
    };
    this.currentState = {
      isActive: false,
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      isConnecting: false,
      connectionStatus: 'Disconnected',
      error: null,
      transcript: '',
      aiResponse: '',
      conversationTurn: 0
    };
  }

  public getState(): SpeechToVideoState {
    return { ...this.currentState };
  }

  private updateState(updates: Partial<SpeechToVideoState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.dispatchEvent(new CustomEvent('stateChange', { detail: this.currentState }));
  }

  private emitError(error: string, shouldAutoRestart = true) {
    console.error('🚨 [SpeechToVideo] Error:', error);
    this.updateState({ error, isProcessing: false, isListening: false });
    this.dispatchEvent(new CustomEvent('error', { detail: error }));
    
    if (shouldAutoRestart && this.config.autoRestart && this.restartAttempts < this.maxRestartAttempts && !this.isDestroyed) {
      this.restartAttempts++;
      console.log(`🔄 [SpeechToVideo] Auto-restarting (attempt ${this.restartAttempts}/${this.maxRestartAttempts})...`);
      setTimeout(() => this.restartSpeechRecognition(), 2000);
    }
  }

  public async initialize(videoElement: HTMLVideoElement): Promise<void> {
    try {
      console.log('🎬 [SpeechToVideo] Starting comprehensive initialization...');
      this.updateState({ isConnecting: true, connectionStatus: 'Initializing...', error: null });

      // Validate required configuration
      if (!this.config.speechKey || !this.config.speechRegion) {
        const missingFields = [];
        if (!this.config.speechKey) missingFields.push('speechKey');
        if (!this.config.speechRegion) missingFields.push('speechRegion');
        throw new Error(`Missing required Azure configuration: ${missingFields.join(', ')}`);
      }

      console.log('🔑 [SpeechToVideo] Azure config validated:', {
        speechRegion: this.config.speechRegion,
        avatarCharacter: this.config.avatarCharacter || 'lisa',
        avatarStyle: this.config.avatarStyle || 'casual-sitting',
        voice: this.config.voice || 'en-US-JennyNeural',
        hasKey: !!this.config.speechKey
      });

      // Step 1: Initialize Speech Recognition
      await this.initializeSpeechRecognition();

      // Step 2: Initialize Audio Context for VAD (if enabled)
      if (this.config.enableVAD) {
        await this.initializeVAD();
      }

      // Step 3: Initialize Azure TTS Avatar SDK
      this.updateState({ connectionStatus: 'Creating Azure Avatar...' });
      await this.initializeAvatar(videoElement);

      // Step 4: Start the conversation loop
      this.updateState({ 
        isActive: true, 
        isConnecting: false,
        connectionStatus: 'Ready - Start speaking!',
        error: null 
      });

      console.log('🎉 [SpeechToVideo] Full initialization completed successfully!');
      this.dispatchEvent(new CustomEvent('ready'));

      // Auto-start listening after a brief delay
      setTimeout(() => {
        if (this.currentState.isActive && !this.isDestroyed) {
          this.startListening();
        }
      }, 1000);

    } catch (error) {
      console.error('❌ [SpeechToVideo] Service initialization failed:', error);
      this.emitError(error instanceof Error ? error.message : 'Failed to initialize speech-to-video service', false);
      throw error;
    }
  }

  private async initializeSpeechRecognition(): Promise<void> {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 [SpeechToVideo] Speech recognition started');
      this.updateState({ isListening: true, connectionStatus: 'Listening...', error: null });
      this.restartAttempts = 0; // Reset restart attempts on successful start
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update state with current transcript
      const currentTranscript = finalTranscript || interimTranscript;
      this.updateState({ transcript: currentTranscript.trim() });

      // Process final transcript
      if (finalTranscript.trim()) {
        console.log('✅ [SpeechToVideo] Final transcript:', finalTranscript.trim());
        this.processSpeech(finalTranscript.trim());
      }

      // Reset silence timer on speech activity
      this.resetSilenceTimer();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🚨 [SpeechToVideo] Speech recognition error:', event.error);
      
      // Handle different error types
      let errorMessage = `Speech recognition error: ${event.error}`;
      let shouldRestart = true;
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          shouldRestart = false;
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
      }
      
      this.emitError(errorMessage, shouldRestart);
    };

    recognition.onend = () => {
      console.log('🔚 [SpeechToVideo] Speech recognition ended');
      this.updateState({ isListening: false });
      
      // Auto-restart if still active and not processing
      if (this.currentState.isActive && !this.currentState.isProcessing && !this.isDestroyed) {
        console.log('🔄 [SpeechToVideo] Auto-restarting speech recognition...');
        setTimeout(() => this.restartSpeechRecognition(), 500);
      }
    };

    this.recognition = recognition;
    console.log('✅ [SpeechToVideo] Speech recognition initialized');
  }

  private async initializeVAD(): Promise<void> {
    try {
      console.log('🎙️ [SpeechToVideo] Initializing Voice Activity Detection...');
      
      // Request microphone access
      this.vadStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Create audio context for VAD
      this.vadAudioContext = new AudioContext();
      const source = this.vadAudioContext.createMediaStreamSource(this.vadStream);
      this.vadAnalyser = this.vadAudioContext.createAnalyser();
      
      this.vadAnalyser.fftSize = 256;
      this.vadAnalyser.smoothingTimeConstant = 0.8;
      
      source.connect(this.vadAnalyser);
      
      console.log('✅ [SpeechToVideo] Voice Activity Detection initialized');
    } catch (error) {
      console.warn('⚠️ [SpeechToVideo] VAD initialization failed:', error);
      // VAD is optional, continue without it
    }
  }

  private async initializeAvatar(videoElement: HTMLVideoElement): Promise<void> {
    this.avatar = new AzureTTSAvatarSDK({
      speechKey: this.config.speechKey,
      speechRegion: this.config.speechRegion,
      avatarCharacter: this.config.avatarCharacter || 'lisa',
      avatarStyle: this.config.avatarStyle || 'casual-sitting',
      voice: this.config.voice || 'en-US-JennyNeural'
    });

    console.log('🎭 [SpeechToVideo] Avatar instance created, setting up event listeners...');

    // Set up avatar event listeners
    this.avatar.on('connected', () => {
      console.log('✅ [SpeechToVideo] Avatar connected successfully!');
      this.updateState({ connectionStatus: 'Avatar connected' });
    });

    this.avatar.on('error', (error: Error) => {
      console.error('❌ [SpeechToVideo] Avatar error:', error);
      this.emitError(`Avatar error: ${error.message}`);
    });

    this.avatar.on('synthesisStarted', () => {
      console.log('🗣️ [SpeechToVideo] Avatar started speaking');
      this.updateState({ isSpeaking: true, connectionStatus: 'Avatar speaking...' });
      
      // Stop listening while avatar is speaking
      this.stopListening();
    });

    this.avatar.on('synthesisCompleted', () => {
      console.log('✅ [SpeechToVideo] Avatar finished speaking');
      this.updateState({ isSpeaking: false, connectionStatus: 'Ready - Continue speaking!' });
      
      // Resume listening after avatar finishes speaking
      setTimeout(() => {
        if (this.currentState.isActive && !this.isDestroyed) {
          this.startListening();
        }
      }, 1000); // 1 second delay to avoid echo
    });

    this.avatar.on('disconnected', () => {
      console.log('🔌 [SpeechToVideo] Avatar disconnected');
      this.updateState({ 
        isActive: false, 
        isConnecting: false,
        connectionStatus: 'Avatar disconnected',
        isSpeaking: false 
      });
    });

    // Initialize avatar with timeout
    console.log('🔗 [SpeechToVideo] Initializing Azure avatar...');
    try {
      await Promise.race([
        this.avatar.initialize(videoElement),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Avatar initialization timeout (30s)')), 30000)
        )
      ]);
      console.log('🎉 [SpeechToVideo] Avatar initialization completed successfully!');
    } catch (avatarError) {
      console.error('💥 [SpeechToVideo] Avatar initialization failed:', avatarError);
      throw new Error(`Avatar initialization failed: ${avatarError instanceof Error ? avatarError.message : 'Unknown error'}`);
    }
  }

  public startListening(): void {
    if (!this.recognition || !this.currentState.isActive || this.currentState.isSpeaking || this.currentState.isProcessing) {
      return;
    }

    try {
      console.log('🎤 [SpeechToVideo] Starting to listen...');
      this.recognition.start();
      this.updateState({ transcript: '', error: null });
      this.startSilenceTimer();
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.emitError('Failed to start speech recognition');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.currentState.isListening) {
      console.log('🔇 [SpeechToVideo] Stopping listening...');
      this.recognition.stop();
    }
    this.clearSilenceTimer();
    this.updateState({ isListening: false });
  }

  private restartSpeechRecognition(): void {
    if (!this.currentState.isActive || this.isDestroyed) return;
    
    console.log('🔄 [SpeechToVideo] Restarting speech recognition...');
    this.stopListening();
    setTimeout(() => {
      if (this.currentState.isActive && !this.currentState.isSpeaking && !this.isDestroyed) {
        this.startListening();
      }
    }, 1000);
  }

  private startSilenceTimer(): void {
    this.clearSilenceTimer();
    if (this.config.silenceTimeout && this.config.silenceTimeout > 0) {
      this.silenceTimer = setTimeout(() => {
        console.log('⏰ [SpeechToVideo] Silence timeout - restarting recognition');
        this.restartSpeechRecognition();
      }, this.config.silenceTimeout);
    }
  }

  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    this.startSilenceTimer();
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private async processSpeech(transcript: string): Promise<void> {
    if (!transcript.trim() || this.currentState.isProcessing) return;

    try {
      console.log('🔄 [SpeechToVideo] Processing speech:', transcript);
      
      this.updateState({ 
        isProcessing: true, 
        isListening: false,
        connectionStatus: 'Processing speech...',
        transcript,
        conversationTurn: this.currentState.conversationTurn + 1
      });

      // Stop listening while processing
      this.stopListening();

      // Add user message to conversation history
      this.conversationHistory.push({ role: 'user', content: transcript });

      // Send to corporate API for GPT processing
      this.updateState({ connectionStatus: 'Getting AI response...' });
      const response = await this.callCorporateAPI(transcript);
      
      if (!response) {
        throw new Error('No response from AI');
      }

      // Add AI response to conversation history
      this.conversationHistory.push({ role: 'assistant', content: response });

      this.updateState({ 
        aiResponse: response,
        connectionStatus: 'Generating avatar response...'
      });

      // Generate avatar video response
      await this.speakResponse(response);

      // Reset processing state
      this.updateState({ 
        isProcessing: false,
        connectionStatus: 'Ready - Continue speaking!'
      });

      console.log('✅ [SpeechToVideo] Speech processing completed successfully');

    } catch (error) {
      console.error('❌ [SpeechToVideo] Error processing speech:', error);
      this.updateState({ isProcessing: false });
      this.emitError(error instanceof Error ? error.message : 'Failed to process speech');
      
      // Resume listening after error
      setTimeout(() => {
        if (this.currentState.isActive && !this.isDestroyed) {
          this.startListening();
        }
      }, 2000);
    }
  }

  private async callCorporateAPI(userMessage: string): Promise<string> {
    const apiUrl = this.config.corporateApiUrl || '/api/corporate';
    
    // Prepare messages for the API (include conversation context)
    const messages = [
      { role: 'system', content: 'You are a helpful corporate AI assistant. Provide concise, professional responses suitable for voice conversation. Keep responses under 100 words for natural speech flow.' },
      ...this.conversationHistory.slice(-6), // Keep last 6 messages for context
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
      throw new Error(`Corporate API error: ${response.status} - ${response.statusText}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body from corporate API');
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
            // Parse the streaming format: 0:"content"
            const match = line.match(/^0:"(.*)"/);
            if (match) {
              // Unescape the content
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

    const trimmedResponse = fullResponse.trim();
    if (!trimmedResponse) {
      throw new Error('Empty response from corporate API');
    }

    return trimmedResponse;
  }

  private async speakResponse(text: string): Promise<void> {
    if (!this.avatar || !this.avatar.isReady()) {
      throw new Error('Avatar not ready for speech synthesis');
    }

    try {
      console.log('🎭 [SpeechToVideo] Avatar speaking response...');
      await this.avatar.speakText(text);
      console.log('✅ [SpeechToVideo] Avatar response completed');
    } catch (error) {
      console.error('❌ [SpeechToVideo] Error speaking response:', error);
      throw new Error('Failed to generate avatar speech');
    }
  }

  public async disconnect(): Promise<void> {
    console.log('🔌 [SpeechToVideo] Disconnecting service...');
    this.isDestroyed = true;

    // Stop listening
    this.stopListening();
    this.clearSilenceTimer();

    // Disconnect avatar
    if (this.avatar) {
      this.avatar.disconnect();
      this.avatar = null;
    }

    // Clean up VAD resources
    if (this.vadStream) {
      this.vadStream.getTracks().forEach(track => track.stop());
      this.vadStream = null;
    }

    if (this.vadAudioContext) {
      try {
        await this.vadAudioContext.close();
      } catch (error) {
        console.warn('Error closing audio context:', error);
      }
      this.vadAudioContext = null;
    }

    // Clear conversation history
    this.conversationHistory = [];
    this.restartAttempts = 0;

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
      conversationTurn: 0
    });

    this.dispatchEvent(new CustomEvent('disconnected'));
    console.log('✅ [SpeechToVideo] Service disconnected successfully');
  }

  public async speakText(text: string): Promise<void> {
    if (!this.avatar || !this.avatar.isReady()) {
      throw new Error('Avatar not ready');
    }

    await this.avatar.speakText(text);
  }

  public isReady(): boolean {
    return this.currentState.isActive && 
           this.avatar?.isReady() === true && 
           !this.currentState.isConnecting &&
           !this.isDestroyed;
  }

  public getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  public clearConversation(): void {
    this.conversationHistory = [];
    this.updateState({ conversationTurn: 0 });
    console.log('🗑️ [SpeechToVideo] Conversation history cleared');
  }
}

export default SpeechToVideoService; 