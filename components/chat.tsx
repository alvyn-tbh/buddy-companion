"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import Header from "./sub-header";
import { toast } from "sonner";
import { SuggestedPrompts } from "./suggested-prompts";

// interface Message {
//   id: string;
//   role: "system" | "user" | "assistant" | "data";
//   content: string;
// }

export default function Chat(props: { api: string, chat_url: string, features_url: string, how_it_works_url: string }) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

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
        toast.error(
          error.message.length > 0
            ? error.message
            : "An error occurred, please try again later.",
          { position: "top-center", richColors: true },
        );
      },
    });

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

  // Filter out system messages from display
  const displayMessages = messages.filter(message => message.role !== 'system');

  return (
    <div className="h-dvh flex flex-col justify-center w-full stretch">
      <Header 
        title="Buddy AI | Corporate Wellness" 
        chat_url={props.chat_url} 
        features_url={props.features_url} 
        how_it_works_url={props.how_it_works_url}
        isAudioEnabled={isAudioEnabled}
        onAudioToggle={setIsAudioEnabled}
      />
      {displayMessages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
          <div className="mt-8 px-4">
            <SuggestedPrompts sendMessage={handleSendMessage} />
          </div>
        </div>
      ) : (
        <Messages messages={displayMessages} isLoading={isLoading} status={status} isAudioEnabled={isAudioEnabled} />
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
        />
      </form>
    </div>
  );
}
