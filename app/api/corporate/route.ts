import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is missing');
}

if (!process.env.OPENAI_CORPORATE_ASSISTANT_ID) {
  console.error('OPENAI_CORPORATE_ASSISTANT_ID environment variable is missing');
}

export async function POST(request: NextRequest) {
  try {
    const { messages, existingThreadId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Use existing thread or create new one
    const threadId = existingThreadId || (await openai.beta.threads.create()).id;

    // Add the message to the thread
    const messageContent = `${messages[messages.length - 1].content} ${template}`;
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: messageContent,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.OPENAI_CORPORATE_ASSISTANT_ID!,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (runStatus.status === 'failed') {
      console.error('Run failed:', runStatus.status, runStatus.last_error);
      return NextResponse.json({ error: 'Assistant run failed' }, { status: 500 });
    }

    // Get the response
    const threadMessages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = threadMessages.data[0];

    const responseText = lastMessage.content[0].type === 'text' ? lastMessage.content[0].text.value : 'No text response';

    // Properly escape the response text for the streaming format
    const escapedResponse = responseText
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');

    // Return in the format expected by useChat
    return new Response(
      `0:"${escapedResponse}"\n`,
      {
        headers: {
          'Content-Type': 'text/plain',
          'X-Thread-Id': threadId,
        },
      }
    );

  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const template = `Please provide corporate and business advice. Be professional, strategic, and business-focused.`;
