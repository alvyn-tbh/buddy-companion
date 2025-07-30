'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HeyGenAvatarService, getAvatarInstance } from '@/lib/heygen-avatar-service';
import { SpeechRecognitionService } from '@/lib/speech-recognition-service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface HeyGenAvatarChatProps {
  className?: string;
  onTranscript?: (transcript: string) => void;
  onResponse?: (response: string) => void;
}

export function HeyGenAvatarChat({ className, onTranscript, onResponse }: HeyGenAvatarChatProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarServiceRef = useRef<HeyGenAvatarService | null>(null);
  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Initialize avatar service
  const initializeAvatar = useCallback(async () => {
    if (isInitializing || isReady) return;

    setIsInitializing(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
      if (!apiKey) {
        throw new Error('HeyGen API key not configured');
      }

      // Get or create avatar instance
      avatarServiceRef.current = getAvatarInstance({
        apiKey,
        avatarId: 'josh_lite3_20230714', // Default avatar
        voiceId: '2d5b0e6cf36f460aa7fc47e3eee4ba54', // Default voice
      });

      // Set up event handlers
      avatarServiceRef.current.onStreamReady = (stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      };

      avatarServiceRef.current.onConnected = () => {
        setIsReady(true);
        toast.success('Avatar connected successfully');
      };

      avatarServiceRef.current.onError = (error) => {
        console.error('Avatar error:', error);
        toast.error(`Avatar error: ${error.message}`);
      };

      // Initialize the avatar session
      await avatarServiceRef.current.initialize();

    } catch (error) {
      console.error('Failed to initialize avatar:', error);
      toast.error('Failed to initialize avatar');
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, isReady]);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (speechServiceRef.current) return;

    speechServiceRef.current = new SpeechRecognitionService({
      language: 'en-US',
      continuous: true,
      interimResults: true,
    });

    // Set up event handlers
    speechServiceRef.current.onResult = (result) => {
      setCurrentTranscript(result.transcript);
      if (!result.isFinal) {
        onTranscript?.(result.transcript);
      }
    };

    speechServiceRef.current.onFinalResult = async (transcript) => {
      console.log('Final transcript:', transcript);
      onTranscript?.(transcript);
      
      // Process with GPT and avatar
      if (avatarServiceRef.current && isReady) {
        setIsProcessing(true);
        try {
          await avatarServiceRef.current.speak(transcript, true); // Use GPT
          onResponse?.('Processing...');
        } catch (error) {
          console.error('Error processing speech:', error);
          toast.error('Failed to process speech');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    speechServiceRef.current.onError = (error) => {
      console.error('Speech recognition error:', error);
      if (error !== 'no-speech') {
        toast.error(`Speech error: ${error}`);
      }
    };

    speechServiceRef.current.onSpeechStart = () => {
      console.log('Speech started');
    };

    speechServiceRef.current.onSpeechEnd = () => {
      console.log('Speech ended');
      setCurrentTranscript('');
    };
  }, [isReady, onTranscript, onResponse]);

  // Toggle listening
  const toggleListening = useCallback(async () => {
    if (!speechServiceRef.current) {
      initializeSpeechRecognition();
    }

    try {
      if (isListening) {
        speechServiceRef.current?.stop();
        setIsListening(false);
        setAudioLevel(0);
      } else {
        await speechServiceRef.current?.start();
        setIsListening(true);
        
        // Start audio level monitoring
        const monitorAudioLevel = () => {
          if (speechServiceRef.current?.getIsListening()) {
            const level = speechServiceRef.current.getAudioLevel();
            setAudioLevel(level);
            requestAnimationFrame(monitorAudioLevel);
          }
        };
        monitorAudioLevel();
      }
    } catch (error) {
      console.error('Error toggling speech recognition:', error);
      toast.error('Failed to access microphone');
    }
  }, [isListening, initializeSpeechRecognition]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (videoRef.current) {
      if (isVideoEnabled) {
        videoRef.current.style.display = 'none';
      } else {
        videoRef.current.style.display = 'block';
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [isVideoEnabled]);

  // Initialize on mount
  useEffect(() => {
    initializeAvatar();
    initializeSpeechRecognition();

    return () => {
      // Cleanup
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
    };
  }, [initializeAvatar, initializeSpeechRecognition]);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="relative aspect-video bg-gray-900">
        {/* Video element for avatar stream */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isMuted}
        />

        {/* Loading overlay */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <p>Initializing avatar...</p>
            </div>
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Listening indicator */}
              {isListening && (
                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm">Listening...</span>
                  <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-100"
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Current transcript */}
              {currentTranscript && (
                <div className="bg-black/50 px-3 py-1 rounded-full">
                  <span className="text-white text-sm">{currentTranscript}</span>
                </div>
              )}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                  <span className="text-white text-sm">Processing...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Microphone toggle */}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleListening}
                disabled={!isReady || isProcessing}
                className={`text-white hover:bg-white/20 ${isListening ? 'bg-red-500/30' : ''}`}
              >
                {isListening ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>

              {/* Audio toggle */}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              {/* Video toggle */}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleVideo}
                className="text-white hover:bg-white/20"
              >
                {isVideoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="p-2 bg-gray-800 text-white text-sm">
        <div className="flex items-center justify-between">
          <span>Status: {isReady ? 'Connected' : isInitializing ? 'Connecting...' : 'Disconnected'}</span>
          <span className="text-xs text-gray-400">Powered by HeyGen</span>
        </div>
      </div>
    </Card>
  );
}