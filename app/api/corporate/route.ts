import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { corporate } from '@/lib/system-prompt';
import { usageTracker } from '@/lib/usage-tracker';
import { createClient } from '@/lib/supabase/server';
import { corporate as corporateIntro } from '@/lib/system-prompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is missing');
}

export async function POST(request: NextRequest) {
  try {
    const { messages, existingThreadId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      const errorMessage = 'Invalid messages format';
      return new Response(
        `0:"${errorMessage}"\n`,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
    }

    // Get user ID for usage tracking
    let userId: string | undefined;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch (error) {
      console.warn('Could not get user for usage tracking:', error);
    }

    // --- Custom follow-up logic for name, company, and role ---
    // We'll use simple keyword detection for demo purposes
    // (In production, use NLP or LLM function-calling for more robust extraction)
    const userMessages = messages.filter(m => m.role === 'user');

    // Helper functions
    function extractName(text: string) {
      // Look for "my name is ..." or "I am ..." or "I'm ..."
      const nameMatch = text.match(/(?:my name is|i am|i\'m|i’m)\s+([A-Za-z ]+)/i);
      if (nameMatch) return nameMatch[1].trim().split(' ')[0];
      // Fallback: if user just types a single word
      if (text.trim().split(' ').length === 1 && text.trim().length > 1) return text.trim();
      return null;
    }
    function extractCompany(text: string) {
      // Look for "company is ..." or "at ..." or "from ..."
      const companyMatch = text.match(/(?:company is|at|from)\s+([A-Za-z0-9 &]+)/i);
      if (companyMatch) return companyMatch[1].trim();
      return null;
    }
    function extractRole(text: string) {
      // Look for "role is ..." or "I am a ..." or "I work as ..."
      const roleMatch = text.match(/(?:role is|i am a|i work as|i’m a|i\'m a)\s+([A-Za-z ]+)/i);
      if (roleMatch) return roleMatch[1].trim();
      return null;
    }

    // Track what we have
    let userName = null;
    let companyName = null;
    let userRole = null;
    for (const msg of userMessages) {
      if (!userName) userName = extractName(msg.content);
      if (!companyName) companyName = extractCompany(msg.content);
      if (!userRole) userRole = extractRole(msg.content);
    }

    // Check if this is the first message (only system message exists)
    const isFirstMessage = messages.length === 1 && messages[0].role === 'system';
    
    if (isFirstMessage) {
      // Send introductory message
      const introMessage = corporateIntro;
      
      return new Response(
        `0:"${introMessage}"\n`,
        {
          headers: {
            'Content-Type': 'text/plain',
            'X-Thread-Id': existingThreadId || 'gpt-api',
          },
        }
      );
    }

    // Format messages for GPT API
    const formattedMessages = [
      {
        role: 'system',
        content: corporate
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Use OpenAI GPT API instead of Assistant API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // You can change this to gpt-4o or gpt-4-turbo based on your needs
      messages: formattedMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Track usage
    const requestId = `corporate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // We'll track usage after the response is complete
    let totalTokens = 0;
    let responseContent = '';

    // Create a readable stream from the completion
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              responseContent += content;
              // Escape the content for streaming format
              const escapedContent = content
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
              
              controller.enqueue(new TextEncoder().encode(`0:"${escapedContent}"\n`));
            }
            
            // Track tokens from usage
            if (chunk.usage?.total_tokens) {
              totalTokens = chunk.usage.total_tokens;
            }
          }
          
          // Track usage after response is complete
          if (totalTokens > 0) {
            await usageTracker.trackUsage({
              user_id: userId,
              api_type: 'text',
              model: 'gpt-4o-mini',
              tokens_used: totalTokens,
              request_id: requestId,
              metadata: {
                thread_id: existingThreadId,
                message_count: messages.length,
                response_length: responseContent.length,
              },
            });
          }
          
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'X-Thread-Id': existingThreadId || 'gpt-api', // Keep thread ID for compatibility
      },
    });

  } catch (error) {
    console.error('Error in API:', error);
    
    // Handle specific OpenAI errors
    let userFriendlyMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      if (errorMessage.includes('rate_limit_exceeded') || errorMessage.includes('quota')) {
        userFriendlyMessage = 'OpenAI API rate limit exceeded. You have exceeded your current quota. Please check your plan and billing details.';
      } else if (errorMessage.includes('authentication')) {
        userFriendlyMessage = 'OpenAI API authentication failed. Please check your API key configuration.';
      } else {
        userFriendlyMessage = `OpenAI API error: ${errorMessage}`;
      }
    }
    
    // Return error in streaming format
    return new Response(
      `0:"${userFriendlyMessage}"\n`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
  }
}
