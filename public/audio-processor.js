// Audio Processing Web Worker for Voice Activity Detection
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.sampleRate = 48000;
    
    // Speech detection parameters
    this.speechFrequencyRange = { min: 80, max: 1000 };
    this.energyThreshold = 0.01;
    
    // Initialize FFT
    this.port.onmessage = (event) => {
      if (event.data.type === 'config') {
        this.sampleRate = event.data.sampleRate || this.sampleRate;
      }
    };
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input.length > 0) {
      const channelData = input[0];
      
      // Fill buffer
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex++] = channelData[i];
        
        // When buffer is full, analyze it
        if (this.bufferIndex >= this.bufferSize) {
          this.analyzeBuffer();
          this.bufferIndex = 0;
        }
      }
    }
    
    return true;
  }
  
  analyzeBuffer() {
    // Calculate RMS energy
    let sum = 0;
    for (let i = 0; i < this.bufferSize; i++) {
      sum += this.buffer[i] * this.buffer[i];
    }
    const rms = Math.sqrt(sum / this.bufferSize);
    
    // Simple zero-crossing rate for voice detection
    let zeroCrossings = 0;
    for (let i = 1; i < this.bufferSize; i++) {
      if ((this.buffer[i] >= 0) !== (this.buffer[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / this.bufferSize;
    
    // Estimate if this is speech based on energy and zero-crossing rate
    const isSpeechLike = rms > this.energyThreshold && 
                         zeroCrossingRate > 0.1 && 
                         zeroCrossingRate < 0.5;
    
    // Send analysis results
    this.port.postMessage({
      type: 'analysis',
      rms: rms,
      zeroCrossingRate: zeroCrossingRate,
      isSpeechLike: isSpeechLike,
      timestamp: currentTime
    });
  }
}

registerProcessor('audio-processor', AudioProcessor);
