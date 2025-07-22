# API Documentation

This document provides comprehensive documentation for all public APIs, functions, and components in the AI SDK Starter project.

## Table of Contents

1. [REST API Endpoints](#rest-api-endpoints)
2. [React Hooks](#react-hooks)
3. [UI Components](#ui-components)
4. [Core Modules](#core-modules)
5. [Utility Functions](#utility-functions)
6. [TypeScript Interfaces](#typescript-interfaces)

## REST API Endpoints

### 1. Corporate Chat API

**Endpoint:** `POST /api/corporate`

**Description:** Handles corporate assistant chat interactions using OpenAI's GPT models.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "system" | "user" | "assistant",
      "content": "string"
    }
  ],
  "existingThreadId": "string" // Optional
}
```

**Response:** Server-sent events stream with format:
```
0:"message content"\n
```

**Headers:**
- `X-Thread-Id`: Thread identifier for conversation continuity

**Example:**
```javascript
const response = await fetch('/api/corporate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello!' }
    ]
  })
});
```

### 2. Audio Transcription API

**Endpoint:** `POST /api/transcribe`

**Description:** Transcribes audio files using OpenAI's Whisper API.

**Request:** FormData with the following fields:
- `audio`: Audio file (max 25MB)
- `language`: Language code (default: 'en')
- `responseFormat`: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt' (default: 'verbose_json')

**Supported Audio Formats:** mp3, mp4, mpeg, mpga, m4a, wav, webm

**Response:**
```json
{
  "transcription": "string",
  "language": "string",    // Only for verbose_json
  "duration": 123.45,      // Only for verbose_json
  "segments": []           // Only for verbose_json
}
```

**Example:**
```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('language', 'en');
formData.append('responseFormat', 'verbose_json');

const response = await fetch('/api/transcribe', {
  method: 'POST',
  body: formData
});
```

### 3. Text-to-Speech API

**Endpoint:** `POST /api/tts`

**Description:** Converts text to speech using OpenAI's TTS API.

**Request Body:**
```json
{
  "text": "string",        // Required, max 4096 characters
  "voice": "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
  "model": "tts-1" | "tts-1-hd",
  "speed": 0.25-4.0,       // Default: 1.0
  "format": "mp3" | "opus" | "aac" | "flac"  // Default: "mp3"
}
```

**Response:** Audio file stream with appropriate Content-Type header

**Example:**
```javascript
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, world!',
    voice: 'alloy',
    model: 'tts-1',
    speed: 1.0,
    format: 'mp3'
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
```

### 4. Analytics API

**Endpoint:** `POST /api/analytics/track`

**Description:** Tracks service usage analytics.

**Request Body:**
```json
{
  "service_used": "string",
  "visitor_id": "string",
  "session_id": "string"
}
```

**Response:** 200 OK on success

### 5. Queue Status API

**Endpoint:** `GET /api/queue/status`

**Description:** Returns the current status of all processing queues.

**Response:**
```json
{
  "timestamp": "ISO 8601 date",
  "redis": {
    "health": true,
    "info": {
      "url": "string",
      "isConnected": true
    }
  },
  "queues": {
    "openaiChat": { "waiting": [], "active": [], "completed": [], "failed": [] },
    "audioProcessing": { "waiting": [], "active": [], "completed": [], "failed": [] },
    "largeRequests": { "waiting": [], "active": [], "completed": [], "failed": [] },
    "analytics": { "waiting": [], "active": [], "completed": [], "failed": [] }
  }
}
```

### 6. Admin APIs

#### Get Users
**Endpoint:** `GET /api/admin/users`

**Description:** Retrieves all users (admin authentication required).

#### Get Usage Stats
**Endpoint:** `GET /api/admin/usage`

**Description:** Retrieves usage statistics for all users (admin authentication required).

## React Hooks

### 1. useAuth

**Location:** `lib/hooks/use-auth.tsx`

**Description:** Provides authentication state and methods.

**Usage:**
```tsx
import { useAuth } from '@/lib/hooks/use-auth';

function MyComponent() {
  const { 
    user, 
    loading, 
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshUser
  } = useAuth();

  // Sign up example
  await signUp({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  });

  // Sign in example
  await signIn({
    email: 'user@example.com',
    password: 'password123'
  });
}
```

**Returns:**
- `user`: Current authenticated user or null
- `loading`: Authentication loading state
- `error`: Authentication error message
- `signUp`: Function to register new user
- `signIn`: Function to sign in with email/password
- `signInWithGoogle`: Function for Google OAuth
- `signInWithGitHub`: Function for GitHub OAuth
- `signOut`: Function to sign out
- `resetPassword`: Function to send password reset email
- `updatePassword`: Function to update password
- `updateProfile`: Function to update user profile
- `refreshUser`: Function to refresh user data

### 2. useAudio

**Location:** `lib/hooks/use-audio.ts`

**Description:** Manages audio playback and recording functionality.

**Usage:**
```tsx
import { useAudio } from '@/lib/hooks/use-audio';

