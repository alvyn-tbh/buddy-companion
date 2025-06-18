import { OpenAI } from 'openai';
import { 
  openaiChatQueue, 
  audioProcessingQueue, 
  largeRequestsQueue, 
  analyticsQueue,
  JOB_TYPES
} from './bull-queue';
import { initRedis, closeRedis } from '../redis';
import { responseCache, generateCacheKey } from '../cache';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Process OpenAI chat requests
openaiChatQueue.process(JOB_TYPES.CHAT_REQUEST, async (job) => {
  const { messages, threadId, assistantId, requestId } = job.data;
  
  console.log(`Processing chat request ${requestId}`);
  
  try {
    // Check cache first
    const cacheKey = generateCacheKey(messages, assistantId);
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log(`Cache hit for request ${requestId}`);
      return cachedResponse;
    }

    // Use existing thread or create a new one
    const newThreadId = threadId || (await openai.beta.threads.create()).id;
    
    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    // Add JSON instruction to the user's message
    const template = 'Please respond in JSON format: {"response": "<response here>"}';
    const messageContent = `${latestMessage.content} ${template}`;

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(newThreadId, {
      role: 'user',
      content: messageContent,
    });

    // Create a run
    const run = await openai.beta.threads.runs.create(newThreadId, {
      assistant_id: assistantId,
    });

    // Wait for the run to complete with timeout
    await waitForRunCompletion(newThreadId, run.id);
    
    // Get the messages
    const threadMessages = await openai.beta.threads.messages.list(newThreadId);
    const assistantMessage = threadMessages.data[0];
    const content = assistantMessage.content[0];

    // Parse the response
    const assistantResponse = 'text' in content ? content.text.value : '';
    const assistantResponseObj = JSON.parse(assistantResponse);

    const response = {
      response: assistantResponseObj.response,
      threadId: newThreadId,
      requestId,
    };

    // Cache the response
    responseCache.set(cacheKey, response, 300000); // 5 minutes

    console.log(`Chat request ${requestId} completed successfully`);
    return response;

  } catch (error) {
    console.error(`Chat request ${requestId} failed:`, error);
    throw error;
  }
});

// Process audio transcription
audioProcessingQueue.process(JOB_TYPES.AUDIO_TRANSCRIPTION, async (job) => {
  const { requestId } = job.data;
  
  console.log(`Processing audio transcription ${requestId}`);
  
  try {
    // Here you would implement audio transcription logic
    // For now, we'll simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = {
      transcription: "Simulated audio transcription result",
      confidence: 0.95,
      requestId,
    };

    console.log(`Audio transcription ${requestId} completed successfully`);
    return result;

  } catch (error) {
    console.error(`Audio transcription ${requestId} failed:`, error);
    throw error;
  }
});

// Process large analysis requests
largeRequestsQueue.process(JOB_TYPES.LARGE_ANALYSIS, async (job) => {
  const { requestId } = job.data;
  
  console.log(`Processing large analysis ${requestId}`);
  
  try {
    // Simulate heavy processing
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const result = {
      analysis: "Complex analysis result",
      insights: ["Insight 1", "Insight 2", "Insight 3"],
      requestId,
    };

    console.log(`Large analysis ${requestId} completed successfully`);
    return result;

  } catch (error) {
    console.error(`Large analysis ${requestId} failed:`, error);
    throw error;
  }
});

// Process analytics events
analyticsQueue.process(JOB_TYPES.ANALYTICS_EVENT, async (job) => {
  const { event, data, timestamp } = job.data;
  
  console.log(`Processing analytics event: ${event}`);
  
  try {
    // Here you would implement analytics processing
    // For now, we'll just log the event
    console.log('Analytics event processed:', { event, data, timestamp });
    
    return { success: true, event, timestamp };

  } catch (error) {
    console.error(`Analytics event ${event} failed:`, error);
    throw error;
  }
});

// Helper function to wait for OpenAI run completion
async function waitForRunCompletion(threadId: string, runId: string, timeout: number = 30000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (runStatus.status === 'completed') {
      return;
    }
    
    if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
      throw new Error(`Run failed: ${runStatus.status} - ${runStatus.last_error?.message || 'Unknown error'}`);
    }
    
    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Run timeout exceeded');
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

// Initialize Redis and start processing
async function startWorker() {
  try {
    await initRedis();
    console.log('Queue worker started successfully');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();