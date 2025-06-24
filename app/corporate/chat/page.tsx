"use client";

import { useEffect, useState } from 'react';
import Chat from "@/components/chat";
import { trackPageView } from "@/lib/analytics";

// Corporate-specific TTS configuration
const CORPORATE_TTS_CONFIG = {
  defaultVoice: 'echo' as const, // Professional, clear voice for corporate context
  speed: 0.9, // Slightly slower for better comprehension in professional settings
  autoPlay: true, // Auto-play responses for better user experience
  defaultModel: 'tts-1' as const, // Standard quality for corporate use
};

export default function Page() {
  const [ttsConfig, setTtsConfig] = useState(CORPORATE_TTS_CONFIG);

  useEffect(() => {
    // Track page view for analytics
    trackPageView('corporate_chat');
    
    // Store corporate TTS preferences
    localStorage.setItem('corporate_tts_voice', ttsConfig.defaultVoice);
    localStorage.setItem('corporate_tts_speed', ttsConfig.speed.toString());
    localStorage.setItem('corporate_tts_model', ttsConfig.defaultModel);
  }, [ttsConfig]);

  return (
    <div className="corporate-chat-container">
      <Chat 
        api="/api/corporate" 
        chat_url="/corporate/chat" 
        features_url="/corporate/features" 
        how_it_works_url="/corporate/how-it-works"
        ttsConfig={ttsConfig}
      />
    </div>
  );
}
