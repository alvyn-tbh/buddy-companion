"use client";

import type { Message as TMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";

import { Markdown } from "./markdown";
import { AudioPlayer } from "./audio-player";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  PocketKnife,
  SparklesIcon,
  StopCircle,
} from "lucide-react";
import { SpinnerIcon } from "./icons";

interface TextPart {
  type: "text";
  text: string;
}

interface ReasoningPart {
  type: "reasoning";
  reasoning: string;
  details: Array<{ type: "text"; text: string }>;
}

interface ReasoningMessagePartProps {
  part: ReasoningPart;
  isReasoning: boolean;
}

export function ReasoningMessagePart({
  part,
  isReasoning,
}: ReasoningMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: 0,
    },
  };

  const memoizedSetIsExpanded = useCallback((value: boolean) => {
    setIsExpanded(value);
  }, []);

  useEffect(() => {
    memoizedSetIsExpanded(isReasoning);
  }, [isReasoning, memoizedSetIsExpanded]);

  return (
    <div className="flex flex-col">
      {isReasoning ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">Reasoning</div>
          <div className="animate-spin">
            <SpinnerIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">Reasoned for a few seconds</div>
          <button
            className={cn(
              "cursor-pointer rounded-full dark:hover:bg-zinc-800 hover:bg-zinc-200",
              {
                "dark:bg-zinc-800 bg-zinc-200": isExpanded,
              },
            )}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronUpIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="reasoning"
            className="text-sm dark:text-zinc-400 text-zinc-600 flex flex-col gap-4 border-l pl-3 dark:border-zinc-800"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {part.details.map((detail, detailIndex) =>
              detail.type === "text" ? (
                <Markdown key={detailIndex}>{detail.text}</Markdown>
              ) : (
                "<redacted>"
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PurePreviewMessage = ({
  message,
  isLatestMessage,
  status,
  isAudioEnabled,
  ttsConfig,
  ttsModel,
  voice: selectedVoice,
}: {
  message: TMessage;
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  isLatestMessage: boolean;
  isAudioEnabled: boolean;
  ttsConfig?: {
    defaultVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed: number;
    autoPlay: boolean;
  };
  ttsModel?: 'tts-1' | 'tts-1-hd';
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}) => {
  // Extract text content from message parts for audio playback
  const getMessageText = () => {
    if (!message.parts) return message.content || "";
    
    return message.parts
      .filter(part => part.type === "text")
      .map(part => (part as TextPart).text)
      .join(" ");
  };

  const messageText = getMessageText();

  // Use corporate TTS config if provided, otherwise use defaults
  const voice = selectedVoice || ttsConfig?.defaultVoice || 'alloy';
  const speed = ttsConfig?.speed || 1.0;
  const autoPlay = ttsConfig?.autoPlay ?? true;
  const model = ttsModel || 'tts-1';

  // Auto-play audio for the latest completed assistant message
  useEffect(() => {
    if (
      message.role === "assistant" &&
      isLatestMessage &&
      isAudioEnabled &&
      status === "ready" &&
      messageText.trim() &&
      autoPlay
    ) {
      // Add a longer delay and check if user is still on the page
      const timer = setTimeout(async () => {
        if (!document.hidden) { // Only auto-play if tab is active
          try {
            // Call OpenAI TTS API for auto-play
            const response = await fetch('/api/tts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: messageText,
                voice: voice,
                model: model,
                speed: speed,
                format: 'mp3'
              }),
            });

            if (response.ok) {
              // Get the audio data as a blob
              const audioBlob = await response.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              
              audio.onended = () => {
                // Clean up the blob URL
                URL.revokeObjectURL(audioUrl);
              };
              
              audio.onerror = () => {
                // Clean up the blob URL
                URL.revokeObjectURL(audioUrl);
              };
              
              await audio.play();
            }
          } catch (error) {
            console.error('Auto-play audio error:', error);
          }
        }
      }, 1000); // Increased delay to 1 second

      return () => clearTimeout(timer);
    }
  }, [message.role, isLatestMessage, isAudioEnabled, status, messageText, voice, speed, autoPlay, model]);

  return (
    <AnimatePresence key={message.id}>
      <motion.div
        className="w-full mx-auto px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={`message-${message.id}`}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            "group-data-[role=user]/message:w-fit",
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col w-full space-y-4">
            {message.parts?.map((part, i) => {
              switch (part.type) {
                case "text":
                  return (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={`message-${message.id}-part-${i}`}
                      className="flex flex-row gap-2 items-start w-full pb-4"
                    >
                      <div
                        className={cn("flex flex-col gap-4", {
                          "bg-secondary text-secondary-foreground px-3 py-2 rounded-tl-xl rounded-tr-xl rounded-bl-xl":
                            message.role === "user",
                        })}
                      >
                        <Markdown>{part.text}</Markdown>
                        {/* Add audio player for assistant messages */}
                        {message.role === "assistant" && (
                          <AudioPlayer 
                            text={part.text} 
                            isEnabled={isAudioEnabled}
                            voice={voice}
                            ttsModel={model}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                case "tool-invocation":
                  const { toolName, state } = part.toolInvocation;

                  return (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={`message-${message.id}-part-${i}`}
                      className="flex flex-col gap-2 p-2 mb-3 text-sm bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-zinc-50 dark:bg-zinc-800 rounded-full">
                          <PocketKnife className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex items-baseline gap-2">
                            {state === "call" ? "Calling" : "Called"}{" "}
                            <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                              {toolName}
                            </span>
                          </div>
                        </div>
                        <div className="w-5 h-5 flex items-center justify-center">
                          {state === "call" ? (
                            isLatestMessage && status !== "ready" ? (
                              <Loader2 className="animate-spin h-4 w-4 text-zinc-500" />
                            ) : (
                              <StopCircle className="h-4 w-4 text-red-500" />
                            )
                          ) : state === "result" ? (
                            <CheckCircle size={14} className="text-green-600" />
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                case "reasoning":
                  return (
                    <ReasoningMessagePart
                      key={`message-${message.id}-${i}`}
                      // @ts-expect-error part
                      part={part}
                      isReasoning={
                        (message.parts &&
                          status === "streaming" &&
                          i === message.parts.length - 1) ??
                        false
                      }
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const Message = memo(PurePreviewMessage, (prevProps, nextProps) => {
  // More efficient comparison
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.isLatestMessage !== nextProps.isLatestMessage) return false;
  if (prevProps.isAudioEnabled !== nextProps.isAudioEnabled) return false;
  
  // Deep comparison only when necessary
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.message.role !== nextProps.message.role) return false;
  
  // Only compare content if it's actually different
  if (prevProps.message.content !== nextProps.message.content) return false;
  
  // Use shallow comparison for parts if possible
  if (prevProps.message.parts?.length !== nextProps.message.parts?.length) return false;
  
  return true;
});
