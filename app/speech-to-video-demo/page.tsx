'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, BookOpen, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

// Dynamically import components with no SSR to prevent hydration mismatches
const SetupStatus = dynamic(() => import('@/components/setup-status'), {
  ssr: false,
  loading: () => (
    <div className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 rounded-lg border text-card-foreground shadow-sm mb-8">
      <div className="flex items-start gap-3">
        <div className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0 rounded-full bg-orange-200 animate-pulse" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
            🔧 Checking Setup Status...
          </h3>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            Verifying environment configuration...
          </div>
        </div>
      </div>
    </div>
  )
});

const SpeechToVideoConversation = dynamic(() => import('@/components/speech-to-video-conversation').then(mod => ({ default: mod.SpeechToVideoConversation })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading conversation interface...</p>
      </div>
    </div>
  )
});

const SpeechToVideoDebug = dynamic(() => import('@/components/speech-to-video-debug'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading debug panel...</p>
      </div>
    </div>
  )
});

export default function SpeechToVideoDemoPage() {
  const [showDebug, setShowDebug] = useState(false);
  
  // Set page title and description for SEO
  useEffect(() => {
    document.title = 'Speech-to-Video Demo | AI Companion';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Experience AI conversations with Azure Text-to-Speech Avatar technology');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="text-sm">
              🎬 Speech-to-Video
            </Badge>
            <Badge variant="outline" className="text-sm">
              Azure Powered
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            AI Avatar Conversation Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience next-generation AI conversations with continuous speech recognition 
            and lifelike avatar responses powered by Azure Text-to-Speech technology.
          </p>
        </div>

        {/* Setup Status */}
        <SetupStatus className="mb-8" />

        {/* Quick Links */}
        <div className="flex justify-center gap-4 mb-8">
          <Link 
            href="/docs/AZURE_TTS_AVATAR_SETUP.md"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Setup Guide
          </Link>
          <Link 
            href="https://github.com/your-repo/speech-to-video"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <Github className="h-4 w-4" />
            Source Code
          </Link>
          <Link 
            href="https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/real-time-synthesis-avatar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Azure Docs
          </Link>
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            Debug Panel
            {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-8">
            <SpeechToVideoDebug />
          </div>
        )}

        {/* Speech-to-Video Conversation Component */}
        <SpeechToVideoConversation className="mb-8" />
      </div>
    </div>
  );
}
