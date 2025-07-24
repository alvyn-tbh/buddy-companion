'use client';

import React, { useState, useRef, useCallback } from 'react';
import { AzureAvatarService, AVATAR_CHARACTERS, AVATAR_BACKGROUNDS } from '@/lib/azure-avatar-service';
import { AvatarSelector } from '@/components/avatar-selector';
import { AvatarStream } from '@/components/avatar-stream';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Settings,
  Video,
  MessageSquare,
  Sparkles,
  Info,
  Send,
  Loader2
} from 'lucide-react';

export default function AvatarDemoPage() {
  // Avatar configuration state
  const [selectedCharacter, setSelectedCharacter] = useState<keyof typeof AVATAR_CHARACTERS>('lisa');
  const [selectedStyle, setSelectedStyle] = useState('casual-sitting');
  const [selectedBackground, setSelectedBackground] = useState<keyof typeof AVATAR_BACKGROUNDS>('gradient');
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  
  // Service state
  const avatarServiceRef = useRef<AzureAvatarService | null>(null);
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  
  // Text-to-speech state
  const [ttsText, setTtsText] = useState('Hello! I am your AI avatar assistant. I can help you with various tasks and provide information in a more engaging and interactive way.');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize avatar service
  const initializeService = useCallback(() => {
    const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      toast.error('Azure Speech credentials not configured. Please set environment variables.');
      return;
    }

    avatarServiceRef.current = new AzureAvatarService({
      speechKey,
      speechRegion,
      avatarCharacter: selectedCharacter,
      avatarStyle: selectedStyle,
      voice: selectedVoice,
      background: selectedBackground,
      enableEmotions: true,
      streamingMode: true
    });

    setIsServiceInitialized(true);
    toast.success('Avatar service initialized successfully');
  }, [selectedCharacter, selectedStyle, selectedVoice, selectedBackground]);

  // Handle configuration changes
  const handleCharacterChange = (character: keyof typeof AVATAR_CHARACTERS) => {
    setSelectedCharacter(character);
    // Reset style to first supported style for new character
    setSelectedStyle(AVATAR_CHARACTERS[character].supportedStyles[0]);
    
    if (avatarServiceRef.current) {
      avatarServiceRef.current.changeAvatar(character, AVATAR_CHARACTERS[character].supportedStyles[0]);
    }
  };

  const handleBackgroundChange = (background: keyof typeof AVATAR_BACKGROUNDS) => {
    setSelectedBackground(background);
    
    if (avatarServiceRef.current) {
      avatarServiceRef.current.changeBackground(background);
    }
  };

  // Handle text-to-speech
  const handleSpeak = async () => {
    if (!avatarServiceRef.current || !avatarServiceRef.current.isReady()) {
      toast.error('Please start the avatar stream first');
      return;
    }

    if (!ttsText.trim()) {
      toast.error('Please enter some text to speak');
      return;
    }

    setIsSpeaking(true);
    try {
      await avatarServiceRef.current.speak({
        text: ttsText,
        emotion: 'neutral'
      });
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to speak text');
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Avatar Integration Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Experience real-time AI avatars with Azure Speech Services
        </p>
      </div>

      {/* Environment Check */}
      {(!process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || !process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Azure Speech credentials not found. Please configure your environment variables to enable avatar features.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="stream" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Live Stream
          </TabsTrigger>
          <TabsTrigger value="interact" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Interact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <div className="space-y-4">
              <AvatarSelector
                selectedCharacter={selectedCharacter}
                selectedStyle={selectedStyle}
                selectedBackground={selectedBackground}
                selectedVoice={selectedVoice}
                onCharacterChange={handleCharacterChange}
                onStyleChange={setSelectedStyle}
                onBackgroundChange={handleBackgroundChange}
                onVoiceChange={setSelectedVoice}
              />

              {/* Initialize Button */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Service Status</h3>
                    <p className="text-sm text-gray-500">
                      {isServiceInitialized ? 'Avatar service is ready' : 'Click to initialize service'}
                    </p>
                  </div>
                  <Button
                    onClick={initializeService}
                    disabled={isServiceInitialized}
                    variant={isServiceInitialized ? 'outline' : 'default'}
                  >
                    {isServiceInitialized ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Initialized
                      </>
                    ) : (
                      'Initialize Service'
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">Phase 1</Badge>
                    <div>
                      <div className="font-medium">Avatar Integration</div>
                      <div className="text-sm text-gray-500">
                        Azure Avatar service with character selection and video playback
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">Phase 1</Badge>
                    <div>
                      <div className="font-medium">Audio/Video Sync</div>
                      <div className="text-sm text-gray-500">
                        Perfect synchronization between avatar speech and video
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1" variant="secondary">Phase 2</Badge>
                    <div>
                      <div className="font-medium">Real-time Streaming</div>
                      <div className="text-sm text-gray-500">
                        Live avatar streaming with WebRTC support
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1" variant="secondary">Phase 2</Badge>
                    <div>
                      <div className="font-medium">Custom Backgrounds</div>
                      <div className="text-sm text-gray-500">
                        Choose from predefined or custom backgrounds
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1" variant="secondary">Phase 2</Badge>
                    <div>
                      <div className="font-medium">Emotion Mapping</div>
                      <div className="text-sm text-gray-500">
                        Avatar expressions based on conversation context
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Optimizations</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Hardware-accelerated video rendering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Efficient WebRTC streaming</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Adaptive bitrate streaming</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Low-latency audio processing</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stream" className="space-y-6">
          {isServiceInitialized && avatarServiceRef.current ? (
            <div className="max-w-4xl mx-auto">
              <AvatarStream
                avatarService={avatarServiceRef.current}
                enableEmotions={true}
                onStreamReady={(stream) => {
                  console.log('Stream ready:', stream);
                  toast.success('Avatar stream is ready');
                }}
                onStreamError={(error) => {
                  console.error('Stream error:', error);
                  toast.error(`Stream error: ${error.message}`);
                }}
              />
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Service Not Initialized</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please go to the Setup tab and initialize the avatar service first.
              </p>
              <Button onClick={() => setActiveTab('setup')}>
                Go to Setup
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interact" className="space-y-6">
          {isServiceInitialized && avatarServiceRef.current ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Text to Speech */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Text to Speech</h3>
                <div className="space-y-4">
                  <Textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Enter text for the avatar to speak..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {ttsText.length} characters
                    </div>
                    <Button
                      onClick={handleSpeak}
                      disabled={isSpeaking || !ttsText.trim()}
                    >
                      {isSpeaking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Speaking...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Speak
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Phrases */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Phrases</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Welcome to our presentation!',
                    'Let me explain this concept.',
                    'Do you have any questions?',
                    'That\'s a great point!',
                    'Thank you for your attention.',
                    'Let\'s move on to the next topic.'
                  ].map((phrase) => (
                    <Button
                      key={phrase}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTtsText(phrase);
                        handleSpeak();
                      }}
                      disabled={isSpeaking}
                    >
                      {phrase}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Service Not Initialized</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please go to the Setup tab and initialize the avatar service first.
              </p>
              <Button onClick={() => setActiveTab('setup')}>
                Go to Setup
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}