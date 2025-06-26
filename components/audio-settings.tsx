"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Volume2, VolumeX, Settings } from "lucide-react";
import { toast } from "sonner";

interface AudioSettingsProps {
  isAudioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
  onTTSModelChange?: (model: 'tts-1' | 'tts-1-hd') => void;
  onVoiceChange?: (voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => void;
  ttsModel?: 'tts-1' | 'tts-1-hd';
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  className?: string;
}

export function AudioSettings({ 
  isAudioEnabled, 
  onAudioToggle, 
  onTTSModelChange,
  onVoiceChange,
  ttsModel = 'tts-1',
  voice = 'alloy',
  className = "" 
}: AudioSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Don't close if Select is open
    if (isSelectOpen) {
      console.log('Select is open, not closing dropdown');
      return;
    }
    
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      console.log('Closing dropdown due to click outside');
      setShowSettings(false);
    }
  }, [isSelectOpen]);

  useEffect(() => {
    if (!isSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isSelectOpen, handleClickOutside]);

  const handleAudioToggle = () => {
    onAudioToggle(!isAudioEnabled);
    toast.info(!isAudioEnabled ? "Audio enabled" : "Audio disabled");
  };

  const handleTTSModelChange = (model: string) => {
    console.log('TTS Model change triggered:', model);
    console.log('onTTSModelChange callback exists:', !!onTTSModelChange);
    
    if (onTTSModelChange) {
      console.log('Calling onTTSModelChange with:', model);
      onTTSModelChange(model as 'tts-1' | 'tts-1-hd');
      toast.info(`TTS model changed to ${model === 'tts-1' ? 'Standard' : 'Premium'}`);
    } else {
      console.log('onTTSModelChange callback is not provided');
      toast.error('TTS model change callback not available');
    }
  };

  const handleVoiceChange = (voice: string) => {
    console.log('Voice change triggered:', voice);
    console.log('onVoiceChange callback exists:', !!onVoiceChange);
    
    if (onVoiceChange) {
      console.log('Calling onVoiceChange with:', voice);
      onVoiceChange(voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer');
      toast.info(`Voice changed to ${voice}`);
    } else {
      console.log('onVoiceChange callback is not provided');
      toast.error('Voice change callback not available');
    }
  };

  const testAudio = async () => {
    if (!isAudioEnabled) {
      toast.error("Please enable audio first");
      return;
    }

    try {
      // Use OpenAI TTS for testing
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: "Audio test successful",
          voice: voice,
          model: ttsModel,
          speed: 1.0,
          format: 'mp3'
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          toast.success("Audio test completed");
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          toast.error("Audio test failed");
        };
        
        await audio.play();
      } else {
        toast.error("Audio test failed");
      }
    } catch (error) {
      toast.error("Audio test failed");
      console.error(error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setShowSettings(!showSettings)}
        title="Audio settings"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {showSettings && (
        <div ref={dropdownRef} className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px] z-[60]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Audio Output</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleAudioToggle}
              >
                {isAudioEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            
            {isAudioEnabled && (
              <div className="space-y-2">
                <span className="text-sm font-medium">TTS Quality</span>
                <Select 
                  value={ttsModel} 
                  onValueChange={handleTTSModelChange}
                  onOpenChange={(open) => {
                    console.log('Select open state changing to:', open);
                    setIsSelectOpen(open);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {ttsModel === 'tts-1' ? 'Standard' : 'Premium'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tts-1">
                      <div className="flex items-center gap-2">
                        <span>Standard</span>
                        <span className="text-xs text-gray-500">- Faster, lower cost</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tts-1-hd">
                      <div className="flex items-center gap-2">
                        <span>Premium</span>
                        <span className="text-xs text-gray-500">- Higher quality</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Voice</span>
              <Select 
                value={voice} 
                onValueChange={handleVoiceChange}
                onOpenChange={(open) => {
                  console.log('Select open state changing to:', open);
                  setIsSelectOpen(open);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {voice}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">
                    <div className="flex items-center gap-2">
                      <span><b>Alloy (Male)</b> - Neutral, professional, great for all-purpose use</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="echo">
                    <div className="flex items-center gap-2">
                      <span><b>Echo (Male)</b> - Warm, friendly, conversational tone</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fable">
                    <div className="flex items-center gap-2">
                      <span><b>Fable (Male)</b> - Storyteller vibe, perfect for narration and audiobooks</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="onyx">
                    <div className="flex items-center gap-2">
                      <span><b>Onyx (Male)</b> - Deep, serious, with authority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="nova">
                    <div className="flex items-center gap-2">
                      <span><b>Nova (Female)</b> - Clear, articulate, great for instructions</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="shimmer">
                    <div className="flex items-center gap-2">
                      <span><b>Shimmer (Female)</b> - Light, expressive, upbeat energy</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Test Audio</span>
              <Button
                variant="outline"
                size="sm"
                onClick={testAudio}
                disabled={!isAudioEnabled}
                className="text-xs"
              >
                Test
              </Button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              {isAudioEnabled 
                ? `Audio is enabled with ${voice} voice and ${ttsModel === 'tts-1' ? 'Standard' : 'Premium'} quality. Assistant responses will be read aloud.`
                : "Audio is disabled. Enable to hear assistant responses."
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 