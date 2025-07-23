'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cpu,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Github,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import components
const SpeechToVideoConversationOptimized = dynamic(
  () => import('@/components/speech-to-video-conversation-optimized'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading optimized interface...</p>
        </div>
      </div>
    )
  }
);

const SetupStatus = dynamic(() => import('@/components/setup-status'), {
  ssr: false
});

export default function SpeechToVideoOptimizedPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'Optimized Speech-to-Video | AI Companion';
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="default" className="gap-1">
              <Zap className="h-3 w-3" />
              Optimized Version
            </Badge>
            <Badge variant="secondary">Real-time Ready</Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Speech-to-Video AI Assistant (Optimized)
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience lightning-fast AI conversations with our optimized implementation. 
            Instant startup, seamless fallbacks, and real-time performance.
          </p>
        </div>

        {/* Performance Improvements */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-blue-600" />
            Performance Optimizations
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Instant Startup
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    SDK preloading and fast initialization gets you talking in seconds, not minutes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Progressive Enhancement
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    TTS available immediately while avatar loads in background
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    Smart Fallbacks
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Automatic fallback to browser TTS if Azure services are unavailable
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Performance Comparison</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Initial Connection Time</span>
                <div className="flex gap-4">
                  <span className="text-red-600">Before: ~30s</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="text-green-600 font-semibold">After: ~2-3s</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time to First Speech</span>
                <div className="flex gap-4">
                  <span className="text-red-600">Before: 30s+</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="text-green-600 font-semibold">After: Instant</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avatar Availability</span>
                <div className="flex gap-4">
                  <span className="text-orange-600">Before: Blocking</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="text-green-600 font-semibold">After: Progressive</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Setup Status */}
        <SetupStatus className="mb-8" />

        {/* Main Demo Tabs */}
        <Tabs defaultValue="demo" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-4">
            <SpeechToVideoConversationOptimized />
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Click &quot;Start Conversation&quot; and begin speaking immediately. 
                The AI will respond using TTS while the avatar loads in the background.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Instant Availability</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      No more waiting for avatar connections. Start conversations immediately with TTS 
                      while the visual avatar loads seamlessly in the background.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Smart Mode Switching</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Automatically switches between Avatar, TTS, and browser fallback modes based on 
                      availability and performance requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Cpu className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Optimized Resource Loading</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      SDK preloading, connection pooling, and lazy initialization ensure minimal 
                      startup time and efficient resource usage.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Technical Implementation</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Architecture Improvements</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>SDK preloading on module import for faster initialization</li>
                    <li>Non-blocking avatar connection with immediate TTS availability</li>
                    <li>Progressive enhancement from TTS to full avatar mode</li>
                    <li>Intelligent fallback chain: Avatar → Azure TTS → Browser TTS</li>
                    <li>Optimized connection timeouts and retry logic</li>
                    <li>Request queuing for smooth conversation flow</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Code Structure</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 font-mono text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      <div>• /lib/azure-tts-avatar-sdk-optimized.ts</div>
                      <div>• /lib/speech-to-video-service-optimized.ts</div>
                      <div>• /lib/hooks/use-speech-to-video-optimized.tsx</div>
                      <div>• /components/speech-to-video-conversation-optimized.tsx</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Link 
                    href="https://github.com/jacob-ai-bot/new-empty-project"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    View Source
                  </Link>
                  <Link 
                    href="/docs/SPEECH_TO_VIDEO_OPTIMIZATION.md"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    Read Documentation
                  </Link>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
