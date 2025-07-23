'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AzureAvatarService, AvatarServiceConfig, AvatarState, AvatarStreamOptions } from '@/lib/azure-avatar-service';
import { toast } from 'sonner';

interface UseAvatarOptions extends Partial<AvatarServiceConfig> {
  autoInitialize?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onSpeakingStart?: () => void;
  onSpeakingComplete?: () => void;
}

interface UseAvatarReturn {
  avatarService: AzureAvatarService | null;
  avatarState: AvatarState;
  isReady: boolean;
  initialize: (videoElement: HTMLVideoElement) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  speak: (options: AvatarStreamOptions) => Promise<void>;
  changeAvatar: (character: string, style?: string) => void;
  changeBackground: (background: string) => void;
}

export function useAvatar(options: UseAvatarOptions = {}): UseAvatarReturn {
  const serviceRef = useRef<AzureAvatarService | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>({
    isInitialized: false,
    isConnected: false,
    isSpeaking: false,
    currentEmotion: 'neutral',
    error: null
  });
  const [isReady, setIsReady] = useState(false);

  // Create service instance
  useEffect(() => {
    const speechKey = options.speechKey || process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const speechRegion = options.speechRegion || process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      console.error('Azure Speech credentials not configured');
      setAvatarState(prev => ({
        ...prev,
        error: new Error('Azure Speech credentials not configured')
      }));
      return;
    }

    const service = new AzureAvatarService({
      speechKey,
      speechRegion,
      avatarCharacter: options.avatarCharacter,
      avatarStyle: options.avatarStyle,
      voice: options.voice,
      background: options.background,
      customBackground: options.customBackground,
      enableEmotions: options.enableEmotions ?? true,
      streamingMode: options.streamingMode ?? false
    });

    // Set up event listeners
    service.on('state-changed', (state) => {
      setAvatarState(state);
      setIsReady(state.isInitialized && state.isConnected && !state.error);
    });

    service.on('error', (error) => {
      console.error('Avatar error:', error);
      options.onError?.(error);
      toast.error(`Avatar error: ${error.message}`);
    });

    service.on('connected', () => {
      options.onReady?.();
      toast.success('Avatar connected');
    });

    service.on('speaking-started', () => {
      options.onSpeakingStart?.();
    });

    service.on('speaking-completed', () => {
      options.onSpeakingComplete?.();
    });

    serviceRef.current = service;

    return () => {
      service.destroy();
    };
  }, []); // Only create service once

  const initialize = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!serviceRef.current) {
      throw new Error('Avatar service not created');
    }

    try {
      await serviceRef.current.initialize(videoElement);
    } catch (error) {
      console.error('Failed to initialize avatar:', error);
      throw error;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!serviceRef.current) {
      throw new Error('Avatar service not created');
    }

    try {
      await serviceRef.current.connect();
    } catch (error) {
      console.error('Failed to connect avatar:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!serviceRef.current) return;

    try {
      await serviceRef.current.disconnect();
    } catch (error) {
      console.error('Failed to disconnect avatar:', error);
    }
  }, []);

  const speak = useCallback(async (options: AvatarStreamOptions) => {
    if (!serviceRef.current) {
      throw new Error('Avatar service not created');
    }

    if (!isReady) {
      throw new Error('Avatar not ready. Please connect first.');
    }

    try {
      await serviceRef.current.speak(options);
    } catch (error) {
      console.error('Failed to speak:', error);
      throw error;
    }
  }, [isReady]);

  const changeAvatar = useCallback((character: string, style?: string) => {
    if (!serviceRef.current) return;
    serviceRef.current.changeAvatar(character as any, style);
  }, []);

  const changeBackground = useCallback((background: string) => {
    if (!serviceRef.current) return;
    serviceRef.current.changeBackground(background);
  }, []);

  return {
    avatarService: serviceRef.current,
    avatarState,
    isReady,
    initialize,
    connect,
    disconnect,
    speak,
    changeAvatar,
    changeBackground
  };
}