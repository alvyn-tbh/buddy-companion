"use client";

import { useEffect, useRef, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Video, VideoOff } from "lucide-react";
import { StreamingAvatarProvider, StreamingAvatarSessionState, useStreamingAvatarContext } from "@/lib/heygen/context";
import { useStreamingAvatarSession } from "@/lib/heygen/hooks/useStreamingAvatarSession";
import { useVoiceChat } from "@/lib/heygen/hooks/useVoiceChat";
import { useTextChat } from "@/lib/heygen/hooks/useTextChat";
import { AvatarVideo } from "./AvatarVideo";
import { AvatarControls } from "./AvatarControls";
import { AvatarConfig } from "./AvatarConfig";
import { DEFAULT_AVATAR_CONFIG } from "@/lib/heygen/constants";
import { StartAvatarRequest } from "@heygen/streaming-avatar";
import { toast } from "sonner";

interface InteractiveAvatarProps {
  onMessage?: (message: string) => void;
  onSessionEnd?: () => void;
}

function InteractiveAvatarContent({ onMessage, onSessionEnd }: InteractiveAvatarProps) {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } = useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { sendTextMessage } = useTextChat();
  const { messages, isAvatarTalking } = useStreamingAvatarContext();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_AVATAR_CONFIG);
  const [showAvatar, setShowAvatar] = useState(false);
  const mediaStream = useRef<HTMLVideoElement>(null);

  // Fetch access token from API
  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/heygen/get-access-token", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch access token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      toast.error("Failed to get HeyGen access token. Please check your API key.");
      throw error;
    }
  }

  // Start avatar session
  const startSession = async (isVoiceChat: boolean) => {
    try {
      const token = await fetchAccessToken();
      const avatar = initAvatar(token);

      await startAvatar(config);
      setShowAvatar(true);

      if (isVoiceChat) {
        await startVoiceChat();
      }

      toast.success("Avatar session started successfully!");
    } catch (error) {
      console.error("Error starting avatar session:", error);
      toast.error("Failed to start avatar session");
    }
  };

  // Handle text message sending
  const handleSendMessage = async (message: string) => {
    if (!stream) return;

    try {
      // Send message through avatar SDK
      await sendTextMessage(message);

      // Also send to parent component for integration with chat
      onMessage?.(message);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Update video stream when available
  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [stream]);

  // Handle session end
  const handleStopSession = () => {
    setShowAvatar(false);
    onSessionEnd?.();
  };

  // Handle messages from avatar
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      onMessage?.(lastMessage.content);
    }
  }, [messages, onMessage]);

  return (
    <div className="w-full">
      {!showAvatar ? (
        <Card className="p-6">
          <AvatarConfig config={config} onConfigChange={setConfig} />
          <div className="flex gap-4 mt-6 justify-center">
            <Button
              size="lg"
              onClick={() => startSession(true)}
              disabled={sessionState === StreamingAvatarSessionState.LOADING}
            >
              {sessionState === StreamingAvatarSessionState.LOADING ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Start Voice Chat
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => startSession(false)}
              disabled={sessionState === StreamingAvatarSessionState.LOADING}
            >
              <VideoOff className="mr-2 h-4 w-4" />
              Start Text Chat
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="relative overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                <AvatarVideo ref={mediaStream} />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground">Connecting to avatar...</p>
                </div>
              )}
              {isAvatarTalking && (
                <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  Avatar is speaking...
                </div>
              )}
            </div>
          </Card>
          
          {sessionState === StreamingAvatarSessionState.CONNECTED && (
            <div className="flex justify-center">
              <AvatarControls
                onStopSession={handleStopSession}
                onSendMessage={handleSendMessage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main component with provider
export function InteractiveAvatar(props: InteractiveAvatarProps) {
  return (
    <StreamingAvatarProvider>
      <InteractiveAvatarContent {...props} />
    </StreamingAvatarProvider>
  );
}