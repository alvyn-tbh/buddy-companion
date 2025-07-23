import { useState, useEffect, useCallback } from 'react';

interface UseAudioReturn {
  isAudioEnabled: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  isPlaying: boolean;
  enableAudio: () => void;
  disableAudio: () => void;
  toggleAudio: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playText: (text: string, voice?: string) => Promise<void>;
  stopPlaying: () => void;
  isSpeechRecognitionSupported: boolean;
}

export function useAudio(): UseAudioReturn {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Check if speech recognition is supported (for transcription)
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const stopPlaying = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  }, [currentAudio]);

  const enableAudio = useCallback(() => {
    setIsAudioEnabled(true);
  }, []);

  const disableAudio = useCallback(() => {
    setIsAudioEnabled(false);
    stopPlaying();
  }, [stopPlaying]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSpeechRecognitionSupported) {
      throw new Error('Speech recognition not supported');
    }
    setIsRecording(true);
  }, [isSpeechRecognitionSupported]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setIsTranscribing(false);
  }, []);

  const playText = useCallback(async (text: string, voice: string = 'alloy') => {
    if (!isAudioEnabled || !text.trim()) {
      return;
    }

    try {
      // Stop any currently playing audio
      stopPlaying();

      setIsPlaying(true);

      // Call OpenAI TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          model: 'tts-1',
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
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        // Clean up the blob URL
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        // Clean up the blob URL
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

    } catch (error) {
      console.error('Error with TTS:', error);
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, [isAudioEnabled, stopPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlaying();
    };
  }, [stopPlaying]);

  return {
    isAudioEnabled,
    isRecording,
    isTranscribing,
    isPlaying,
    enableAudio,
    disableAudio,
    toggleAudio,
    startRecording,
    stopRecording,
    playText,
    stopPlaying,
    isSpeechRecognitionSupported,
  };
}
