import { useCallback } from "react";
import { useStreamingAvatarContext } from "../context";

export const useVoiceChat = () => {
  const { avatarRef, isListening, setIsListening } = useStreamingAvatarContext();

  const startVoiceChat = useCallback(async () => {
    if (!avatarRef.current) {
      console.error("Avatar not initialized");
      return;
    }

    try {
      await avatarRef.current.startVoiceChat();
      setIsListening(true);
      console.log("Voice chat started");
    } catch (error) {
      console.error("Failed to start voice chat:", error);
      setIsListening(false);
    }
  }, [avatarRef, setIsListening]);

  const stopVoiceChat = useCallback(async () => {
    if (!avatarRef.current) return;

    try {
      await avatarRef.current.stopVoiceChat();
      setIsListening(false);
      console.log("Voice chat stopped");
    } catch (error) {
      console.error("Failed to stop voice chat:", error);
    }
  }, [avatarRef, setIsListening]);

  const toggleVoiceChat = useCallback(async () => {
    if (isListening) {
      await stopVoiceChat();
    } else {
      await startVoiceChat();
    }
  }, [isListening, startVoiceChat, stopVoiceChat]);

  return {
    startVoiceChat,
    stopVoiceChat,
    toggleVoiceChat,
    isListening,
  };
};