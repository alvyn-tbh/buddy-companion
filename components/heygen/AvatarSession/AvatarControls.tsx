'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AvatarControlsProps {
  isSessionActive: boolean;
  isMuted: boolean;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
}

export function AvatarControls({
  isSessionActive,
  isMuted,
  onStart,
  onStop,
  onRestart,
  onToggleMute,
}: AvatarControlsProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center gap-2 p-4">
        {!isSessionActive ? (
          <Button onClick={onStart} variant="default" size="sm">
            <Play className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        ) : (
          <>
            <Button onClick={onStop} variant="destructive" size="sm">
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
            <Button onClick={onRestart} variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
            <Button
              onClick={onToggleMute}
              variant="outline"
              size="icon"
              className="ml-2"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}