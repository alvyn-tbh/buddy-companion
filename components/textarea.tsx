import { Button } from "./ui/button";
import { Textarea as TextareaComponent } from "./ui/textarea";
import { SendHorizontal, StopCircle, Mic, MicOff, Volume2, VolumeX, MessageCircle, MessageCircleOff } from "lucide-react";
import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { toast } from "sonner";

// Lazy load RealtimeWebRTC to reduce initial bundle size
const RealtimeWebRTCModule = lazy(() => import('../lib/realtime-webrtc').then(mod => ({ default: mod.RealtimeWebRTC })));

interface InputProps {
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
  input: string;
  isLoading: boolean;
  stop: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isAudioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

export function Textarea({ 
  handleInputChange, 
  input, 
  isLoading, 
  stop, 
  handleSubmit, 
  isAudioEnabled, 
  onAudioToggle,
  voice = 'alloy'
}: InputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [transcript, setTranscript] = useState("");
  const [realtimeWebRTC, setRealtimeWebRTC] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxRecordingTime = 300000; // 5 minutes max recording time
  const silenceThreshold = 5000; // 5 seconds of silence

  // Lazy initialize RealtimeWebRTC only when needed
  const initializeRealtimeWebRTC = useCallback(async () => {
    if (!realtimeWebRTC) {
      try {
        const { RealtimeWebRTC } = await import('../lib/realtime-webrtc');
        const instance = new RealtimeWebRTC();
        setRealtimeWebRTC(instance);
        return instance;
      } catch (error) {
        console.error('Failed to load RealtimeWebRTC:', error);
        toast.error('Failed to initialize voice mode');
        return null;
      }
    }
    return realtimeWebRTC;
  }, [realtimeWebRTC]);

  // Toggle Voice Mode
  const toggleVoiceMode = useCallback(async () => {
    if (isVoiceModeActive) {
      // Disconnect voice mode
      setIsVoiceModeActive(false);
      setConnectionStatus('');
      if (realtimeWebRTC) {
        try {
          realtimeWebRTC.disconnect();
        } catch (error) {
          console.error('Error disconnecting voice mode:', error);
        }
      }
      return;
    }

    // Initialize voice mode
    setIsConnecting(true);
    setConnectionStatus('Initializing...');
    
    try {
      const rtc = await initializeRealtimeWebRTC();
      if (!rtc) {
        setIsConnecting(false);
        return;
      }

      // Set up event handlers
      rtc.onTranscript = (transcript: string) => {
        setTranscript(transcript);
        handleInputChange({ target: { value: transcript } });
      };

      rtc.onResponse = (response: string) => {
        console.log('AI Response:', response);
      };

      rtc.onStatusChange = (status: string) => {
        setConnectionStatus(status);
        if (status === 'Connected') {
          setIsVoiceModeActive(true);
          setIsConnecting(false);
        }
      };

      rtc.onError = (error: string) => {
        console.error('Voice mode error:', error);
        toast.error(`Voice mode error: ${error}`);
        setIsConnecting(false);
        setIsVoiceModeActive(false);
      };

      // Create session and connect
      const session = await rtc.createSession({
        model: 'gpt-4o-realtime-preview-2024-10-01',
        voice: voice,
        instructions: `You are a helpful AI assistant. Respond conversationally and naturally.`
      });

      await rtc.connect();
      
    } catch (error) {
      console.error('Error starting voice mode:', error);
      toast.error('Failed to start voice mode');
      setIsConnecting(false);
      setIsVoiceModeActive(false);
    }
  }, [isVoiceModeActive, realtimeWebRTC, voice, handleInputChange, initializeRealtimeWebRTC]);

  // Audio recording functions (optimized)
  const startRecording = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = handleRecordingStop;
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      
      // Auto-stop recording after max time
      setTimeout(() => {
        if (isRecording && mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, maxRecordingTime);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingStartTime(null);
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const handleRecordingStop = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsTranscribing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      if (audioBlob.size === 0) {
        toast.error('No audio recorded');
        return;
      }
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const { transcription } = await response.json();
      
      if (transcription?.trim()) {
        const newValue = input + (input ? ' ' : '') + transcription;
        handleInputChange({ target: { value: newValue } });
        toast.success('Audio transcribed successfully');
      } else {
        toast.error('No speech detected in recording');
      }
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
      isProcessingRef.current = false;
    }
  }, [input, handleInputChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (realtimeWebRTC) {
        realtimeWebRTC.disconnect();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [realtimeWebRTC]);

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="bg-background border border-input rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 relative overflow-hidden"
      >
        <TextareaComponent
          autoComplete="off"
          value={input}
          onChange={handleInputChange}
          placeholder="Say anything..."
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none border-0 focus:ring-0 focus:ring-offset-0"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (input.trim() && !isLoading) {
                handleSubmit(event as any);
              }
            }
          }}
        />
        
        {/* Control buttons row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Voice Recording Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing || isVoiceModeActive}
              className={`${isRecording ? 'bg-red-100 border-red-300 text-red-700' : ''}`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            {/* Voice Mode Toggle - Only load when needed */}
            <Suspense fallback={
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            }>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={toggleVoiceMode}
                disabled={isConnecting || isRecording || isTranscribing}
                className={`${isVoiceModeActive ? 'bg-blue-100 border-blue-300 text-blue-700' : ''}`}
              >
                {isConnecting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : isVoiceModeActive ? (
                  <MessageCircleOff className="h-4 w-4" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
              </Button>
            </Suspense>

            {/* Audio Toggle */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onAudioToggle(!isAudioEnabled)}
              className={`${isAudioEnabled ? 'bg-green-100 border-green-300 text-green-700' : ''}`}
            >
              {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>

          {/* Send/Stop Button */}
          {isLoading ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={stop}
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              variant="default"
              disabled={!input.trim()}
              onClick={(e) => {
                e.preventDefault();
                const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as any;
                formEvent.preventDefault = () => {};
                handleSubmit(formEvent);
              }}
            >
              <SendHorizontal className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Voice Mode Status Indicators */}
        {isVoiceModeActive && (
          <div className="absolute -top-8 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
              Voice Mode {connectionStatus || 'Connecting...'}
            </div>
          </div>
        )}

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

        {/* Voice Mode Transcript Display */}
        {isVoiceModeActive && transcript && (
          <div className="absolute -top-24 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500">You said:</span>
              <p className="text-sm">{transcript}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
