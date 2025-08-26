"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { trackPageView } from "@/lib/analytics";
import { AuthGuard } from '@/components/auth-guard';
import { Video, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { corporate } from '@/lib/intro-prompt';

// Dynamic import of Chat component to reduce initial bundle size
const Chat = dynamic(() => import('@/components/chat'), {
  loading: () => (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading chat interface...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for chat component to prevent hydration issues
});

// Dynamic import of InteractiveAvatar component (return the component directly)
const InteractiveAvatar = dynamic(
  () => import('@/components/heygen/InteractiveAvatar').then((m) => m.default),
  {
    loading: () => (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading avatar interface...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Corporate-specific voice configuration
const CORPORATE_VOICE_CONFIG = {
  defaultVoice: 'echo' as const, // Professional, clear voice for corporate context
  speed: 0.9, // Slightly slower for better comprehension in professional settings
  autoPlay: true, // Auto-play responses for better user experience
};

export default function Page() {
  const voiceConfig = CORPORATE_VOICE_CONFIG;
  const [chatMode, setChatMode] = useState<'text' | 'avatar'>('text');

  useEffect(() => {
    // Track page view for analytics
    trackPageView('corporate_chat');

    // Store corporate voice preferences
    localStorage.setItem('corporate_voice', voiceConfig.defaultVoice);
    localStorage.setItem('corporate_voice_speed', voiceConfig.speed.toString());
  }, [voiceConfig]);

  return (
    <AuthGuard redirectTo="/corporate">
      <div className="corporate-chat-container w-full min-h-screen flex flex-col py-2 sm:py-4 lg:py-8 px-2 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Corporate Chat</h1>
          <p className="text-muted-foreground mb-4">
            Choose between text-based chat or interact with our AI avatar
          </p>

          <Tabs value={chatMode} onValueChange={(value) => setChatMode(value as 'text' | 'avatar')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Text Chat
              </TabsTrigger>
              <TabsTrigger value="avatar" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Avatar Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <Chat
                api="/api/corporate"
                chat_url="/corporate/chat"
                features_url="/corporate/features"
                how_it_works_url="/corporate/how-it-works"
                ttsConfig={voiceConfig}
                introMessage={corporate}
              />
            </TabsContent>

            <TabsContent value="avatar" className="mt-4">
              <InteractiveAvatar initialMessage={"hi! my name is corporate wellness, and here is how i can be useful: I can help with workplace stress, burnout, decision fatigue, communication, and focus. Ask me for quick grounding exercises, meeting prep, feedback practice, or structured problem-solving. I’ll keep things calm, practical, and supportive."} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
