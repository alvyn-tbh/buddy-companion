import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { openaiChatQueue, audioProcessingQueue, largeRequestsQueue } from '../queue/bull-queue';

interface SocketData {
  userId?: string;
  sessionId?: string;
  room?: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedClients: Map<string, SocketData> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    this.setupQueueListeners();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Store client data
      this.connectedClients.set(socket.id, {
        userId: socket.handshake.auth.userId,
        sessionId: socket.handshake.auth.sessionId,
        room: socket.handshake.auth.room,
      });

      // Join room if specified
      if (socket.handshake.auth.room) {
        socket.join(socket.handshake.auth.room);
      }

      // Handle chat message
      socket.on('chat:message', async (data) => {
        try {
          const { messages, threadId, assistantId, requestId } = data;
          
          // Add job to queue
          const job = await openaiChatQueue.add('chat-request', {
            messages,
            threadId,
            assistantId,
            requestId,
          }, {
            priority: 2, // Normal priority
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          });

          // Emit job queued event
          socket.emit('chat:queued', {
            requestId,
            jobId: job.id,
            position: await openaiChatQueue.getWaiting(),
          });

        } catch (error) {
          console.error('Error queuing chat message:', error);
          socket.emit('chat:error', {
            requestId: data.requestId,
            error: 'Failed to queue message',
          });
        }
      });

      // Handle audio processing
      socket.on('audio:process', async (data) => {
        try {
          const { audioData, requestId } = data;
          
          // Add job to audio processing queue
          const job = await audioProcessingQueue.add('audio-transcription', {
            audioData,
            requestId,
          }, {
            priority: 3, // Lower priority for audio
            attempts: 2,
          });

          socket.emit('audio:queued', {
            requestId,
            jobId: job.id,
          });

        } catch (error) {
          console.error('Error queuing audio processing:', error);
          socket.emit('audio:error', {
            requestId: data.requestId,
            error: 'Failed to queue audio processing',
          });
        }
      });

      // Handle large request
      socket.on('analysis:large', async (data) => {
        try {
          const { data: analysisData, requestId } = data;
          
          // Add job to large requests queue
          const job = await largeRequestsQueue.add('large-analysis', {
            data: analysisData,
            requestId,
          }, {
            priority: 4, // Lowest priority
            attempts: 5,
          });

          socket.emit('analysis:queued', {
            requestId,
            jobId: job.id,
          });

        } catch (error) {
          console.error('Error queuing large analysis:', error);
          socket.emit('analysis:error', {
            requestId: data.requestId,
            error: 'Failed to queue analysis',
          });
        }
      });

      // Handle room join
      socket.on('room:join', (room) => {
        socket.join(room);
        this.connectedClients.get(socket.id)!.room = room;
        socket.emit('room:joined', room);
      });

      // Handle room leave
      socket.on('room:leave', (room) => {
        socket.leave(room);
        this.connectedClients.get(socket.id)!.room = undefined;
        socket.emit('room:left', room);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  private setupQueueListeners() {
    // Listen for completed chat jobs
    openaiChatQueue.on('completed', (job, result) => {
      const { requestId } = job.data;
      
      // Find client by request ID and emit result
      this.io.emit('chat:completed', {
        requestId,
        result,
        jobId: job.id,
      });
    });

    // Listen for failed chat jobs
    openaiChatQueue.on('failed', (job, error) => {
      const { requestId } = job.data;
      
      this.io.emit('chat:failed', {
        requestId,
        error: error.message,
        jobId: job.id,
      });
    });

    // Listen for completed audio jobs
    audioProcessingQueue.on('completed', (job, result) => {
      const { requestId } = job.data;
      
      this.io.emit('audio:completed', {
        requestId,
        result,
        jobId: job.id,
      });
    });

    // Listen for completed large analysis jobs
    largeRequestsQueue.on('completed', (job, result) => {
      const { requestId } = job.data;
      
      this.io.emit('analysis:completed', {
        requestId,
        result,
        jobId: job.id,
      });
    });
  }

  // Public methods for external use
  public emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any) {
    // Find socket by userId
    for (const [socketId, clientData] of this.connectedClients.entries()) {
      if (clientData.userId === userId) {
        this.io.to(socketId).emit(event, data);
        break;
      }
    }
  }

  public getConnectedClients() {
    return this.connectedClients.size;
  }

  public getClientData(socketId: string) {
    return this.connectedClients.get(socketId);
  }
} 