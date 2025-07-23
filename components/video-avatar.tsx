'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AzureTTSAvatarSDK, AvatarConfig, AvatarState } from '@/lib/azure-tts-avatar-sdk';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Play,
  Square,
  Video,
  VideoOff,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoAvatarProps {
  config: AvatarConfig;
  onAvatarReady?: (avatar: AzureTTSAvatarSDK) => void;
  onAvatarError?: (error: Error) => void;
  onStateChange?: (state: AvatarState) => void;
  className?: string;
}

export function VideoAvatar({ 
  config, 
  onAvatarReady, 
  onAvatarError, 
  onStateChange,
  className = ''
}: VideoAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<AzureTTSAvatarSDK | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>({
    isConnected: false,
    isConnecting: false,
    isSpeaking: false,
    connectionStatus: 'Disconnected',
    error: null
  });
  const [testText, setTestText] = useState('Hello! I am your AI avatar assistant. Welcome to our conversation!');

  const startAvatar = useCallback(async () => {
    if (!videoRef.current || avatarState.isConnecting) {
      return;
    }

    try {
      console.log('🎬 [VideoAvatar] Starting avatar with config:', {
        speechRegion: config.speechRegion,
        avatarCharacter: config.avatarCharacter,
        avatarStyle: config.avatarStyle,
        voice: config.voice,
        hasKey: !!config.speechKey
      });

      // Create new avatar instance
      const avatar = new AzureTTSAvatarSDK(config);
      avatarRef.current = avatar;

      // Set up event listeners
      avatar.on('stateChange', (state: AvatarState) => {
        console.log('🔄 [VideoAvatar] State changed:', state);
        setAvatarState(state);
        onStateChange?.(state);
      });

      avatar.on('connected', async () => {
        console.log('✅ [VideoAvatar] Avatar connected');
        onAvatarReady?.(avatar);
        toast.success('Avatar connected successfully!');
        
        // Automatically speak the intro message
        try {
          const { corporate } = await import('@/lib/intro-prompt');
          console.log('🎤 [VideoAvatar] Speaking intro message...');
          await avatar.speakText(corporate);
        } catch (error) {
          console.error('❌ [VideoAvatar] Failed to speak intro message:', error);
        }
      });

      avatar.on('error', (error: Error) => {
        console.error('❌ [VideoAvatar] Avatar error:', error);
        onAvatarError?.(error);
        toast.error(`Avatar error: ${error.message}`);
      });

      avatar.on('synthesisStarted', () => {
        console.log('🗣️ [VideoAvatar] Started speaking');
      });

      avatar.on('synthesisCompleted', () => {
        console.log('✅ [VideoAvatar] Finished speaking');
      });

      // Initialize avatar
      await avatar.initialize(videoRef.current);

    } catch (error) {
      console.error('💥 [VideoAvatar] Failed to start avatar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start avatar';
      setAvatarState(prev => ({
        ...prev,
        error: errorMessage,
        isConnecting: false,
        connectionStatus: 'Failed'
      }));
      onAvatarError?.(new Error(errorMessage));
      toast.error(`Failed to start avatar: ${errorMessage}`);
    }
  }, [config, onAvatarReady, onAvatarError, onStateChange, avatarState.isConnecting]);

  const stopAvatar = () => {
    if (avatarRef.current) {
      console.log('⏹️ [VideoAvatar] Stopping avatar');
      avatarRef.current.disconnect();
      avatarRef.current = null;
      toast.info('Avatar disconnected');
    }
  };

  const testSpeech = async () => {
    if (!avatarRef.current || !avatarRef.current.isReady()) {
      toast.error('Avatar not ready. Please start the avatar first.');
      return;
    }

    try {
      await avatarRef.current.speakText(testText);
      toast.success('Test speech completed!');
    } catch (error) {
      console.error('❌ [VideoAvatar] Test speech failed:', error);
      toast.error('Test speech failed');
    }
  };

  const getStatusBadge = () => {
    if (avatarState.isConnecting) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Connecting...</Badge>;
    }
    if (avatarState.isConnected) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Connected</Badge>;
    }
    if (avatarState.error) {
      return <Badge variant="outline" className="bg-red-50 text-red-700">Error</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-700">Disconnected</Badge>;
  };

  const getStatusIcon = () => {
    if (avatarState.isConnecting) {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    if (avatarState.isConnected) {
      return <Video className="h-5 w-5 text-green-500" />;
    }
    if (avatarState.error) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    return <VideoOff className="h-5 w-5 text-gray-500" />;
  };

  useEffect(() => {
    // Auto-start avatar when component mounts
    const timer = setTimeout(() => {
      startAvatar();
    }, 1000); // Small delay to ensure everything is ready

    return () => {
      clearTimeout(timer);
      // Cleanup on unmount
      if (avatarRef.current) {
        avatarRef.current.disconnect();
      }
    };
  }, [startAvatar]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold">AI Avatar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {avatarState.connectionStatus}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Video Container */}
        <div className="relative">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted={false}
              playsInline
              style={{
                backgroundColor: config.backgroundColor || '#f0f0f0'
              }}
            />
            
            {/* Overlay when not connected */}
            {!avatarState.isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  {avatarState.isConnecting ? (
                    <div className="space-y-2">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {avatarState.connectionStatus}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <VideoOff className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Avatar not active
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Speaking indicator */}
            {avatarState.isSpeaking && (
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 animate-pulse">
                  Speaking...
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {avatarState.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium">Avatar Error</p>
                <p className="mt-1">{avatarState.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!avatarState.isConnected ? (
            <Button
              onClick={startAvatar}
              disabled={avatarState.isConnecting}
              className="flex-1"
            >
              {avatarState.isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {avatarState.isConnecting ? 'Connecting...' : 'Start Avatar'}
            </Button>
          ) : (
            <>
              <Button
                onClick={testSpeech}
                disabled={avatarState.isSpeaking}
                variant="outline"
              >
                <Play className="h-4 w-4 mr-2" />
                Test Speech
              </Button>
              <Button
                onClick={stopAvatar}
                variant="outline"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Test Text Input */}
        {avatarState.isConnected && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Text:</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              rows={2}
              placeholder="Enter text for the avatar to speak..."
            />
          </div>
        )}

        {/* Avatar Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Character: {config.avatarCharacter || 'lisa'}</div>
          <div>Style: {config.avatarStyle || 'casual-sitting'}</div>
          <div>Voice: {config.voice || 'en-US-JennyNeural'}</div>
          <div>Region: {config.speechRegion}</div>
        </div>
      </div>
    </Card>
  );
} 