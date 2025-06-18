import { NextResponse } from 'next/server';
import { getOpenAIQueue } from '@/lib/openai-queue';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // Check for required environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is missing');
    return NextResponse.json(
      { error: 'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.' },
      { status: 500 }
    );
  }

  if (!process.env.OPENAI_CORPORATE_ASSISTANT_ID) {
    console.error('OPENAI_CORPORATE_ASSISTANT_ID environment variable is missing');
    return NextResponse.json(
      { error: 'OpenAI Corporate Assistant ID is not configured. Please set the OPENAI_CORPORATE_ASSISTANT_ID environment variable.' },
      { status: 500 }
    );
  }

  const { messages, threadId: existingThreadId } = await req.json();
  console.log('Received messages:', messages);
  console.log('Existing thread ID:', existingThreadId);

  // Rate limiting by IP (you might want to use a more sophisticated method)
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(clientIP, 10, 60000)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    // Get the queue instance
    const queue = getOpenAIQueue(process.env.OPENAI_API_KEY);
    
    // Add request to queue
    const result = await queue.processOpenAIRequest({
      messages,
      threadId: existingThreadId,
      assistantId: process.env.OPENAI_CORPORATE_ASSISTANT_ID,
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Return in the format expected by useChat
    return new Response(
      `0:"${result.response.replace(/"/g, '\\"')}"\n`,
      {
        headers: {
          'Content-Type': 'text/plain',
          'X-Thread-Id': result.threadId,
          'X-Queue-Length': queue.getQueueLength().toString(),
          'X-Processing-Count': queue.getProcessingCount().toString(),
        },
      }
    );

  } catch (error) {
    console.error('Error in API:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
