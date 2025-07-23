'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Video, Mic, Brain, Volume2 } from 'lucide-react';

interface SpeechToVideoStatusProps {
  className?: string;
}

export function SpeechToVideoStatus({ className = '' }: SpeechToVideoStatusProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  useEffect(() => {
    // Check if speech-to-video is active by looking for the avatar video element
    const checkStatus = () => {
      const avatarVideo = document.querySelector('.speech-to-video-avatar');
      setIsActive(!!avatarVideo);
    };

    // Check initially and then every second
    checkStatus();
    const interval = setInterval(checkStatus, 1000);

    // Listen for speech-to-video events from the textarea
    const handleSpeechToVideoEvent = (event: CustomEvent) => {
      const { type, state } = event.detail;
      
      if (type === 'stateChange') {
        if (state.isListening) {
          setCurrentStep('listening');
        } else if (state.isProcessing) {
          setCurrentStep('processing');
        } else if (state.isSpeaking) {
          setCurrentStep('speaking');
        } else {
          setCurrentStep('idle');
        }
      }
    };

    // Add event listener for speech-to-video updates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener('speech-to-video-update' as any, handleSpeechToVideoEvent);

    return () => {
      clearInterval(interval);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.removeEventListener('speech-to-video-update' as any, handleSpeechToVideoEvent);
    };
  }, []);

  if (!isActive) {
    return null;
  }

  const getStepInfo = (step: string) => {
    switch (step) {
      case 'listening':
        return {
          icon: <Mic className="h-4 w-4" />,
          label: 'Listening',
          color: 'bg-blue-500',
          description: 'Waiting for your voice...'
        };
      case 'processing':
        return {
          icon: <Brain className="h-4 w-4" />,
          label: 'Processing',
          color: 'bg-orange-500',
          description: 'AI is thinking...'
        };
      case 'speaking':
        return {
          icon: <Volume2 className="h-4 w-4" />,
          label: 'Speaking',
          color: 'bg-green-500',
          description: 'Avatar is responding...'
        };
      default:
        return {
          icon: <Video className="h-4 w-4" />,
          label: 'Ready',
          color: 'bg-purple-500',
          description: 'Speech-to-video active'
        };
    }
  };

  const stepInfo = getStepInfo(currentStep);

  return (
    <Card className={`p-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${stepInfo.color} text-white`}>
          {stepInfo.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              🎬 Speech-to-Video
            </Badge>
            <Badge variant={currentStep === 'idle' ? 'default' : 'secondary'} className="text-xs">
              {stepInfo.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stepInfo.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default SpeechToVideoStatus; 