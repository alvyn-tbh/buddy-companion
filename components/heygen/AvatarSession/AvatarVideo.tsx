'use client';

import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AvatarVideoProps {
  stream: MediaStream | null;
  isLoading: boolean;
  debugInfo?: {
    fps?: number;
    latency?: number;
    quality?: string;
  };
}

export function AvatarVideo({ stream, isLoading, debugInfo }: AvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  return (
    <Card className="relative overflow-hidden bg-black">
      <div className="relative aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          muted={false}
        />
        
        {debugInfo && (
          <div className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-1 text-xs text-white">
            {debugInfo.fps && <div>FPS: {debugInfo.fps}</div>}
            {debugInfo.latency && <div>Latency: {debugInfo.latency}ms</div>}
            {debugInfo.quality && <div>Quality: {debugInfo.quality}</div>}
          </div>
        )}
      </div>
    </Card>
  );
}