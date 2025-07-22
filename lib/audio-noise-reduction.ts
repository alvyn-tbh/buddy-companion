export class AudioNoiseReduction {
  private audioContext: AudioContext;
  private source: MediaStreamAudioSourceNode | null = null;
  private destination: MediaStreamAudioDestinationNode;
  private filters: BiquadFilterNode[] = [];
  private compressor: DynamicsCompressorNode;
  private gain: GainNode;
  
  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.destination = this.audioContext.createMediaStreamDestination();
    
    // Create dynamics compressor for consistent levels
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    
    // Create gain node for volume control
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = 1.0;
    
    // Create filters for noise reduction
    this.setupFilters();
  }
  
  private setupFilters(): void {
    // High-pass filter to remove low-frequency noise (< 80Hz)
    const highPass = this.audioContext.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 80;
    highPass.Q.value = 0.7;
    this.filters.push(highPass);
    
    // Low-pass filter to remove high-frequency noise (> 8000Hz)
    const lowPass = this.audioContext.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 8000;
    lowPass.Q.value = 0.7;
    this.filters.push(lowPass);
    
    // Notch filters for common noise frequencies
    const notchFrequencies = [50, 60, 100, 120]; // Power line noise
    notchFrequencies.forEach(freq => {
      const notch = this.audioContext.createBiquadFilter();
      notch.type = 'notch';
      notch.frequency.value = freq;
      notch.Q.value = 30;
      this.filters.push(notch);
    });
    
    // Parametric EQ to boost speech frequencies
    const speechBoost = this.audioContext.createBiquadFilter();
    speechBoost.type = 'peaking';
    speechBoost.frequency.value = 2000; // Boost clarity frequencies
    speechBoost.Q.value = 0.5;
    speechBoost.gain.value = 3; // 3dB boost
    this.filters.push(speechBoost);
  }
  
  async processStream(inputStream: MediaStream): Promise<MediaStream> {
    // Create source from input stream
    this.source = this.audioContext.createMediaStreamSource(inputStream);
    
    // Connect the audio processing chain
    let currentNode: AudioNode = this.source;
    
    // Connect through filters
    for (const filter of this.filters) {
      currentNode.connect(filter);
      currentNode = filter;
    }
    
    // Connect to compressor and gain
    currentNode.connect(this.compressor);
    this.compressor.connect(this.gain);
    this.gain.connect(this.destination);
    
    // Return the processed stream
    return this.destination.stream;
  }
  
  setGain(value: number): void {
    this.gain.gain.value = Math.max(0, Math.min(2, value));
  }
  
  updateFilter(filterIndex: number, frequency?: number, gain?: number, q?: number): void {
    if (filterIndex >= 0 && filterIndex < this.filters.length) {
      const filter = this.filters[filterIndex];
      if (frequency !== undefined) filter.frequency.value = frequency;
      if (q !== undefined) filter.Q.value = q;
      if (gain !== undefined && 'gain' in filter) {
        (filter as any).gain.value = gain;
      }
    }
  }
  
  disconnect(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    this.filters.forEach(filter => filter.disconnect());
    this.compressor.disconnect();
    this.gain.disconnect();
  }
  
  getAnalyser(): AnalyserNode {
    const analyser = this.audioContext.createAnalyser();
    this.gain.connect(analyser);
    return analyser;
  }
}

// Enhanced noise gate for additional noise reduction
export class NoiseGate {
  private audioContext: AudioContext;
  private inputGain: GainNode;
  private outputGain: GainNode;
  private analyser: AnalyserNode;
  private threshold: number = -40; // dB
  private attack: number = 0.01; // seconds
  private release: number = 0.1; // seconds
  private isOpen: boolean = false;
  private animationFrame: number | null = null;
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.inputGain = this.audioContext.createGain();
    this.outputGain = this.audioContext.createGain();
    this.analyser = this.audioContext.createAnalyser();
    
    this.inputGain.connect(this.analyser);
    this.inputGain.connect(this.outputGain);
    
    this.startProcessing();
  }
  
  private startProcessing(): void {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const process = () => {
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Convert to dB
      const db = 20 * Math.log10(average / 255);
      
      // Gate logic
      const shouldOpen = db > this.threshold;
      
      if (shouldOpen && !this.isOpen) {
        // Open gate
        this.outputGain.gain.setTargetAtTime(1, this.audioContext.currentTime, this.attack);
        this.isOpen = true;
      } else if (!shouldOpen && this.isOpen) {
        // Close gate
        this.outputGain.gain.setTargetAtTime(0, this.audioContext.currentTime, this.release);
        this.isOpen = false;
      }
      
      this.animationFrame = requestAnimationFrame(process);
    };
    
    process();
  }
  
  connect(source: AudioNode, destination: AudioNode): void {
    source.connect(this.inputGain);
    this.outputGain.connect(destination);
  }
  
  setThreshold(threshold: number): void {
    this.threshold = threshold;
  }
  
  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this.inputGain.disconnect();
    this.outputGain.disconnect();
    this.analyser.disconnect();
  }
}
