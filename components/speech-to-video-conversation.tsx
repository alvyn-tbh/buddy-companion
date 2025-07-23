'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { VideoAvatar } from './video-avatar';
import { AzureTTSAvatarSDK, AvatarConfig } from '@/lib/azure-tts-avatar-sdk';
import { toast } from 'sonner';
import {
  Mic,
  Play,
  Square,
  AlertCircle,
  Loader2,
  Volume2
} from 'lucide-react';

interface SpeechToVideoConversationProps {
  className?: string;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function SpeechToVideoConversation({ className = '' }: SpeechToVideoConversationProps) {
  // State management
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState<AzureTTSAvatarSDK | null>(null);
  const [avatarState, setAvatarState] = useState({
    isActive: false,
    isConnecting: false,
    connectionStatus: 'Disconnected',
    error: null as string | null,
    isReady: false
  });
  const [isConversationActive, setIsConversationActive] = useState(false);
  
  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);
  const conversationActiveRef = useRef(false);

  // Check if Azure credentials are available
  const isAvailable = !!(
    process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY && 
    process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION
  );

  // Avatar configuration
  const avatarConfig: AvatarConfig = {
    speechKey: process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '',
    speechRegion: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || '',
    avatarCharacter: 'lisa',
    avatarStyle: 'casual-sitting',
    voice: 'en-US-JennyNeural'
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update conversation active ref
  useEffect(() => {
    conversationActiveRef.current = isConversationActive;
  }, [isConversationActive]);

  // Update processing ref
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isProcessingRef.current) return;
    
