import { Button } from "./ui/button";
import { Textarea as TextareaComponent } from "./ui/textarea";
import { SendHorizontal, StopCircle, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface InputProps {
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
  input: string;
  isLoading: boolean;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isAudioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
}

export function Textarea({ handleInputChange, input, isLoading, status, stop, handleSubmit, isAudioEnabled, onAudioToggle }: InputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false);
  const maxRecordingTime = 300000; // 5 minutes max recording time

  // Check if speech recognition is supported
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Cleanup function to prevent memory leaks
  const cleanupAudioResources = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
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

  const startSpeechRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported || isProcessingRef.current) {
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      let finalTranscript = '';
      let isFirstResult = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        if (!isRecording) return; // Prevent processing after recording stopped
        
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // For the first result, replace the input. For subsequent results, append.
        if (isFirstResult) {
          handleInputChange({ target: { value: finalTranscript + interimTranscript } });
          isFirstResult = false;
        } else {
          const currentInput = input.trim();
          const newInput = currentInput + finalTranscript + interimTranscript;
          handleInputChange({ target: { value: newInput } });
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          toast.error("No speech detected. Please try again.");
        } else if (event.error === 'network') {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
        setIsRecording(false);
        setIsTranscribing(false);
        cleanupAudioResources();
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Only restart if we're still supposed to be recording
          recognitionRef.current?.start();
        } else {
          setIsRecording(false);
          setIsTranscribing(false);
          isFirstResult = true;
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error("Failed to start speech recognition");
      setIsRecording(false);
      setIsTranscribing(false);
    }
  }, [isSpeechRecognitionSupported, isRecording, input, handleInputChange, cleanupAudioResources]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleMicClick = useCallback(async () => {
    if (isProcessingRef.current) {
      return; // Prevent multiple simultaneous operations
    }

    if (isRecording) {
      // Stop recording
      isProcessingRef.current = true;
      setIsRecording(false);
      setIsTranscribing(true);
      
      try {
        mediaRecorderRef.current?.stop();
        stopSpeechRecognition();
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsTranscribing(false);
      }
    } else {
      try {
        isProcessingRef.current = true;
        
        // Request microphone permission with better error handling
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 1
          } 
        });
        
        streamRef.current = stream;
        audioChunksRef.current = [];
        setRecordingStartTime(Date.now());

        // Set up MediaRecorder with fallback MIME types
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : MediaRecorder.isTypeSupported('audio/webm') 
            ? 'audio/webm' 
            : 'audio/mp4';

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 128000
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            
            // If speech recognition is supported, use it for transcription
            if (isSpeechRecognitionSupported) {
              // Speech recognition results are already handled in onresult
              setIsTranscribing(false);
            } else {
              // Fallback: show a message that transcription is not available
              handleInputChange({ target: { value: input + " [Audio recorded - transcription not available in this browser]" } });
              setIsTranscribing(false);
            }

            // Clean up the stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
          } catch (error) {
            console.error('Error processing audio:', error);
            toast.error("Error processing audio recording");
            setIsTranscribing(false);
          } finally {
            isProcessingRef.current = false;
          }
        };

        // Start recording
        mediaRecorderRef.current.start(1000); // Collect data every second
        setIsRecording(true);
        
        // Start speech recognition
        startSpeechRecognition();
        
        toast.success("Recording started... Speak now!");
      } catch (error) {
        console.error("Error accessing microphone:", error);
        isProcessingRef.current = false;
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            toast.error("Microphone access denied. Please allow microphone permissions and try again.");
          } else if (error.name === 'NotFoundError') {
            toast.error("No microphone found. Please connect a microphone and try again.");
          } else if (error.name === 'NotReadableError') {
            toast.error("Microphone is already in use by another application.");
          } else {
            toast.error("Could not access microphone. Please check permissions and try again.");
          }
        } else {
          toast.error("Could not access microphone. Please check permissions and try again.");
        }
      }
    }
  }, [isRecording, isSpeechRecognitionSupported, input, handleInputChange, startSpeechRecognition, stopSpeechRecognition]);

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
    };
  }, [cleanupAudioResources]);

  // Prevent recording when loading
  const canRecord = !isLoading && !isTranscribing && !isProcessingRef.current;

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
            Transcribing...
          </div>
        </div>
      )}
    </div>
  );
}
