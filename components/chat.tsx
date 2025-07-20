"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import Header from "./sub-header";
import { toast } from "sonner";
import { SuggestedPrompts } from "./suggested-prompts";
import type { Message as TMessage } from "ai";
import { corporate } from "@/lib/intro-prompt";

// interface Message {
//   id: string;
//   role: "system" | "user" | "assistant" | "data";
//   content: string;
// }

export default function Chat(props: { 
  api: string, 
  chat_url: string, 
  features_url: string, 
  how_it_works_url: string,
  ttsConfig?: {
    defaultVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed: number;
    autoPlay: boolean;
  }
}) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [voice, setVoice] = useState<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>(props.ttsConfig?.defaultVoice || 'alloy');
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [introMessage, setIntroMessage] = useState<TMessage | null>(null);

  // Debug voice changes
  const handleVoiceChange = (newVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => {
    console.log('Chat component: Voice changing from', voice, 'to', newVoice);
    setVoice(newVoice);
  };

  const { messages, input, handleInputChange: chatHandleInputChange, handleSubmit, status, stop, setInput } =
    useChat({
      api: `${props.api}`,
      maxSteps: 5,
      body: {
        threadId,
      },
      onResponse: (response) => {
        // Only handle headers, don't read the response body
        const newThreadId = response.headers.get('X-Thread-Id');
        if (newThreadId && newThreadId !== threadId) {
          setThreadId(newThreadId);
          console.log('Thread ID updated:', newThreadId);
        }
        console.log('Response received, thread ID:', newThreadId || threadId);
      },
      onFinish: (message) => {
        // Log the final processed message
        console.log('Assistant message received:', message);
      },
      onError: (error) => {
        console.error('Chat error:', error);
        
        // Check if it's a rate limit error
        const errorMessage = error.message || '';
        const isRateLimitError = errorMessage.includes('rate limit') || 
                                errorMessage.includes('quota') || 
                                errorMessage.includes('exceeded');
        
        if (isRateLimitError) {
          toast.error(
            "OpenAI API Rate Limit Exceeded",
            {
              position: "top-center",
              richColors: true,
              description: "You have exceeded your current quota. Please check your plan and billing details.",
              duration: 10000, // Show for 10 seconds
              action: {
                label: "Learn More",
                onClick: () => window.open("https://platform.openai.com/docs/guides/error-codes/api-errors", "_blank")
              }
            }
          );
        } else {
          toast.error(
            errorMessage.length > 0
              ? errorMessage
              : "An error occurred, please try again later.",
            { position: "top-center", richColors: true },
          );
        }
      },
    });

  // Auto-start conversation for corporate context
  useEffect(() => {
    if (!hasStartedConversation && messages.length === 0 && props.api === '/api/corporate') {
      // Add a small delay to ensure the chat is ready
      setTimeout(() => {
        const introContent = corporate;
        
        setIntroMessage({
          id: 'intro-message',
          role: 'assistant',
          content: introContent,
          parts: [
            {
              type: 'text',
              text: introContent
            }
          ]
        });
        setHasStartedConversation(true);
      }, 500);
    }
  }, [hasStartedConversation, messages.length, props.api]);

  const isLoading = status === "streaming" || status === "submitted";

  const handleSendMessage = (message: string) => {
    setInput(message);
    const formEvent = {
      preventDefault: () => { },
    } as React.FormEvent<HTMLFormElement>;
    handleSubmit(formEvent);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => {
    chatHandleInputChange(event as React.ChangeEvent<HTMLTextAreaElement>);
  };

  // Filter out system messages from display and include intro message
  const displayMessages = [
    ...(introMessage ? [introMessage] : []),
    ...messages.filter(message => message.role !== 'system')
  ];

  return (
    <div className="h-dvh flex flex-col justify-center w-full stretch">
      <Header 
        title="Buddy AI | Corporate Wellness" 
        chat_url={props.chat_url} 
        features_url={props.features_url} 
        how_it_works_url={props.how_it_works_url}
        isAudioEnabled={isAudioEnabled}
        onAudioToggle={setIsAudioEnabled}
        voice={voice}
        onVoiceChange={handleVoiceChange}
      />

      {displayMessages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
          <div className="mt-8 px-4">
            <SuggestedPrompts sendMessage={handleSendMessage} />
          </div>
        </div>
      ) : (
        <Messages 
          messages={displayMessages} 
          isLoading={isLoading} 
          status={status} 
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="pb-8 bg-white dark:bg-black w-full max-w-xl mx-auto px-4 sm:px-0"
      >
        <Textarea
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          stop={stop}
          handleSubmit={handleSubmit}
          isAudioEnabled={isAudioEnabled}
          onAudioToggle={setIsAudioEnabled}
          voice={voice}
        />
      </form>
    </div>
  );
}
