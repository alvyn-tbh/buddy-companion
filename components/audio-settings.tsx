"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Settings } from "lucide-react";
import { toast } from "sonner";

interface AudioSettingsProps {
  isAudioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
  className?: string;
}

export function AudioSettings({ isAudioEnabled, onAudioToggle, className = "" }: AudioSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setShowSettings(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAudioToggle = () => {
    onAudioToggle(!isAudioEnabled);
    toast.info(!isAudioEnabled ? "Audio enabled" : "Audio disabled");
  };

  const testAudio = () => {
    if (!isAudioEnabled) {
      toast.error("Please enable audio first");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance("Audio test successful");
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      
      utterance.onend = () => {
        toast.success("Audio test completed");
      };
      
      utterance.onerror = () => {
        toast.error("Audio test failed");
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      toast.error("Audio playback not supported");
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
        <div ref={dropdownRef} className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] z-[60]">
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
                ? "Audio is enabled. Assistant responses will be read aloud."
                : "Audio is disabled. Enable to hear assistant responses."
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 