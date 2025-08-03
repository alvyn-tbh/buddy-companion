export interface VADConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
  noiseFloorAdaptation?: boolean;
  adaptationSpeed?: number;
  voiceThreshold?: number;
  silenceThreshold?: number;
  preSpeechPadding?: number;
  postSpeechPadding?: number;
}

export interface VADCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onVolumeChange?: (volume: number) => void;
  onNoiseFloorUpdate?: (noiseFloor: number) => void;
}

export class VoiceActivityDetector {
  protected audioContext: AudioContext | null = null;
  protected analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  protected frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private timeData: Uint8Array<ArrayBuffer> | null = null;
  
  protected config: Required<VADConfig>;
  private callbacks: VADCallbacks;
  
  private isSpeaking = false;
  private speechStartTime = 0;
  private speechEndTime = 0;
  private noiseFloor = -50; // dB
  private adaptiveNoiseFloor = -50;
  private volumeHistory: number[] = [];
  private animationFrame: number | null = null;
  
  constructor(config: VADConfig = {}, callbacks: VADCallbacks = {}) {
    this.config = {
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      minDecibels: -90,
      maxDecibels: -10,
      noiseFloorAdaptation: true,
      adaptationSpeed: 0.02,
      voiceThreshold: 10, // dB above noise floor
      silenceThreshold: 5, // dB above noise floor
      preSpeechPadding: 300, // ms
      postSpeechPadding: 500, // ms
      ...config
    };
    
    this.callbacks = callbacks;
  }
  
  async start(stream: MediaStream): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
      this.analyser.minDecibels = this.config.minDecibels;
      this.analyser.maxDecibels = this.config.maxDecibels;
      
      // Connect audio stream
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      
      // Initialize data arrays with proper ArrayBuffer backing
      this.frequencyData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      this.timeData = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
      
      // Start processing
      this.startProcessing();
      
    } catch (error) {
      console.error('Failed to start VAD:', error);
      throw error;
    }
  }
  
  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.frequencyData = null;
    this.timeData = null;
    this.volumeHistory = [];
  }
  
  private startProcessing(): void {
    const process = () => {
      if (!this.analyser || !this.frequencyData || !this.timeData) return;
      
      // Get frequency and time domain data
      this.analyser.getByteFrequencyData(this.frequencyData);
      this.analyser.getByteTimeDomainData(this.timeData);
      
      // Calculate current volume in dB
      const volume = this.calculateVolume();
      
      // Update noise floor if adaptation is enabled
      if (this.config.noiseFloorAdaptation) {
        this.updateNoiseFloor(volume);
      }
      
      // Detect voice activity
      this.detectVoiceActivity(volume);
      
      // Notify volume change
      this.callbacks.onVolumeChange?.(volume);
      
      // Continue processing
      this.animationFrame = requestAnimationFrame(process);
    };
    
    process();
  }
  
  protected calculateVolume(): number {
    if (!this.frequencyData) return this.config.minDecibels;
    
    // Calculate RMS of frequency data
    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      const normalized = this.frequencyData[i] / 255;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / this.frequencyData.length);
    
    // Convert to dB
    const db = 20 * Math.log10(Math.max(rms, 0.0001));
    
    // Map to our dB range
    const mappedDb = this.config.minDecibels + (db + 4) * (this.config.maxDecibels - this.config.minDecibels) / 4;
    
    return Math.max(this.config.minDecibels, Math.min(this.config.maxDecibels, mappedDb));
  }
  
  private updateNoiseFloor(currentVolume: number): void {
    // Maintain a rolling history of volume levels
    this.volumeHistory.push(currentVolume);
    if (this.volumeHistory.length > 100) {
      this.volumeHistory.shift();
    }
    
    // Only update noise floor during quiet periods
    if (!this.isSpeaking && this.volumeHistory.length > 20) {
      // Calculate the 20th percentile as noise floor
      const sorted = [...this.volumeHistory].sort((a, b) => a - b);
      const percentileIndex = Math.floor(sorted.length * 0.2);
      const newNoiseFloor = sorted[percentileIndex];
      
      // Smooth the noise floor update
      this.adaptiveNoiseFloor = this.adaptiveNoiseFloor * (1 - this.config.adaptationSpeed) + 
                                newNoiseFloor * this.config.adaptationSpeed;
      
      this.noiseFloor = this.adaptiveNoiseFloor;
      this.callbacks.onNoiseFloorUpdate?.(this.noiseFloor);
    }
  }
  
  private detectVoiceActivity(currentVolume: number): void {
    const now = Date.now();
    const volumeAboveNoiseFloor = currentVolume - this.noiseFloor;
    
    if (!this.isSpeaking) {
      // Check if volume exceeds voice threshold
      if (volumeAboveNoiseFloor > this.config.voiceThreshold) {
        // Apply pre-speech padding
        this.speechStartTime = now - this.config.preSpeechPadding;
        this.isSpeaking = true;
        this.callbacks.onSpeechStart?.();
      }
    } else {
      // Check if volume drops below silence threshold
      if (volumeAboveNoiseFloor < this.config.silenceThreshold) {
        if (this.speechEndTime === 0) {
          this.speechEndTime = now;
        } else if (now - this.speechEndTime > this.config.postSpeechPadding) {
          // Speech has ended
          this.isSpeaking = false;
          this.speechEndTime = 0;
          this.callbacks.onSpeechEnd?.();
        }
      } else {
        // Reset speech end time if voice returns
        this.speechEndTime = 0;
      }
    }
  }
  
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
  
  getNoiseFloor(): number {
    return this.noiseFloor;
  }
  
  setConfig(config: Partial<VADConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.analyser) {
      if (config.fftSize !== undefined) this.analyser.fftSize = config.fftSize;
      if (config.smoothingTimeConstant !== undefined) this.analyser.smoothingTimeConstant = config.smoothingTimeConstant;
      if (config.minDecibels !== undefined) this.analyser.minDecibels = config.minDecibels;
      if (config.maxDecibels !== undefined) this.analyser.maxDecibels = config.maxDecibels;
      
             // Reinitialize data arrays if FFT size changed
       if (config.fftSize !== undefined) {
         this.frequencyData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
         this.timeData = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
       }
    }
  }
}

