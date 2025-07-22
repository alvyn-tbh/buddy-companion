# Functions and Utilities Documentation

This document provides detailed documentation for all utility functions, helpers, and service modules in the AI SDK Starter project.

## Table of Contents

1. [Audio Services](#audio-services)
2. [Authentication Functions](#authentication-functions)
3. [Queue Management](#queue-management)
4. [Analytics Functions](#analytics-functions)
5. [Cache Utilities](#cache-utilities)
6. [Database Functions](#database-functions)
7. [Helper Utilities](#helper-utilities)

## Audio Services

### Audio Transcription Functions

**Location:** `lib/audio-transcription.ts`

#### transcribeAudio

**Description:** Transcribes audio to text using OpenAI Whisper API.

```typescript
async function transcribeAudio(
  audioBuffer: Buffer,
  options?: TranscriptionOptions
): Promise<TranscriptionResult>
```

**Parameters:**
- `audioBuffer`: Audio file data as Buffer
- `options`: Optional configuration
  - `language`: ISO language code (e.g., 'en', 'es', 'fr')
  - `prompt`: Context to improve accuracy
  - `responseFormat`: Output format ('json', 'text', 'srt', 'verbose_json', 'vtt')
  - `temperature`: Model temperature (0-1)

**Returns:**
```typescript
{
  transcription: string;
  confidence?: number;      // Only with verbose_json
  language?: string;         // Detected language
  duration?: number;         // Audio duration in seconds
  requestId: string;         // Unique request identifier
}
```

**Example:**
```typescript
const audioBuffer = await fs.readFile('audio.mp3');
const result = await transcribeAudio(audioBuffer, {
  language: 'en',
  responseFormat: 'verbose_json',
  temperature: 0.2
});
console.log(`Transcription: ${result.transcription}`);
console.log(`Duration: ${result.duration}s`);
```

#### queueTranscription

**Description:** Adds audio transcription job to processing queue.

```typescript
async function queueTranscription(
  audioBuffer: Buffer,
  options?: TranscriptionOptions & { userId?: string }
): Promise<string>
```

**Returns:** Job ID for tracking

**Example:**
```typescript
const jobId = await queueTranscription(audioBuffer, {
  language: 'en',
  userId: 'user123'
});
// Track job status using jobId
```

### Text-to-Speech Functions

**Location:** `lib/tts-service.ts`

#### textToSpeech

**Description:** Converts text to speech using OpenAI TTS API.

```typescript
async function textToSpeech(
  text: string,
  options?: TTSOptions
): Promise<TTSResult>
```

**Parameters:**
- `text`: Text to convert (max 4096 characters)
- `options`:
  - `voice`: Voice selection ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')
  - `model`: TTS model ('tts-1', 'tts-1-hd')
  - `speed`: Playback speed (0.25-4.0)
  - `format`: Audio format ('mp3', 'opus', 'aac', 'flac')

**Returns:**
```typescript
{
  audioUrl: string;      // URL to audio file
  duration?: number;     // Audio duration
  requestId: string;     // Request identifier
}
```

**Example:**
```typescript
const result = await textToSpeech("Hello, world!", {
  voice: 'alloy',
  model: 'tts-1-hd',
  speed: 1.0,
  format: 'mp3'
});

// Play audio
const audio = new Audio(result.audioUrl);
await audio.play();
```

#### validateTTSOptions

**Description:** Validates TTS configuration options.

```typescript
function validateTTSOptions(options: TTSOptions): void
```

**Throws:** Error if options are invalid

**Example:**
```typescript
try {
  validateTTSOptions({ voice: 'invalid-voice' });
} catch (error) {
  console.error('Invalid TTS options:', error.message);
}
```

## Authentication Functions

**Location:** `lib/auth.ts`

### User Registration

#### signUpWithEmail

**Description:** Creates new user account with email/password.

```typescript
async function signUpWithEmail(data: SignUpData): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

**Parameters:**
```typescript
{
  email: string;
  password: string;
  name?: string;
}
```

**Example:**
```typescript
const { user, error } = await signUpWithEmail({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'John Doe'
});

if (error) {
  console.error('Signup failed:', error);
} else {
  console.log('User created:', user.id);
}
```

### User Authentication

#### signInWithEmail

**Description:** Authenticates user with email/password.

```typescript
async function signInWithEmail(data: SignInData): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

#### signInWithGoogle

**Description:** Initiates Google OAuth authentication.

```typescript
async function signInWithGoogle(): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

#### signInWithGitHub

**Description:** Initiates GitHub OAuth authentication.

```typescript
async function signInWithGitHub(): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

### Session Management

#### getCurrentUser

**Description:** Retrieves current authenticated user.

```typescript
async function getCurrentUser(): Promise<{
  user: AuthUser | null;
  error: string | null;
}>
```

#### signOut

**Description:** Signs out current user.

```typescript
async function signOut(): Promise<{
  error: string | null;
}>
```

#### onAuthStateChange

**Description:** Subscribes to authentication state changes.

```typescript
function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): () => void
```

**Returns:** Unsubscribe function

**Example:**
```typescript
const unsubscribe = onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});

// Later: unsubscribe();
```

### Password Management

#### resetPassword

**Description:** Sends password reset email.

```typescript
async function resetPassword(email: string): Promise<{
  error: string | null;
}>
```

#### updatePassword

**Description:** Updates user password.

```typescript
async function updatePassword(newPassword: string): Promise<{
  error: string | null;
}>
```

## Queue Management

**Location:** `lib/queue/bull-queue.ts`

### Queue Creation

#### getOpenaiChatQueue

**Description:** Gets or creates OpenAI chat processing queue.

```typescript
async function getOpenaiChatQueue(): Promise<Queue>
```

**Configuration:**
- Attempts: 3
- Backoff: Exponential, 2s delay
- Cleanup: Keep 100 completed, 50 failed

#### getAudioProcessingQueue

**Description:** Gets or creates audio processing queue.

```typescript
async function getAudioProcessingQueue(): Promise<Queue>
```

**Configuration:**
- Attempts: 2
- Backoff: Exponential, 5s delay
- Cleanup: Keep 50 completed, 25 failed

### Queue Operations

#### Adding Jobs

```typescript
const queue = await getOpenaiChatQueue();

const job = await queue.add('chat-request', {
  messages: [...],
  userId: 'user123',
  model: 'gpt-4'
}, {
  priority: JOB_PRIORITIES.HIGH,
  delay: 5000, // Delay 5 seconds
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});
```

#### Job Priorities

```typescript
const JOB_PRIORITIES = {
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
  BULK: 4
};
```

#### Monitoring Queue Status

```typescript
async function getQueueStats(): Promise<{
  openaiChat: QueueStats;
  audioProcessing: QueueStats;
  largeRequests: QueueStats;
  analytics: QueueStats;
}>
```

**Example:**
```typescript
const stats = await getQueueStats();
console.log('Chat queue waiting:', stats.openaiChat.waiting.length);
console.log('Audio queue active:', stats.audioProcessing.active.length);
```

### Queue Events

```typescript
queue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

queue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

queue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled and will be retried`);
});
```

## Analytics Functions

**Location:** `lib/analytics.ts`

### Visitor Tracking

#### generateVisitorId

**Description:** Generates persistent visitor identifier.

```typescript
function generateVisitorId(): string
```

**Features:**
- Persists in localStorage
- Unique per browser
- Format: `visitor_[random]_[timestamp]`

#### generateSessionId

**Description:** Generates session identifier.

```typescript
function generateSessionId(): string
```

**Features:**
- Persists in sessionStorage
- New ID per browser session
- Format: `session_[random]_[timestamp]`

### Usage Tracking

#### trackServiceUsage

**Description:** Records service usage event.

```typescript
async function trackServiceUsage(
  serviceName: string,
  metadata?: Record<string, any>
): Promise<void>
```

**Example:**
```typescript
await trackServiceUsage('chat', {
  model: 'gpt-4',
  messageCount: 10
});
```

### Usage Tracker Class

**Location:** `lib/usage-tracker.ts`

#### trackUsage

**Description:** Tracks API usage for billing and analytics.

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
  request_id?: string;
  metadata?: Record<string, unknown>;
}
```

**Example:**
```typescript
await usageTracker.trackUsage({
  user_id: 'user123',
  api_type: 'text',
  model: 'gpt-4',
  tokens_used: 1500,
  request_id: 'req_abc123',
  metadata: {
    thread_id: 'thread_xyz',
    response_time: 2.3
  }
});
```

#### getUserUsage

**Description:** Retrieves user's usage statistics.

```typescript
async getUserUsage(
  userId: string,
  period?: 'day' | 'week' | 'month'
): Promise<UsageSummary>
```

**Returns:**
```typescript
{
  total_cost: number;
  by_api_type: {
    text: { count: number; cost: number; tokens: number };
    tts: { count: number; cost: number; characters: number };
    transcription: { count: number; cost: number; minutes: number };
  };
  by_model: Record<string, { count: number; cost: number }>;
}
```

## Cache Utilities

**Location:** `lib/cache.ts`

### SimpleCache Class

#### Constructor

```typescript
constructor(maxSize: number = 1000)
```

#### set

**Description:** Stores data in cache with TTL.

```typescript
set(key: string, data: T, ttl: number = 300000): void
```

**Parameters:**
- `key`: Cache key
- `data`: Data to cache
- `ttl`: Time to live in milliseconds (default: 5 minutes)

#### get

**Description:** Retrieves data from cache.

```typescript
get(key: string): T | null
```

**Returns:** Cached data or null if expired/not found

#### clear

**Description:** Clears all cache entries.

```typescript
clear(): void
```

#### cleanup

**Description:** Removes expired entries.

```typescript
cleanup(): void
```

**Example:**
```typescript
const cache = new SimpleCache<OpenAIResponse>(100);

// Cache API response
cache.set('chat_123', {
  response: 'Hello!',
  threadId: 'thread_abc'
}, 60000); // Cache for 1 minute

// Retrieve from cache
const cached = cache.get('chat_123');
if (cached) {
  console.log('Cache hit:', cached.response);
}
```

## Database Functions

### Supabase Client Creation

**Location:** `lib/supabase/client.ts`, `lib/supabase/server.ts`

#### createClient (Browser)

**Description:** Creates Supabase client for browser use.

```typescript
function createClient(): SupabaseClient
```

**Example:**
```typescript
const supabase = createClient();

// Query data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('active', true);
```

#### createClient (Server)

**Description:** Creates Supabase client for server-side use.

```typescript
async function createClient(): Promise<SupabaseClient>
```

**Features:**
- Cookie-based authentication
- Server-side session handling

### Database Metrics

**Location:** `lib/database-metrics-collector.ts`

#### collectDatabaseMetrics

**Description:** Collects database performance metrics.

```typescript
async function collectDatabaseMetrics(): Promise<DatabaseMetrics>
```

**Returns:**
```typescript
{
  query_count: number;
  avg_query_time: number;
  slow_queries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
  connection_pool: {
    active: number;
    idle: number;
    waiting: number;
  };
}
```

## Helper Utilities

### Rate Limiting

**Location:** `lib/rate-limit.ts`

#### createRateLimiter

**Description:** Creates rate limiter instance.

```typescript
function createRateLimiter(options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}): RateLimiter
```

**Example:**
```typescript
const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  keyGenerator: (req) => req.ip || 'anonymous'
});

// In API route
if (!await limiter.check(request)) {
  return new Response('Too Many Requests', { status: 429 });
}
```

### Redis Connection

**Location:** `lib/redis.ts`

#### initRedis

**Description:** Initializes Redis connection.

```typescript
async function initRedis(): Promise<void>
```

#### isRedisReady

**Description:** Checks Redis connection status.

```typescript
function isRedisReady(): boolean
```

#### redisClient

**Description:** Redis client instance for direct operations.

```typescript
const redisClient: RedisClient
```

**Example:**
```typescript
// Set value with expiration
await redisClient.setex('key', 3600, 'value');

// Get value
const value = await redisClient.get('key');

// Increment counter
const count = await redisClient.incr('counter');
```

### System Prompts

**Location:** `lib/system-prompt.tsx`

**Available Prompts:**
- `corporate`: Corporate assistant persona
- `travel`: Travel assistant persona
- `culture`: Cultural assistant persona
- `emotional`: Emotional support persona

**Location:** `lib/intro-prompt.ts`

**Intro Messages:**
- Service-specific introduction messages
- Personalized greetings

### Utility Functions

**Location:** `lib/utils.ts`

#### cn (className utility)

**Description:** Merges class names with conflict resolution.

```typescript
function cn(...inputs: ClassValue[]): string
```

**Example:**
```typescript
const className = cn(
  'base-class',
  isActive && 'active',
  { 'error': hasError },
  customClass
);
```

## Error Handling Best Practices

### API Error Responses

```typescript
// Standardized error format
return NextResponse.json({
  error: 'Brief error message',
  details: 'Detailed explanation',
  code: 'ERROR_CODE'
}, { status: 400 });
```

### Error Codes

- `INVALID_INPUT`: Invalid request parameters
- `AUTH_REQUIRED`: Authentication needed
- `INSUFFICIENT_PERMISSIONS`: Lacking required permissions
- `RATE_LIMITED`: Too many requests
- `QUOTA_EXCEEDED`: Usage limit reached
- `SERVICE_ERROR`: External service failure

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    attempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  }
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < options.attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < options.attempts - 1) {
        const delay = options.backoff === 'exponential' 
          ? options.delay * Math.pow(2, i)
          : options.delay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

---

Last updated: December 2024
