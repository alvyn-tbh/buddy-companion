'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import StreamingAvatar, { 
  AvatarQuality, 
  StreamingEvents,
  VoiceEmotion,
  StartAvatarResponse
} from '@heygen/streaming-avatar';
import { AvatarConfig, AvatarConfiguration } from './AvatarConfig';
import { AvatarVideo } from './AvatarSession/AvatarVideo';
import { AudioInput } from './AvatarSession/AudioInput';
import { TextInput } from './AvatarSession/TextInput';
import { MessageHistory, Message } from './AvatarSession/MessageHistory';
import { AvatarControls } from './AvatarSession/AvatarControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface InteractiveAvatarProps {
  onMessageSend?: (message: string) => Promise<string>;
  className?: string;
}

export function InteractiveAvatar({ onMessageSend, className = '' }: InteractiveAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfiguration | null>(null);
  const [debugInfo] = useState<{ fps?: number; latency?: number; quality?: string }>({});
  
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const sessionDataRef = useRef<StartAvatarResponse | null>(null);
  const handleEndSessionRef = useRef<(() => Promise<void>) | null>(null);

  // Initialize the avatar instance
  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        // Get access token from our API
        const response = await fetch('/api/heygen/access-token', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to get access token');
        }
        
        const { token } = await response.json();
        
        // Initialize streaming avatar
        avatarRef.current = new StreamingAvatar({ token });
        
        // Set up event listeners
        avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
          console.log('Avatar started talking');
        });
        
        avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
          console.log('Avatar stopped talking');
        });
        
        avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
          console.log('Stream disconnected');
          handleEndSessionRef.current?.();
        });
        
        avatarRef.current.on(StreamingEvents.STREAM_READY, (event) => {
          console.log('Stream ready', event);
          if (event.stream) {
            setStream(event.stream);
          }
        });
      } catch (error) {
        console.error('Failed to initialize avatar:', error);
        toast.error('Failed to initialize avatar service');
      }
    };
    
    initializeAvatar();
    
    return () => {
      if (avatarRef.current) {
        // Cleanup avatar resources
        try {
          // Stop any active avatar session
          if (sessionDataRef.current) {
            avatarRef.current.stopAvatar().catch(console.error);
          }
          // Note: StreamingAvatar doesn't have a destroy method
          // The instance will be garbage collected when ref is cleared
        } catch (error) {
          console.error('Error during avatar cleanup:', error);
        }
      }
    };
  }, []);

  const handleSpeak = useCallback(async (text: string) => {
    if (!avatarRef.current || !sessionDataRef.current || !isSessionActive) return;
    
    setIsLoadingRepeat(true);
    
    try {
      await avatarRef.current.speak({
        text,
      });
    } catch (error) {
      console.error('Failed to make avatar speak:', error);
      toast.error('Failed to make avatar speak');
    } finally {
      setIsLoadingRepeat(false);
    }
  }, [isSessionActive]);

  const handleStartSession = useCallback(async (config: AvatarConfiguration) => {
    if (!avatarRef.current || isSessionActive) return;
    
    setIsLoadingSession(true);
    setAvatarConfig(config);
    
    try {
      const sessionData = await avatarRef.current.createStartAvatar({
        avatarName: config.avatarId,
        voice: {
          voiceId: config.voiceId,
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY,
        },
        quality: config.quality as AvatarQuality,
        language: config.language,
      });
      
      sessionDataRef.current = sessionData;
      setIsSessionActive(true);
      
      // Optional: Send initial greeting
      await handleSpeak("Hello! I'm your interactive avatar assistant. How can I help you today?");
      
      toast.success('Avatar session started successfully');
    } catch (error) {
      console.error('Failed to start avatar session:', error);
      toast.error('Failed to start avatar session');
    } finally {
      setIsLoadingSession(false);
    }
  }, [isSessionActive, handleSpeak]);

  const handleEndSession = useCallback(async () => {
    if (!avatarRef.current || !sessionDataRef.current) return;
    
    try {
      await avatarRef.current.stopAvatar();
      
      setStream(null);
      setIsSessionActive(false);
      sessionDataRef.current = null;
      
      toast.success('Avatar session ended');
    } catch (error) {
      console.error('Failed to end session:', error);
      toast.error('Failed to end session properly');
    }
  }, []);

  // Update the ref when handleEndSession changes
  useEffect(() => {
    handleEndSessionRef.current = handleEndSession;
  }, [handleEndSession]);

  const handleRestartSession = useCallback(async () => {
    if (!avatarConfig) return;
    
    await handleEndSession();
    setTimeout(() => {
      handleStartSession(avatarConfig);
    }, 1000);
      }, [avatarConfig, handleEndSession, handleStartSession]);

  const handleUserMessage = useCallback(async (text: string) => {
    // Add user message to history
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Get response from parent component or use default
    let response = "I understand your message. How else can I help you?";
    
    if (onMessageSend) {
      try {
        response = await onMessageSend(text);
      } catch (error) {
        console.error('Error getting response:', error);
        response = "I'm sorry, I encountered an error processing your request.";
      }
    }
    
    // Add assistant message to history
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    
    // Make avatar speak the response
    await handleSpeak(response);
  }, [onMessageSend, handleSpeak]);

  const handleToggleMute = useCallback(() => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [stream, isMuted]);

  if (!isSessionActive) {
    return (
      <div className={className}>
        <AvatarConfig
          onStart={handleStartSession}
          isStarting={isLoadingSession}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <AvatarVideo
            stream={stream}
            isLoading={isLoadingSession}
            debugInfo={debugInfo}
          />
          <AvatarControls
            isSessionActive={isSessionActive}
            isMuted={isMuted}
            onStart={() => avatarConfig && handleStartSession(avatarConfig)}
            onStop={handleEndSession}
            onRestart={handleRestartSession}
            onToggleMute={handleToggleMute}
          />
        </div>
        
        <div className="space-y-4">
          <MessageHistory messages={messages} />
          
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="voice">Voice Input</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="mt-4">
              <TextInput
                onSend={handleUserMessage}
                isProcessing={isLoadingRepeat}
              />
            </TabsContent>
            
            <TabsContent value="voice" className="mt-4">
              <AudioInput
                onTranscript={handleUserMessage}
                isProcessing={isLoadingRepeat}
                isSpeaking={isLoadingRepeat}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}