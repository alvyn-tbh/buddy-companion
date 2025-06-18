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

// Initialize Redis connections
export async function initRedis() {
  try {
    console.log('Connecting to Redis at:', process.env.REDIS_URL || 'redis://localhost:6379');
    await redisClient.connect();
    await cacheClient.connect();
    console.log('✅ Redis connections established successfully');
    
    // Test the connection
    const ping = await redisClient.ping();
    console.log('Redis ping response:', ping);
    
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeRedis() {
  try {
    await redisClient.quit();
    await cacheClient.quit();
    console.log('✅ Redis connections closed gracefully');
  } catch (error) {
    console.error('❌ Error closing Redis connections:', error);
  }
}

// Health check
export async function redisHealthCheck() {
  try {
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
  };
} 