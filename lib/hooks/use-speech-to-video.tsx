'use client';

import { useState, useCallback, useRef } from 'react';
import { AzureTTSAvatarSDK } from '../azure-tts-avatar-sdk';

export interface SpeechToVideoState {
  isActive: boolean;
  isConnecting: boolean;
  connectionStatus: string;
  isSpeaking: boolean;
  error: string | null;
  isReady: boolean;
}

export interface SpeechToVideoConfig {
  speechKey?: string;
  speechRegion?: string;
  avatarCharacter?: string;
  avatarStyle?: string;
  voice?: string;
}

export interface UseSpeechToVideoReturn {
  state: SpeechToVideoState;
  avatar: AzureTTSAvatarSDK | null;
  startSpeechToVideo: (config?: SpeechToVideoConfig) => Promise<void>;
  stopSpeechToVideo: () => void;
  speakText: (text: string) => Promise<void>;
  isAvailable: boolean;
}

export function useSpeechToVideo(): UseSpeechToVideoReturn {
  const [state, setState] = useState<SpeechToVideoState>({
    isActive: false,
    isConnecting: false,
    connectionStatus: '',
    isSpeaking: false,
    error: null,
    isReady: false
  });

  const avatarRef = useRef<AzureTTSAvatarSDK | null>(null);

  const updateState = useCallback((updates: Partial<SpeechToVideoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const isAvailable = useCallback(() => {
    const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;
    return !!(speechKey && speechRegion);
  }, [])();

  const startSpeechToVideo = useCallback(async (config?: SpeechToVideoConfig) => {
    if (state.isActive || state.isConnecting) {
      console.log('🔄 [SpeechToVideo Hook] Already active or connecting, skipping...');
      return;
    }

    console.log('🚀 [SpeechToVideo Hook] Starting speech-to-video...');
    
    try {
      updateState({ 
        isConnecting: true, 
        error: null,
        connectionStatus: 'Initializing...'
      });

      // Get credentials
      const speechKey = config?.speechKey || process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
      const speechRegion = config?.speechRegion || process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

      console.log('🔑 [SpeechToVideo Hook] Checking credentials:', {
        hasKey: !!speechKey,
        region: speechRegion
      });

      if (!speechKey || !speechRegion) {
        const missing = [];
        if (!speechKey) missing.push('NEXT_PUBLIC_AZURE_SPEECH_KEY');
        if (!speechRegion) missing.push('NEXT_PUBLIC_AZURE_SPEECH_REGION');
        throw new Error(`Azure Speech credentials not configured. Missing: ${missing.join(', ')}`);
      }

      // Create video element
      updateState({ connectionStatus: 'Creating video element...' });
      const videoElement = document.createElement('video');
      videoElement.className = 'hidden';
      document.body.appendChild(videoElement);
      console.log('📺 [SpeechToVideo Hook] Video element created');

      // Create avatar instance
      updateState({ connectionStatus: 'Creating avatar instance...' });
      const avatarConfig = {
        speechKey,
        speechRegion,
        avatarCharacter: config?.avatarCharacter || 'lisa',
        avatarStyle: config?.avatarStyle || 'casual-sitting',
        voice: config?.voice || 'en-US-JennyNeural'
      };
      
      console.log('🎭 [SpeechToVideo Hook] Creating avatar with config:', avatarConfig);
      const avatar = new AzureTTSAvatarSDK(avatarConfig);

      // Set up event listeners
      console.log('🔗 [SpeechToVideo Hook] Setting up avatar event listeners...');
      
      avatar.on('connected', () => {
        console.log('✅ [SpeechToVideo Hook] Avatar connected successfully!');
        updateState({
          isActive: true,
          isConnecting: false,
          connectionStatus: 'Connected',
          isReady: true
        });
      });

      avatar.on('error', (error: Error) => {
        console.error('❌ [SpeechToVideo Hook] Avatar error:', error);
        updateState({
          error: error.message,
          connectionStatus: 'Error',
          isConnecting: false,
          isReady: false
        });
      });

      avatar.on('synthesisStarted', () => {
        updateState({
          isSpeaking: true,
          connectionStatus: 'Speaking'
        });
      });

      avatar.on('synthesisCompleted', () => {
        updateState({
          isSpeaking: false,
          connectionStatus: 'Connected'
        });
      });

      avatar.on('disconnected', () => {
        updateState({
          isActive: false,
          isConnecting: false,
          connectionStatus: 'Disconnected',
          isSpeaking: false,
          error: null,
          isReady: false
        });
      });

      // Initialize avatar
      updateState({ connectionStatus: 'Initializing avatar...' });
      console.log('🎬 [SpeechToVideo Hook] Initializing avatar...');
      
      try {
        await Promise.race([
          avatar.initialize(videoElement),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Avatar initialization timeout (30 seconds)')), 30000)
          )
        ]);
        
        avatarRef.current = avatar;
        console.log('🎉 [SpeechToVideo Hook] Avatar initialized successfully!');
        
      } catch (initError) {
        console.error('💥 [SpeechToVideo Hook] Avatar initialization failed:', initError);
        // Clean up
        avatar.disconnect();
        videoElement.remove();
        throw new Error(`Avatar initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`);
      }

    } catch (error) {
      console.error('❌ [SpeechToVideo Hook] Failed to start speech-to-video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateState({
        error: errorMessage,
        isConnecting: false,
        connectionStatus: 'Error',
        isReady: false
      });
      throw error;
    }
  }, [state.isActive, state.isConnecting, updateState]);

  const stopSpeechToVideo = useCallback(() => {
    if (avatarRef.current) {
      avatarRef.current.disconnect();
      avatarRef.current = null;
    }

    updateState({
      isActive: false,
      isConnecting: false,
      connectionStatus: '',
      isSpeaking: false,
      error: null,
      isReady: false
    });
  }, [updateState]);

  const speakText = useCallback(async (text: string) => {
    if (!avatarRef.current || !avatarRef.current.isReady()) {
      throw new Error('Avatar not ready');
    }

    try {
      await avatarRef.current.speakText(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Speech failed';
      updateState({ error: errorMessage });
      throw error;
    }
  }, [updateState]);

  return {
    state,
    avatar: avatarRef.current,
    startSpeechToVideo,
    stopSpeechToVideo,
    speakText,
    isAvailable
  };
}

export default useSpeechToVideo; 