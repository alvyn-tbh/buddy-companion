import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, threadId: existingThreadId } = await req.json();
  console.log('Received messages:', messages);
  console.log('Existing thread ID:', existingThreadId);

  if (!ASSISTANT_ID) {
    console.error('Assistant ID not configured');
    return NextResponse.json(
      { error: 'Assistant ID not configured' },
      { status: 500 }
    );
  }

  try {
    // Use existing thread or create a new one
    const threadId = existingThreadId || (await openai.beta.threads.create()).id;
    console.log('Using thread ID:', threadId);

    // Get the latest user message (the last message should be from the user)
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    // Add JSON instruction to the user's message
    const template = 'Please respond in JSON format: {"response": "<response here>"}';
    const messageContent = `${latestMessage.content} ${template}`;
    console.log('Adding message to thread:', messageContent);

    // Add the user's message to the thread
    const messageResponse = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: messageContent,
    });
    console.log('Message created:', messageResponse);

    // Create a run
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });
    // console.log('Run created:', run);

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    // console.log('Initial run status:', runStatus);

    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      // console.log('Updated run status:', runStatus);
    }

    if (runStatus.status !== 'completed') {
      console.error('Run failed:', runStatus.status, runStatus.last_error);
      return NextResponse.json({
        error: `Run failed: ${runStatus.status}`,
        details: runStatus.last_error
      }, { status: 500 });
    }

    // Get the messages
    const threadMessages = await openai.beta.threads.messages.list(threadId);
    // console.log('Thread messages:', threadMessages);

    const assistantMessage = threadMessages.data[0];
    // console.log('Assistant message:', assistantMessage);

    const content = assistantMessage.content[0];
    // console.log('Message content:', content);

    // Return the assistant's response
    const assistantResponse = 'text' in content ? content.text.value : '';
    const assistantResponseObj = JSON.parse(assistantResponse);
    // console.log('JSON response:', assistantResponseObj);

    // Return in the format expected by useChat
    return new Response(
      `0:"${assistantResponseObj.response.replace(/"/g, '\\"')}"\n`,
      {
        headers: {
          'Content-Type': 'text/plain',
          'X-Thread-Id': threadId,
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
