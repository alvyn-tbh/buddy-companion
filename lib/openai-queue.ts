import { OpenAI } from 'openai';
import { RequestQueue, type QueueItem } from './queue';
import { responseCache, generateCacheKey } from './cache';

interface OpenAIRequest {
  messages: any[];
  threadId?: string;
  assistantId: string;
  apiKey: string;
}

interface OpenAIResponse {
  response: string;
  threadId: string;
}

class OpenAIQueue extends RequestQueue {
  private openai: OpenAI;

  constructor(apiKey: string, config?: any) {
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
    return this.add(request, 0);
  }

  protected async processItem(item: QueueItem): Promise<OpenAIResponse> {
    const request: OpenAIRequest = item.data;
    
    // Check cache first
    const cacheKey = generateCacheKey(request.messages, request.assistantId);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log('Cache hit for request:', cacheKey);
      return cachedResponse;
    }

    try {
      // Use existing thread or create a new one
      const threadId = request.threadId || (await this.openai.beta.threads.create()).id;
      
      // Get the latest user message
      const latestMessage = request.messages[request.messages.length - 1];
      if (latestMessage.role !== 'user') {
        throw new Error('Last message must be from user');
      }

      // Add JSON instruction to the user's message
      const template = 'Please respond in JSON format: {"response": "<response here>"}';
      const messageContent = `${latestMessage.content} ${template}`;

      // Add the user's message to the thread
      await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageContent,
      });

      // Create a run
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: request.assistantId,
      });

      // Wait for the run to complete with timeout
      const result = await this.waitForRunCompletion(threadId, run.id);
      
      // Get the messages
      const threadMessages = await this.openai.beta.threads.messages.list(threadId);
      const assistantMessage = threadMessages.data[0];
      const content = assistantMessage.content[0];

      // Parse the response
      const assistantResponse = 'text' in content ? content.text.value : '';
      const assistantResponseObj = JSON.parse(assistantResponse);

      const response: OpenAIResponse = {
        response: assistantResponseObj.response,
        threadId,
      };

      // Cache the response
      responseCache.set(cacheKey, response, 300000); // 5 minutes

      return response;

    } catch (error) {
      console.error('OpenAI request failed:', error);
      throw error;
    }
  }

  private async waitForRunCompletion(threadId: string, runId: string, timeout: number = 30000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const runStatus = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      
      if (runStatus.status === 'completed') {
        return runStatus;
      }
      
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        throw new Error(`Run failed: ${runStatus.status} - ${runStatus.last_error?.message || 'Unknown error'}`);
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Run timeout exceeded');
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