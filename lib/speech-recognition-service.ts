export interface SpeechRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private config: SpeechRecognitionConfig;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;

  constructor(config: SpeechRecognitionConfig = {}) {
    this.config = {
      language: config.language || 'en-US',
      continuous: config.continuous ?? true,
      interimResults: config.interimResults ?? true,
      maxAlternatives: config.maxAlternatives || 1,
    };

    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.config.continuous!;
    this.recognition.interimResults = this.config.interimResults!;
    this.recognition.maxAlternatives = this.config.maxAlternatives!;
    this.recognition.lang = this.config.language!;

    // Set up event handlers
    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
    this.recognition.onstart = this.handleStart.bind(this);
    this.recognition.onspeechstart = this.handleSpeechStart.bind(this);
    this.recognition.onspeechend = this.handleSpeechEnd.bind(this);
  }

  /**
   * Start listening for speech
   */
  async start(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      return;
    }

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for voice activity detection
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      // Start recognition
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      throw error;
    }
  }

  /**
   * Stop listening for speech
   */
  stop(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    this.recognition.stop();
    this.isListening = false;

    // Clean up audio resources
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
    }
  }

  /**
   * Get current audio level (0-1)
   */
  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const sum = dataArray.reduce((a, b) => a + b, 0);
    return sum / (dataArray.length * 255);
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  // Event handlers
  private handleResult(event: SpeechRecognitionEvent) {
    const results = event.results;
    const lastResult = results[results.length - 1];

    if (lastResult) {
      const result: SpeechRecognitionResult = {
        transcript: lastResult[0].transcript,
        isFinal: lastResult.isFinal,
        confidence: lastResult[0].confidence,
      };

      this.onResult?.(result);

      // If final result, trigger processing
      if (result.isFinal) {
        this.onFinalResult?.(result.transcript);
      }
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent) {
    console.error('Speech recognition error:', event.error);
    this.onError?.(event.error);

    // Auto-restart on certain errors
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
      setTimeout(() => {
        if (this.isListening) {
          this.recognition?.start();
        }
      }, 1000);
    }
  }

  private handleEnd() {
    // Auto-restart if continuous mode is enabled and we're still supposed to be listening
    if (this.config.continuous && this.isListening) {
      setTimeout(() => {
        if (this.isListening) {
          this.recognition?.start();
        }
      }, 100);
    }
  }

  private handleStart() {
    this.onStart?.();
  }

  private handleSpeechStart() {
    this.onSpeechStart?.();
  }

  private handleSpeechEnd() {
    this.onSpeechEnd?.();
  }

  // Event callbacks (to be set by consumer)
  onResult?: (result: SpeechRecognitionResult) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
}