'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '@/lib/utils';
import { AVATAR_CHARACTERS, AVATAR_BACKGROUNDS } from '@/lib/azure-avatar-service';
import { User, Palette, Volume2, Sparkles } from 'lucide-react';

interface AvatarSelectorProps {
  selectedCharacter: keyof typeof AVATAR_CHARACTERS;
  selectedStyle: string;
  selectedBackground: keyof typeof AVATAR_BACKGROUNDS;
  selectedVoice: string;
  onCharacterChange: (character: keyof typeof AVATAR_CHARACTERS) => void;
  onStyleChange: (style: string) => void;
  onBackgroundChange: (background: keyof typeof AVATAR_BACKGROUNDS) => void;
  onVoiceChange: (voice: string) => void;
  className?: string;
}

const VOICES = {
  'en-US-JennyNeural': { name: 'Jenny', gender: 'Female', accent: 'US' },
  'en-US-GuyNeural': { name: 'Guy', gender: 'Male', accent: 'US' },
  'en-US-AriaNeural': { name: 'Aria', gender: 'Female', accent: 'US' },
  'en-US-DavisNeural': { name: 'Davis', gender: 'Male', accent: 'US' },
  'en-GB-SoniaNeural': { name: 'Sonia', gender: 'Female', accent: 'UK' },
  'en-GB-RyanNeural': { name: 'Ryan', gender: 'Male', accent: 'UK' },
  'en-AU-NatashaNeural': { name: 'Natasha', gender: 'Female', accent: 'AU' },
  'en-AU-WilliamNeural': { name: 'William', gender: 'Male', accent: 'AU' }
};

export function AvatarSelector({
  selectedCharacter,
  selectedStyle,
  selectedBackground,
  selectedVoice,
  onCharacterChange,
  onStyleChange,
  onBackgroundChange,
  onVoiceChange,
  className
}: AvatarSelectorProps) {
  const [activeTab, setActiveTab] = useState('character');
  const currentCharacter = AVATAR_CHARACTERS[selectedCharacter];

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Avatar Configuration</h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Customizable
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="character" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Character</span>
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Style</span>
            </TabsTrigger>
            <TabsTrigger value="background" className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Background</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1">
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="space-y-4 mt-4">
            <Label>Select Avatar Character</Label>
            <RadioGroup value={selectedCharacter} onValueChange={(value) => onCharacterChange(value as keyof typeof AVATAR_CHARACTERS)}>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(AVATAR_CHARACTERS).map(([key, character]) => (
                  <label
                    key={key}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all',
                      selectedCharacter === key 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <RadioGroupItem value={key} className="sr-only" />
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/avatars/${key}.png`} />
                      <AvatarFallback>{character.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{character.name}</div>
                      <div className="text-sm text-gray-500">{character.description}</div>
                    </div>
                    {selectedCharacter === key && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </label>
                ))}
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-4">
            <Label>Select Avatar Style</Label>
            <Select value={selectedStyle} onValueChange={onStyleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a style" />
              </SelectTrigger>
              <SelectContent>
                {currentCharacter.supportedStyles.map((style) => (
                  <SelectItem key={style} value={style}>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{style.replace('-', ' ')}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              Different styles affect the avatar's pose and setting
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-4 mt-4">
            <Label>Select Background</Label>
            <RadioGroup value={selectedBackground} onValueChange={(value) => onBackgroundChange(value as keyof typeof AVATAR_BACKGROUNDS)}>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(AVATAR_BACKGROUNDS).map(([key, bg]) => (
                  <label
                    key={key}
                    className={cn(
                      'flex items-center justify-center rounded-lg border p-4 cursor-pointer transition-all h-24',
                      selectedBackground === key 
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                    style={{
                      background: bg.value.includes('url(') 
                        ? bg.value.replace('url(', 'url(').replace(')', ')') 
                        : bg.value,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <RadioGroupItem value={key} className="sr-only" />
                    <span className={cn(
                      'font-medium px-2 py-1 rounded',
                      bg.value.includes('gradient') || bg.value.includes('url') 
                        ? 'bg-white/90 text-gray-900' 
                        : 'text-gray-700'
                    )}>
                      {bg.name}
                    </span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4 mt-4">
            <Label>Select Voice</Label>
            <Select value={selectedVoice} onValueChange={onVoiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a voice" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VOICES).map(([key, voice]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{voice.name}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {voice.gender}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {voice.accent}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              Choose a voice that matches your avatar's personality
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm font-medium mb-2">Current Configuration:</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>Character:</span>
              <span className="font-medium">{currentCharacter.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-500" />
              <span>Style:</span>
              <span className="font-medium capitalize">{selectedStyle.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <span>Background:</span>
              <span className="font-medium">{AVATAR_BACKGROUNDS[selectedBackground].name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <span>Voice:</span>
              <span className="font-medium">{VOICES[selectedVoice as keyof typeof VOICES]?.name || 'Default'}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}