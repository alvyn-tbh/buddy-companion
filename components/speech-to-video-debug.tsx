'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AzureTTSAvatarSDK } from '@/lib/azure-tts-avatar-sdk';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DebugStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  timestamp?: Date;
}

export function SpeechToVideoDebug() {
  const [debugSteps, setDebugSteps] = useState<DebugStep[]>([
    { name: 'Environment Variables Check', status: 'pending' },
    { name: 'Azure SDK Loading', status: 'pending' },
    { name: 'Azure Credentials Validation', status: 'pending' },
    { name: 'Avatar Instance Creation', status: 'pending' },
    { name: 'Video Element Setup', status: 'pending' },
    { name: 'Avatar Connection', status: 'pending' },
    { name: 'Test Speech Synthesis', status: 'pending' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateStep = (stepName: string, status: DebugStep['status'], message?: string) => {
    setDebugSteps(prev => prev.map(step => 
      step.name === stepName 
        ? { ...step, status, message, timestamp: new Date() }
        : step
    ));
    addLog(`${stepName}: ${status}${message ? ` - ${message}` : ''}`);
  };

  const runDebugTest = async () => {
    setIsRunning(true);
    setLogs([]);
    
    // Reset all steps
    setDebugSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));

    try {
      // Step 1: Check environment variables
      updateStep('Environment Variables Check', 'running');
      const envCheck = {
        speechKey: !!process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY,
        speechRegion: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || null
      };
      
      if (!envCheck.speechKey || !envCheck.speechRegion) {
        updateStep('Environment Variables Check', 'error', 
          `Missing: ${!envCheck.speechKey ? 'SPEECH_KEY ' : ''}${!envCheck.speechRegion ? 'SPEECH_REGION' : ''}`
        );
        return;
      }
      
      updateStep('Environment Variables Check', 'success', 
        `Region: ${envCheck.speechRegion}, Key: ${envCheck.speechKey ? 'Present' : 'Missing'}`
      );

      // Step 2: Load Azure SDK
      updateStep('Azure SDK Loading', 'running');
      
      // Create a test script element to check SDK loading
      const testScriptLoad = () => {
        return new Promise<void>((resolve, reject) => {
          if (window.SpeechSDK) {
            resolve();
            return;
          }
          
          const script = document.createElement('script');
          script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
          script.async = true;
          
          const timeout = setTimeout(() => {
            document.head.removeChild(script);
            reject(new Error('SDK load timeout'));
          }, 10000);
          
          script.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          script.onerror = (error) => {
            clearTimeout(timeout);
            document.head.removeChild(script);
            reject(error);
          };
          
          document.head.appendChild(script);
        });
      };

      try {
        await testScriptLoad();
        updateStep('Azure SDK Loading', 'success', 'SDK loaded successfully');
      } catch (error) {
        updateStep('Azure SDK Loading', 'error', `Failed to load SDK: ${error}`);
        return;
      }

      // Step 3: Validate Azure credentials
      updateStep('Azure Credentials Validation', 'running');
      
      try {
        const response = await fetch(
          `https://${envCheck.speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
          {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '',
              'Content-type': 'application/x-www-form-urlencoded',
              'Content-Length': '0'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        updateStep('Azure Credentials Validation', 'success', 'Credentials valid');
      } catch (error) {
        updateStep('Azure Credentials Validation', 'error', 
          `Invalid credentials or network error: ${error}`
        );
        return;
      }

      // Step 4: Create avatar instance
      updateStep('Avatar Instance Creation', 'running');
      
      let avatar: AzureTTSAvatarSDK | null = null;
      try {
        avatar = new AzureTTSAvatarSDK({
          speechKey: process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '',
          speechRegion: envCheck.speechRegion || '',
          avatarCharacter: 'lisa',
          avatarStyle: 'casual-sitting',
          voice: 'en-US-JennyNeural'
        });
        
        updateStep('Avatar Instance Creation', 'success', 'Avatar instance created');
      } catch (error) {
        updateStep('Avatar Instance Creation', 'error', `Failed to create instance: ${error}`);
        return;
      }

      // Step 5: Setup video element
      updateStep('Video Element Setup', 'running');
      
      const videoElement = document.createElement('video');
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      
      const videoContainer = document.getElementById('debug-video-container');
      if (videoContainer) {
        videoContainer.innerHTML = '';
        videoContainer.appendChild(videoElement);
        updateStep('Video Element Setup', 'success', 'Video element ready');
      } else {
        updateStep('Video Element Setup', 'error', 'Video container not found');
        return;
      }

      // Step 6: Connect avatar
      updateStep('Avatar Connection', 'running');
      
      try {
        await avatar.initialize(videoElement);
        updateStep('Avatar Connection', 'success', 'Avatar connected');
      } catch (error) {
        updateStep('Avatar Connection', 'error', `Connection failed: ${error}`);
        return;
      }

      // Step 7: Test speech
      updateStep('Test Speech Synthesis', 'running');
      
      try {
        await avatar.speakText('Hello! This is a test of the Azure Text to Speech Avatar system.');
        updateStep('Test Speech Synthesis', 'success', 'Speech synthesis working');
      } catch (error) {
        updateStep('Test Speech Synthesis', 'error', `Speech failed: ${error}`);
      }

      // Cleanup
      setTimeout(() => {
        avatar?.disconnect();
      }, 10000);

    } catch (error) {
      addLog(`Unexpected error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DebugStep['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DebugStep['status']) => {
    const variants: Record<DebugStep['status'], 'outline' | 'default' | 'secondary' | 'destructive'> = {
      pending: 'outline',
      running: 'default',
      success: 'secondary',
      error: 'destructive'
    };
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  // Console log interceptor
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('[Azure Avatar SDK]') || message.includes('[VideoAvatar]')) {
        addLog(`LOG: ${message}`);
      }
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('[Azure Avatar SDK]') || message.includes('[VideoAvatar]')) {
        addLog(`ERROR: ${message}`);
      }
      originalError(...args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('[Azure Avatar SDK]') || message.includes('[VideoAvatar]')) {
        addLog(`WARN: ${message}`);
      }
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Speech-to-Video Debug Panel</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Test each component of the Speech-to-Video system
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={runDebugTest}
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Debug Test...
              </>
            ) : (
              'Run Debug Test'
            )}
          </Button>
        </div>

        {/* Debug Steps */}
        <div className="space-y-2">
          <h3 className="font-semibold">Debug Steps:</h3>
          {debugSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(step.status)}
                <span className="font-medium">{step.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(step.status)}
                {step.timestamp && (
                  <span className="text-xs text-gray-500">
                    {step.timestamp.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Video Container */}
        <div className="space-y-2">
          <h3 className="font-semibold">Video Output:</h3>
          <div
            id="debug-video-container"
            className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-center h-full text-gray-400">
              Video will appear here during testing
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="space-y-2">
          <h3 className="font-semibold">Debug Logs:</h3>
          <div className="h-64 overflow-y-auto bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Run the debug test to see logs.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Step Details */}
        {debugSteps.some(step => step.message) && (
          <div className="space-y-2">
            <h3 className="font-semibold">Step Details:</h3>
            <div className="space-y-2">
              {debugSteps.filter(step => step.message).map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    step.status === 'error' 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  <strong>{step.name}:</strong> {step.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default SpeechToVideoDebug; 