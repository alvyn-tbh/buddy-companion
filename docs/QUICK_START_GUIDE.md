# Quick Start Guide

This guide provides quick examples and code snippets for common tasks in the AI SDK Starter project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Common Tasks](#common-tasks)
3. [API Integration Examples](#api-integration-examples)
4. [Component Usage Examples](#component-usage-examples)
5. [Advanced Features](#advanced-features)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-sdk-starter

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Required Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Redis Configuration (optional for queues)
REDIS_URL=redis://localhost:6379

# Authentication (optional)
NEXT_PUBLIC_USER_AUTH=true
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start

# With queue workers (if using Redis)
npm run queue:worker
npm run queue:monitor
```

## Common Tasks

### 1. Implementing Chat Interface

```tsx
// pages/chat.tsx
import { Chat } from '@/components/chat';
import { AuthProvider } from '@/lib/hooks/use-auth';

export default function ChatPage() {
  return (
    <AuthProvider>
      <Chat
        api="/api/corporate"
        chat_url="/chat"
        features_url="/features"
        how_it_works_url="/how-it-works"
        ttsConfig={{
          defaultVoice: 'alloy',
          speed: 1.0,
          autoPlay: true
        }}
      />
    </AuthProvider>
  );
}
```

### 2. Adding Authentication

```tsx
// components/protected-page.tsx
import { useAuth } from '@/lib/hooks/use-auth';
import { AuthGuard } from '@/components/auth-guard';

export default function ProtectedPage() {
  const { user } = useAuth();

  return (
    <AuthGuard redirectTo="/login">
      <div>
        <h1>Welcome, {user?.name || user?.email}</h1>
        {/* Protected content */}
      </div>
    </AuthGuard>
  );
}
```

### 3. Implementing Audio Transcription

```tsx
// components/audio-recorder.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  async function handleAudioUpload(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', 'en');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setTranscription(data.transcription);
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  }

  // Recording logic here...

  return (
    <div>
      <Button onClick={() => setIsRecording(!isRecording)}>
        {isRecording ? 'Stop' : 'Start'} Recording
      </Button>
      {transcription && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}
```

### 4. Text-to-Speech Implementation

```tsx
// components/text-reader.tsx
import { useAudio } from '@/lib/hooks/use-audio';
import { AudioPlayer } from '@/components/audio-player';

export function TextReader({ text }: { text: string }) {
  const { playText, stopPlaying, isPlaying } = useAudio();

  return (
    <div className="flex items-center gap-2">
      <AudioPlayer
        text={text}
        isEnabled={true}
        voice="alloy"
        ttsModel="tts-1-hd"
      />
      {/* Or use the hook directly */}
      <button
        onClick={() => isPlaying ? stopPlaying() : playText(text, 'nova')}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );
}
```

## API Integration Examples

### 1. Chat API Integration

```javascript
// Direct API usage
async function sendChatMessage(messages) {
  const response = await fetch('/api/corporate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        ...messages
      ]
    })
  });

  // Handle streaming response
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Parse streaming format: 0:"content"\n
    const match = chunk.match(/0:"(.*)"/);
    if (match) {
      fullResponse += match[1];
      // Update UI with partial response
    }
  }

  return fullResponse;
}
```

### 2. Audio Processing Pipeline

```javascript
// Complete audio processing pipeline
async function processAudioMessage(audioFile) {
  // Step 1: Transcribe audio
  const formData = new FormData();
  formData.append('audio', audioFile);
  
  const transcribeResponse = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData
  });
  
  const { transcription } = await transcribeResponse.json();
  
  // Step 2: Send transcribed text to chat
  const chatResponse = await fetch('/api/corporate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: transcription }
      ]
    })
  });
  
  // Step 3: Convert response to speech
  const assistantMessage = await readStreamingResponse(chatResponse);
  
  const ttsResponse = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: assistantMessage,
      voice: 'alloy'
    })
  });
  
  const audioBlob = await ttsResponse.blob();
  return URL.createObjectURL(audioBlob);
}
```

### 3. Queue Management

```javascript
// Using queues for background processing
import { getOpenaiChatQueue, JOB_PRIORITIES } from '@/lib/queue/bull-queue';

async function queueChatRequest(messages, userId) {
  const queue = await getOpenaiChatQueue();
  
  // Add high-priority job
  const job = await queue.add('chat-request', {
    messages,
    userId,
    timestamp: Date.now()
  }, {
    priority: JOB_PRIORITIES.HIGH,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });

  // Monitor job progress
  job.on('progress', (progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
  });

  // Wait for completion
  try {
    const result = await job.finished();
    return result;
  } catch (error) {
    console.error('Job failed:', error);
    throw error;
  }
}
```

## Component Usage Examples

### 1. Custom Chat Interface

```tsx
// components/custom-chat.tsx
import { useChat } from '@ai-sdk/react';
import { Messages } from '@/components/messages';
import { Textarea } from '@/components/textarea';
import { useAudio } from '@/lib/hooks/use-audio';

