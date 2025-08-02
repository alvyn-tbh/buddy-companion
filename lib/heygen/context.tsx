"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import StreamingAvatar, {
  ConnectionQuality,
  StreamingEvents,
} from "@heygen/streaming-avatar";

export enum StreamingAvatarSessionState {
  INACTIVE = "INACTIVE",
  LOADING = "LOADING",
  CONNECTED = "CONNECTED",
}

interface MessageEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StreamingAvatarContextType {
  avatarRef: React.MutableRefObject<StreamingAvatar | null>;
  sessionState: StreamingAvatarSessionState;
  setSessionState: (state: StreamingAvatarSessionState) => void;
  stream: MediaStream | null;
  setStream: (stream: MediaStream | null) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  isUserTalking: boolean;
  setIsUserTalking: (talking: boolean) => void;
  isAvatarTalking: boolean;
  setIsAvatarTalking: (talking: boolean) => void;
  connectionQuality: ConnectionQuality | null;
  setConnectionQuality: (quality: ConnectionQuality | null) => void;
  messages: MessageEntry[];
  addMessage: (message: MessageEntry) => void;
  clearMessages: () => void;
  handleUserTalkingMessage: (message: string) => void;
  handleStreamingTalkingMessage: (message: string) => void;
  handleEndMessage: (role: "user" | "assistant", message: string) => void;
}

const StreamingAvatarContext = createContext<StreamingAvatarContextType | null>(
  null
);

export const useStreamingAvatarContext = () => {
  const context = useContext(StreamingAvatarContext);
  if (!context) {
    throw new Error(
      "useStreamingAvatarContext must be used within a StreamingAvatarProvider"
    );
  }
  return context;
};

interface StreamingAvatarProviderProps {
  children: ReactNode;
}

export const StreamingAvatarProvider: React.FC<StreamingAvatarProviderProps> = ({
  children,
}) => {
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const [sessionState, setSessionState] = useState<StreamingAvatarSessionState>(
    StreamingAvatarSessionState.INACTIVE
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(
    null
  );
  const [messages, setMessages] = useState<MessageEntry[]>([]);

  const addMessage = useCallback((message: MessageEntry) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const handleUserTalkingMessage = useCallback((message: string) => {
    // Handle real-time user talking updates
    console.log("User talking:", message);
  }, []);

  const handleStreamingTalkingMessage = useCallback((message: string) => {
    // Handle real-time avatar talking updates
    console.log("Avatar talking:", message);
  }, []);

  const handleEndMessage = useCallback(
    (role: "user" | "assistant", message: string) => {
      addMessage({
        id: Date.now().toString(),
        role,
        content: message,
        timestamp: new Date(),
      });
    },
    [addMessage]
  );

  const value: StreamingAvatarContextType = {
    avatarRef,
    sessionState,
    setSessionState,
    stream,
    setStream,
    isListening,
    setIsListening,
    isUserTalking,
    setIsUserTalking,
    isAvatarTalking,
    setIsAvatarTalking,
    connectionQuality,
    setConnectionQuality,
    messages,
    addMessage,
    clearMessages,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
  };

  return (
    <StreamingAvatarContext.Provider value={value}>
      {children}
    </StreamingAvatarContext.Provider>
  );
};