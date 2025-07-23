'use client';

import { AzureTTSAvatarSDK } from './azure-tts-avatar-sdk';

export interface SpeechToVideoConfig {
  speechKey: string;
  speechRegion: string;
  avatarCharacter?: string;
  avatarStyle?: string;
  voice?: string;
  corporateApiUrl?: string;
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
}

export class SpeechToVideoService extends EventTarget {
  private avatar: AzureTTSAvatarSDK | null = null;
  private recognition: SpeechRecognition | null = null;
  private config: SpeechToVideoConfig;
  private currentState: SpeechToVideoState;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

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
      aiResponse: ''
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
    try {
      console.log('🎬 [SpeechToVideo] Starting initialization...');
      this.updateState({ isConnecting: true, connectionStatus: 'Initializing...' });

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

      this.updateState({ connectionStatus: 'Creating Azure Avatar...' });

      // Initialize Azure TTS Avatar SDK
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
        this.updateState({ 
          isActive: true, 
          isConnecting: false,
          connectionStatus: 'Connected',
          error: null 
        });
        this.dispatchEvent(new CustomEvent('ready'));
      });

      this.avatar.on('error', (error: Error) => {
        console.error('❌ [SpeechToVideo] Avatar error:', error);
        this.emitError(`Avatar error: ${error.message}`);
      });

      this.avatar.on('synthesisStarted', () => {
        console.log('🗣️ [SpeechToVideo] Avatar started speaking');
        this.updateState({ isSpeaking: true, connectionStatus: 'Speaking' });
      });

      this.avatar.on('synthesisCompleted', () => {
        console.log('✅ [SpeechToVideo] Avatar finished speaking');
        this.updateState({ isSpeaking: false, connectionStatus: 'Connected' });
      });

      this.avatar.on('disconnected', () => {
        console.log('🔌 [SpeechToVideo] Avatar disconnected');
        this.updateState({ 
          isActive: false, 
          isConnecting: false,
          connectionStatus: 'Disconnected',
          isSpeaking: false 
        });
      });

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

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
            this.processSpeech(finalTranscript.trim());
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          this.emitError(`Speech recognition error: ${event.error}`);
        };

        recognition.onend = () => {
          this.updateState({ isListening: false });
          // Restart listening if still active and not processing
          if (this.currentState.isActive && !this.currentState.isProcessing) {
            setTimeout(() => this.startListening(), 500);
          }
        };

        // Assign to instance property after configuration
        this.recognition = recognition;
      } else {
        throw new Error('Speech recognition not supported in this browser');
      }

      // Initialize avatar with timeout and retry logic
      this.updateState({ connectionStatus: 'Connecting to Azure...' });
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

    } catch (error) {
      console.error('❌ [SpeechToVideo] Service initialization failed:', error);
      this.emitError(error instanceof Error ? error.message : 'Failed to initialize speech-to-video service');
      
      // Provide helpful error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('Missing required Azure configuration')) {
          this.emitError('⚠️ Azure Speech Service not configured. Please check your environment variables.');
        } else if (error.message.includes('timeout')) {
          this.emitError('⏱️ Connection timeout. Please check your internet connection and Azure credentials.');
        } else if (error.message.includes('Speech recognition not supported')) {
          this.emitError('🎤 Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
        }
      }
    }
  }

  public startListening(): void {
    if (!this.recognition || !this.currentState.isActive) {
      this.emitError('Speech recognition not available or service not active');
      return;
    }

    try {
      this.recognition.start();
      this.updateState({ transcript: '' });
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.emitError('Failed to start speech recognition');
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.updateState({ isListening: false });
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

      // Stop listening while processing
      this.stopListening();

      // Add user message to conversation history
      this.conversationHistory.push({ role: 'user', content: transcript });

      // Send to corporate API for GPT processing
      const response = await this.callCorporateAPI(transcript);
      
      if (!response) {
        throw new Error('No response from AI');
      }

      // Add AI response to conversation history
      this.conversationHistory.push({ role: 'assistant', content: response });

      this.updateState({ 
        aiResponse: response,
        connectionStatus: 'Generating avatar...'
      });

      // Generate avatar video response
      await this.speakResponse(response);

      // Reset processing state and resume listening
      this.updateState({ 
        isProcessing: false,
        connectionStatus: 'Connected'
      });

      // Resume listening after a short delay
      setTimeout(() => {
        if (this.currentState.isActive) {
          this.startListening();
        }
      }, 1000);

    } catch (error) {
      console.error('Error processing speech:', error);
      this.emitError(error instanceof Error ? error.message : 'Failed to process speech');
    }
  }

  private async callCorporateAPI(userMessage: string): Promise<string> {
    const apiUrl = this.config.corporateApiUrl || '/api/corporate';
    
    // Prepare messages for the API
    const messages = [
      { role: 'system', content: 'Corporate AI Assistant' },
      ...this.conversationHistory.slice(-10), // Keep last 10 messages for context
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
      throw new Error(`Corporate API error: ${response.status}`);
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
      throw new Error('Failed to generate avatar speech');
    }
  }

  public async disconnect(): Promise<void> {
    // Stop listening
    this.stopListening();

    // Disconnect avatar
    if (this.avatar) {
      this.avatar.disconnect();
      this.avatar = null;
    }

    // Clear conversation history
    this.conversationHistory = [];

    this.updateState({
      isActive: false,
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      isConnecting: false,
      connectionStatus: 'Disconnected',
      error: null,
      transcript: '',
      aiResponse: ''
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
}

export default SpeechToVideoService;
