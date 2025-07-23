import { OpenAI } from 'openai';
import { 
  getOpenaiChatQueue,
  getAudioProcessingQueue, 
  getLargeRequestsQueue, 
  getAnalyticsQueue,
  JOB_TYPES
} from './bull-queue';
import { initRedis, closeRedis } from '../redis';
import { responseCache, generateCacheKey } from '../cache';
import { transcribeAudio, base64ToBuffer, validateAudioInput } from '../audio-transcription';
import { corporate } from '../system-prompt';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('CRITICAL: OPENAI_API_KEY is not configured');
  console.error('Worker will fail to process OpenAI requests');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize queue processors
async function initializeQueueProcessors() {
  try {
    // Get queue instances
    const openaiChatQueue = await getOpenaiChatQueue();
    const audioProcessingQueue = await getAudioProcessingQueue();
    const largeRequestsQueue = await getLargeRequestsQueue();
    const analyticsQueue = await getAnalyticsQueue();

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

        // Format messages for GPT API
        const formattedMessages = [
          {
            role: 'system',
            content: corporate
          },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content
          }))
        ];

        // Use OpenAI GPT API instead of Assistant API
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1000,
        });

        const responseText = completion.choices[0]?.message?.content || 'No response generated';

        const response = {
          response: responseText,
          threadId: threadId || 'gpt-api',
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
      const { audioBuffer: base64Audio, options, requestId } = job.data;
      
      console.log(`Processing audio transcription ${requestId}`);
      
      try {
        // Convert base64 back to buffer
        const audioBuffer = base64ToBuffer(base64Audio);
        
        // Validate audio input
        validateAudioInput(audioBuffer);
        
        // Transcribe using OpenAI Whisper API
        const result = await transcribeAudio(audioBuffer, options);

        console.log(`Audio transcription ${requestId} completed successfully`);
        return result;

      } catch (error) {
        console.error(`Audio transcription ${requestId} failed:`, error);
        throw error;
      }
    });

    // Process large requests
    largeRequestsQueue.process(JOB_TYPES.LARGE_ANALYSIS, async (job) => {
      const { requestId } = job.data;
      
      console.log(`Processing large request ${requestId}`);
      
      try {
        // Simulate processing large requests
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log(`Large request ${requestId} completed successfully`);
        return { success: true, requestId };

      } catch (error) {
        console.error(`Large request ${requestId} failed:`, error);
        throw error;
      }
    });

    // Process analytics
    analyticsQueue.process(JOB_TYPES.ANALYTICS_EVENT, async (job) => {
      const { event, requestId } = job.data;
      
      console.log(`Processing analytics ${requestId}`);
      
      try {
        // Simulate analytics processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`Analytics ${requestId} completed successfully`);
        return { success: true, event, requestId };

      } catch (error) {
        console.error(`Analytics ${requestId} failed:`, error);
        throw error;
      }
    });

    console.log('✅ All queue processors initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize queue processors:', error);
    throw error;
  }
}

// Initialize Redis and queue processors
async function initialize() {
  try {
    console.log('🚀 Initializing queue worker...');
    
    // Initialize Redis
    await initRedis();
    console.log('✅ Redis initialized');
    
    // Initialize queue processors
    await initializeQueueProcessors();
    console.log('✅ Queue processors initialized');
    
    console.log('🎉 Queue worker ready!');
    
  } catch (error) {
    console.error('❌ Failed to initialize queue worker:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function shutdown() {
  console.log('🛑 Shutting down queue worker...');
  
  try {
    await closeRedis();
    console.log('✅ Redis connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the worker
initialize().catch((error) => {
  console.error('❌ Failed to start queue worker:', error);
  process.exit(1);
});
