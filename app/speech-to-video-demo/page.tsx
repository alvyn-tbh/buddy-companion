'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SpeechToVideoExample } from '@/components/speech-to-video-example';
import { Card } from '@/components/ui/card';

// Dynamically import SetupStatus with no SSR to prevent hydration mismatches
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
import { Badge } from '@/components/ui/badge';
import { Github, ExternalLink, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function SpeechToVideoDemoPage() {
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
            AI Avatar Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience next-generation AI conversations with lifelike avatars powered by 
            Azure Text-to-Speech technology and real-time voice interaction.
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
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🎯</div>
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              How Speech-to-Video Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">1</div>
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">🎤 You Speak</div>
                <div className="text-blue-700 dark:text-blue-300">Your speech is converted to text using browser speech recognition</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">2</div>
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">🧠 AI Processes</div>
                <div className="text-blue-700 dark:text-blue-300">Text is sent to GPT with corporate wellness system prompt</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">3</div>
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">🎬 Avatar Responds</div>
                <div className="text-blue-700 dark:text-blue-300">AI response is converted to lifelike video using Azure TTS Avatar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Component */}
        <SpeechToVideoExample className="mb-8" />

        {/* Technology Stack */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl mb-2">☁️</div>
              <h3 className="font-semibold">Azure Speech</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Text-to-Speech Avatar API
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl mb-2">⚛️</div>
              <h3 className="font-semibold">React</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Custom hooks & state management
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl mb-2">🎭</div>
              <h3 className="font-semibold">AI Avatars</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lifelike video responses
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-3xl mb-2">🎤</div>
              <h3 className="font-semibold">WebRTC</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time audio processing
              </p>
            </div>
          </div>
        </Card>

        {/* Features Overview */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Avatar Generation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate lifelike video responses with synchronized lip movements
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Multiple Avatar Characters</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose from various avatar characters and presentation styles
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Advanced State Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprehensive state tracking with real-time status updates
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">Neural Voice Synthesis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    High-quality neural voices with natural intonation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold">Error Recovery</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Robust error handling with automatic retry mechanisms
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  6
                </div>
                <div>
                  <h3 className="font-semibold">Context Provider</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Global state management for seamless integration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 