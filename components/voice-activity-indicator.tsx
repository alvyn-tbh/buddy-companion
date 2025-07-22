import { cn } from '@/lib/utils';

interface VoiceActivityIndicatorProps {
  isActive: boolean;
  isSpeaking: boolean;
  volume: number;
  noiseFloor: number;
  className?: string;
}

export function VoiceActivityIndicator({
  isActive,
  isSpeaking,
  volume,
  noiseFloor,
  className
}: VoiceActivityIndicatorProps) {
  if (!isActive) return null;

  // Calculate volume level (0-100)
  const volumeLevel = Math.max(0, Math.min(100, ((volume - noiseFloor) / 40) * 100));
  
  // Calculate bar heights based on volume
  const bars = Array(5).fill(0).map((_, i) => {
    const threshold = (i + 1) * 20;
    const height = volumeLevel > threshold ? 100 : (volumeLevel / threshold) * 100;
    return Math.max(20, height); // Minimum 20% height
  });

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Voice activity bars */}
      <div className="flex items-center gap-1 h-6">
        {bars.map((height, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-100",
              isSpeaking ? "bg-green-500" : "bg-gray-400"
            )}
            style={{
              height: `${height}%`,
              opacity: isSpeaking ? 1 : 0.5
            }}
          />
        ))}
      </div>
      
      {/* Status text */}
      <span className={cn(
        "text-xs font-medium transition-colors",
        isSpeaking ? "text-green-600" : "text-gray-500"
      )}>
        {isSpeaking ? "Speaking" : "Listening"}
      </span>
      
      {/* Noise floor indicator */}
      <span className="text-xs text-gray-400">
        NF: {noiseFloor.toFixed(0)}dB
      </span>
    </div>
  );
}

// Minimal voice indicator for tight spaces
export function MiniVoiceIndicator({ isSpeaking, volume, className }: { 
  isSpeaking: boolean; 
  volume: number; 
  className?: string;
}) {
  const size = isSpeaking ? Math.min(16, 8 + (volume + 50) / 10) : 8;
  
  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "rounded-full transition-all duration-200",
          isSpeaking ? "bg-green-500" : "bg-gray-400"
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          opacity: isSpeaking ? 1 : 0.5
        }}
      />
      {isSpeaking && (
        <div 
          className="absolute inset-0 rounded-full bg-green-500 animate-ping"
          style={{
            animationDuration: '1s'
          }}
        />
      )}
    </div>
  );
}
