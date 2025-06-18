interface QueueItem {
  id: string;
  priority: number;
  data: any;
  retries: number;
  maxRetries: number;
  timestamp: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface QueueConfig {
  maxConcurrent: number;
  maxRetries: number;
  retryDelay: number;
  rateLimit: number;
  rateLimitWindow: number;
}

abstract class RequestQueue {
  private queue: QueueItem[] = [];
  private processing: Set<string> = new Set();
  private config: QueueConfig;
  private rateLimitCount = 0;
  private rateLimitReset = Date.now();

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxConcurrent: 3,
      maxRetries: 3,
      retryDelay: 1000,
      rateLimit: 10,
      rateLimitWindow: 60000,
      ...config,
    };
  }

  async add<T>(
    data: any,
    priority: number = 0,
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const item: QueueItem = {
        id: Math.random().toString(36).substr(2, 9),
        priority,
        data,
        retries: 0,
        maxRetries,
        timestamp: Date.now(),
        resolve,
        reject,
      };

      this.queue.push(item);
      this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
      this.process();
    });
  }

  private async process() {
    if (this.processing.size >= this.config.maxConcurrent) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      setTimeout(() => this.process(), 1000);
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.processing.add(item.id);
    this.rateLimitCount++;

    try {
      const result = await this.processItem(item);
      item.resolve(result);
    } catch (error) {
      if (item.retries < item.maxRetries) {
        item.retries++;
        item.timestamp = Date.now();
        this.queue.unshift(item); // Add back to front of queue
        setTimeout(() => this.process(), this.config.retryDelay * item.retries);
      } else {
        item.reject(error);
      }
    } finally {
      this.processing.delete(item.id);
      this.process(); // Process next item
    }
  }

  protected abstract processItem(item: QueueItem): Promise<any>;

  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now > this.rateLimitReset) {
      this.rateLimitCount = 0;
      this.rateLimitReset = now + this.config.rateLimitWindow;
    }
    return this.rateLimitCount < this.config.rateLimit;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getProcessingCount(): number {
    return this.processing.size;
  }

  clear(): void {
    this.queue.forEach(item => item.reject(new Error('Queue cleared')));
    this.queue = [];
    this.processing.clear();
  }
}

export { RequestQueue, type QueueItem, type QueueConfig }; 