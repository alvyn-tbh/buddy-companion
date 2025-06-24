import { Button } from "./ui/button";
import { Textarea as TextareaComponent } from "./ui/textarea";
import { SendHorizontal, StopCircle, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface InputProps {
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
  input: string;
  isLoading: boolean;
  stop: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isAudioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
}

export function Textarea({ handleInputChange, input, isLoading, stop, handleSubmit, isAudioEnabled, onAudioToggle }: InputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxRecordingTime = 300000; // 5 minutes max recording time
  const silenceThreshold = 5000; // 5 seconds of silence

  // Cleanup function to prevent memory leaks
  const cleanupAudioResources = useCallback(() => {
    try {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });
        streamRef.current = null;
      }
      audioChunksRef.current = [];
      isProcessingRef.current = false;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, []);

  // Function to transcribe audio using OpenAI API
  const transcribeAudioWithOpenAI = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'en');
      formData.append('responseFormat', 'verbose_json');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const result = await response.json();
      return result.transcription || '';
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      // Stop recording and transcribe
      setIsRecording(false);
      setIsTranscribing(true);
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Stop media recorder
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
      }
      
      // Process the recorded audio for transcription
      try {
        // Combine all audio chunks into a single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size > 0) {
          // Transcribe using OpenAI API
          const transcription = await transcribeAudioWithOpenAI(audioBlob);
          
          if (transcription.trim()) {
            handleInputChange({ target: { value: transcription.trim() } });
            toast.success("Transcription completed!");
          } else {
            toast.warning("No speech detected in the recording");
          }
        } else {
          toast.error("No audio data recorded");
        }
      } catch (error) {
        console.error('Error processing audio:', error);
        toast.error("Error transcribing audio recording");
      } finally {
        setIsTranscribing(false);
        isProcessingRef.current = false;
        audioChunksRef.current = [];
      }
      
      return;
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      setRecordingStartTime(Date.now());

      // Start MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // Audio recording stopped, will be processed in handleMicClick
        isProcessingRef.current = false;
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      
      // Start silence detection timer
      silenceTimerRef.current = setTimeout(() => {
        if (isRecording) {
          toast.info("Stopping recording due to silence...");
          handleMicClick(); // Stop recording
        }
      }, silenceThreshold);
      
      toast.success("Recording started... Speak now!");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
      setIsRecording(false);
    }
  }, [isRecording, handleInputChange, silenceThreshold, transcribeAudioWithOpenAI]);

  const toggleAudio = useCallback(() => {
    onAudioToggle(!isAudioEnabled);
    toast.info(!isAudioEnabled ? "Audio enabled" : "Audio disabled");
  }, [isAudioEnabled, onAudioToggle]);

  // Check for maximum recording time
  useEffect(() => {
    if (recordingStartTime && isRecording) {
      const timer = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        if (elapsed >= maxRecordingTime) {
          toast.warning("Maximum recording time reached (5 minutes)");
          handleMicClick(); // Stop recording
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [recordingStartTime, isRecording, maxRecordingTime, handleMicClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [cleanupAudioResources]);

  // Prevent recording when loading, but allow stopping when recording
  const canRecord = !isLoading && !isTranscribing && (!isProcessingRef.current || isRecording);

  return (
    <div className="relative">
      <TextareaComponent
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message or click the microphone to speak..."
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
        {/* Audio Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleAudio}
          title={isAudioEnabled ? "Disable audio" : "Enable audio"}
        >
          {isAudioEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5 text-gray-400" />
          )}
        </Button>

        {/* Microphone Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isRecording ? 'animate-pulse bg-red-100 dark:bg-red-900' : ''}`}
          onClick={handleMicClick}
          disabled={!canRecord}
          title={isRecording ? "Stop recording" : "Start voice recording"}
        >
          {isRecording ? (
            <MicOff className="h-5 w-5 text-red-500" />
          ) : isTranscribing ? (
            <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        {/* Send/Stop Button */}
        {isLoading || isRecording ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={isRecording ? handleMicClick : stop}
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!input.trim() || isRecording || isTranscribing}
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

      {/* Recording Status Indicator */}
      {isRecording && (
        <div className="absolute -top-8 left-0 right-0 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Recording... Click to stop
          </div>
        </div>
      )}

      {/* Transcribing Status Indicator */}
      {isTranscribing && (
        <div className="absolute -top-8 left-0 right-0 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
            Transcribing with OpenAI...
          </div>
        </div>
      )}
    </div>
  );
}
