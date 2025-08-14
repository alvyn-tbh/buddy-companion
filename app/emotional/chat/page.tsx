"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { trackPageView } from "@/lib/analytics";
import { AuthGuard } from '@/components/auth-guard';
import { Video, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emotional } from '@/lib/intro-prompt';

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

// Emotional-specific voice configuration
const EMOTIONAL_VOICE_CONFIG = {
    defaultVoice: 'shimmer' as const, // Softer, gentle voice for emotional context
    speed: 0.95, // Calm pacing
    autoPlay: true,
};

export default function Page() {
    const voiceConfig = EMOTIONAL_VOICE_CONFIG;
    const [chatMode, setChatMode] = useState<'text' | 'avatar'>('text');

    useEffect(() => {
        // Track page view for analytics
        trackPageView('emotional_chat');

        // Store emotional voice preferences
        localStorage.setItem('emotional_voice', voiceConfig.defaultVoice);
        localStorage.setItem('emotional_voice_speed', voiceConfig.speed.toString());
    }, [voiceConfig]);

    return (
        <AuthGuard redirectTo="/emotional">
            <div className="emotional-chat-container w-full min-h-screen flex flex-col py-2 sm:py-4 lg:py-8 px-2 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold mb-2">Emotional Chat</h1>
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
                                api="/api/emotional"
                                chat_url="/emotional/chat"
                                features_url="/emotional/features"
                                how_it_works_url="/emotional/how-it-works"
                                ttsConfig={voiceConfig}
                                introMessage={emotional}
                title="Buddy AI | Emotional Wellness"
                                hideVoiceModeButton
                            />
                        </TabsContent>

                        <TabsContent value="avatar" className="mt-4">
                            <InteractiveAvatar />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthGuard>
    );
}
