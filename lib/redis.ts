import { createClient } from 'redis';

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error && reason.message.includes('Redis')) {
    console.error('❌ Unhandled Redis promise rejection:', reason);
  }
});

// Redis client for Bull Queue
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.error('Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Redis client for caching
export const cacheClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis cache connection failed after 10 retries');
        return new Error('Redis cache connection failed');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Connection state tracking
let isInitializing = false;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Initialize Redis connections
export async function initRedis() {
  // If already initialized and connected, return immediately
  if (isInitialized && redisClient.isReady && cacheClient.isReady) {
    return;
  }

  // If initialization is in progress, wait for it
  if (isInitializing && initPromise) {
    return initPromise;
  }

  // Start new initialization
  isInitializing = true;
  initPromise = performInit();
  
  try {
    await initPromise;
  } finally {
    isInitializing = false;
    initPromise = null;
  }
}

async function performInit() {
  try {
    console.log('Connecting to Redis at:', process.env.REDIS_URL || 'redis://localhost:6379');
    
    // Connect both clients safely
    const connectPromises = [];
    
    if (!redisClient.isReady && !redisClient.isOpen) {
      connectPromises.push(redisClient.connect().catch(err => {
        if (err.message !== 'Socket already opened') {
          throw err;
        }
      }));
    }
    if (!cacheClient.isReady && !cacheClient.isOpen) {
      connectPromises.push(cacheClient.connect().catch(err => {
        if (err.message !== 'Socket already opened') {
          throw err;
        }
      }));
    }
    
    if (connectPromises.length > 0) {
      await Promise.all(connectPromises);
    }
    
    // Wait for both clients to be ready
    let attempts = 0;
    const maxAttempts = 10;
    while ((!redisClient.isReady || !cacheClient.isReady) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!redisClient.isReady || !cacheClient.isReady) {
      throw new Error('Redis clients failed to become ready');
    }
    
    console.log('✅ Redis connections established successfully');
    isInitialized = true;
    
    // Test the connection
    const ping = await redisClient.ping();
    console.log('Redis ping response:', ping);
    
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    isInitialized = false;
    throw error;
  }
}

// Graceful shutdown
export async function closeRedis() {
  try {
    if (redisClient.isReady) {
      await redisClient.quit();
    }
    if (cacheClient.isReady) {
      await cacheClient.quit();
    }
    isInitialized = false;
    console.log('✅ Redis connections closed gracefully');
  } catch (error) {
    console.error('❌ Error closing Redis connections:', error);
  }
}

// Health check with automatic connection
export async function redisHealthCheck() {
  try {
    // Ensure connections are established
    await initRedis();
    
    // Test both connections
    const [ping1, ping2] = await Promise.all([
      redisClient.ping(),
      cacheClient.ping()
    ]);
    
    return ping1 === 'PONG' && ping2 === 'PONG';
  } catch (error) {
    console.error('❌ Redis health check failed:', error);
    return false;
  }
}

// Check if Redis is ready without attempting to connect
export function isRedisReady(): boolean {
  return redisClient.isReady && cacheClient.isReady && isInitialized;
}

// Get Redis connection info
export function getRedisInfo() {
  return {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    isConnected: isRedisReady(),
    isInitialized,
    redisClientReady: redisClient.isReady,
    cacheClientReady: cacheClient.isReady,
    isInitializing,
  };
}
