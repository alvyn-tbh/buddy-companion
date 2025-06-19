"use client";

import { useEffect } from 'react';
import Chat from "@/components/chat";
import { trackPageView } from "@/lib/analytics";

export default function Page() {
  useEffect(() => {
    // Track page view for analytics
    trackPageView('corporate_chat');
  }, []);

  return <Chat api="/api/corporate" chat_url="/corporate/chat" features_url="/corporate/features" how_it_works_url="/corporate/how-it-works" />;
}
