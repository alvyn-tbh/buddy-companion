import { OpenAI } from 'openai';
import { RequestQueue, type QueueItem, type QueueConfig } from './queue';
import { responseCache, generateCacheKey } from './cache';
import { corporate } from './system-prompt';

// Import the ChatMessage type from cache
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id?: string;
}

interface OpenAIRequest {
  messages: ChatMessage[];
  threadId?: string;
  assistantId: string;
  apiKey: string;
}

interface OpenAIResponse {
  response: string;
  threadId: string;
}

class OpenAIQueue extends RequestQueue<OpenAIRequest> {
  private openai: OpenAI;

  constructor(apiKey: string, config?: Partial<QueueConfig>) {
    super({
      maxConcurrent: 2, // Limit concurrent OpenAI calls
      maxRetries: 3,
      retryDelay: 2000,
      rateLimit: 5, // Conservative rate limit
      rateLimitWindow: 60000,
      ...config,
    });
    
    this.openai = new OpenAI({ apiKey });
  }

  async processOpenAIRequest(request: OpenAIRequest): Promise<OpenAIResponse> {
    // Use the base add method and handle the response extraction
    await this.add(request, 0);
    
    // Get the response from cache
    const cacheKey = generateCacheKey(request.messages, request.assistantId);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw new Error('No response found after processing');
  }

  protected async processItem(item: QueueItem<OpenAIRequest>): Promise<OpenAIRequest> {
    const request: OpenAIRequest = item.data;
    
    // Check cache first
    const cacheKey = generateCacheKey(request.messages, request.assistantId);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log('Cache hit for request:', cacheKey);
      return request;
    }

    try {
      // Format messages for GPT API
      const formattedMessages = [
        {
          role: 'system' as const,
          content: corporate
        },
        ...request.messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      // Use OpenAI GPT API instead of Assistant API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseText = completion.choices[0]?.message?.content || 'No response generated';

      const response: OpenAIResponse = {
        response: responseText,
        threadId: request.threadId || 'gpt-api',
      };

      // Cache the response
      responseCache.set(cacheKey, response, 300000); // 5 minutes

      return request;

    } catch (error) {
      console.error('OpenAI request failed:', error);
      throw error;
    }
  }
}

// Global queue instance
let globalOpenAIQueue: OpenAIQueue | null = null;

export function getOpenAIQueue(apiKey: string): OpenAIQueue {
  if (!globalOpenAIQueue) {
    globalOpenAIQueue = new OpenAIQueue(apiKey);
  }
  return globalOpenAIQueue;
}

export { OpenAIQueue, type OpenAIRequest, type OpenAIResponse };
