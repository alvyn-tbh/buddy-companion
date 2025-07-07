"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { VoiceAvatarGrid, VoiceAvatarWithInfo } from "./voice-avatar";
import { toast } from "sonner";

interface VoicePickerProps {
  selectedVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  onVoiceSelect: (voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => void;
  title?: string;
  description?: string;
  className?: string;
  showTestButton?: boolean;
}

export function VoicePicker({ 
  selectedVoice, 
  onVoiceSelect, 
  title = "Choose Your Voice",
  description = "Select a voice that matches your preference",
  className = "",
  showTestButton = true
}: VoicePickerProps) {
  const [isTesting, setIsTesting] = useState(false);

  const testVoice = async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Hello! I'm ${selectedVoice}. This is how I sound.`,
          voice: selectedVoice,
          model: 'tts-1',
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
          setIsTesting(false);
          toast.success("Voice test completed");
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          setIsTesting(false);
          toast.error("Voice test failed");
        };
        
        await audio.play();
      } else {
        setIsTesting(false);
        toast.error("Voice test failed");
      }
    } catch (error) {
      setIsTesting(false);
      toast.error("Voice test failed");
      console.error(error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <VoiceAvatarWithInfo 
            voice={selectedVoice} 
            size="md" 
            isSelected={true}
          />
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <VoiceAvatarGrid 
          selectedVoice={selectedVoice}
          onVoiceSelect={onVoiceSelect}
        />
        
        {showTestButton && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={testVoice}
              disabled={isTesting}
              variant="outline"
              size="sm"
              className="w-full max-w-xs"
            >
              {isTesting ? "Testing..." : "Test Voice"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function VoicePickerModal({ 
  selectedVoice, 
  onVoiceSelect, 
  onClose,
  title = "Voice Selection",
  description = "Choose your preferred voice"
}: VoicePickerProps & { 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <VoicePicker 
            selectedVoice={selectedVoice}
            onVoiceSelect={(voice) => {
              onVoiceSelect(voice);
              onClose();
            }}
            showTestButton={true}
          />
        </div>
      </div>
    </div>
  );
} 