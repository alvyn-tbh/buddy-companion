'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSpeechToVideo, UseSpeechToVideoReturn } from '../hooks/use-speech-to-video';

type SpeechToVideoContextType = UseSpeechToVideoReturn;

const SpeechToVideoContext = createContext<SpeechToVideoContextType | undefined>(undefined);

export interface SpeechToVideoProviderProps {
  children: ReactNode;
}

export function SpeechToVideoProvider({ children }: SpeechToVideoProviderProps) {
  const speechToVideoHook = useSpeechToVideo();

  return (
    <SpeechToVideoContext.Provider value={speechToVideoHook}>
      {children}
    </SpeechToVideoContext.Provider>
  );
}

export function useSpeechToVideoContext(): SpeechToVideoContextType {
  const context = useContext(SpeechToVideoContext);
  if (context === undefined) {
    throw new Error('useSpeechToVideoContext must be used within a SpeechToVideoProvider');
  }
  return context;
}

// Optional: Create a higher-order component for components that need speech-to-video
export function withSpeechToVideo<P extends object>(
  Component: React.ComponentType<P & { speechToVideo: SpeechToVideoContextType }>
) {
  return function WrappedComponent(props: P) {
    const speechToVideo = useSpeechToVideoContext();
    return <Component {...props} speechToVideo={speechToVideo} />;
  };
}

export default SpeechToVideoContext; 