'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
  AlertCircle,
  Mic,
  MicOff,
  Video,
  VideoOff
} from 'lucide-react';

interface AvatarVideoPlayerProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  audioRef?: React.RefObject<HTMLAudioElement>;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlayPause?: (isPlaying: boolean) => void;
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  enableMicrophone?: boolean;
  onMicrophoneToggle?: (enabled: boolean) => void;
}

export function AvatarVideoPlayer({
  videoRef: externalVideoRef,
  audioRef,
  onTimeUpdate,
  onPlayPause,
  className,
  showControls = true,
  autoPlay = false,
  enableMicrophone = false,
  onMicrophoneToggle
}: AvatarVideoPlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoElement = externalVideoRef || internalVideoRef;
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Hide overlay after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      setShowOverlay(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowOverlay(false), 3000);
    };

    if (isPlaying) {
      resetTimeout();
    } else {
      setShowOverlay(true);
    }

    return () => clearTimeout(timeout);
  }, [isPlaying]);

  // Sync audio and video
  useEffect(() => {
    if (!videoElement.current || !audioRef?.current) return;

    const video = videoElement.current;
    const audio = audioRef.current;

    const syncAudioVideo = () => {
      if (Math.abs(video.currentTime - audio.currentTime) > 0.1) {
        audio.currentTime = video.currentTime;
      }
    };

    video.addEventListener('timeupdate', syncAudioVideo);
    return () => video.removeEventListener('timeupdate', syncAudioVideo);
  }, [videoElement, audioRef]);

  const handlePlayPause = useCallback(() => {
    if (!videoElement.current) return;

    const video = videoElement.current;
    const audio = audioRef?.current;

    if (video.paused) {
      video.play();
      audio?.play();
      setIsPlaying(true);
    } else {
      video.pause();
      audio?.pause();
      setIsPlaying(false);
    }

    onPlayPause?.(video.paused);
  }, [videoElement, audioRef, onPlayPause]);

  const handleSeek = useCallback((value: number[]) => {
    if (!videoElement.current) return;

    const video = videoElement.current;
    const audio = audioRef?.current;
    const newTime = value[0];

    video.currentTime = newTime;
    if (audio) audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [videoElement, audioRef]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (videoElement.current) {
      videoElement.current.volume = newVolume;
    }
    if (audioRef?.current) {
      audioRef.current.volume = newVolume;
    }
  }, [videoElement, audioRef]);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (videoElement.current) {
      videoElement.current.muted = newMuted;
    }
    if (audioRef?.current) {
      audioRef.current.muted = newMuted;
    }
  }, [isMuted, videoElement, audioRef]);

  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const handleMicrophoneToggle = useCallback(() => {
    const newEnabled = !isMicEnabled;
    setIsMicEnabled(newEnabled);
    onMicrophoneToggle?.(newEnabled);
  }, [isMicEnabled, onMicrophoneToggle]);

  const handleVideoToggle = useCallback(() => {
    setIsVideoEnabled(!isVideoEnabled);
  }, [isVideoEnabled]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  useEffect(() => {
    const video = videoElement.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load video');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    if (autoPlay) {
      video.play().catch(() => {
        // Autoplay might be blocked
        setIsPlaying(false);
      });
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoElement, onTimeUpdate, autoPlay]);

  return (
    <Card className={cn('relative overflow-hidden', className)} ref={containerRef}>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoElement}
          className={cn(
            'w-full h-full object-cover',
            !isVideoEnabled && 'opacity-0'
          )}
          playsInline
          autoPlay={autoPlay}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="text-white text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300',
              showOverlay ? 'opacity-100' : 'opacity-0'
            )}
            onMouseMove={() => setShowOverlay(true)}
          >
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                <div className={cn(
                  'w-2 h-2 rounded-full mr-2',
                  isPlaying ? 'bg-green-500' : 'bg-red-500'
                )} />
                {isPlaying ? 'Live' : 'Paused'}
              </Badge>

              <div className="flex items-center gap-2">
                {enableMicrophone && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleMicrophoneToggle}
                    className="text-white hover:bg-white/20"
                  >
                    {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleVideoToggle}
                  className="text-white hover:bg-white/20"
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Center Play Button */}
            {!isPlaying && showOverlay && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handlePlayPause}
                  className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <Play className="w-8 h-8 ml-1" />
                </Button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSeek([Math.max(0, currentTime - 10)])}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSeek([Math.min(duration, currentTime + 10)])}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <span className="text-white text-sm ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Volume Controls */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleMuteToggle}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>

                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />

                  {/* Fullscreen */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio Element (hidden) */}
      {audioRef && (
        <audio
          ref={audioRef}
          className="hidden"
          autoPlay={autoPlay}
        />
      )}
    </Card>
  );
}