// Advanced VAD with frequency analysis for better speech detection
export class AdvancedVoiceActivityDetector extends VoiceActivityDetector {
  private speechFrequencyRange = { min: 80, max: 1000 }; // Hz - typical speech frequency range
  private sampleRate = 48000;
  
  protected calculateVolume(): number {
    if (!this.frequencyData || !this.analyser) return this.config.minDecibels;
    
    // Focus on speech frequency range
    const binSize = this.sampleRate / (2 * this.frequencyData.length);
    const minBin = Math.floor(this.speechFrequencyRange.min / binSize);
    const maxBin = Math.ceil(this.speechFrequencyRange.max / binSize);
    
    // Calculate energy in speech frequency range
    let speechEnergy = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < this.frequencyData.length; i++) {
      const energy = this.frequencyData[i] / 255;
      totalEnergy += energy * energy;
      
      if (i >= minBin && i <= maxBin) {
        speechEnergy += energy * energy;
      }
    }
    
    // Calculate speech-to-total energy ratio
    const speechRatio = totalEnergy > 0 ? speechEnergy / totalEnergy : 0;
    
    // Calculate RMS with speech weighting
    const rms = Math.sqrt(speechEnergy / (maxBin - minBin + 1));
    
    // Apply speech ratio bonus (more speech frequencies = higher confidence)
    const speechBonus = speechRatio > 0.4 ? 5 : 0; // dB bonus for speech-like content
    
    // Convert to dB
    const db = 20 * Math.log10(Math.max(rms, 0.0001)) + speechBonus;
    
    // Map to our dB range
    const mappedDb = this.config.minDecibels + (db + 4) * (this.config.maxDecibels - this.config.minDecibels) / 4;
    
    return Math.max(this.config.minDecibels, Math.min(this.config.maxDecibels, mappedDb));
  }
  
  async start(stream: MediaStream): Promise<void> {
    await super.start(stream);
    
    // Get actual sample rate from audio context
    if (this.audioContext) {
      this.sampleRate = this.audioContext.sampleRate;
    }
  }
}
