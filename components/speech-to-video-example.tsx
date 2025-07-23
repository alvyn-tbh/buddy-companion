'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Textarea } from './textarea';
import { VideoAvatar } from './video-avatar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AzureTTSAvatarSDK, AvatarConfig } from '@/lib/azure-tts-avatar-sdk';
import { SpeechToVideoDebug } from './speech-to-video-debug';
import { SpeechToVideoService } from '@/lib/speech-to-video-service';
import { toast } from 'sonner';
import {
  Play,
  RotateCcw,
  AlertCircle,
  Loader2,
  Trash2,
  Settings,
  Volume2
} from 'lucide-react';

interface SpeechToVideoExampleProps {
  className?: string;
}

export function SpeechToVideoExample({ className = '' }: SpeechToVideoExampleProps) {
  // Local state for the example
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [currentAvatar, setCurrentAvatar] = useState<AzureTTSAvatarSDK | null>(null);
  const [speechToVideoService, setSpeechToVideoService] = useState<SpeechToVideoService | null>(null);
  const [avatarState, setAvatarState] = useState({
    isActive: false,
    isConnecting: false,
    connectionStatus: 'Disconnected',
    error: null as string | null,
    isReady: false,
    isSpeaking: false,
    conversationTurn: 0
  });

  const speechToVideoServiceRef = useRef<SpeechToVideoService | null>(null);

  // Check if Azure credentials are available
  const isAvailable = !!(
    process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY && 
    process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION
  );

  // Create avatar configuration
  const avatarConfig: AvatarConfig = {
    speechKey: process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '',
    speechRegion: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || '',
    avatarCharacter: 'lisa',
    avatarStyle: 'casual-sitting',
    voice: 'en-US-JennyNeural'
  };

  // Handle input changes
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => {
    setInput(event.target.value);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call corporate API
      const response = await fetch('/api/corporate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful corporate AI assistant. Provide concise, professional responses suitable for voice conversation. Keep responses under 100 words for natural speech flow.' },
            { role: 'user', content: input.trim() }
          ],
          existingThreadId: `example-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() && line.startsWith('0:"')) {
              const match = line.match(/^0:"(.*)"/);
              if (match) {
                const content = match[1]
                  .replace(/\\"/g, '"')
                  .replace(/\\n/g, '\n')
                  .replace(/\\r/g, '\r')
                  .replace(/\\t/g, '\t')
                  .replace(/\\\\/g, '\\');
                fullResponse += content;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      const aiResponse = fullResponse.trim();
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If avatar is ready, speak the response
      if (avatarState.isActive && avatarState.isReady && currentAvatar) {
        try {
          await currentAvatar.speakText(aiResponse);
          toast.success('Avatar response delivered!');
        } catch (error) {
          console.error('Error speaking response:', error);
          toast.error('Error playing avatar response');
        }
      }

    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Error processing your message');
    } finally {
      setIsLoading(false);
      setInput('');
    }
  }, [input, avatarState.isActive, avatarState.isReady, currentAvatar]);

  // Handle avatar ready callback
  const handleAvatarReady = useCallback((avatar: AzureTTSAvatarSDK) => {
    setCurrentAvatar(avatar);
    setAvatarState(prev => ({ ...prev, isReady: true, isActive: true }));
    toast.success('Avatar is ready for conversation!');
  }, []);

  // Handle avatar error callback
  const handleAvatarError = useCallback((error: Error) => {
    console.error('Avatar error:', error);
    setCurrentAvatar(null);
    setAvatarState(prev => ({ ...prev, isReady: false, error: error.message }));
  }, []);

  // Handle speech-to-video state changes
  const handleSpeechToVideoStateChange = useCallback((state: {
    isActive: boolean;
    isConnecting: boolean;
    connectionStatus: string;
    isSpeaking: boolean;
    error: string | null;
    isReady: boolean;
  }) => {
    setAvatarState(prev => ({
      ...prev,
      isActive: state.isActive,
      isConnecting: state.isConnecting,
      connectionStatus: state.connectionStatus,
      isSpeaking: state.isSpeaking,
      error: state.error,
      isReady: state.isReady
    }));
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setInput('');
    
    // Clear conversation in speech-to-video service
    if (speechToVideoServiceRef.current) {
      speechToVideoServiceRef.current.clearConversation();
    }
    
    toast.info('Conversation cleared');
  }, []);

  // Stop function (placeholder)
  const stop = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Test avatar speech
  const testAvatarSpeech = useCallback(async () => {
    if (!avatarState.isReady || !currentAvatar) {
      toast.error('Avatar not ready. Please start avatar first.');
      return;
    }

    try {
      await currentAvatar.speakText("Hello! I'm your AI avatar assistant. I can help you with speech-to-video conversations using Azure technology.");
      toast.success('Avatar test completed!');
    } catch (error) {
      console.error('Error testing avatar:', error);
      toast.error('Error testing avatar speech');
    }
  }, [avatarState.isReady, currentAvatar]);

  // Reset avatar connection
  const resetAvatar = useCallback(() => {
    if (currentAvatar) {
      currentAvatar.disconnect();
      setCurrentAvatar(null);
      setAvatarState({
        isActive: false,
        isConnecting: false,
        connectionStatus: 'Disconnected',
        error: null,
        isReady: false,
        isSpeaking: false,
        conversationTurn: 0
      });
      toast.info('Avatar connection reset');
    }
  }, [currentAvatar]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechToVideoServiceRef.current) {
        speechToVideoServiceRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Speech-to-Video Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Experience AI conversations with Azure Text-to-Speech Avatar
        </p>
      </div>

      {/* Comprehensive Debug Panel */}
      <SpeechToVideoDebug
        isActive={avatarState.isActive}
        isConnecting={avatarState.isConnecting}
        connectionStatus={avatarState.connectionStatus}
        error={avatarState.error}
        onRetry={resetAvatar}
      />

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Conversation</h3>
                <Badge variant={avatarState.isActive ? 'default' : 'secondary'}>
                  {avatarState.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {avatarState.conversationTurn > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Turn #{avatarState.conversationTurn}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testAvatarSpeech}
                  disabled={!avatarState.isReady || avatarState.isSpeaking}
                  className="text-xs"
                >
                  {avatarState.isSpeaking ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Volume2 className="h-3 w-3 mr-1" />
                  )}
                  Test Avatar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearConversation}
                  className="text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🎬</div>
                  <p>Start a speech-to-video conversation!</p>
                  <p className="text-sm mt-1">Use the speech-to-video button below to begin</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 border'
                      }`}
                    >
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit}>
              <Textarea
                handleInputChange={handleInputChange}
                input={input}
                isLoading={isLoading}
                stop={stop}
                handleSubmit={handleSubmit}
                voice="alloy"
                onSpeechToVideoStateChange={handleSpeechToVideoStateChange}
              />
            </form>
          </div>
        </Card>

        {/* Video Avatar */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Avatar</h3>
              <div className="flex items-center gap-2">
                <Badge variant={avatarState.isActive ? 'default' : 'secondary'}>
                  {avatarState.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {avatarState.isSpeaking && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 animate-pulse">
                    Speaking...
                  </Badge>
                )}
              </div>
            </div>

            <VideoAvatar
              config={avatarConfig}
              onAvatarReady={handleAvatarReady}
              onAvatarError={handleAvatarError}
              onStateChange={(state) => setAvatarState(prev => ({
                ...prev,
                isConnecting: state.isConnecting,
                connectionStatus: state.connectionStatus,
                error: state.error,
                isReady: state.isConnected
              }))}
              className="w-full"
            />

            {!isAvailable && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Setup Required</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please configure Azure Speech credentials to enable the avatar functionality.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">How to Use Speech-to-Video</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">Getting Started:</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>1. Click the 🎬 video icon to start speech-to-video mode</li>
              <li>2. Allow microphone access when prompted</li>
              <li>3. Start speaking - your words will be transcribed</li>
              <li>4. Watch the AI respond through the avatar</li>
              <li>5. Continue the conversation naturally</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Features:</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Continuous speech recognition</li>
              <li>• Real-time GPT processing</li>
              <li>• Azure Text-to-Speech avatar video</li>
              <li>• Automatic conversation management</li>
              <li>• Error recovery and reconnection</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Speak clearly and at normal pace</li>
            <li>• Wait for the avatar to finish speaking before continuing</li>
            <li>• Use the reset button if you encounter connection issues</li>
            <li>• Keep responses conversational for best avatar performance</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default SpeechToVideoExample; 