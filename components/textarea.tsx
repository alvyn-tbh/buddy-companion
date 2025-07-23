import { Button } from "./ui/button";
import { Textarea as TextareaComponent } from "./ui/textarea";
import { SendHorizontal, StopCircle, Mic, MicOff, Radio, Video } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { RealtimeWebRTC } from "../lib/realtime-webrtc";
import { VoiceActivityIndicator, MiniVoiceIndicator } from "./voice-activity-indicator";
import { SpeechToVideoService } from "../lib/speech-to-video-service";

interface InputProps {
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
  input: string;
  isLoading: boolean;
  stop: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  onSpeechToVideoStateChange?: (state: {
    isActive: boolean;
    isConnecting: boolean;
    connectionStatus: string;
    isSpeaking: boolean;
    error: string | null;
    isReady: boolean;
  }) => void; // Callback for state changes
}

export function Textarea({ 
  handleInputChange,
  input,
  isLoading,
  stop,
  handleSubmit,
  voice = 'alloy',
  onSpeechToVideoStateChange
}: InputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState<number>(-50);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [noiseFloor, setNoiseFloor] = useState<number>(-50);
  const [isSpeechToVideoActive, setIsSpeechToVideoActive] = useState(false);
  const [isVideoConnecting, setIsVideoConnecting] = useState(false);
  const [videoConnectionStatus, setVideoConnectionStatus] = useState<string>('');
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeRef = useRef<RealtimeWebRTC | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const azureAvatarRef = useRef<any | null>(null);
  const maxRecordingTime = 300000; // 5 minutes max recording time
  const silenceThreshold = 5000; // 5 seconds of silence

  // Initialize RealtimeWebRTC
  useEffect(() => {
    realtimeRef.current = new RealtimeWebRTC();
    
    // Set up event handlers
    realtimeRef.current.on('transcript', (text: string) => {
      setTranscript(text);
    });

    realtimeRef.current.on('status', (status: string) => {
      setConnectionStatus(status);
      if (status === 'Connected') {
        setIsConnecting(false);
      }
    });

    realtimeRef.current.on('error', (error: string) => {
      console.error('Realtime error:', error);
      toast.error(`Realtime error: ${error}`);
      setIsVoiceModeActive(false);
      setIsConnecting(false);
    });

    realtimeRef.current.on('volume', (vol: number) => {
      setVolume(vol);
    });

    realtimeRef.current.on('speechStart', () => {
      setIsSpeaking(true);
    });

    realtimeRef.current.on('speechEnd', () => {
      setIsSpeaking(false);
    });

    return () => {
      if (realtimeRef.current) {
        realtimeRef.current.disconnect();
      }
    };
  }, []);

  const toggleVoiceMode = useCallback(async () => {
    if (isVoiceModeActive) {
      // Stop voice mode
      if (realtimeRef.current) {
        realtimeRef.current.disconnect();
      }
      setIsVoiceModeActive(false);
      setIsConnecting(false);
      setConnectionStatus('');
      setTranscript("");
      toast.info("Voice mode deactivated");
    } else {
      // Start voice mode
      try {
        setIsConnecting(true);
        setConnectionStatus('Creating session...');
        
        if (!realtimeRef.current) {
          realtimeRef.current = new RealtimeWebRTC();
        }

        // Create session
        await realtimeRef.current.createSession({
          model: 'gpt-4o-realtime-preview-2024-12-17',
          voice: voice,
          instructions: "You are a helpful AI assistant. Respond naturally and conversationally to user input.",
          noiseReduction: true,
          vadConfig: {
            voiceThreshold: 8,
            silenceThreshold: 3,
            preSpeechPadding: 200,
            postSpeechPadding: 300,
            noiseFloorAdaptation: true,
            adaptationSpeed: 0.03
          }
        });

        // Connect to OpenAI Realtime
        await realtimeRef.current.connect();
        
        setIsVoiceModeActive(true);
        setTranscript("");
        toast.success("Voice mode activated - Start speaking!");
      } catch (error) {
        console.error('Error starting voice mode:', error);
        toast.error('Error starting voice mode');
        setIsConnecting(false);
        setConnectionStatus('');
      }
    }
  }, [isVoiceModeActive, voice]);

  const toggleSpeechToVideo = useCallback(async () => {
    if (isSpeechToVideoActive) {
      // Stop speech-to-video mode
      if (azureAvatarRef.current) {
        azureAvatarRef.current.disconnect();
        azureAvatarRef.current = null;
      }
      setIsSpeechToVideoActive(false);
      setIsVideoConnecting(false);
      setVideoConnectionStatus('');
      setAvatarSpeaking(false);
      setAvatarError(null);
      toast.info("Speech-to-video conversation stopped");
    } else {
      // Start speech-to-video mode with corporate integration
      try {
        setIsVideoConnecting(true);
        setVideoConnectionStatus('Initializing...');
        
        // Get Azure credentials
        const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
        const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

        console.log('🔑 Checking Azure credentials...');
        console.log('Speech Key available:', !!speechKey);
        console.log('Speech Region:', speechRegion);

        if (!speechKey || !speechRegion) {
          const errorMsg = `Azure Speech credentials not configured. Missing: ${!speechKey ? 'SPEECH_KEY ' : ''}${!speechRegion ? 'SPEECH_REGION' : ''}`;
          console.error('❌', errorMsg);
          
          // Show helpful setup guide
          toast.error(
            <div className="text-left">
              <div className="font-semibold mb-2">🔧 Setup Required</div>
              <div className="text-sm space-y-1">
                <p>Azure Speech Service credentials are missing.</p>
                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
                  Missing: {!speechKey ? 'SPEECH_KEY ' : ''}{!speechRegion ? 'SPEECH_REGION' : ''}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  📖 See <strong>docs/AZURE_SETUP_GUIDE.md</strong> for step-by-step setup
                </p>
              </div>
            </div>, 
            { 
              duration: 8000,
              style: { maxWidth: '400px' }
            }
          );
          
          throw new Error(errorMsg);
        }

        // Create speech-to-video service instance

        // Create a video element for the avatar
        const videoElement = document.createElement('video');
        videoElement.className = 'speech-to-video-avatar';
        videoElement.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          height: 225px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          z-index: 1000;
          background: #000;
        `;
        document.body.appendChild(videoElement);

        // Initialize speech-to-video service with corporate integration
        const speechToVideoService = new SpeechToVideoService({
          speechKey,
          speechRegion,
          avatarCharacter: 'lisa',
          avatarStyle: 'casual-sitting',
          voice: 'en-US-JennyNeural',
          corporateApiUrl: '/api/corporate'
        });

        // Set up event listeners
        speechToVideoService.addEventListener('ready', () => {
          setIsSpeechToVideoActive(true);
          setIsVideoConnecting(false);
          setVideoConnectionStatus('Ready - Start speaking!');
          setAvatarError(null);
          toast.success("🎬 Speech-to-video conversation started! Start speaking now.");
          
          // Start listening immediately
          speechToVideoService.startListening();
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        speechToVideoService.addEventListener('stateChange', (event: any) => {
          const state = event.detail;
          setVideoConnectionStatus(state.connectionStatus);
          setAvatarSpeaking(state.isSpeaking);
          
          if (state.transcript) {
            // Show the user's speech as input
            handleInputChange({ target: { value: state.transcript } });
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        speechToVideoService.addEventListener('error', (event: any) => {
          const error = event.detail;
          console.error('Speech-to-video error:', error);
          setAvatarError(error);
          setVideoConnectionStatus('Error');
          setIsVideoConnecting(false);
          toast.error(`Speech-to-video error: ${error}`);
        });

        speechToVideoService.addEventListener('disconnected', () => {
          setIsSpeechToVideoActive(false);
          setIsVideoConnecting(false);
          setVideoConnectionStatus('Disconnected');
          setAvatarSpeaking(false);
          setAvatarError(null);
          
          // Remove video element
          const existingVideo = document.querySelector('.speech-to-video-avatar');
          if (existingVideo) {
            existingVideo.remove();
          }
        });

        // Initialize the service
        await speechToVideoService.initialize(videoElement);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        azureAvatarRef.current = speechToVideoService as any;
        
      } catch (error) {
        console.error('Error starting speech-to-video mode:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error starting speech-to-video: ${errorMessage}`);
        setIsVideoConnecting(false);
        setVideoConnectionStatus('');
      }
    }
  }, [isSpeechToVideoActive, handleInputChange]);



  // Get current speech-to-video state
  const getSpeechToVideoState = useCallback(() => {
    return {
      isActive: isSpeechToVideoActive,
      isConnecting: isVideoConnecting,
      connectionStatus: videoConnectionStatus,
      isSpeaking: avatarSpeaking,
      error: avatarError,
      isReady: azureAvatarRef.current?.isReady() || false
    };
  }, [isSpeechToVideoActive, isVideoConnecting, videoConnectionStatus, avatarSpeaking, avatarError]);

  // Notify parent of speech-to-video state changes
  useEffect(() => {
    if (onSpeechToVideoStateChange) {
      onSpeechToVideoStateChange(getSpeechToVideoState());
    }
  }, [onSpeechToVideoStateChange, getSpeechToVideoState]);

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
      if (realtimeRef.current) {
        realtimeRef.current.disconnect();
      }
      if (azureAvatarRef.current) {
        azureAvatarRef.current.disconnect();
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
        {/* Voice Mode Button (Radio Icon for Speech-to-Speech) */}
        <div className="relative">
          <Button
            variant={isVoiceModeActive ? "default" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${isVoiceModeActive ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            onClick={toggleVoiceMode}
            disabled={isLoading || isRecording || isTranscribing || isConnecting}
            title={isVoiceModeActive ? "Stop speech-to-speech mode" : "Start speech-to-speech mode"}
          >
            {isVoiceModeActive ? (
              <Radio className="h-5 w-5 text-white animate-pulse" />
            ) : isConnecting ? (
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Radio className="h-5 w-5" />
            )}
          </Button>
          {isVoiceModeActive && connectionStatus === 'Connected' && (
            <MiniVoiceIndicator
              isSpeaking={isSpeaking}
              volume={volume}
              className="absolute -top-1 -right-1"
            />
          )}
        </div>

        {/* Speech-to-Video Button (AI Avatar Conversation) */}
        <div className="relative">
          <Button
            variant={isSpeechToVideoActive ? "default" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${isSpeechToVideoActive ? 'bg-purple-500 hover:bg-purple-600 shadow-lg' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
            onClick={toggleSpeechToVideo}
            disabled={isLoading || isRecording || isTranscribing || isVideoConnecting || isVoiceModeActive}
            title={isSpeechToVideoActive ? "Stop AI avatar conversation" : "Start AI avatar conversation"}
          >
            {isSpeechToVideoActive ? (
              <Video className="h-5 w-5 text-white animate-pulse" />
            ) : isVideoConnecting ? (
              <div className="h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            )}
          </Button>
          {isSpeechToVideoActive && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Microphone Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isRecording ? 'animate-pulse bg-red-100 dark:bg-red-900' : ''}`}
          onClick={handleMicClick}
          disabled={!canRecord || isVoiceModeActive}
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
            disabled={!input.trim() || isRecording || isTranscribing || isVoiceModeActive}
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

      {/* Voice Mode Status Indicators */}
      {isVoiceModeActive && (
        <div className="absolute -top-12 left-0 right-0 text-center">
          <div className="inline-flex flex-col items-center gap-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
              Voice Mode {connectionStatus || 'Connecting...'}
            </div>
            {connectionStatus === 'Connected' && (
              <VoiceActivityIndicator
                isActive={true}
                isSpeaking={isSpeaking}
                volume={volume}
                noiseFloor={noiseFloor}
                className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm"
              />
            )}
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

      {/* Speech-to-Video Status Indicator */}
      {(isSpeechToVideoActive || isVideoConnecting) && (
        <div className="absolute -top-16 left-0 right-0 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm shadow-md ${
            avatarError 
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              : avatarSpeaking
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : isVideoConnecting
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
          }`}>
            <Video className="w-3 h-3" />
            <div className={`w-2 h-2 rounded-full ${
              avatarError
                ? 'bg-red-500'
                : avatarSpeaking 
                  ? 'bg-green-500 animate-pulse'
                  : isVideoConnecting
                    ? 'bg-blue-500 animate-spin'
                    : 'bg-purple-500 animate-pulse'
            }`}></div>
            {avatarError 
              ? 'Avatar Error'
              : avatarSpeaking 
                ? 'AI Avatar Speaking...'
                : isVideoConnecting
                  ? 'Connecting Avatar...'
                  : `AI Avatar ${videoConnectionStatus || 'Ready'}`
            }
          </div>
        </div>
      )}
    </div>
  );
}
