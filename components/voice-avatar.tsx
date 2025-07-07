import React from 'react';
import { cn } from '@/lib/utils';

interface VoiceAvatarProps {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isSelected?: boolean;
}

const voiceConfigs = {
  alloy: {
    name: 'Alloy',
    gender: 'Male',
    description: 'Neutral, professional',
    colors: {
      bg: 'bg-gradient-to-br from-slate-400 to-slate-600',
      border: 'border-slate-300',
      text: 'text-slate-700',
      icon: 'text-slate-100'
    },
    icon: '👨‍💼'
  },
  echo: {
    name: 'Echo',
    gender: 'Male', 
    description: 'Warm, friendly',
    colors: {
      bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      border: 'border-amber-300',
      text: 'text-amber-700',
      icon: 'text-amber-100'
    },
    icon: '👨‍🦱'
  },
  fable: {
    name: 'Fable',
    gender: 'Male',
    description: 'Storyteller vibe',
    colors: {
      bg: 'bg-gradient-to-br from-purple-400 to-indigo-600',
      border: 'border-purple-300',
      text: 'text-purple-700',
      icon: 'text-purple-100'
    },
    icon: '👨‍🎨'
  },
  onyx: {
    name: 'Onyx',
    gender: 'Male',
    description: 'Deep, serious',
    colors: {
      bg: 'bg-gradient-to-br from-gray-700 to-black',
      border: 'border-gray-600',
      text: 'text-gray-800',
      icon: 'text-gray-200'
    },
    icon: '👨‍💻'
  },
  nova: {
    name: 'Nova',
    gender: 'Female',
    description: 'Clear, articulate',
    colors: {
      bg: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      border: 'border-blue-300',
      text: 'text-blue-700',
      icon: 'text-blue-100'
    },
    icon: '👩‍💼'
  },
  shimmer: {
    name: 'Shimmer',
    gender: 'Female',
    description: 'Light, expressive',
    colors: {
      bg: 'bg-gradient-to-br from-pink-300 to-rose-400',
      border: 'border-pink-200',
      text: 'text-pink-700',
      icon: 'text-pink-100'
    },
    icon: '👩‍🎤'
  }
};

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base'
};

export function VoiceAvatar({ 
  voice, 
  size = 'md', 
  className = '',
  isSelected = false 
}: VoiceAvatarProps) {
  const config = voiceConfigs[voice];
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn(
      'relative flex items-center justify-center rounded-full border-2 transition-all duration-200',
      config.colors.bg,
      config.colors.border,
      sizeClass,
      isSelected && 'ring-2 ring-blue-500 ring-offset-2',
      className
    )}>
      <span className="text-lg leading-none">{config.icon}</span>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function VoiceAvatarWithInfo({ 
  voice, 
  size = 'md',
  showInfo = true,
  className = '',
  isSelected = false 
}: VoiceAvatarProps & { showInfo?: boolean }) {
  const config = voiceConfigs[voice];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <VoiceAvatar 
        voice={voice} 
        size={size} 
        isSelected={isSelected}
      />
      
      {showInfo && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{config.name}</span>
            <span className="text-xs text-gray-500">({config.gender})</span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {config.description}
          </span>
        </div>
      )}
    </div>
  );
}

export function VoiceAvatarGrid({ 
  selectedVoice,
  onVoiceSelect,
  className = ''
}: {
  selectedVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  onVoiceSelect: (voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => void;
  className?: string;
}) {
  const voices: Array<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = [
    'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
  ];

  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {voices.map((voice) => (
        <button
          key={voice}
          onClick={() => onVoiceSelect(voice)}
          className={cn(
            'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105',
            selectedVoice === voice 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          )}
        >
          <VoiceAvatar 
            voice={voice} 
            size="md" 
            isSelected={selectedVoice === voice}
          />
          <div className="text-center">
            <div className="text-xs font-medium">{voiceConfigs[voice].name}</div>
            <div className="text-xs text-gray-500">{voiceConfigs[voice].gender}</div>
          </div>
        </button>
      ))}
    </div>
  );
} 