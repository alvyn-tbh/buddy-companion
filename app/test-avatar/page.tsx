'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Global window types are declared in azure-avatar-service.ts

export default function TestAvatarPage() {
  const [status, setStatus] = useState('Not started');
  const [logs, setLogs] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const loadSpeechSDK = async () => {
    // Ensure WebRTC compatibility is applied before loading SDK
    await import('@/lib/webrtc-compatibility');
    
    return new Promise<void>((resolve, reject) => {
      if (window.SpeechSDK) {
        addLog('✅ Speech SDK already loaded');
        // WebRTC compatibility is already applied via the import
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
      script.async = true;

      script.onload = () => {
        addLog('✅ Speech SDK loaded successfully');
        // WebRTC compatibility is already applied via the import
        
        if (window.SpeechSDK) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sdkAny = window.SpeechSDK as any;
          addLog(`SDK Version: ${sdkAny.SDK_VERSION || 'Unknown'}`);
          addLog(`Available APIs: ${Object.keys(window.SpeechSDK).join(', ')}`);
        }
        resolve();
      };

      script.onerror = () => {
        addLog('❌ Failed to load Speech SDK');
        reject(new Error('Failed to load SDK'));
      };

      document.head.appendChild(script);
    });
  };

  const testBasicTTS = async () => {
    try {
      setIsLoading(true);
      setStatus('Testing basic TTS...');
      addLog('🎤 Starting basic TTS test...');

      // Load SDK
      await loadSpeechSDK();

      // Get credentials
      const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
      const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

      if (!speechKey || !speechRegion) {
        throw new Error('Missing Azure credentials');
      }

      addLog(`📍 Using region: ${speechRegion}`);

      // Create speech config
      const speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
      speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
      
      addLog('✅ Speech config created');

      // Create synthesizer
      const synthesizer = new window.SpeechSDK.SpeechSynthesizer(speechConfig);
      
      addLog('✅ Synthesizer created');

      // Synthesize speech
      synthesizer.speakTextAsync(
        'Hello! This is a test of Azure Text to Speech.',
        () => {
          addLog('✅ TTS successful!');
          synthesizer.close();
          setStatus('Basic TTS working!');
        },
        (error: string) => {
          addLog(`❌ TTS error: ${error}`);
          synthesizer.close();
          setStatus('TTS failed');
        }
      );

    } catch (error) {
      addLog(`❌ Error: ${error}`);
      setStatus('Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testAvatarAPI = async () => {
    try {
      setIsLoading(true);
      setStatus('Testing Avatar API...');
      addLog('🎭 Starting Avatar API test...');

      // Load SDK
      await loadSpeechSDK();

      // Check for Avatar APIs
      const hasAvatarConfig = !!window.SpeechSDK?.AvatarConfig;
      const hasAvatarSynthesizer = !!window.SpeechSDK?.AvatarSynthesizer;
      
      addLog(`AvatarConfig available: ${hasAvatarConfig}`);
      addLog(`AvatarSynthesizer available: ${hasAvatarSynthesizer}`);

      if (!hasAvatarConfig || !hasAvatarSynthesizer) {
        addLog('⚠️ Avatar APIs not found in current SDK');
        addLog('📦 Available SDK classes:');
        Object.keys(window.SpeechSDK).forEach(key => {
          if (typeof window.SpeechSDK[key] === 'function') {
            addLog(`  - ${key}`);
          }
        });
        setStatus('Avatar API not available');
        return;
      }

      // Get credentials
      const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
      const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

      if (!speechKey || !speechRegion) {
        throw new Error('Missing Azure credentials');
      }

      // Create speech config
      const speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
      speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
      
      addLog('✅ Speech config created');

      // Create avatar config
      const avatarConfig = new window.SpeechSDK.AvatarConfig('lisa', 'casual-sitting');
      
      addLog('✅ Avatar config created');

      // Create avatar synthesizer
      const avatarSynthesizer = new window.SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);
      
      addLog('✅ Avatar synthesizer created');

      // Start avatar
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      avatarSynthesizer.startAvatarAsync(
        videoRef.current,
        () => {
          addLog('✅ Avatar started successfully!');
          setStatus('Avatar connected!');
          
          // Test speech
          avatarSynthesizer.speakTextAsync(
            'Hello! I am an Azure AI Avatar.',
            () => {
              addLog('✅ Avatar speech successful!');
            },
            (error: string) => {
              addLog(`❌ Avatar speech error: ${error}`);
            }
          );
        },
        (error: string) => {
          addLog(`❌ Avatar start error: ${error}`);
          setStatus('Avatar failed to start');
        }
      );

    } catch (error) {
      addLog(`❌ Error: ${error}`);
      setStatus('Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Azure Avatar API Test</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex gap-4 mb-4">
          <Button onClick={testBasicTTS} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Basic TTS
          </Button>
          <Button onClick={testAvatarAPI} disabled={isLoading} variant="outline">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Avatar API
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <Badge variant={status.includes('working') || status.includes('connected') ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Video Output</h2>
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
        <div className="h-64 overflow-y-auto bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Click a test button to start.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="mt-6 text-sm text-gray-600">
        <p>Environment:</p>
        <ul className="ml-4">
          <li>Region: {process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || 'Not set'}</li>
          <li>Key: {process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY ? 'Set' : 'Not set'}</li>
        </ul>
      </div>
    </div>
  );
}
