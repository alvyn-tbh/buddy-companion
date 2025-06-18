"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AudioPlayerProps {
  text: string;
  isEnabled: boolean;
  className?: string;
}

export function AudioPlayer({ text, isEnabled, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isProcessingRef = useRef(false);

  // Check if speech synthesis is supported
  const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback((text: string) => {
    if (!isEnabled || !text.trim() || isProcessingRef.current || !isSpeechSynthesisSupported) {
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsLoading(true);

      // Cancel any existing speech
      window.speechSynthesis.cancel();

      // Create new utterance with optimized settings
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';

      // Set up event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsLoading(false);
        isProcessingRef.current = false;
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsLoading(false);
        isProcessingRef.current = false;
        utteranceRef.current = null;
        
        // Provide specific error messages
        if (event.error === 'canceled') {
          toast.error("Audio playback was canceled");
        } else if (event.error === 'interrupted') {
          toast.error("Audio playback was interrupted");
        } else if (event.error === 'audio-busy') {
          toast.error("Audio system is busy. Please try again.");
        } else if (event.error === 'audio-hardware') {
          toast.error("Audio hardware error. Please check your speakers.");
        } else {
          toast.error("Error playing audio. Please try again.");
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      setIsPlaying(false);
      setIsLoading(false);
      isProcessingRef.current = false;
      utteranceRef.current = null;
      toast.error("Audio playback not supported in this browser");
    }
  }, [isEnabled, isSpeechSynthesisSupported]);

  const stopSpeaking = useCallback(() => {
    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
    isProcessingRef.current = false;
    utteranceRef.current = null;
  }, [isSpeechSynthesisSupported]);

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

  // Prevent rendering if no text or not supported
  if (!text.trim() || !isSpeechSynthesisSupported) return null;

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