function MyComponent() {
  const {
    isAudioEnabled,
    isRecording,
    isTranscribing,
    isPlaying,
    enableAudio,
    disableAudio,
    toggleAudio,
    startRecording,
    stopRecording,
    playText,
    stopPlaying,
    isSpeechRecognitionSupported
  } = useAudio();

  // Play text as speech
  await playText('Hello, world!', 'alloy');
}
```

**Returns:**
- `isAudioEnabled`: Audio feature enabled state
- `isRecording`: Recording status
- `isTranscribing`: Transcription in progress
- `isPlaying`: Audio playback status
- `enableAudio`: Enable audio features
- `disableAudio`: Disable audio features
- `toggleAudio`: Toggle audio on/off
- `startRecording`: Start audio recording
- `stopRecording`: Stop audio recording
- `playText`: Convert text to speech and play
- `stopPlaying`: Stop current audio playback
- `isSpeechRecognitionSupported`: Browser support check

### 3. useScrollToBottom

**Location:** `lib/hooks/use-scroll-to-bottom.tsx`

**Description:** Provides automatic scrolling to bottom functionality.

**Usage:**
```tsx
import { useScrollToBottom } from '@/lib/hooks/use-scroll-to-bottom';

function ChatComponent() {
  const [containerRef, endRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div ref={containerRef}>
      {/* Chat messages */}
      <div ref={endRef} />
    </div>
  );
}
```

## UI Components

### 1. Chat Component

**Location:** `components/chat.tsx`

**Description:** Main chat interface component with AI integration.

**Props:**
```tsx
interface ChatProps {
  api: string;              // API endpoint
  chat_url: string;         // Chat page URL
  features_url: string;     // Features page URL
  how_it_works_url: string; // How it works page URL
  ttsConfig?: {
    defaultVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed: number;
    autoPlay: boolean;
  };
}
```

**Example:**
```tsx
<Chat 
  api="/api/corporate"
  chat_url="/corporate"
  features_url="/features"
  how_it_works_url="/how-it-works"
  ttsConfig={{
    defaultVoice: 'alloy',
    speed: 1.0,
    autoPlay: true
  }}
/>
```

### 2. AudioPlayer Component

**Location:** `components/audio-player.tsx`

**Description:** Audio playback component with TTS integration.

**Props:**
```tsx
interface AudioPlayerProps {
  text: string;
  isEnabled: boolean;
  className?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  ttsModel?: 'tts-1' | 'tts-1-hd';
}
```

**Example:**
```tsx
<AudioPlayer
  text="Hello, world!"
  isEnabled={true}
  voice="alloy"
  ttsModel="tts-1"
  className="mt-2"
/>
```

### 3. QueueDashboard Component

**Location:** `components/queue-dashboard.tsx`

**Description:** Displays real-time queue statistics and job management.

**Props:** None (fetches data internally)

**Example:**
```tsx
<QueueDashboard />
```

### 4. Message Component

**Location:** `components/message.tsx`

**Description:** Displays individual chat messages with markdown support.

**Props:**
```tsx
interface MessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isPlaying?: boolean;
  onPlayAudio?: () => void;
  voice?: string;
}
```

### 5. VoiceAvatar Component

**Location:** `components/voice-avatar.tsx`

**Description:** Animated avatar for voice interactions.

**Props:**
```tsx
interface VoiceAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
}
```

### 6. AuthGuard Component

**Location:** `components/auth-guard.tsx`

**Description:** Protects routes requiring authentication.

**Props:**
```tsx
interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
}
```

**Example:**
```tsx
<AuthGuard requireAdmin={true} redirectTo="/login">
  <AdminDashboard />
