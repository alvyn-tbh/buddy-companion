import Queue from 'bull';
import type { Queue as BullQueue } from 'bull';
import { redisClient, initRedis, isRedisReady } from '../redis';

// Queue names
export const QUEUE_NAMES = {
  OPENAI_CHAT: 'openai-chat',
  AUDIO_PROCESSING: 'audio-processing',
  LARGE_REQUESTS: 'large-requests',
  ANALYTICS: 'analytics',
} as const;

// Job priorities
export const JOB_PRIORITIES = {
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
  BULK: 4,
} as const;

// Job types
export const JOB_TYPES = {
  CHAT_REQUEST: 'chat-request',
  AUDIO_TRANSCRIPTION: 'audio-transcription',
  LARGE_ANALYSIS: 'large-analysis',
  ANALYTICS_EVENT: 'analytics-event',
} as const;

// Parse Redis URL for Bull configuration
function parseRedisUrl() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const urlObj = new URL(url);
  
  const port = urlObj.port ? parseInt(urlObj.port) : 6379;
  const db = urlObj.pathname && urlObj.pathname.length > 1 
    ? parseInt(urlObj.pathname.slice(1)) 
    : 0;

  // Validate parsed numbers
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid Redis port: ${urlObj.port}`);
  }
  
  if (isNaN(db) || db < 0) {
    throw new Error(`Invalid Redis database number: ${urlObj.pathname?.slice(1)}`);
  }

  return {
    host: urlObj.hostname,
    port,
    password: urlObj.password || undefined,
    db,
  };
}

const redisConfig = parseRedisUrl();

// Queue instances (lazy initialization)
let _openaiChatQueue: BullQueue | null = null;
let _audioProcessingQueue: BullQueue | null = null;
let _largeRequestsQueue: BullQueue | null = null;
let _analyticsQueue: BullQueue | null = null;

// Ensure Redis connection is established before creating queues
async function ensureRedisConnection(): Promise<boolean> {
  try {
    // Check if already ready first
    if (isRedisReady()) {
      return true;
    }
    
    // Use the centralized Redis connection management
    await initRedis();
    
    // Test connection
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

// Queue factory function with error handling
async function createQueue(name: string, options: Queue.QueueOptions = {}): Promise<BullQueue> {
  try {
    // Ensure Redis is connected before creating queue
    const isConnected = await ensureRedisConnection();
    if (!isConnected) {
      throw new Error('Redis connection not available');
    }

    const queue = new Queue(name, {
      redis: redisConfig,
      ...options,
    });

    // Add error handling
    queue.on('error', (error) => {
      console.error(`❌ ${name} Queue error:`, error);
    });

    queue.on('waiting', (jobId) => {
      console.log(`⏳ ${name} Job ${jobId} is waiting`);
    });

    queue.on('active', (job) => {
      console.log(`🔄 ${name} Job ${job.id} has started processing`);
    });

    queue.on('completed', (job) => {
      console.log(`✅ ${name} Job ${job.id} has completed`);
    });

    queue.on('failed', (job, err) => {
      console.error(`❌ ${name} Job ${job.id} has failed:`, err);
    });

    queue.on('stalled', (jobId) => {
      console.warn(`⚠️ ${name} Job ${jobId} has stalled`);
    });

    return queue;
  } catch (error) {
    console.error(`❌ Failed to create ${name} queue:`, error);
    throw error;
  }
}

// Lazy getter functions with async initialization
export async function getOpenaiChatQueue(): Promise<BullQueue> {
  if (!_openaiChatQueue) {
    _openaiChatQueue = await createQueue(QUEUE_NAMES.OPENAI_CHAT, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return _openaiChatQueue;
}

export async function getAudioProcessingQueue(): Promise<BullQueue> {
  if (!_audioProcessingQueue) {
    _audioProcessingQueue = await createQueue(QUEUE_NAMES.AUDIO_PROCESSING, {
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 25,
      },
    });
  }
  return _audioProcessingQueue;
}

export async function getLargeRequestsQueue(): Promise<BullQueue> {
  if (!_largeRequestsQueue) {
    _largeRequestsQueue = await createQueue(QUEUE_NAMES.LARGE_REQUESTS, {
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
        removeOnComplete: 20,
        removeOnFail: 10,
      },
      limiter: {
        max: 2, // Max 2 large requests at a time
        duration: 60000, // Per minute
      },
    });
  }
  return _largeRequestsQueue;
}

export async function getAnalyticsQueue(): Promise<BullQueue> {
  if (!_analyticsQueue) {
    _analyticsQueue = await createQueue(QUEUE_NAMES.ANALYTICS, {
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 1000,
        removeOnFail: 500,
      },
    });
  }
  return _analyticsQueue;
}

// Legacy exports for backward compatibility (these will be deprecated)
let _legacyOpenaiChatQueue: BullQueue | null = null;
let _legacyAudioProcessingQueue: BullQueue | null = null;
let _legacyLargeRequestsQueue: BullQueue | null = null;
let _legacyAnalyticsQueue: BullQueue | null = null;

export const openaiChatQueue = (async () => {
  try {
    if (!_legacyOpenaiChatQueue) {
      _legacyOpenaiChatQueue = await getOpenaiChatQueue();
    }
    return _legacyOpenaiChatQueue;
  } catch (error) {
    console.error('❌ Failed to initialize legacy openaiChatQueue:', error);
    throw error;
  }
})();

export const audioProcessingQueue = (async () => {
  try {
    if (!_legacyAudioProcessingQueue) {
      _legacyAudioProcessingQueue = await getAudioProcessingQueue();
    }
    return _legacyAudioProcessingQueue;
  } catch (error) {
    console.error('❌ Failed to initialize legacy audioProcessingQueue:', error);
    throw error;
  }
})();

export const largeRequestsQueue = (async () => {
  try {
    if (!_legacyLargeRequestsQueue) {
      _legacyLargeRequestsQueue = await getLargeRequestsQueue();
    }
    return _legacyLargeRequestsQueue;
  } catch (error) {
    console.error('❌ Failed to initialize legacy largeRequestsQueue:', error);
    throw error;
  }
})();

export const analyticsQueue = (async () => {
  try {
    if (!_legacyAnalyticsQueue) {
      _legacyAnalyticsQueue = await getAnalyticsQueue();
    }
    return _legacyAnalyticsQueue;
  } catch (error) {
    console.error('❌ Failed to initialize legacy analyticsQueue:', error);
    throw error;
  }
})();

// Queue monitoring with error handling
export async function getQueueStats() {
  try {
    const stats = {
      openaiChat: {
        waiting: await (await getOpenaiChatQueue()).getWaiting(),
        active: await (await getOpenaiChatQueue()).getActive(),
        completed: await (await getOpenaiChatQueue()).getCompleted(),
        failed: await (await getOpenaiChatQueue()).getFailed(),
      },
      audioProcessing: {
        waiting: await (await getAudioProcessingQueue()).getWaiting(),
        active: await (await getAudioProcessingQueue()).getActive(),
        completed: await (await getAudioProcessingQueue()).getCompleted(),
        failed: await (await getAudioProcessingQueue()).getFailed(),
      },
      largeRequests: {
        waiting: await (await getLargeRequestsQueue()).getWaiting(),
        active: await (await getLargeRequestsQueue()).getActive(),
        completed: await (await getLargeRequestsQueue()).getCompleted(),
        failed: await (await getLargeRequestsQueue()).getFailed(),
      },
      analytics: {
        waiting: await (await getAnalyticsQueue()).getWaiting(),
        active: await (await getAnalyticsQueue()).getActive(),
        completed: await (await getAnalyticsQueue()).getCompleted(),
        failed: await (await getAnalyticsQueue()).getFailed(),
      },
    };

    return stats;
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
    // Return empty stats if queues are not available
    return {
      openaiChat: { waiting: [], active: [], completed: [], failed: [] },
      audioProcessing: { waiting: [], active: [], completed: [], failed: [] },
      largeRequests: { waiting: [], active: [], completed: [], failed: [] },
      analytics: { waiting: [], active: [], completed: [], failed: [] },
    };
  }
}

// Graceful shutdown
export async function closeQueues() {
  try {
    const queues = [
      _openaiChatQueue,
      _audioProcessingQueue,
      _largeRequestsQueue,
      _analyticsQueue,
    ].filter(Boolean);

    await Promise.all(queues.map(queue => queue?.close()));
    
    // Reset queue instances
    _openaiChatQueue = null;
    _audioProcessingQueue = null;
    _largeRequestsQueue = null;
    _analyticsQueue = null;
    
    console.log('✅ All queues closed');
  } catch (error) {
    console.error('❌ Error closing queues:', error);
  }
}

// Log Redis configuration
console.log('🔧 Bull Queue Redis Config:', {
  host: redisConfig.host,
  port: redisConfig.port,
  db: redisConfig.db,
  hasPassword: !!redisConfig.password,
});
