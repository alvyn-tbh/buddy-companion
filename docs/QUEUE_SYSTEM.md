# Queue System Implementation

This document describes the comprehensive queue system implemented for the Buddy Companion chat application, featuring asynchronous processing, request queuing, backpressure handling, retry logic, Bull Queue, and WebSockets.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   API Routes    │    │   Bull Queues   │
│                 │    │                 │    │                 │
│ • React Chat    │───▶│ • /api/corporate│───▶│ • OpenAI Chat   │
│ • WebSocket     │    │ • /api/travel   │    │ • Audio Process │
│ • Real-time     │    │ • /api/emotional│    │ • Large Requests│
│   Updates       │    │ • /api/culture  │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Redis Cache   │    │   Queue Worker  │
                       │                 │    │                 │
                       │ • Response Cache│    │ • Job Processing│
                       │ • Session Store │    │ • Retry Logic   │
                       │ • Rate Limiting │    │ • Error Handling│
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Features Implemented

### 1. **Asynchronous Processing**
- All heavy operations (OpenAI API calls, audio transcription, large analysis) are processed asynchronously
- API routes return immediately with job IDs
- Results delivered via WebSocket events

### 2. **Request Queuing for Larger Requests**
- **OpenAI Chat Queue**: Standard chat requests (priority 2)
- **Audio Processing Queue**: Audio transcription jobs (priority 3)
- **Large Requests Queue**: Complex analysis with backpressure (priority 4)
- **Analytics Queue**: Event tracking (priority 1)

### 3. **Backpressure Handling**
- Queue concurrency limits prevent system overload
- Automatic job throttling when queues are full
- Client notifications about queue status and position

### 4. **Retry Logic**
- Exponential backoff for failed jobs
- Configurable retry attempts per queue type
- Automatic job recovery and error reporting

### 5. **Bull Queue**
- Redis-based job queue system
- Priority-based job processing
- Job monitoring and statistics
- Graceful shutdown handling

### 6. **WebSockets**
- Real-time job status updates
- Live queue position tracking
- Instant result delivery
- Connection health monitoring

## 📁 File Structure

```
lib/
├── redis.ts                 # Redis connection management
├── cache.ts                 # Response caching system
├── rate-limit.ts           # Rate limiting utilities
├── queue/
│   ├── bull-queue.ts       # Bull Queue configuration
│   ├── worker.ts           # Queue worker processes
│   └── monitor.ts          # Queue monitoring CLI
└── websocket/
    └── server.ts           # WebSocket server

app/
├── api/
│   ├── corporate/route.ts  # Updated with queue integration
│   ├── travel/route.ts     # (similar updates needed)
│   ├── emotional/route.ts  # (similar updates needed)
│   ├── culture/route.ts    # (similar updates needed)
│   └── queue/
│       └── status/route.ts # Queue status API
└── admin/
    └── queue/page.tsx      # Queue monitoring dashboard

components/
└── queue-dashboard.tsx     # React queue monitoring component
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
REDIS_URL=redis://localhost:6379/1
OPENAI_API_KEY=your_openai_api_key
OPENAI_CORPORATE_ASSISTANT_ID=your_assistant_id

# Optional
REDIS_PASSWORD=your_redis_password
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

### Queue Configuration
```typescript
// OpenAI Chat Queue
maxConcurrent: 3
retryAttempts: 3
backoffDelay: 2000ms

// Audio Processing Queue
maxConcurrent: 2
retryAttempts: 2
backoffDelay: 5000ms

// Large Requests Queue
maxConcurrent: 2
retryAttempts: 5
backoffDelay: 10000ms
rateLimit: 2 jobs/minute

// Analytics Queue
maxConcurrent: 5
retryAttempts: 1
no backoff
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Set Environment Variables
Create a `.env.local` file with your Redis URL and OpenAI credentials.

