"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import Header from "./header";
import { toast } from "sonner";
import { SuggestedPrompts } from "./suggested-prompts";

// interface Message {
//   id: string;
//   role: "system" | "user" | "assistant" | "data";
//   content: string;
// }

export default function Chat(props: { api: string }) {
  const [threadId, setThreadId] = useState<string | null>(null);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    chatHandleInputChange(event as React.ChangeEvent<HTMLTextAreaElement>);
  };

  // Filter out system messages from display
  const displayMessages = messages.filter(message => message.role !== 'system');

  return (
    <div className="h-dvh flex flex-col justify-center w-full stretch">
      <Header />
      {displayMessages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
          <div className="mt-8 px-4">
            <SuggestedPrompts sendMessage={handleSendMessage} />
          </div>
        </div>
      ) : (
        <Messages messages={displayMessages} isLoading={isLoading} status={status} />
      )}
      <form
        onSubmit={handleSubmit}
        className="pb-8 bg-white dark:bg-black w-full max-w-xl mx-auto px-4 sm:px-0"
      >
        <Textarea
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          status={status}
          stop={stop}
          handleSubmit={handleSubmit}
        />
      </form>
    </div>
  );
}
