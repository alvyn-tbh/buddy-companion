"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square, MessageSquare } from "lucide-react";
import { useStreamingAvatarContext } from "@/lib/heygen/context";
import { useVoiceChat } from "@/lib/heygen/hooks/useVoiceChat";
import { useStreamingAvatarSession } from "@/lib/heygen/hooks/useStreamingAvatarSession";

interface AvatarControlsProps {
  onStopSession?: () => void;
  onSendMessage?: (message: string) => void;
}

export function AvatarControls({ onStopSession, onSendMessage }: AvatarControlsProps) {
  const { isListening, isUserTalking, isAvatarTalking } = useStreamingAvatarContext();
  const { toggleVoiceChat } = useVoiceChat();
  const { stopAvatar } = useStreamingAvatarSession();

  const handleStop = async () => {
    await stopAvatar();
    onStopSession?.();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Voice Chat Toggle */}
      <Button
        onClick={toggleVoiceChat}
        variant={isListening ? "default" : "outline"}
        size="lg"
        className={`
          ${isUserTalking ? "ring-2 ring-green-500" : ""}
          ${isAvatarTalking ? "ring-2 ring-blue-500" : ""}
        `}
      >
        {isListening ? (
          <>
            <Mic className="mr-2 h-4 w-4" />
            {isUserTalking ? "Speaking..." : "Listening..."}
          </>
        ) : (
          <>
            <MicOff className="mr-2 h-4 w-4" />
            Start Voice Chat
          </>
        )}
      </Button>

      {/* Text Chat Button */}
      {onSendMessage && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            // Open text input modal or handle text chat
            const message = prompt("Enter your message:");
            if (message) {
              onSendMessage(message);
            }
          }}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Text Chat
        </Button>
      )}

      {/* Stop Session */}
      <Button
        onClick={handleStop}
        variant="destructive"
        size="lg"
      >
        <Square className="mr-2 h-4 w-4" />
        End Session
      </Button>
    </div>
  );
}