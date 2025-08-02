import { useCallback } from "react";
import { useStreamingAvatarContext } from "../context";

export const useTextChat = () => {
  const { avatarRef } = useStreamingAvatarContext();

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!avatarRef.current) {
        console.error("Avatar not initialized");
        return;
      }

      try {
        await avatarRef.current.speak({
          text,
          taskType: "talk",
        });
        console.log("Text message sent to avatar");
      } catch (error) {
        console.error("Failed to send text message:", error);
      }
    },
    [avatarRef]
  );

  const interrupt = useCallback(async () => {
    if (!avatarRef.current) return;

    try {
      await avatarRef.current.interrupt();
      console.log("Avatar interrupted");
    } catch (error) {
      console.error("Failed to interrupt avatar:", error);
    }
  }, [avatarRef]);

  return {
    sendTextMessage,
    interrupt,
  };
};