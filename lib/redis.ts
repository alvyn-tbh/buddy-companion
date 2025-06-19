import { createClient } from 'redis';

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

// Initialize Redis connections
export async function initRedis() {
  if (isInitializing) {
    // Wait for ongoing initialization
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  if (isInitialized && redisClient.isReady && cacheClient.isReady) {
    return; // Already connected
  }

  isInitializing = true;
  
  try {
    console.log('Connecting to Redis at:', process.env.REDIS_URL || 'redis://localhost:6379');
    
    // Connect both clients
    const connectPromises = [];
    
    if (!redisClient.isReady) {
      connectPromises.push(redisClient.connect());
    }
    if (!cacheClient.isReady) {
      connectPromises.push(cacheClient.connect());
    }
    
    await Promise.all(connectPromises);
    
    console.log('✅ Redis connections established successfully');
    isInitialized = true;
    
    // Test the connection
    const ping = await redisClient.ping();
    console.log('Redis ping response:', ping);
    
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    isInitialized = false;
    throw error;
  } finally {
    isInitializing = false;
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
    
    const ping1 = await redisClient.ping();
    const ping2 = await cacheClient.ping();
    return ping1 === 'PONG' && ping2 === 'PONG';
  } catch (error) {
    console.error('❌ Redis health check failed:', error);
    return false;
  }
}

// Get Redis connection info
export function getRedisInfo() {
  return {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    isConnected: redisClient.isReady && cacheClient.isReady,
    isInitialized,
  };
} 