'use client';

import React, { useState, useEffect } from 'react';
import { Field } from './Field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AvatarConfigProps {
  onStart: (config: AvatarConfiguration) => void;
  isStarting: boolean;
}

export interface AvatarConfiguration {
  avatarId: string;
  voiceId: string;
  language: string;
  quality: 'low' | 'medium' | 'high';
}

// Default avatars and voices from HeyGen
const DEFAULT_AVATARS = [
  { id: 'avatar_wayne_20240711', name: 'Wayne' },
  { id: 'avatar_josh_20240711', name: 'Josh' },
  { id: 'avatar_anna_20240711', name: 'Anna' },
  { id: 'avatar_susan_20240711', name: 'Susan' },
];

const DEFAULT_VOICES = [
  { id: '0a1f130137ff4ba2a21eda84dc12cbd5', name: 'Eric - Natural' },
  { id: '001a77bb29084102bfcf3117bb497eb9', name: 'Paul - Natural' },
  { id: '00988b7ed1c3430f93d75ce32b88e2ad', name: 'Jennifer - Natural' },
  { id: '00d76ba1cf37448589ad123faa39ea4b', name: 'Emily - Natural' },
];

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
  { id: 'de', name: 'German' },
  { id: 'it', name: 'Italian' },
  { id: 'pt', name: 'Portuguese' },
  { id: 'zh', name: 'Chinese' },
  { id: 'ja', name: 'Japanese' },
  { id: 'ko', name: 'Korean' },
];

export function AvatarConfig({ onStart, isStarting }: AvatarConfigProps) {
  const [config, setConfig] = useState<AvatarConfiguration>({
    avatarId: DEFAULT_AVATARS[0].id,
    voiceId: DEFAULT_VOICES[0].id,
    language: 'en',
    quality: 'high',
  });

  const handleStart = () => {
    onStart(config);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configure Your Avatar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field label="Select Avatar">
          <Select
            value={config.avatarId}
            onValueChange={(value) => setConfig({ ...config, avatarId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an avatar" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_AVATARS.map((avatar) => (
                <SelectItem key={avatar.id} value={avatar.id}>
                  {avatar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Select Voice">
          <Select
            value={config.voiceId}
            onValueChange={(value) => setConfig({ ...config, voiceId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a voice" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_VOICES.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Language">
          <Select
            value={config.language}
            onValueChange={(value) => setConfig({ ...config, language: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Video Quality">
          <Select
            value={config.quality}
            onValueChange={(value: 'low' | 'medium' | 'high') => 
              setConfig({ ...config, quality: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Button 
          onClick={handleStart} 
          className="w-full"
          disabled={isStarting}
        >
          {isStarting ? 'Starting Session...' : 'Start Avatar Session'}
        </Button>
      </CardContent>
    </Card>
  );
}