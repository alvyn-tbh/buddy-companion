"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Settings } from "lucide-react";
import { toast } from "sonner";
import { VoiceAvatarGrid } from "./voice-avatar";

interface AudioSettingsProps {
  isAudioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
  onVoiceChange?: (voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => void;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  className?: string;
}

export function AudioSettings({
  isAudioEnabled,
  onAudioToggle,
  onVoiceChange,
  voice = 'alloy',
  className = ""
}: AudioSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      console.log('Closing dropdown due to click outside');
      setShowSettings(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleAudioToggle = () => {
    onAudioToggle(!isAudioEnabled);
    toast.info(!isAudioEnabled ? "Audio enabled" : "Audio disabled");
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

            <div className="space-y-2">
              <span className="text-sm font-medium">Voice Avatar</span>
              <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                <VoiceAvatarGrid
                  selectedVoice={voice}
                  onVoiceSelect={(selectedVoice) => {
                    handleVoiceChange(selectedVoice);
                  }}
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              {isAudioEnabled
                ? `Audio is enabled with ${voice} voice avatar. Voice interactions will use this avatar.`
                : "Audio is disabled. Enable to use voice interactions."
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 