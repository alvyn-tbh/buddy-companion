"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { trackPageView } from "@/lib/analytics";
import { AuthGuard } from '@/components/auth-guard';
import { HeyGenAvatarChat } from '@/components/heygen-avatar-chat';
import { Button } from '@/components/ui/button';
import { Video, MessageSquare } from 'lucide-react';

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

// Corporate-specific voice configuration
const CORPORATE_VOICE_CONFIG = {
  defaultVoice: 'echo' as const, // Professional, clear voice for corporate context
  speed: 0.9, // Slightly slower for better comprehension in professional settings
  autoPlay: true, // Auto-play responses for better user experience
};

export default function Page() {
  const voiceConfig = CORPORATE_VOICE_CONFIG;
  const [showAvatar, setShowAvatar] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [avatarResponse, setAvatarResponse] = useState('');

  useEffect(() => {
    // Track page view for analytics
    trackPageView('corporate_chat');
    
    // Store corporate voice preferences
    localStorage.setItem('corporate_voice', voiceConfig.defaultVoice);
    localStorage.setItem('corporate_voice_speed', voiceConfig.speed.toString());
    
    // Check if HeyGen is configured
    const isHeyGenConfigured = !!process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
    if (!isHeyGenConfigured) {
      setShowAvatar(false);
    }
  }, [voiceConfig]);

  const handleTranscript = (text: string) => {
    setTranscript(text);
  };

  const handleAvatarResponse = (response: string) => {
    setAvatarResponse(response);
  };

  return (
    <AuthGuard redirectTo="/corporate">
      <div className="corporate-chat-container w-full min-h-screen flex flex-col">
        {/* Toggle button for avatar view */}
        <div className="flex justify-end p-4 bg-background border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAvatar(!showAvatar)}
            className="flex items-center gap-2"
          >
            {showAvatar ? (
              <>
                <MessageSquare className="h-4 w-4" />
                Text Chat
              </>
            ) : (
              <>
                <Video className="h-4 w-4" />
                Avatar Chat
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 flex">
          {showAvatar ? (
            // Avatar chat view
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Avatar video section */}
              <div className="lg:w-1/2 p-4">
                <HeyGenAvatarChat
                  className="h-full max-h-[600px]"
                  onTranscript={handleTranscript}
                  onResponse={handleAvatarResponse}
                />
              </div>
              
              {/* Chat history section */}
              <div className="lg:w-1/2 p-4 flex flex-col">
                <div className="flex-1 overflow-auto bg-muted/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Conversation History</h3>
                  
                  {transcript && (
                    <div className="mb-4">
                      <div className="font-medium text-sm text-muted-foreground">You said:</div>
                      <div className="mt-1 p-3 bg-primary/10 rounded-lg">{transcript}</div>
                    </div>
                  )}
                  
                  {avatarResponse && (
                    <div className="mb-4">
                      <div className="font-medium text-sm text-muted-foreground">Avatar response:</div>
                      <div className="mt-1 p-3 bg-secondary/10 rounded-lg">{avatarResponse}</div>
                    </div>
                  )}
                  
                  {!transcript && !avatarResponse && (
                    <p className="text-muted-foreground text-center">
                      Click the microphone button to start speaking
                    </p>
                  )}
                </div>
                
                {/* Instructions */}
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">How to use:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Click the microphone button to start speaking</li>
                    <li>• The avatar will process your speech and respond</li>
                    <li>• Use the controls to mute audio or disable video</li>
                    <li>• Switch to text chat mode using the button above</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            // Traditional text chat view
            <div className="flex-1 py-2 sm:py-4 lg:py-8 px-2 sm:px-6 lg:px-8">
              <Chat 
                api="/api/corporate" 
                chat_url="/corporate/chat" 
                features_url="/corporate/features" 
                how_it_works_url="/corporate/how-it-works"
                ttsConfig={voiceConfig}
              />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
