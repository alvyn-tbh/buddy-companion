'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SpeechToVideoServiceOptimized } from '../speech-to-video-service-optimized';
import { preloadAzureSDK } from '../azure-tts-avatar-sdk-optimized';

export interface SpeechToVideoState {
  isActive: boolean;
  isConnecting: boolean;
  connectionStatus: string;
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  isReady: boolean;
  transcript: string;
  aiResponse: string;
  mode: 'avatar' | 'tts' | 'fallback';
}

export interface SpeechToVideoConfig {
  speechKey?: string;
  speechRegion?: string;
  avatarCharacter?: string;
  avatarStyle?: string;
  voice?: string;
  corporateApiUrl?: string;
  enableFastStart?: boolean;
}

export interface UseSpeechToVideoReturn {
  state: SpeechToVideoState;
  service: SpeechToVideoServiceOptimized | null;
  startSpeechToVideo: (config?: SpeechToVideoConfig) => Promise<void>;
  stopSpeechToVideo: () => void;
  speakText: (text: string) => Promise<void>;
  isAvailable: boolean;
}

export function useSpeechToVideoOptimized(): UseSpeechToVideoReturn {
  const [state, setState] = useState<SpeechToVideoState>({
    isActive: false,
    isConnecting: false,
    connectionStatus: '',
    isSpeaking: false,
    isListening: false,
    isProcessing: false,
    error: null,
    isReady: false,
    transcript: '',
    aiResponse: '',
    mode: 'tts'
  });

  const serviceRef = useRef<SpeechToVideoServiceOptimized | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Preload SDK on mount for faster initialization
  useEffect(() => {
    preloadAzureSDK();
  }, []);

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
      console.log('🔄 [SpeechToVideoOptimized Hook] Already active or connecting');
      return;
    }

    console.log('🚀 [SpeechToVideoOptimized Hook] Starting fast initialization...');
    
    try {
      updateState({ 
        isConnecting: true, 
        error: null,
        connectionStatus: 'Fast Initializing...'
      });

      // Get credentials
      const speechKey = config?.speechKey || process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
      const speechRegion = config?.speechRegion || process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

      if (!speechKey || !speechRegion) {
        throw new Error('Azure Speech credentials not configured');
      }

      // Create or reuse video element
      if (!videoElementRef.current) {
        const videoElement = document.createElement('video');
        videoElement.id = 'speech-to-video-avatar';
        videoElement.className = 'hidden';
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        document.body.appendChild(videoElement);
        videoElementRef.current = videoElement;
      }

      // Create service with optimized config
      const service = new SpeechToVideoServiceOptimized({
        speechKey,
        speechRegion,
        avatarCharacter: config?.avatarCharacter || 'lisa',
        avatarStyle: config?.avatarStyle || 'casual-sitting',
        voice: config?.voice || 'en-US-JennyNeural',
        corporateApiUrl: config?.corporateApiUrl,
        enableFastStart: config?.enableFastStart !== false,
        preloadSDK: true
      });

      // Set up event listeners
      service.addEventListener('stateChange', ((event: CustomEvent<SpeechToVideoState>) => {
        const serviceState = event.detail;
        updateState({
          isActive: serviceState.isActive,
          isListening: serviceState.isListening,
          isProcessing: serviceState.isProcessing,
          isSpeaking: serviceState.isSpeaking,
          connectionStatus: serviceState.connectionStatus,
          transcript: serviceState.transcript,
          aiResponse: serviceState.aiResponse,
          mode: serviceState.mode,
          error: serviceState.error
        });
      }) as EventListener);

      service.addEventListener('ready', () => {
        console.log('✅ [SpeechToVideoOptimized Hook] Service ready!');
        updateState({
          isReady: true,
          isConnecting: false
        });
      });

      service.addEventListener('error', ((event: CustomEvent<string>) => {
        console.error('❌ [SpeechToVideoOptimized Hook] Service error:', event.detail);
        updateState({
          error: event.detail,
          isConnecting: false,
          isReady: false
        });
      }) as EventListener);

      // Initialize with fast mode
      await service.initialize(videoElementRef.current);
      
      serviceRef.current = service;
      
      // Start listening immediately
      service.startListening();
      
      console.log('🎉 [SpeechToVideoOptimized Hook] Service initialized and listening!');
      
    } catch (error) {
      console.error('❌ [SpeechToVideoOptimized Hook] Failed to start:', error);
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
    if (serviceRef.current) {
      serviceRef.current.disconnect();
      serviceRef.current = null;
    }

    if (videoElementRef.current) {
      videoElementRef.current.remove();
      videoElementRef.current = null;
    }

    updateState({
      isActive: false,
      isConnecting: false,
      connectionStatus: '',
      isSpeaking: false,
      isListening: false,
      isProcessing: false,
      error: null,
      isReady: false,
      transcript: '',
      aiResponse: '',
      mode: 'tts'
    });
  }, [updateState]);

  const speakText = useCallback(async (text: string) => {
    if (!serviceRef.current || !serviceRef.current.isReady()) {
      throw new Error('Service not ready');
    }

    try {
      await serviceRef.current.speakText(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Speech failed';
      updateState({ error: errorMessage });
      throw error;
    }
  }, [updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
      if (videoElementRef.current) {
        videoElementRef.current.remove();
      }
    };
  }, []);

  return {
    state,
    service: serviceRef.current,
    startSpeechToVideo,
    stopSpeechToVideo,
    speakText,
    isAvailable
  };
}

export default useSpeechToVideoOptimized;