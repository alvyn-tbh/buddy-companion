'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AzureAvatarService, AvatarState, AVATAR_EMOTIONS } from '@/lib/azure-avatar-service';
import { AvatarVideoPlayer } from './avatar-video-player';
import { cn } from '@/lib/utils';
import {
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  Activity,
  Zap,
  Heart,
  Frown,
  Angry,
  Smile
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from './ui/label';

// Simple WebRTC availability test (compatibility handled by dedicated utility)
function checkWebRTCSupport(): { supported: boolean; error?: string } {
  if (typeof RTCPeerConnection === 'undefined') {
    return { supported: false, error: 'RTCPeerConnection is not supported' };
  }

  try {
    const testConnection = new RTCPeerConnection();
    testConnection.close();
    return { supported: true };
  } catch (error) {
    console.error('❌ WebRTC support test failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { supported: false, error: `WebRTC test failed: ${errorMessage}` };
  }
}

interface AvatarStreamProps {
  avatarService: AzureAvatarService;
  onStreamReady?: (stream: MediaStream) => void;
  onStreamError?: (error: Error) => void;
  enableEmotions?: boolean;
  className?: string;
}

interface StreamMetrics {
  fps: number;
  bitrate: number;
  latency: number;
  quality: 'HD' | 'SD' | 'Low';
}

const EMOTION_ICONS = {
  neutral: Activity,
  happy: Smile,
  sad: Frown,
  angry: Angry,
  surprised: Zap,
  thoughtful: Heart
};

export function AvatarStream({
  avatarService,
  onStreamReady,
  onStreamError,
  enableEmotions = true,
  className
}: AvatarStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [avatarState, setAvatarState] = useState<AvatarState>(avatarService.getState());
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamMetrics, setStreamMetrics] = useState<StreamMetrics>({
    fps: 0,
    bitrate: 0,
    latency: 0,
    quality: 'HD'
  });
  const [currentEmotion, setCurrentEmotion] = useState<keyof typeof AVATAR_EMOTIONS>('neutral');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  const [webRTCSupport, setWebRTCSupport] = useState<{ supported: boolean; error?: string }>({ supported: true });

  // Monitor avatar state changes
  useEffect(() => {
    // Check for WebRTC support on mount
    const support = checkWebRTCSupport();
    setWebRTCSupport(support);
    if (!support.supported) {
      toast.error(`WebRTC Error: ${support.error}`);
    }
  
    const handleStateChange = (state: AvatarState) => {
      setAvatarState(state);
      setCurrentEmotion(state.currentEmotion);
    };

    avatarService.on('state-changed', handleStateChange);
    return () => {
      avatarService.removeListener('state-changed', handleStateChange);
    };
  }, [avatarService]);

  // Start streaming
  const startStream = useCallback(async () => {
    if (!videoRef.current || isStreaming) return;

    try {
      setIsStreaming(true);

      // Initialize avatar if not already done
      if (!avatarState.isInitialized) {
        await avatarService.initialize(videoRef.current);
      }

      // Connect avatar
      if (!avatarState.isConnected) {
        await avatarService.connect();
      }

      // Get media stream (for real-time streaming)
      if ('captureStream' in videoRef.current) {
        const stream = (videoRef.current as HTMLVideoElement & {
          captureStream: (fps: number) => MediaStream;
        }).captureStream(30); // 30 FPS
        streamRef.current = stream;
        onStreamReady?.(stream);

        // Start monitoring stream metrics
        startMetricsMonitoring();
      }

      toast.success('Avatar stream started successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start stream');
      console.error('Stream error:', err);
      setIsStreaming(false);
      onStreamError?.(err);
      toast.error(`Failed to start stream: ${err.message}`);
    }
  }, [avatarService, avatarState, isStreaming, onStreamReady, onStreamError]);

  // Stop streaming
  const stopStream = useCallback(async () => {
    try {
      setIsStreaming(false);

      // Stop metrics monitoring
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = null;
      }

      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Disconnect avatar
      await avatarService.disconnect();

      toast.info('Avatar stream stopped');
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  }, [avatarService]);

  // Monitor stream metrics
  const startMetricsMonitoring = () => {
    metricsIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !streamRef.current) return;

      // Calculate FPS (simulated for demo)
      const fps = Math.round(25 + Math.random() * 5);

      // Calculate bitrate (simulated for demo)
      const bitrate = Math.round((Math.random() * 2000 + 3000) * 1024); // 3-5 Mbps

      // Calculate latency (simulated for demo)
      const latency = Math.round(20 + Math.random() * 30);

      // Determine quality based on metrics
      let quality: 'HD' | 'SD' | 'Low' = 'HD';
      if (bitrate < 2000 * 1024) quality = 'SD';
      if (bitrate < 1000 * 1024) quality = 'Low';

      // Determine connection quality
      let connQuality: 'excellent' | 'good' | 'poor' = 'excellent';
      if (latency > 50 || fps < 20) connQuality = 'good';
      if (latency > 100 || fps < 15) connQuality = 'poor';

      setStreamMetrics({ fps, bitrate, latency, quality });
      setConnectionQuality(connQuality);
    }, 1000);
  };

  // Handle emotion changes
  const handleEmotionChange = async (emotion: keyof typeof AVATAR_EMOTIONS) => {
    if (!enableEmotions || !avatarState.isConnected) return;

    try {
      await avatarService.speak({
        text: getEmotionText(emotion),
        emotion
      });
      setCurrentEmotion(emotion);
    } catch (error) {
      console.error('Error changing emotion:', error);
      toast.error('Failed to change emotion');
    }
  };

  const getEmotionText = (emotion: keyof typeof AVATAR_EMOTIONS): string => {
    const emotionTexts = {
      neutral: "I'm ready to assist you.",
      happy: "I'm delighted to help you today!",
      sad: "I understand this might be challenging.",
      angry: "I can see this is frustrating.",
      surprised: "Oh, that's interesting!",
      thoughtful: "Let me think about that for a moment."
    };
    return emotionTexts[emotion];
  };

  const formatBitrate = (bitrate: number): string => {
    if (bitrate > 1024 * 1024) {
      return `${(bitrate / (1024 * 1024)).toFixed(1)} Mbps`;
    }
    return `${(bitrate / 1024).toFixed(0)} Kbps`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  if (!webRTCSupport.supported) {
    return (
      <Card className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>WebRTC Not Supported:</strong> {webRTCSupport.error}
            <p className="mt-2 text-xs">Please try a different browser or check your browser settings.</p>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Video Player */}
      <AvatarVideoPlayer
        videoRef={videoRef}
        audioRef={audioRef}
        showControls={false}
        autoPlay={true}
        enableMicrophone={true}
      />

      {/* Stream Controls and Status */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Stream Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isStreaming ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <div className="font-medium">Stream Status</div>
                <div className="text-sm text-gray-500">
                  {isStreaming ? 'Live streaming' : 'Not streaming'}
                </div>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn(
                connectionQuality === 'excellent' && 'bg-green-50 text-green-700 border-green-300',
                connectionQuality === 'good' && 'bg-yellow-50 text-yellow-700 border-yellow-300',
                connectionQuality === 'poor' && 'bg-red-50 text-red-700 border-red-300'
              )}
            >
              {connectionQuality} connection
            </Badge>
          </div>

          {/* Stream Metrics */}
          {isStreaming && (
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold">{streamMetrics.fps}</div>
                <div className="text-xs text-gray-500">FPS</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold">{formatBitrate(streamMetrics.bitrate)}</div>
                <div className="text-xs text-gray-500">Bitrate</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold">{streamMetrics.latency}ms</div>
                <div className="text-xs text-gray-500">Latency</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold">{streamMetrics.quality}</div>
                <div className="text-xs text-gray-500">Quality</div>
              </div>
            </div>
          )}

          {/* Emotion Controls */}
          {enableEmotions && avatarState.isConnected && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Avatar Emotion</Label>
              <div className="flex items-center gap-2">
                {Object.entries(AVATAR_EMOTIONS).map(([emotion]) => {
                  const Icon = EMOTION_ICONS[emotion as keyof typeof AVATAR_EMOTIONS];
                  return (
                    <Button
                      key={emotion}
                      size="sm"
                      variant={currentEmotion === emotion ? 'default' : 'outline'}
                      onClick={() => handleEmotionChange(emotion as keyof typeof AVATAR_EMOTIONS)}
                      disabled={avatarState.isSpeaking}
                      className="flex-1"
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {emotion}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stream Controls */}
          <div className="flex gap-2">
            {!isStreaming ? (
              <Button
                onClick={startStream}
                disabled={avatarState.isConnecting}
                className="flex-1"
              >
                {avatarState.isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4 mr-2" />
                )}
                Start Streaming
              </Button>
            ) : (
              <Button
                onClick={stopStream}
                variant="destructive"
                className="flex-1"
              >
                <WifiOff className="w-4 h-4 mr-2" />
                Stop Streaming
              </Button>
            )}
          </div>

          {/* Error Display */}
          {avatarState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{avatarState.error.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}