</AuthGuard>
```

### 7. Header Component

**Location:** `components/header.tsx`

**Description:** Main navigation header with authentication status.

### 8. UserProfile Component

**Location:** `components/user-profile.tsx`

**Description:** User profile display and management.

### 9. VoicePicker Component

**Location:** `components/voice-picker.tsx`

**Description:** Voice selection dropdown for TTS.

### 10. SuggestedPrompts Component

**Location:** `components/suggested-prompts.tsx`

**Description:** Displays suggested conversation starters.

## Core Modules

### 1. Audio Transcription Module

**Location:** `lib/audio-transcription.ts`

**Functions:**

#### transcribeAudio
```typescript
async function transcribeAudio(
  audioBuffer: Buffer,
  options?: TranscriptionOptions
): Promise<TranscriptionResult>
```

**Parameters:**
- `audioBuffer`: Audio data as Buffer
- `options`: Optional transcription settings
  - `language`: Target language code
  - `prompt`: Context prompt for better accuracy
  - `responseFormat`: Output format
  - `temperature`: Model temperature (0-1)

**Returns:**
```typescript
{
  transcription: string;
  confidence?: number;
  language?: string;
  duration?: number;
  requestId: string;
}
```

#### queueTranscription
```typescript
async function queueTranscription(
  audioBuffer: Buffer,
  options?: TranscriptionOptions
): Promise<string> // Returns job ID
```

### 2. TTS Service Module

**Location:** `lib/tts-service.ts`

**Functions:**

#### textToSpeech
```typescript
async function textToSpeech(
  text: string,
  options?: TTSOptions
): Promise<TTSResult>
```

**Parameters:**
- `text`: Text to convert to speech
- `options`:
  - `voice`: Voice selection
  - `model`: TTS model ('tts-1' or 'tts-1-hd')
  - `speed`: Playback speed (0.25-4.0)
  - `format`: Audio format

**Returns:**
```typescript
{
  audioUrl: string;
  duration?: number;
  requestId: string;
}
```

#### validateTTSOptions
```typescript
function validateTTSOptions(options: TTSOptions): void
```

### 3. Usage Tracker Module

**Location:** `lib/usage-tracker.ts`

**Class:** `UsageTracker`

**Methods:**

#### trackUsage
```typescript
async trackUsage(data: UsageData): Promise<void>
```

**Parameters:**
```typescript
{
  user_id?: string;
  api_type: 'speech' | 'text' | 'tts' | 'transcription';
  model: string;
  tokens_used?: number;
  characters_used?: number;
  minutes_used?: number;
  images_used?: number;
  request_id?: string;
  metadata?: Record<string, unknown>;
}
```

#### getUserUsage
```typescript
async getUserUsage(userId: string): Promise<UsageSummary>
```

### 4. Authentication Module

**Location:** `lib/auth.ts`

**Functions:**

#### signUpWithEmail
```typescript
async function signUpWithEmail(data: SignUpData): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

#### signInWithEmail
```typescript
async function signInWithEmail(data: SignInData): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

#### signInWithGoogle
```typescript
async function signInWithGoogle(): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

#### signOut
```typescript
async function signOut(): Promise<{
  error: string | null;
}>
```

#### getCurrentUser
```typescript
async function getCurrentUser(): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

### 5. Queue Management Module

**Location:** `lib/queue/bull-queue.ts`

**Queue Types:**
- `openai-chat`: Chat request processing
- `audio-processing`: Audio transcription jobs
- `large-requests`: Large analysis tasks
- `analytics`: Analytics event processing

**Functions:**

#### getOpenaiChatQueue
```typescript
async function getOpenaiChatQueue(): Promise<Queue>
```

#### getAudioProcessingQueue
```typescript
async function getAudioProcessingQueue(): Promise<Queue>
```

#### getQueueStats
```typescript
async function getQueueStats(): Promise<QueueStats>
```

**Example:**
```typescript
const queue = await getOpenaiChatQueue();
const job = await queue.add('chat-request', {
  messages: [...],
  userId: 'user123'
}, {
  priority: JOB_PRIORITIES.HIGH,
  attempts: 3
});
```

### 6. WebRTC Realtime Module

**Location:** `lib/realtime-webrtc.ts`

**Class:** `RealtimeWebRTC`

**Methods:**

#### createSession
```typescript
async createSession(config: RealtimeConfig): Promise<void>
```

#### connect
```typescript
async connect(): Promise<void>
```

#### sendAudio
```typescript
sendAudio(audioData: Float32Array): void
```

#### disconnect
```typescript
disconnect(): void
```

**Event Handlers:**
- `onTranscript`: Receives transcribed text
- `onResponse`: Receives AI responses
- `onStatusChange`: Connection status updates
- `onError`: Error notifications

### 7. Redis Module

**Location:** `lib/redis.ts`

**Functions:**

#### initRedis
```typescript
async function initRedis(): Promise<void>
```

#### isRedisReady
```typescript
function isRedisReady(): boolean
```

### 8. Cache Module

**Location:** `lib/cache.ts`

**Class:** `SimpleCache`

**Methods:**

#### set
```typescript
set(key: string, data: OpenAIResponse, ttl?: number): void
```

#### get
```typescript
get(key: string): OpenAIResponse | null
```

#### clear
```typescript
clear(): void
```

## Utility Functions

### 1. Analytics Utilities

**Location:** `lib/analytics.ts`

#### generateVisitorId
```typescript
function generateVisitorId(): string
```
Generates a unique visitor ID for analytics tracking.

#### generateSessionId
```typescript
function generateSessionId(): string
```
Generates a session ID for the current browsing session.

#### trackServiceUsage
```typescript
async function trackServiceUsage(serviceName: string): Promise<void>
```
Tracks usage of a specific service.

### 2. Supabase Client Utilities

**Location:** `lib/supabase/client.ts`, `lib/supabase/server.ts`

#### createClient (Browser)
```typescript
function createClient(): SupabaseClient
```
Creates a Supabase client for browser use.

#### createClient (Server)
```typescript
async function createClient(): Promise<SupabaseClient>
```
Creates a Supabase client for server-side use with cookie handling.

## TypeScript Interfaces

### Core Types

```typescript
// Authentication
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
  created_at: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Chat
interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Audio
interface TranscriptionResult {
  transcription: string;
  confidence?: number;
  language?: string;
  duration?: number;
  requestId: string;
}

interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number;
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

// Usage Tracking
interface UsageData {
  user_id?: string;
  api_type: 'speech' | 'text' | 'tts' | 'transcription';
  model: string;
  tokens_used?: number;
  characters_used?: number;
  minutes_used?: number;
  images_used?: number;
  request_id?: string;
  metadata?: Record<string, unknown>;
}

// Queue Management
interface BullJob {
  id: string | number;
  data: Record<string, unknown>;
  opts: Record<string, unknown>;
  progress: number;
  delay: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  attemptsMade: number;
  name: string;
}

interface QueueStats {
  waiting: BullJob[];
  active: BullJob[];
  completed: BullJob[];
  failed: BullJob[];
}

// Realtime WebRTC
interface RealtimeSession {
  id: string;
  client_secret: {
    value: string;
    expires_at: number;
  };
  model?: string;
}

interface RealtimeConfig {
  model: string;
  voice: string;
  instructions?: string;
}
```

## Error Handling

All APIs return standardized error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Authentication required
- `402`: Payment Required - Quota exceeded
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error

## Environment Variables

Required environment variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Redis Configuration (for queues)
REDIS_URL=redis://localhost:6379

# Authentication Settings
NEXT_PUBLIC_USER_AUTH=true  # Enable/disable user authentication

# Optional
NEXT_PUBLIC_VERCEL_URL=your-deployment-url
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Authentication**: Use the `useAuth` hook for user state management
3. **Rate Limiting**: Implement client-side rate limiting for API calls
4. **Audio**: Check browser compatibility before using audio features
5. **Queues**: Use appropriate priority levels for different job types
6. **Caching**: Implement response caching for frequently accessed data
7. **Security**: Never expose sensitive keys in client-side code

## Examples

### Complete Chat Implementation

```tsx
import { useChat } from '@ai-sdk/react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAudio } from '@/lib/hooks/use-audio';
import { Chat } from '@/components/chat';

export default function ChatPage() {
  const { user } = useAuth();
  const { playText } = useAudio();

  return (
    <div className="container mx-auto p-4">
      {user ? (
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
      ) : (
        <p>Please sign in to use the chat.</p>
      )}
    </div>
  );
}
```

### Audio Transcription Implementation

```javascript
async function handleAudioUpload(audioFile) {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('language', 'en');
  formData.append('responseFormat', 'verbose_json');

  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Transcription failed');
    }

    const result = await response.json();
    console.log('Transcription:', result.transcription);
    console.log('Duration:', result.duration, 'seconds');
    
    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}
```

### Queue Job Processing

```javascript
import { getOpenaiChatQueue, JOB_PRIORITIES } from '@/lib/queue/bull-queue';

async function processChatRequest(messages, userId) {
  const queue = await getOpenaiChatQueue();
  
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

  console.log('Job queued:', job.id);
  
  // Wait for completion
  const result = await job.finished();
  return result;
}
```

### WebRTC Voice Mode Implementation

```javascript
import { RealtimeWebRTC } from '@/lib/realtime-webrtc';

const rtc = new RealtimeWebRTC();

// Set up event handlers
rtc.setEventHandlers({
  onTranscript: (transcript) => {
    console.log('User said:', transcript);
  },
  onResponse: (response) => {
    console.log('AI responded:', response);
  },
  onStatusChange: (status) => {
    console.log('Connection status:', status);
  },
  onError: (error) => {
    console.error('WebRTC error:', error);
  }
});

// Create session and connect
await rtc.createSession({
  model: 'gpt-4o-realtime',
  voice: 'alloy',
  instructions: 'You are a helpful assistant'
});

await rtc.connect();

// Start sending audio
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const audioData = e.inputBuffer.getChannelData(0);
      rtc.sendAudio(audioData);
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
  });
```

## Support

For additional support or questions:
1. Check the README.md for setup instructions
2. Review the example implementations in the codebase
3. Consult the OpenAI API documentation for model-specific details
4. Check Supabase documentation for database-related queries

---

Last updated: December 2024
