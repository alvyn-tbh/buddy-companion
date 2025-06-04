import { Button } from "./ui/button";
import { Textarea as TextareaComponent } from "./ui/textarea";
import { SendHorizontal, StopCircle, Mic, MicOff } from "lucide-react";
import { useState, useRef } from "react";

interface InputProps {
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
  input: string;
  isLoading: boolean;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function Textarea({ handleInputChange, input, isLoading, status, stop, handleSubmit }: InputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  console.log(status);
  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          // const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // const audioFile = new File([audioBlob], "recording.webm", { type: 'audio/webm' });

          // Here you would typically send the audio file to your backend
          // For now, we'll just update the input with a placeholder
          handleInputChange({ target: { value: "[Audio recorded]" } });

          // Clean up the stream tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Could not access microphone. Please check permissions.");
      }
    }
  };

  return (
    <div className="relative">
      <TextareaComponent
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message..."
        className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
              const formEvent = {
                preventDefault: () => { },
              } as React.FormEvent<HTMLFormElement>;
              handleSubmit(formEvent);
            }
          }
        }}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleMicClick}
          disabled={isLoading}
        >
          {isRecording ? (
            <MicOff className="h-5 w-5 text-red-500" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        {isLoading ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={stop}
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!input.trim()}
            onClick={() => {
              if (input.trim()) {
                const formEvent = {
                  preventDefault: () => { },
                } as React.FormEvent<HTMLFormElement>;
                handleSubmit(formEvent);
              }
            }}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
