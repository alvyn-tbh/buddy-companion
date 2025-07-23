export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  videoResolution: string;
  audioLatency: number;
  droppedFrames: number;
}

export class AvatarPerformanceMonitor {
  private metrics: PerformanceMetrics;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private droppedFrameCount: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private onMetricsUpdate?: (metrics: PerformanceMetrics) => void;

  constructor(onMetricsUpdate?: (metrics: PerformanceMetrics) => void) {
    this.onMetricsUpdate = onMetricsUpdate;
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0,
      videoResolution: 'N/A',
      audioLatency: 0,
      droppedFrames: 0
    };
  }

  startMonitoring(videoElement: HTMLVideoElement, interval: number = 1000): void {
    this.videoElement = videoElement;
    this.lastFrameTime = performance.now();

    // Monitor video quality
    if ('getVideoPlaybackQuality' in videoElement) {
      this.monitorVideoQuality();
    }

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
    }, interval);

    // Start frame monitoring
    this.monitorFrames();
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private monitorFrames(): void {
    const checkFrame = () => {
      if (!this.videoElement) return;

      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      
      this.frameCount++;
      
      // Calculate FPS every second
      if (deltaTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }

      if (this.monitoringInterval) {
        requestAnimationFrame(checkFrame);
      }
    };

    requestAnimationFrame(checkFrame);
  }

  private monitorVideoQuality(): void {
    if (!this.videoElement || !('getVideoPlaybackQuality' in this.videoElement)) return;

    const quality = (this.videoElement as HTMLVideoElement & { 
      getVideoPlaybackQuality?: () => { droppedVideoFrames?: number } 
    }).getVideoPlaybackQuality?.();
    if (quality) {
      this.droppedFrameCount = quality.droppedVideoFrames || 0;
      this.metrics.droppedFrames = this.droppedFrameCount;
    }
  }

  private async updateMetrics(): Promise<void> {
    if (!this.videoElement) return;

    // Update video resolution
    this.metrics.videoResolution = `${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`;

    // Calculate frame time
    this.metrics.frameTime = this.metrics.fps > 0 ? Math.round(1000 / this.metrics.fps) : 0;

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as typeof performance & { 
        memory?: { usedJSHeapSize?: number } 
      }).memory;
      if (memory?.usedJSHeapSize) {
        this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
      }
    }

    // Simulate CPU usage (in real app, this would come from server metrics)
    this.metrics.cpuUsage = Math.round(20 + Math.random() * 30);

    // Simulate network latency (in real app, measure actual network RTT)
    this.metrics.networkLatency = Math.round(10 + Math.random() * 40);

    // Simulate audio latency
    this.metrics.audioLatency = Math.round(5 + Math.random() * 15);

    // Update video quality metrics
    this.monitorVideoQuality();

    // Notify listeners
    if (this.onMetricsUpdate) {
      this.onMetricsUpdate(this.metrics);
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Performance optimization suggestions
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.metrics.fps < 24) {
      suggestions.push('Low FPS detected. Consider reducing video quality or closing other applications.');
    }

    if (this.metrics.droppedFrames > 100) {
      suggestions.push('High number of dropped frames. Check network connection or reduce video bitrate.');
    }

    if (this.metrics.memoryUsage > 500) {
      suggestions.push('High memory usage. Consider refreshing the page or closing unused tabs.');
    }

    if (this.metrics.networkLatency > 100) {
      suggestions.push('High network latency detected. This may affect real-time interaction quality.');
    }

    if (this.metrics.audioLatency > 50) {
      suggestions.push('Audio latency is high. This may cause sync issues with avatar lip movements.');
    }

    return suggestions;
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    let score = 100;

    // FPS impact (target: 30fps)
    if (this.metrics.fps < 30) {
      score -= Math.min(30, (30 - this.metrics.fps) * 2);
    }

    // Dropped frames impact
    if (this.metrics.droppedFrames > 0) {
      score -= Math.min(20, this.metrics.droppedFrames / 10);
    }

    // Memory impact
    if (this.metrics.memoryUsage > 300) {
      score -= Math.min(20, (this.metrics.memoryUsage - 300) / 20);
    }

    // Network latency impact
    if (this.metrics.networkLatency > 50) {
      score -= Math.min(20, (this.metrics.networkLatency - 50) / 5);
    }

    // Audio latency impact
    if (this.metrics.audioLatency > 30) {
      score -= Math.min(10, (this.metrics.audioLatency - 30) / 2);
    }

    return Math.max(0, Math.round(score));
  }

  // Export metrics for analytics
  exportMetrics(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      score: this.getPerformanceScore(),
      suggestions: this.getOptimizationSuggestions()
    };

    return JSON.stringify(report, null, 2);
  }
}