    try {
      recognitionRef.current.start();
      console.log('🎤 Started listening');
    } catch (error: unknown) {
      console.error('❌ Failed to start listening:', error);
      // Try again if already started
      if (error instanceof Error && error.message?.includes('already started')) {
        recognitionRef.current.stop();
        setTimeout(() => {
          if (conversationActiveRef.current) {
            startListening();
          }
        }, 500);
      }
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Process speech input
  const processSpeech = useCallback(async (userInput: string) => {
    if (isProcessingRef.current || !currentAvatar) return;
    
    isProcessingRef.current = true;
    setIsProcessing(true);
    setTranscript('');
    setInterimTranscript('');

    try {
      // Stop listening while processing
      stopListening();

      // Add user message
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userInput,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Call GPT API
      console.log('🤖 Calling GPT API...');
      const response = await fetch('/api/corporate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userInput }
          ],
          existingThreadId: `speech-to-video-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let fullResponse = '';
      const decoder = new TextDecoder();

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

      if (!fullResponse.trim()) {
        throw new Error('Empty response from API');
      }

      // Add assistant message
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response using avatar
      if (avatarState.isReady && currentAvatar) {
        setIsSpeaking(true);
        console.log('🎭 Avatar speaking response...');
        
        await currentAvatar.speakText(fullResponse.trim());
        
        setIsSpeaking(false);
        console.log('✅ Avatar finished speaking');
      }

    } catch (error) {
      console.error('❌ Error processing speech:', error);
      toast.error('Error processing your message');
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      
      // Resume listening if conversation is still active
      if (conversationActiveRef.current) {
        setTimeout(() => startListening(), 1000);
      }
    }
  }, [currentAvatar, avatarState.isReady, messages, stopListening, startListening]);

  // Enhanced error handling based on Azure Speech Service documentation
  const handleSpeechRecognitionError = useCallback((errorType: string): boolean => {
    switch (errorType) {
      case 'aborted':
      case 'not-allowed':
        // User explicitly stopped or denied permission - don't retry
        toast.error('Speech recognition access denied. Please allow microphone access.');
        return false;
      case 'audio-capture':
        toast.error('Audio capture failed. Check your microphone.');
        return false;
      case 'network':
        toast.warning('Network error. Retrying...');
        return true;
      case 'service-not-allowed':
        toast.error('Speech service not available.');
        return false;
      case 'bad-grammar':
      case 'language-not-supported':
        toast.error('Language not supported for speech recognition.');
        return false;
      case 'no-speech':
        // Common issue - just retry silently
        console.log('No speech detected, continuing...');
        return true;
      default:
        console.warn(`Unknown speech recognition error: ${errorType}`);
        return true; // Retry unknown errors
    }
  }, []);

  const getRetryDelay = useCallback((errorType: string): number => {
    switch (errorType) {
      case 'network':
        return 3000; // 3 seconds for network errors
      case 'no-speech':
        return 500; // Quick retry for no speech
      default:
        return 1000; // Default 1 second
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setInterimTranscript(interimTranscript);
        
        if (finalTranscript.trim()) {
          setTranscript(finalTranscript);
          // Process the final transcript
          if (!isProcessingRef.current && conversationActiveRef.current) {
            processSpeech(finalTranscript.trim());
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsListening(false);
        
        // Enhanced error handling based on Azure Speech Service troubleshooting guide
        const shouldRetry = handleSpeechRecognitionError(event.error);
        
        // Restart recognition if conversation is still active and error is recoverable
        if (conversationActiveRef.current && shouldRetry) {
          const retryDelay = getRetryDelay(event.error);
          setTimeout(() => startListening(), retryDelay);
        }
      };

      recognition.onend = () => {
        console.log('🔇 Speech recognition ended');
        setIsListening(false);
        
        // Restart if conversation is active and not processing
        if (conversationActiveRef.current && !isProcessingRef.current) {
          setTimeout(() => startListening(), 500);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [processSpeech, startListening, handleSpeechRecognitionError, getRetryDelay]);

  // Start conversation
  const startConversation = useCallback(() => {
    if (!avatarState.isReady || !currentAvatar) {
      toast.error('Please wait for avatar to be ready');
      return;
    }

    setIsConversationActive(true);
    startListening();
    toast.success('Conversation started! Start speaking...');
  }, [avatarState.isReady, currentAvatar, startListening]);

  // Stop conversation
  const stopConversation = useCallback(() => {
    setIsConversationActive(false);
    stopListening();
    toast.info('Conversation stopped');
  }, [stopListening]);

  // Handle avatar ready
  const handleAvatarReady = useCallback((avatar: AzureTTSAvatarSDK) => {
    setCurrentAvatar(avatar);
    setAvatarState(prev => ({ ...prev, isReady: true, isActive: true }));
    toast.success('Avatar is ready for conversation!');
  }, []);

  // Handle avatar error
  const handleAvatarError = useCallback((error: Error) => {
    console.error('Avatar error:', error);
    setCurrentAvatar(null);
    stopConversation();
  }, [stopConversation]);

  // Handle avatar speaking completion
  const handleSpeakingComplete = useCallback(() => {
    setIsSpeaking(false);
    console.log('✅ Avatar finished speaking, ready for next input');
    
    // Resume listening if conversation is active
    if (conversationActiveRef.current && !isProcessingRef.current) {
      setTimeout(() => startListening(), 500);
    }
  }, [startListening]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setTranscript('');
    setInterimTranscript('');
    toast.info('Conversation cleared');
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Speech-to-Video Conversation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Have a natural conversation with the AI avatar using your voice
        </p>
      </div>

      {/* Status Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${avatarState.isReady ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm">Avatar: {avatarState.connectionStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm">Microphone: {isListening ? 'Listening' : 'Inactive'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isConversationActive ? (
              <Button
                onClick={startConversation}
                disabled={!avatarState.isReady}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            ) : (
              <Button
                onClick={stopConversation}
                variant="destructive"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Conversation
              </Button>
            )}
            <Button
              onClick={clearConversation}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation Display */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Conversation</h3>
            
            {/* Transcript Display */}
            {(transcript || interimTranscript) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Mic className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300">
                    {transcript || interimTranscript}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Start a conversation to see messages here...
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
                      <div className="flex items-center gap-2 mb-1">
                        {message.role === 'user' ? (
                          <Mic className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                        <span className="font-medium">
                          {message.role === 'user' ? 'You' : 'AI Avatar'}
                        </span>
                      </div>
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing your message...
                    </div>
                  </div>
                </div>
              )}
              {isSpeaking && (
                <div className="flex justify-start">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      AI Avatar is speaking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </Card>

        {/* Video Avatar */}
        <div className="space-y-4">
          <VideoAvatar
            config={avatarConfig}
            onAvatarReady={handleAvatarReady}
            onAvatarError={handleAvatarError}
            onStateChange={(state) => setAvatarState({
              isActive: state.isConnected,
              isConnecting: state.isConnecting,
              connectionStatus: state.connectionStatus,
              error: state.error,
              isReady: state.isConnected
            })}
            onSpeakingComplete={handleSpeakingComplete}
            autoStart={true}
            hideControls={false}
            className="w-full"
          />

          {!isAvailable && (
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Setup Required</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please configure Azure Speech credentials to enable the avatar functionality.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl mb-2">🎤</div>
            <h4 className="font-semibold mb-1">1. Speak</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Your voice is converted to text in real-time
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl mb-2">🤖</div>
            <h4 className="font-semibold mb-1">2. Process</h4>
            <p className="text-gray-600 dark:text-gray-400">
              GPT-4 processes your input with context
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl mb-2">🎭</div>
            <h4 className="font-semibold mb-1">3. Generate</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Azure creates lifelike avatar video
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-3xl mb-2">🔄</div>
            <h4 className="font-semibold mb-1">4. Continue</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically listens for your next input
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
