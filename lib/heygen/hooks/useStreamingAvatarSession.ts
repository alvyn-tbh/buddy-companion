import { useCallback } from "react";
import StreamingAvatar, {
  StartAvatarRequest,
  StreamingEvents,
} from "@heygen/streaming-avatar";
import {
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
} from "../context";

export const useStreamingAvatarSession = () => {
  const {
    avatarRef,
    sessionState,
    setSessionState,
    setStream,
    setIsListening,
    setIsUserTalking,
    setIsAvatarTalking,
    setConnectionQuality,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    clearMessages,
  } = useStreamingAvatarContext();

  const initAvatar = useCallback(
    (token: string) => {
      avatarRef.current = new StreamingAvatar({
        token,
        basePath: process.env.NEXT_PUBLIC_HEYGEN_BASE_API_URL || "https://api.heygen.com",
      });

      return avatarRef.current;
    },
    [avatarRef]
  );

  const handleStream = useCallback(
    ({ detail }: { detail: MediaStream }) => {
      setStream(detail);
      setSessionState(StreamingAvatarSessionState.CONNECTED);
    },
    [setSessionState, setStream]
  );

  const stopAvatar = useCallback(async () => {
    if (!avatarRef.current) return;

    avatarRef.current.off(StreamingEvents.STREAM_READY, handleStream);
    avatarRef.current.off(StreamingEvents.STREAM_DISCONNECTED, stopAvatar);
    
    clearMessages();
    setIsListening(false);
    setIsUserTalking(false);
    setIsAvatarTalking(false);
    setStream(null);
    
    await avatarRef.current.stopAvatar();
    setSessionState(StreamingAvatarSessionState.INACTIVE);
  }, [
    handleStream,
    setSessionState,
    setStream,
    avatarRef,
    setIsListening,
    clearMessages,
    setIsUserTalking,
    setIsAvatarTalking,
  ]);

  const startAvatar = useCallback(
    async (config: StartAvatarRequest) => {
      if (!avatarRef.current) {
        throw new Error("Avatar not initialized. Call initAvatar first.");
      }

      setSessionState(StreamingAvatarSessionState.LOADING);

      try {
        // Set up event listeners
        avatarRef.current.on(StreamingEvents.STREAM_READY, handleStream);
        avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, stopAvatar);

        avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
          console.log("Avatar started talking", e);
          setIsAvatarTalking(true);
        });

        avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
          console.log("Avatar stopped talking", e);
          setIsAvatarTalking(false);
        });

        avatarRef.current.on(StreamingEvents.USER_START, () => {
          console.log("User started talking");
          setIsUserTalking(true);
          setIsListening(true);
        });

        avatarRef.current.on(StreamingEvents.USER_STOP, () => {
          console.log("User stopped talking");
          setIsUserTalking(false);
        });

        avatarRef.current.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
          handleUserTalkingMessage(event.detail);
        });

        avatarRef.current.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
          handleStreamingTalkingMessage(event.detail);
        });

        avatarRef.current.on(StreamingEvents.USER_END_MESSAGE, (event) => {
          handleEndMessage("user", event.detail);
        });

        avatarRef.current.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
          handleEndMessage("assistant", event.detail);
        });

        // Start the avatar session
        await avatarRef.current.startAvatar(config);

        console.log("Avatar session started successfully");
      } catch (error) {
        console.error("Error starting avatar:", error);
        setSessionState(StreamingAvatarSessionState.INACTIVE);
        throw error;
      }
    },
    [
      avatarRef,
      setSessionState,
      handleStream,
      stopAvatar,
      setIsAvatarTalking,
      setIsUserTalking,
      setIsListening,
      handleUserTalkingMessage,
      handleStreamingTalkingMessage,
      handleEndMessage,
    ]
  );

  return {
    initAvatar,
    startAvatar,
    stopAvatar,
    sessionState,
    stream: useStreamingAvatarContext().stream,
  };
};