"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StartAvatarRequest, VoiceEmotion, AvatarQuality } from "@heygen/streaming-avatar";
import {
  AVATARS,
  CORPORATE_VOICE_EMOTIONS,
  QUALITY_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/heygen/constants";

interface AvatarConfigProps {
  config: StartAvatarRequest;
  onConfigChange: (config: StartAvatarRequest) => void;
}

export function AvatarConfig({ config, onConfigChange }: AvatarConfigProps) {
  const updateConfig = (updates: Partial<StartAvatarRequest>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateVoiceConfig = (voiceUpdates: any) => {
    updateConfig({
      voice: { ...config.voice, ...voiceUpdates },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configure Your Avatar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Selection */}
        <div className="space-y-2">
          <Label htmlFor="avatar">Select Avatar</Label>
          <Select
            value={config.avatarName}
            onValueChange={(value) => updateConfig({ avatarName: value })}
          >
            <SelectTrigger id="avatar">
              <SelectValue placeholder="Choose an avatar" />
            </SelectTrigger>
            <SelectContent>
              {AVATARS.map((avatar) => (
                <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
                  {avatar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Emotion */}
        <div className="space-y-2">
          <Label htmlFor="emotion">Voice Emotion</Label>
          <Select
            value={config.voice?.emotion}
            onValueChange={(value) => updateVoiceConfig({ emotion: value as VoiceEmotion })}
          >
            <SelectTrigger id="emotion">
              <SelectValue placeholder="Choose voice emotion" />
            </SelectTrigger>
            <SelectContent>
              {CORPORATE_VOICE_EMOTIONS.map((emotion) => (
                <SelectItem key={emotion.value} value={emotion.value}>
                  {emotion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Video Quality */}
        <div className="space-y-2">
          <Label htmlFor="quality">Video Quality</Label>
          <Select
            value={config.quality}
            onValueChange={(value) => updateConfig({ quality: value as AvatarQuality })}
          >
            <SelectTrigger id="quality">
              <SelectValue placeholder="Choose video quality" />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={config.language}
            onValueChange={(value) => updateConfig({ language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Choose language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speaking Rate */}
        <div className="space-y-2">
          <Label htmlFor="rate">Speaking Rate: {config.voice?.rate || 1.0}x</Label>
          <input
            id="rate"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={config.voice?.rate || 1.0}
            onChange={(e) => updateVoiceConfig({ rate: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}