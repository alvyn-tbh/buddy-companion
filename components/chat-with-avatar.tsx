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
import { InteractiveAvatar } from "./heygen/InteractiveAvatar";
import { Button } from "@/components/ui/button";
import { Video, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChatWithAvatar(props: { 
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
  const [showAvatar, setShowAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "avatar">("chat");

  const { messages, input, handleInputChange: chatHandleInputChange, handleSubmit, status, stop, setInput, append } =
    useChat({
      api: `${props.api}`,
      maxSteps: 5,
      body: {
        threadId,
      },
      onResponse: (response) => {
        const newThreadId = response.headers.get('X-Thread-Id');
        if (newThreadId && newThreadId !== threadId) {
          setThreadId(newThreadId);
          console.log('Thread ID updated:', newThreadId);
        }
      },
      onFinish: (message) => {
        console.log('Assistant message received:', message);
      },
      onError: (error) => {
        console.error('Chat error:', error);
        
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
              duration: 10000,
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
      const timeout = setTimeout(() => {
        const welcomeMessage: TMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: corporate,
          createdAt: new Date(),
        };
        setIntroMessage(welcomeMessage);
        setHasStartedConversation(true);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [hasStartedConversation, messages.length, props.api]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    chatHandleInputChange(e);
  };

  // Combine intro message with chat messages
  const allMessages = introMessage && messages.length === 0 
    ? [introMessage]
    : messages;

  // Handle messages from avatar
  const handleAvatarMessage = (message: string) => {
    // Add the message to the chat
    append({
      role: "user",
      content: message,
    });
  };

  // Handle voice changes
  const handleVoiceChange = (newVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => {
    console.log('Chat component: Voice changing from', voice, 'to', newVoice);
    setVoice(newVoice);
  };

  return (
    <div className="w-full flex flex-col rounded-3xl bg-white shadow-2xl">
      <Header
        title="Buddy AI | Chat"
        chat_url={props.chat_url}
        features_url={props.features_url}
        how_it_works_url={props.how_it_works_url}
      />
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "chat" | "avatar")} className="h-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Text Chat
              </TabsTrigger>
              <TabsTrigger value="avatar" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video Avatar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="h-[calc(100%-80px)] m-0">
            <div className="flex flex-col h-full rounded-3xl">
              <ProjectOverview
                projectId={threadId || ""}
                isLoading={status === "in_progress"}
                onStop={stop}
              />
              
              {allMessages.length > 0 && (
                <Messages
                  messages={allMessages}
                  threadId={threadId || ""}
                  isAudioEnabled={isAudioEnabled}
                  setIsAudioEnabled={setIsAudioEnabled}
                  voice={voice}
                  onVoiceChange={handleVoiceChange}
                  voiceSpeed={props.ttsConfig?.speed}
                  autoPlay={props.ttsConfig?.autoPlay}
                />
              )}
              
              {allMessages.length === 0 && hasStartedConversation && (
                <SuggestedPrompts
                  label="Wellness Topics"
                  prompts={[
                    "How can I manage stress at work?",
                    "Tips for better work-life balance",
                    "Quick desk exercises for the office",
                    "How to improve focus and productivity"
                  ]}
                  onPromptSelected={(prompt) => {
                    setInput(prompt);
                    handleSubmit(new Event('submit') as any);
                  }}
                />
              )}
              
              <div className="px-3 pb-4 pt-3">
                <Textarea
                  autoFocus={true}
                  value={input}
                  onChange={handleInputChange}
                  handleSubmit={handleSubmit as any}
                  status={status}
                  messages={allMessages}
                  stop={stop}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="avatar" className="h-[calc(100%-80px)] m-0">
            <div className="p-6 h-full overflow-y-auto">
              <InteractiveAvatar
                onMessage={handleAvatarMessage}
                onSessionEnd={() => setActiveTab("chat")}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}