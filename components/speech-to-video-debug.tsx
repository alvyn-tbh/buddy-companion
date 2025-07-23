'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Info } from 'lucide-react';

interface DebugInfo {
  browserSupport: {
    speechRecognition: boolean;
    webRTC: boolean;
    mediaDevices: boolean;
  };
  azureConfig: {
    speechKey: boolean;
    speechRegion: string | null;
  };
  permissions: {
    microphone: string;
  };
  connectionStatus: string;
  errors: string[];
}

interface SpeechToVideoDebugProps {
  isActive: boolean;
  isConnecting: boolean;
  connectionStatus: string;
  error: string | null;
  onRetry?: () => void;
}

export function SpeechToVideoDebug({ 
  isActive, 
  isConnecting, 
  connectionStatus, 
  error,
  onRetry 
}: SpeechToVideoDebugProps) {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    browserSupport: {
      speechRecognition: false,
      webRTC: false,
      mediaDevices: false
    },
    azureConfig: {
      speechKey: false,
      speechRegion: null
    },
    permissions: {
      microphone: 'unknown'
    },
    connectionStatus: 'Not connected',
    errors: []
  });

  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  useEffect(() => {
    checkSystemRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      connectionStatus,
      errors: error ? [error] : []
    }));
  }, [connectionStatus, error]);

  const checkSystemRequirements = async () => {
    const info: DebugInfo = {
      browserSupport: {
        speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        webRTC: 'RTCPeerConnection' in window,
        mediaDevices: 'navigator' in window && 'mediaDevices' in navigator
      },
      azureConfig: {
        speechKey: !!process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY,
        speechRegion: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || null
      },
      permissions: {
        microphone: 'unknown'
      },
      connectionStatus: connectionStatus || 'Not connected',
      errors: error ? [error] : []
    };

    // Check microphone permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        info.permissions.microphone = 'granted';
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        info.permissions.microphone = 'denied';
        console.error('Microphone permission denied:', err);
      }
    }

    setDebugInfo(info);
  };

  const requestMicrophonePermission = async () => {
    setIsCheckingPermissions(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setDebugInfo(prev => ({
        ...prev,
        permissions: { ...prev.permissions, microphone: 'granted' }
      }));
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setDebugInfo(prev => ({
        ...prev,
        permissions: { ...prev.permissions, microphone: 'denied' }
      }));
      console.error('Microphone permission denied:', err);
    }
    setIsCheckingPermissions(false);
  };

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      );
    }
    
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    if (isConnecting) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Connecting...</Badge>;
    }
    if (isActive) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>;
    }
    if (error) {
      return <Badge variant="outline" className="bg-red-50 text-red-700">Error</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-700">Inactive</Badge>;
  };

  const allRequirementsMet = debugInfo.browserSupport.speechRecognition && 
                             debugInfo.browserSupport.webRTC && 
                             debugInfo.browserSupport.mediaDevices &&
                             debugInfo.azureConfig.speechKey &&
                             debugInfo.azureConfig.speechRegion &&
                             debugInfo.permissions.microphone === 'granted';

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Avatar Status</h3>
            {getStatusBadge()}
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isConnecting}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          )}
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Connection Status</h4>
          <div className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">{connectionStatus || 'Not connected'}</span>
          </div>
        </div>

        {/* Browser Support */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Browser Support</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Speech Recognition</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.browserSupport.speechRecognition)}
                <span className="text-xs text-gray-500">
                  {debugInfo.browserSupport.speechRecognition ? 'Supported' : 'Not supported'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">WebRTC</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.browserSupport.webRTC)}
                <span className="text-xs text-gray-500">
                  {debugInfo.browserSupport.webRTC ? 'Supported' : 'Not supported'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Media Devices</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.browserSupport.mediaDevices)}
                <span className="text-xs text-gray-500">
                  {debugInfo.browserSupport.mediaDevices ? 'Supported' : 'Not supported'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Azure Configuration */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Azure Configuration</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Speech Key</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.azureConfig.speechKey)}
                <span className="text-xs text-gray-500">
                  {debugInfo.azureConfig.speechKey ? 'Configured' : 'Missing'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Speech Region</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(!!debugInfo.azureConfig.speechRegion)}
                <span className="text-xs text-gray-500">
                  {debugInfo.azureConfig.speechRegion || 'Missing'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Permissions</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm">Microphone Access</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.permissions.microphone)}
              <span className="text-xs text-gray-500 capitalize">
                {debugInfo.permissions.microphone}
              </span>
              {debugInfo.permissions.microphone === 'denied' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestMicrophonePermission}
                  disabled={isCheckingPermissions}
                >
                  {isCheckingPermissions ? 'Checking...' : 'Request'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Errors */}
        {debugInfo.errors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-red-700 dark:text-red-300">Errors</h4>
            <div className="space-y-2">
              {debugInfo.errors.map((err, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300">{err}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        {!allRequirementsMet && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-yellow-700 dark:text-yellow-300">Troubleshooting</h4>
            <div className="space-y-2 text-sm">
              {!debugInfo.browserSupport.speechRecognition && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-700 dark:text-yellow-300">
                    Speech recognition requires Chrome, Edge, or Safari browser.
                  </span>
                </div>
              )}
              {!debugInfo.azureConfig.speechKey && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-700 dark:text-yellow-300">
                    Set NEXT_PUBLIC_AZURE_SPEECH_KEY in your environment variables.
                  </span>
                </div>
              )}
              {!debugInfo.azureConfig.speechRegion && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-700 dark:text-yellow-300">
                    Set NEXT_PUBLIC_AZURE_SPEECH_REGION in your environment variables.
                  </span>
                </div>
              )}
              {debugInfo.permissions.microphone === 'denied' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-700 dark:text-yellow-300">
                    Microphone access is required for speech-to-video conversations.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 