interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const key in store) {
    if (store[key].resetTime < now) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => delete store[key]);
  
  if (keysToDelete.length > 0) {
    console.log(`Rate limiter cleanup: removed ${keysToDelete.length} expired entries`);
  }
}, CLEANUP_INTERVAL);

// Ensure cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => clearInterval(cleanupTimer));
}

export function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = identifier;
  
  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }
  
  if (store[key].count >= limit) {
    return false;
  }
  
  store[key].count++;
  return true;
}

export function getRateLimitInfo(identifier: string) {
  const key = identifier;
  const info = store[key];
  
  if (!info) {
    return { remaining: 10, resetTime: Date.now() + 60000 };
  }
  
  return {
    remaining: Math.max(0, 10 - info.count),
    resetTime: info.resetTime,
  };
} 