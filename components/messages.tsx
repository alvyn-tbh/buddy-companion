import type { Message as TMessage } from "ai";
import { Message } from "./message";
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom";

export const Messages = ({
  messages,
  isLoading,
  status,
  isAudioEnabled,
}: {
  messages: TMessage[];
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  isAudioEnabled: boolean;
}) => {
  const [containerRef, endRef] = useScrollToBottom();
  
  return (
    <div
      className="flex-1 h-full space-y-4 overflow-y-auto py-8"
      ref={containerRef}
    >
      <div className="max-w-xl mx-auto pt-8">
        {messages.map((m, i) => (
          <Message
            key={i}
            isLatestMessage={i === messages.length - 1}
            isLoading={isLoading}
            message={m}
            status={status}
            isAudioEnabled={isAudioEnabled}
          />
        ))}
        <div className="h-1" ref={endRef} />
      </div>
    </div>
  );
};