### 3. Start Redis Server
```bash
# Local Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Start the Queue Worker
```bash
# In a separate terminal
npm run queue:worker
# or
pnpm queue:worker
```

### 5. Start the Development Server
```bash
npm run dev
# or
pnpm dev
```

### 6. Monitor Queues (Optional)
```bash
# In another terminal
npm run queue:monitor
# or
pnpm queue:monitor
```

## 📊 Monitoring

### Queue Dashboard
Visit `/admin/queue` to see the real-time queue monitoring dashboard.

### API Endpoints
- `GET /api/queue/status` - Get current queue statistics
- `GET /api/queue/status` - Health check for all queues

### CLI Monitor
```bash
npm run queue:monitor
```
Shows real-time queue statistics in the terminal.

## 🔄 Job Flow

### 1. **Client Request**
```typescript
// Client sends chat message
socket.emit('chat:message', {
  messages: [...],
  threadId: 'thread_123',
  assistantId: 'asst_456',
  requestId: 'req_789'
});
```

### 2. **Queue Job**
```typescript
// Server adds job to queue
const job = await openaiChatQueue.add('chat-request', {
  messages,
  threadId,
  assistantId,
  requestId
});

// Client receives queue confirmation
socket.emit('chat:queued', {
  requestId: 'req_789',
  jobId: job.id,
  position: await openaiChatQueue.getWaiting()
});
```

### 3. **Job Processing**
```typescript
// Worker processes the job
openaiChatQueue.process('chat-request', async (job) => {
  const { messages, threadId, assistantId, requestId } = job.data;
  
  // Process with OpenAI
  const result = await processOpenAIRequest(messages, threadId, assistantId);
  
  return { response: result, requestId };
});
```

### 4. **Result Delivery**
```typescript
// Worker emits completion
openaiChatQueue.on('completed', (job, result) => {
  io.emit('chat:completed', {
    requestId: result.requestId,
    response: result.response,
    jobId: job.id
  });
});
```

## 🛠️ API Integration

### Updated API Route Example
```typescript
// app/api/corporate/route.ts
import { openaiChatQueue } from '@/lib/queue/bull-queue';

export async function POST(req: Request) {
  const { messages, threadId } = await req.json();
  
  // Add to queue instead of direct processing
  const job = await openaiChatQueue.add('chat-request', {
    messages,
    threadId,
    assistantId: process.env.OPENAI_CORPORATE_ASSISTANT_ID,
    requestId: generateRequestId()
  });
  
  return Response.json({ 
    jobId: job.id, 
    status: 'queued',
    position: await openaiChatQueue.getWaiting()
  });
}
```

## 📈 Performance Benefits

### Before Queue System
- ❌ Synchronous API calls
- ❌ Blocking responses
- ❌ No retry mechanism
- ❌ No backpressure handling
- ❌ Limited scalability

### After Queue System
- ✅ Asynchronous processing
- ✅ Immediate response with job ID
- ✅ Automatic retries with backoff
- ✅ Backpressure protection
- ✅ Horizontal scaling capability
- ✅ Real-time status updates
- ✅ Graceful error handling

## 🔍 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check `REDIS_URL` in environment
   - Ensure Redis server is running
   - Verify network connectivity

2. **Queue Jobs Not Processing**
   - Ensure worker is running: `npm run queue:worker`
   - Check Redis connection
   - Verify queue configuration

3. **WebSocket Connection Issues**
   - Check CORS configuration
   - Verify client URL settings
   - Ensure Socket.IO server is running

### Debug Commands
```bash
# Check Redis connection
redis-cli ping

# Monitor Redis operations
redis-cli monitor

# Check queue statistics
curl http://localhost:3000/api/queue/status

# View queue dashboard
open http://localhost:3000/admin/queue
```

## 🚀 Production Deployment

### Environment Setup
1. Set production Redis URL
2. Configure proper CORS settings
3. Set up monitoring and alerting
4. Configure auto-scaling for workers

### Scaling Considerations
- Run multiple worker instances
- Use Redis Cluster for high availability
- Implement proper logging and monitoring
- Set up health checks and auto-restart

## 📚 Additional Resources

- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Redis Documentation](https://redis.io/documentation)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**This queue system provides a robust, scalable foundation for handling high-volume chat requests with proper error handling, monitoring, and real-time updates.**
