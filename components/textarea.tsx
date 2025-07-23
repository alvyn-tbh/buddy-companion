import { Button } from "./ui/button";
import { Textarea as TextareaComponent } from "./ui/textarea";
import { SendHorizontal, StopCircle, Mic, MicOff, Radio, Video, VideoOff } from "lucide-react";
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
  const [conversationTurn, setConversationTurn] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeRef = useRef<RealtimeWebRTC | null>(null);
  const speechToVideoServiceRef = useRef<SpeechToVideoService | null>(null);
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
      
      // Cleanup speech-to-video service
      if (speechToVideoServiceRef.current) {
        speechToVideoServiceRef.current.disconnect();
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
      console.log('🛑 [Textarea] Stopping speech-to-video mode...');
      
      if (speechToVideoServiceRef.current) {
        await speechToVideoServiceRef.current.disconnect();
        speechToVideoServiceRef.current = null;
      }
      
      setIsSpeechToVideoActive(false);
      setIsVideoConnecting(false);
      setVideoConnectionStatus('');
      setAvatarSpeaking(false);
      setAvatarError(null);
      setConversationTurn(0);
      
      // Remove video element
      const existingVideo = document.querySelector('.speech-to-video-avatar');
      if (existingVideo) {
        existingVideo.remove();
      }
      
      toast.info("Speech-to-video conversation stopped");
    } else {
      // Start speech-to-video mode with corporate integration
      try {
        console.log('🎬 [Textarea] Starting speech-to-video mode...');
        setIsVideoConnecting(true);
        setVideoConnectionStatus('Initializing...');
        setAvatarError(null);
        
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

        // Create a video element for the avatar
        const videoElement = document.createElement('video');
        videoElement.className = 'speech-to-video-avatar';
        videoElement.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          width: 320px;
          height: 240px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          z-index: 1000;
          background: #000;
          border: 2px solid #e2e8f0;
        `;
        document.body.appendChild(videoElement);

        // Initialize speech-to-video service with enhanced configuration
        const speechToVideoService = new SpeechToVideoService({
          speechKey,
          speechRegion,
          avatarCharacter: 'lisa',
          avatarStyle: 'casual-sitting',
          voice: 'en-US-JennyNeural',
          corporateApiUrl: '/api/corporate',
          enableVAD: true,
          silenceTimeout: 4000, // 4 seconds silence timeout
          autoRestart: true
        });

        // Set up comprehensive event listeners
        speechToVideoService.addEventListener('ready', () => {
          console.log('✅ [Textarea] Speech-to-video service ready');
          setIsSpeechToVideoActive(true);
          setIsVideoConnecting(false);
          setVideoConnectionStatus('Ready - Start speaking!');
          setAvatarError(null);
          setConversationTurn(0);
          toast.success("🎬 Speech-to-video conversation started! Start speaking now.");
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        speechToVideoService.addEventListener('stateChange', (event: any) => {
          const state = event.detail;
          console.log('🔄 [Textarea] Speech-to-video state changed:', state);
          
          setVideoConnectionStatus(state.connectionStatus);
          setAvatarSpeaking(state.isSpeaking);
          setConversationTurn(state.conversationTurn);
          
          if (state.transcript && state.transcript.trim()) {
            // Show the user's speech as input
            handleInputChange({ target: { value: state.transcript } });
          }
          
          // Notify parent component
          if (onSpeechToVideoStateChange) {
            onSpeechToVideoStateChange({
              isActive: state.isActive,
              isConnecting: state.isConnecting,
              connectionStatus: state.connectionStatus,
              isSpeaking: state.isSpeaking,
              error: state.error,
              isReady: state.isActive && !state.isConnecting && !state.error
            });
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        speechToVideoService.addEventListener('error', (event: any) => {
          const error = event.detail;
          console.error('❌ [Textarea] Speech-to-video error:', error);
          setAvatarError(error);
          setVideoConnectionStatus('Error');
          setIsVideoConnecting(false);
          
          // Show user-friendly error message
          if (error.includes('Microphone access denied')) {
            toast.error('🎤 Microphone access required for speech-to-video. Please allow microphone access and try again.');
          } else if (error.includes('Speech recognition not supported')) {
            toast.error('🎤 Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
          } else if (error.includes('Azure')) {
            toast.error('☁️ Azure Speech Service error. Please check your configuration.');
          } else {
            toast.error(`Speech-to-video error: ${error}`);
          }
        });

        speechToVideoService.addEventListener('disconnected', () => {
          console.log('🔌 [Textarea] Speech-to-video service disconnected');
          setIsSpeechToVideoActive(false);
          setIsVideoConnecting(false);
          setVideoConnectionStatus('Disconnected');
          setAvatarSpeaking(false);
          setAvatarError(null);
          setConversationTurn(0);
          
          // Remove video element
          const existingVideo = document.querySelector('.speech-to-video-avatar');
          if (existingVideo) {
            existingVideo.remove();
          }
        });

        // Initialize the service
        console.log('🚀 [Textarea] Initializing speech-to-video service...');
        await speechToVideoService.initialize(videoElement);
        speechToVideoServiceRef.current = speechToVideoService;
        
      } catch (error) {
        console.error('❌ [Textarea] Error starting speech-to-video mode:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setIsVideoConnecting(false);
        setVideoConnectionStatus('');
        setAvatarError(errorMessage);
        
        // Remove video element on error
        const existingVideo = document.querySelector('.speech-to-video-avatar');
        if (existingVideo) {
          existingVideo.remove();
        }
      }
    }
  }, [isSpeechToVideoActive, handleInputChange, onSpeechToVideoStateChange]);

  // Get current speech-to-video state
  const getSpeechToVideoState = useCallback(() => {
    const service = speechToVideoServiceRef.current;
    if (service && service.isReady()) {
      const state = service.getState();
      return {
        isActive: state.isActive,
        isConnecting: state.isConnecting,
        connectionStatus: state.connectionStatus,
        isSpeaking: state.isSpeaking,
        error: state.error,
        isReady: state.isActive && !state.isConnecting && !state.error
      };
    }
    
    return {
      isActive: isSpeechToVideoActive,
      isConnecting: isVideoConnecting,
      connectionStatus: videoConnectionStatus,
      isSpeaking: avatarSpeaking,
      error: avatarError,
      isReady: isSpeechToVideoActive && !isVideoConnecting && !avatarError
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
        
        if (audioBlob.size === 0) {
          throw new Error('No audio recorded');
        }

        // Transcribe the audio
        const transcribedText = await transcribeAudioWithOpenAI(audioBlob);
        
        if (transcribedText.trim()) {
          // Update the input with transcribed text
          handleInputChange({ target: { value: transcribedText } });
          toast.success('Speech transcribed successfully!');
        } else {
          throw new Error('No speech detected in recording');
        }
        
      } catch (error) {
        console.error('Error processing audio:', error);
        toast.error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsTranscribing(false);
        cleanupAudioResources();
      }
    } else {
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
        
        mediaRecorder.onstop = () => {
          console.log('Recording stopped');
        };
        
        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          toast.error('Recording error occurred');
          cleanupAudioResources();
        };
        
        // Start recording
        mediaRecorder.start(1000); // Collect data every second
        setIsRecording(true);
        setRecordingStartTime(Date.now());
        toast.success('Recording started - Speak now!');
        
        // Set maximum recording time
        const maxRecordingTimer = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            toast.info('Maximum recording time reached');
          }
        }, maxRecordingTime);
        
        // Set silence detection timer
        const silenceTimer = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            toast.info('Recording stopped due to silence');
          }
        }, silenceThreshold);
        
        silenceTimerRef.current = silenceTimer;
        
        // Clear timers when recording stops
        const originalStop = mediaRecorder.stop.bind(mediaRecorder);
        mediaRecorder.stop = () => {
          clearTimeout(maxRecordingTimer);
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          originalStop();
        };
        
      } catch (error) {
        console.error('Error starting recording:', error);
        toast.error('Failed to start recording. Please check microphone permissions.');
        cleanupAudioResources();
      }
    }
  }, [isRecording, handleInputChange, transcribeAudioWithOpenAI, cleanupAudioResources]);

  // Get recording duration
  const getRecordingDuration = useCallback(() => {
    if (!recordingStartTime || !isRecording) return 0;
    return Math.floor((Date.now() - recordingStartTime) / 1000);
  }, [recordingStartTime, isRecording]);

  // Format duration for display
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Update recording duration display
  const [recordingDuration, setRecordingDuration] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(getRecordingDuration());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, getRecordingDuration]);

  const isActiveInput = input.trim().length > 0;
  const canSubmit = isActiveInput && !isLoading && !isTranscribing;

  const shouldShowVoiceButton = !isSpeechToVideoActive; // Hide voice button when speech-to-video is active
  const shouldShowVideoButton = !isVoiceModeActive; // Hide video button when voice mode is active

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
    >
      {/* Voice Mode Button */}
      {shouldShowVoiceButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleVoiceMode}
          disabled={isConnecting || isVideoConnecting}
          className={`
            shrink-0 transition-all duration-200 
            ${isVoiceModeActive 
              ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          title={isVoiceModeActive ? "Stop voice mode" : "Start voice mode"}
        >
          {isConnecting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <Radio className={`h-4 w-4 ${isVoiceModeActive ? 'animate-pulse' : ''}`} />
          )}
        </Button>
      )}

      {/* Speech-to-Video Mode Button */}
      {shouldShowVideoButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleSpeechToVideo}
          disabled={isVideoConnecting || isConnecting}
          className={`
            shrink-0 transition-all duration-200 
            ${isSpeechToVideoActive 
              ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          title={isSpeechToVideoActive ? "Stop speech-to-video" : "Start speech-to-video conversation"}
        >
          {isVideoConnecting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : isSpeechToVideoActive ? (
            <VideoOff className="h-4 w-4" />
          ) : (
            <Video className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Voice Activity Status */}
      {(isVoiceModeActive || isSpeechToVideoActive) && (
        <div className="shrink-0">
          {isVoiceModeActive ? (
            <VoiceActivityIndicator 
              isActive={isVoiceModeActive}
              isSpeaking={isSpeaking}
              volume={volume}
            />
          ) : (
            <MiniVoiceIndicator 
              isActive={isSpeechToVideoActive}
              isSpeaking={avatarSpeaking}
              status={videoConnectionStatus}
              conversationTurn={conversationTurn}
            />
          )}
        </div>
      )}

      {/* Main Textarea Container */}
      <div className="flex-1 relative">
        <TextareaComponent
          value={input}
          onChange={handleInputChange}
          placeholder={
            isVoiceModeActive 
              ? "Voice mode active - speak to interact..." 
              : isSpeechToVideoActive
              ? "Speech-to-video active - speak to the avatar..."
              : "Type your message here..."
          }
          disabled={isLoading || isTranscribing || isVoiceModeActive || (isSpeechToVideoActive && avatarSpeaking)}
          className="min-h-[60px] max-h-[200px] resize-none pr-24 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
          rows={3}
        />

        {/* Recording/Voice Controls */}
        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          {/* Recording Duration */}
          {isRecording && (
            <div className="text-xs text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
              🔴 {formatDuration(recordingDuration)}
            </div>
          )}

          {/* Transcribing Indicator */}
          {isTranscribing && (
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
              Processing...
            </div>
          )}

          {/* Mic Button (only show when not in special modes) */}
          {!isVoiceModeActive && !isSpeechToVideoActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMicClick}
              disabled={isLoading || isTranscribing}
              className={`
                h-8 w-8 p-0 transition-all duration-200 
                ${isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isTranscribing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Submit/Stop Button */}
          <Button
            type={isLoading ? "button" : "submit"}
            onClick={isLoading ? stop : undefined}
            disabled={!canSubmit && !isLoading}
            size="sm"
            className="h-8 w-8 p-0 transition-all duration-200"
            title={isLoading ? "Stop generation" : "Send message"}
          >
            {isLoading ? (
              <StopCircle className="h-4 w-4" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {(connectionStatus || videoConnectionStatus) && (
        <div className="absolute -top-8 left-4 right-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            {isVoiceModeActive ? connectionStatus : videoConnectionStatus}
            {isSpeechToVideoActive && conversationTurn > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                Turn #{conversationTurn}
              </span>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
