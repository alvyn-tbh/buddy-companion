import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { emotional } from '@/lib/system-prompt';
import { usageTracker } from '@/lib/usage-tracker';
import { createClient } from '@/lib/supabase/server';
import { emotional as emotionalIntro } from '@/lib/intro-prompt';

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
                    headers: { 'Content-Type': 'text/plain' },
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

        // Intro path
        const isFirstMessage = messages.length === 1 && messages[0].role === 'system';
        if (isFirstMessage) {
            const introMessage = emotionalIntro;
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

        const formattedMessages = [
            { role: 'system', content: emotional },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: formattedMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1000,
        });

        const requestId = `emotional_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let totalTokens = 0;
        let responseContent = '';

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            responseContent += content;
                            const escaped = content
                                .replace(/\\/g, '\\\\')
                                .replace(/"/g, '\\"')
                                .replace(/\n/g, '\\n')
                                .replace(/\r/g, '\\r')
                                .replace(/\t/g, '\\t');
                            controller.enqueue(new TextEncoder().encode(`0:"${escaped}"\n`));
                        }
                        if (chunk.usage?.total_tokens) {
                            totalTokens = chunk.usage.total_tokens;
                        }
                    }
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
                'X-Thread-Id': existingThreadId || 'gpt-api',
            },
        });
    } catch (error) {
        console.error('Error in API:', error);
        let userFriendlyMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            const { message } = error;
            if (message.includes('rate_limit_exceeded') || message.includes('quota')) {
                userFriendlyMessage = 'OpenAI API rate limit exceeded. You have exceeded your current quota. Please check your plan and billing details.';
            } else if (message.includes('authentication')) {
                userFriendlyMessage = 'OpenAI API authentication failed. Please check your API key configuration.';
            } else {
                userFriendlyMessage = `OpenAI API error: ${message}`;
            }
        }
        return new Response(`0:"${userFriendlyMessage}"\n`, {
            status: 500,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}
