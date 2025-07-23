'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { VideoAvatar } from './video-avatar';
import { useSpeechToVideoOptimized } from '@/lib/hooks/use-speech-to-video-optimized';
import { toast } from 'sonner';
import {
  Mic,
  MicOff,
  Play,
  Square,
  AlertCircle,
  Loader2,
  Volume2,
  Zap,
  Tv,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeechToVideoConversationOptimizedProps {
  className?: string;
}

export function SpeechToVideoConversationOptimized({ className = '' }: SpeechToVideoConversationOptimizedProps) {
  const { state, startSpeechToVideo, stopSpeechToVideo, speakText, isAvailable } = useSpeechToVideoOptimized();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.transcript, state.aiResponse]);

  const handleStart = async () => {
    try {
      await startSpeechToVideo({
        enableFastStart: true
      });
      toast.success('AI Assistant activated! Start speaking...');
    } catch (error) {
      console.error('Failed to start:', error);
      toast.error('Failed to start AI Assistant');
    }
  };

  const handleStop = () => {
    stopSpeechToVideo();
    toast.info('AI Assistant stopped');
  };

  const handleTestSpeak = async () => {
    if (!state.isReady) return;
    
    try {
      await speakText('Hello! I am your AI assistant. How can I help you today?');
    } catch (error) {
      console.error('Failed to speak:', error);
      toast.error('Failed to speak text');
    }
  };

  // Mode indicator component
  const ModeIndicator = () => {
    const modeConfig = {
      avatar: { icon: Tv, label: 'Avatar Mode', color: 'text-green-600' },
      tts: { icon: Volume2, label: 'TTS Mode', color: 'text-blue-600' },
      fallback: { icon: MessageSquare, label: 'Fallback Mode', color: 'text-orange-600' }
    };

    const config = modeConfig[state.mode];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={cn('gap-1', config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Status indicator component
  const StatusIndicator = () => {
    if (state.error) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{state.error}</span>
        </div>
      );
    }

    if (state.isConnecting) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{state.connectionStatus}</span>
        </div>
      );
    }

    if (state.isListening) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Mic className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Listening...</span>
        </div>
      );
    }

    if (state.isProcessing) {
      return (
        <div className="flex items-center gap-2 text-orange-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Processing...</span>
        </div>
      );
    }

    if (state.isSpeaking) {
      return (
        <div className="flex items-center gap-2 text-purple-600">
          <Volume2 className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Speaking...</span>
        </div>
      );
    }

    if (state.isReady) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Zap className="h-4 w-4" />
          <span className="text-sm">Ready</span>
        </div>
      );
    }

    return null;
  };

  if (!isAvailable) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Azure Speech Service Not Configured</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please configure your Azure Speech Service credentials in the environment variables.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">AI Avatar Assistant (Optimized)</h3>
          <div className="flex items-center gap-2">
            <ModeIndicator />
            <StatusIndicator />
          </div>
        </div>
        
        {/* Control buttons */}
        <div className="flex gap-2">
          {!state.isActive ? (
            <Button
              onClick={handleStart}
              disabled={state.isConnecting}
              className="gap-2"
              variant="default"
            >
              {state.isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Conversation
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              variant="destructive"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}

          {state.isReady && (
            <Button
              onClick={handleTestSpeak}
              disabled={state.isSpeaking}
              variant="outline"
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Test Speech
            </Button>
          )}
        </div>
      </div>

      {/* Video/Avatar Section */}
      <div className="flex-1 flex flex-col">
        <div ref={videoContainerRef} className="relative bg-gray-100 dark:bg-gray-900 h-96">
          <VideoAvatar className="w-full h-full" />
          
          {/* Listening indicator overlay */}
          {state.isListening && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 bg-green-500/90 text-white px-3 py-1.5 rounded-full">
                <Mic className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Listening</span>
              </div>
            </div>
          )}
        </div>

        {/* Conversation Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current transcript */}
          {state.transcript && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 dark:text-blue-400">
                  <Mic className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">You said:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{state.transcript}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Response */}
          {state.aiResponse && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-purple-600 dark:text-purple-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Assistant:</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">{state.aiResponse}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              Status: <span className="font-medium">{state.connectionStatus || 'Idle'}</span>
            </span>
            {state.isActive && (
              <div className="flex items-center gap-2">
                {state.isListening ? (
                  <Mic className="h-4 w-4 text-green-600 animate-pulse" />
                ) : (
                  <MicOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Optimized for real-time performance
          </div>
        </div>
      </div>
    </Card>
  );
}

export default SpeechToVideoConversationOptimized;