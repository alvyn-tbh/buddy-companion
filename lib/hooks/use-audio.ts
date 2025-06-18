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
  playText: (text: string) => void;
  stopPlaying: () => void;
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
}

export function useAudio(): UseAudioReturn {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Check browser support
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  
  const isSpeechSynthesisSupported = typeof window !== 'undefined' && 
    'speechSynthesis' in window;

  const stopPlaying = useCallback(() => {
    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [isSpeechSynthesisSupported]);

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

  const playText = useCallback((text: string) => {
    if (!isAudioEnabled || !isSpeechSynthesisSupported || !text.trim()) {
      return;
    }

    try {
      // Cancel any existing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with speech synthesis:', error);
    }
  }, [isAudioEnabled, isSpeechSynthesisSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeechSynthesisSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeechSynthesisSupported]);

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
    isSpeechSynthesisSupported,
  };
} 