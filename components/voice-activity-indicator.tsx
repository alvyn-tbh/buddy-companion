import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VoiceActivityIndicatorProps {
  isActive: boolean;
  isSpeaking: boolean;
  volume: number;
  noiseFloor?: number;
  className?: string;
}

export function VoiceActivityIndicator({ 
  isActive, 
  isSpeaking, 
  volume, 
  noiseFloor = -50,
  className 
}: VoiceActivityIndicatorProps) {
  const [displayVolume, setDisplayVolume] = useState(0);

  useEffect(() => {
    if (isActive && isSpeaking) {
      // Normalize volume to 0-100 range
      const normalizedVolume = Math.max(0, Math.min(100, ((volume - noiseFloor) / (0 - noiseFloor)) * 100));
      setDisplayVolume(normalizedVolume);
    } else {
      setDisplayVolume(0);
    }
  }, [isActive, isSpeaking, volume, noiseFloor]);

  if (!isActive) return null;

  return (
    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700", className)}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-0.5 h-3 bg-green-400 rounded-full transition-all duration-100",
              displayVolume > (i * 20) ? "opacity-100" : "opacity-30"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-green-700 dark:text-green-300 font-medium">
        {isSpeaking ? 'Speaking' : 'Listening'}
      </span>
    </div>
  );
}

interface MiniVoiceIndicatorProps {
  isActive: boolean;
  isSpeaking: boolean;
  status: string;
  conversationTurn?: number;
  className?: string;
}

export function MiniVoiceIndicator({ 
  isActive, 
  isSpeaking, 
  status,
  conversationTurn = 0,
  className 
}: MiniVoiceIndicatorProps) {
  if (!isActive) return null;

  const getStatusColor = () => {
    if (status.includes('Error')) return 'red';
    if (isSpeaking) return 'green';
    if (status.includes('Processing') || status.includes('Getting')) return 'blue';
    if (status.includes('Ready') || status.includes('Connected')) return 'purple';
    return 'gray';
  };

  const color = getStatusColor();

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border shadow-sm", className)}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        color === 'red' && "bg-red-500",
        color === 'green' && "bg-green-500 animate-pulse",
        color === 'blue' && "bg-blue-500 animate-spin",
        color === 'purple' && "bg-purple-500",
        color === 'gray' && "bg-gray-400"
      )} />
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          🎬
        </span>
        <span className={cn(
          "text-xs font-medium",
          color === 'red' && "text-red-700 dark:text-red-300",
          color === 'green' && "text-green-700 dark:text-green-300",
          color === 'blue' && "text-blue-700 dark:text-blue-300",
          color === 'purple' && "text-purple-700 dark:text-purple-300",
          color === 'gray' && "text-gray-700 dark:text-gray-300"
        )}>
          {isSpeaking ? 'Speaking' : status.includes('Ready') ? 'Ready' : 'Processing'}
        </span>
        {conversationTurn > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            #{conversationTurn}
          </span>
        )}
      </div>
    </div>
  );
}
