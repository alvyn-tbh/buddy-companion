"use client";

import { useEffect } from 'react';
import Chat from "@/components/chat";
import { trackPageView } from "@/lib/analytics";
import { AuthGuard } from '@/components/auth-guard';

// Corporate-specific voice configuration
const CORPORATE_VOICE_CONFIG = {
  defaultVoice: 'echo' as const, // Professional, clear voice for corporate context
  speed: 0.9, // Slightly slower for better comprehension in professional settings
  autoPlay: true, // Auto-play responses for better user experience
};

export default function Page() {
  const voiceConfig = CORPORATE_VOICE_CONFIG;

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
        <Chat 
          api="/api/corporate" 
          chat_url="/corporate/chat" 
          features_url="/corporate/features" 
          how_it_works_url="/corporate/how-it-works"
          ttsConfig={voiceConfig}
        />
      </div>
    </AuthGuard>
  );
}
