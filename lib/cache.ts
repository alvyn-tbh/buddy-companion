// OpenAI response type
interface OpenAIResponse {
  response: string;
  threadId: string;
  requestId?: string;
}

// Chat message type
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id?: string;
}

interface CacheEntry {
  data: OpenAIResponse;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set(key: string, data: OpenAIResponse, ttl: number = 300000): void { // 5 minutes default
    // Clean up expired entries
    this.cleanup();
    
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): OpenAIResponse | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const responseCache = new SimpleCache();

export function generateCacheKey(messages: ChatMessage[], assistantId: string): string {
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage?.content || '';
  return `${assistantId}:${content.substring(0, 100)}`; // Truncate for key length
}
