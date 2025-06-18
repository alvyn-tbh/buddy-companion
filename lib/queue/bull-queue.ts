import Queue from 'bull';

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
  
  return {
    host: urlObj.hostname,
    port: parseInt(urlObj.port) || 6379,
    password: urlObj.password || undefined,
    db: urlObj.pathname ? parseInt(urlObj.pathname.slice(1)) : 0,
  };
}

const redisConfig = parseRedisUrl();

// Create queues
export const openaiChatQueue = new Queue(QUEUE_NAMES.OPENAI_CHAT, {
  redis: redisConfig,
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

export const audioProcessingQueue = new Queue(QUEUE_NAMES.AUDIO_PROCESSING, {
  redis: redisConfig,
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

export const largeRequestsQueue = new Queue(QUEUE_NAMES.LARGE_REQUESTS, {
  redis: redisConfig,
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

export const analyticsQueue = new Queue(QUEUE_NAMES.ANALYTICS, {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 1000,
    removeOnFail: 500,
  },
});

// Queue event handlers
openaiChatQueue.on('error', (error) => {
  console.error('❌ OpenAI Chat Queue error:', error);
});

openaiChatQueue.on('waiting', (jobId) => {
  console.log(`⏳ Job ${jobId} is waiting`);
});

openaiChatQueue.on('active', (job) => {
  console.log(`🔄 Job ${job.id} has started processing`);
});

openaiChatQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} has completed`);
});

openaiChatQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} has failed:`, err);
});

// Backpressure handling
openaiChatQueue.on('stalled', (jobId) => {
  console.warn(`⚠️ Job ${jobId} has stalled`);
});

// Queue monitoring
export async function getQueueStats() {
  const stats = {
    openaiChat: {
      waiting: await openaiChatQueue.getWaiting(),
      active: await openaiChatQueue.getActive(),
      completed: await openaiChatQueue.getCompleted(),
      failed: await openaiChatQueue.getFailed(),
    },
    audioProcessing: {
      waiting: await audioProcessingQueue.getWaiting(),
      active: await audioProcessingQueue.getActive(),
      completed: await audioProcessingQueue.getCompleted(),
      failed: await audioProcessingQueue.getFailed(),
    },
    largeRequests: {
      waiting: await largeRequestsQueue.getWaiting(),
      active: await largeRequestsQueue.getActive(),
      completed: await largeRequestsQueue.getCompleted(),
      failed: await largeRequestsQueue.getFailed(),
    },
    analytics: {
      waiting: await analyticsQueue.getWaiting(),
      active: await analyticsQueue.getActive(),
      completed: await analyticsQueue.getCompleted(),
      failed: await analyticsQueue.getFailed(),
    },
  };

  return stats;
}

// Graceful shutdown
export async function closeQueues() {
  await openaiChatQueue.close();
  await audioProcessingQueue.close();
  await largeRequestsQueue.close();
  await analyticsQueue.close();
  console.log('✅ All queues closed');
}

// Log Redis configuration
console.log('🔧 Bull Queue Redis Config:', {
  host: redisConfig.host,
  port: redisConfig.port,
  db: redisConfig.db,
  hasPassword: !!redisConfig.password,
}); 