"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Play, Pause, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AudioPlayerProps {
  text: string;
  isEnabled: boolean;
  className?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  ttsModel?: 'tts-1' | 'tts-1-hd';
}

export function AudioPlayer({ 
  text, 
  isEnabled, 
  className = "", 
  voice = 'alloy',
  ttsModel = 'tts-1'
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);

  const speak = useCallback(async (text: string) => {
    if (!isEnabled || !text.trim() || isProcessingRef.current) {
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsLoading(true);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Call OpenAI TTS API directly from client
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          model: ttsModel,
          speed: 1.0,
          format: 'mp3'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS failed');
      }

      // Get the audio data as a blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element and play
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadstart = () => {
        setIsLoading(true);
      };

      audio.oncanplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onpause = () => {
        setIsPlaying(false);
        setIsLoading(false);
        isProcessingRef.current = false;
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsLoading(false);
        isProcessingRef.current = false;
        audioRef.current = null;
        // Clean up the blob URL
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (event) => {
        console.error('Audio playback error:', event);
        setIsPlaying(false);
        setIsLoading(false);
        isProcessingRef.current = false;
        audioRef.current = null;
        // Clean up the blob URL
        URL.revokeObjectURL(audioUrl);
        toast.error("Error playing audio. Please try again.");
      };

      await audio.play();

    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      setIsLoading(false);
      isProcessingRef.current = false;
      audioRef.current = null;
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('API key is not configured')) {
          toast.error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
        } else if (error.message.includes('authentication failed')) {
          toast.error("OpenAI API authentication failed. Please check your API key.");
        } else if (error.message.includes('rate limit exceeded')) {
          toast.error("OpenAI API rate limit exceeded. Please try again later.");
        } else if (error.message.includes('quota exceeded')) {
          toast.error("OpenAI API quota exceeded. Please check your account usage.");
        } else {
          toast.error(`Error playing audio: ${error.message}`);
        }
      } else {
        toast.error("Error playing audio. Please try again.");
      }
    }
  }, [isEnabled, voice, ttsModel]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    isProcessingRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Stop playing if audio is disabled
  useEffect(() => {
    if (!isEnabled && isPlaying) {
      stopSpeaking();
    }
  }, [isEnabled, isPlaying, stopSpeaking]);

  // Handle page visibility changes to pause audio when tab is not active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        stopSpeaking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, stopSpeaking]);

  // Prevent rendering if no text
  if (!text.trim()) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Pause Button */}
      {isEnabled && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={isPlaying ? stopSpeaking : () => speak(text)}
          disabled={isLoading || isProcessingRef.current}
          title={isPlaying ? "Stop audio" : "Play audio"}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