export function CustomChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/corporate'
  });
  
  const { isAudioEnabled, toggleAudio } = useAudio();

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b">
        <button onClick={toggleAudio}>
          Audio: {isAudioEnabled ? 'ON' : 'OFF'}
        </button>
      </header>
      
      <Messages
        messages={messages}
        isAudioEnabled={isAudioEnabled}
        voice="alloy"
      />
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          onSubmit={handleSubmit}
        />
      </form>
    </div>
  );
}
```

### 2. Admin Dashboard

```tsx
// pages/admin/index.tsx
import { AuthGuard } from '@/components/auth-guard';
import { QueueDashboard } from '@/components/queue-dashboard';
import { AdminNav } from '@/components/admin-nav';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    const response = await fetch('/api/admin/usage');
    const data = await response.json();
    setStats(data);
  }

  return (
    <AuthGuard requireAdmin={true}>
      <div className="flex">
        <AdminNav />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">API Calls Today</h3>
              <p className="text-3xl font-bold">{stats?.apiCallsToday || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Total Cost</h3>
              <p className="text-3xl font-bold">${stats?.totalCost || 0}</p>
            </div>
          </div>
          
          <QueueDashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
```

### 3. Voice Interface

```tsx
// components/voice-interface.tsx
import { useState } from 'react';
import { VoiceAvatar } from '@/components/voice-avatar';
import { RealtimeWebRTC } from '@/lib/realtime-webrtc';

export function VoiceInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [rtc] = useState(() => new RealtimeWebRTC());

  async function startVoiceChat() {
    // Set up event handlers
    rtc.setEventHandlers({
      onTranscript: (text) => {
        setTranscript(prev => prev + ' ' + text);
        setIsListening(true);
        setIsSpeaking(false);
      },
      onResponse: (response) => {
        setIsListening(false);
        setIsSpeaking(true);
      },
      onStatusChange: (status) => {
        console.log('Status:', status);
      }
    });

    // Create session and connect
    await rtc.createSession({
      model: 'gpt-4o-realtime',
      voice: 'alloy',
      instructions: 'You are a helpful voice assistant'
    });

    await rtc.connect();
    
    // Start capturing audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Process and send audio to WebRTC...
  }

  return (
    <div className="flex flex-col items-center p-8">
      <VoiceAvatar
        isListening={isListening}
        isSpeaking={isSpeaking}
        size="lg"
      />
      
      <button
        onClick={startVoiceChat}
        className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg"
      >
        Start Voice Chat
      </button>
      
      {transcript && (
        <div className="mt-4 p-4 bg-gray-100 rounded max-w-md">
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
```

## Advanced Features

### 1. Custom System Prompts

```typescript
// lib/custom-prompts.ts
export const customPrompts = {
  technical: `You are a technical support specialist with deep knowledge 
    of software development, APIs, and troubleshooting.`,
  
  creative: `You are a creative writing assistant who helps with 
    storytelling, poetry, and imaginative content.`,
  
  educational: `You are an educational tutor who explains complex 
    concepts in simple terms with examples.`
};

// Usage in API route
const systemPrompt = customPrompts[promptType] || customPrompts.technical;
```

### 2. Rate Limiting Implementation

```typescript
// middleware.ts
import { createRateLimiter } from '@/lib/rate-limit';

const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export async function middleware(request: Request) {
  if (request.url.includes('/api/')) {
    const limited = await limiter.check(request);
    if (!limited) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '900'
        }
      });
    }
  }
}
```

### 3. Custom Analytics Tracking

```typescript
// lib/custom-analytics.ts
import { trackServiceUsage } from '@/lib/analytics';
import { usageTracker } from '@/lib/usage-tracker';

export async function trackAdvancedMetrics(event: {
  type: string;
  userId?: string;
  metadata: Record<string, any>;
}) {
  // Track in analytics
  await trackServiceUsage(event.type, event.metadata);
  
  // Track usage for billing
  if (event.userId && event.type === 'api_call') {
    await usageTracker.trackUsage({
      user_id: event.userId,
      api_type: event.metadata.api_type,
      model: event.metadata.model,
      tokens_used: event.metadata.tokens,
      request_id: event.metadata.request_id
    });
  }
  
  // Send to external analytics (optional)
  if (window.gtag) {
    window.gtag('event', event.type, event.metadata);
  }
}
```

### 4. Error Recovery System

```typescript
// lib/error-recovery.ts
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    fallback?: () => T;
    onError?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, fallback, onError } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (onError) {
        onError(error as Error, attempt);
      }
      
      if (attempt === maxRetries) {
        if (fallback) {
          return fallback();
        }
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  
  throw new Error('Unexpected error in recovery system');
}

// Usage
const result = await withErrorRecovery(
  () => fetch('/api/corporate', options),
  {
    maxRetries: 3,
    fallback: () => ({ response: 'Service temporarily unavailable' }),
    onError: (error, attempt) => {
      console.log(`Attempt ${attempt} failed:`, error.message);
    }
  }
);
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Issues**
   ```bash
   # Check if key is set
   echo $OPENAI_API_KEY
   
   # Test API key
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

2. **Supabase Connection Issues**
   ```javascript
   // Test Supabase connection
   const { data, error } = await supabase
     .from('_test')
     .select('*')
     .limit(1);
   
   if (error) {
     console.error('Supabase connection failed:', error);
   }
   ```

3. **Redis Connection Issues**
   ```javascript
   // Check Redis connection
   import { isRedisReady } from '@/lib/redis';
   
   if (!isRedisReady()) {
     console.error('Redis not connected');
   }
   ```

---

Last updated: December 2024
