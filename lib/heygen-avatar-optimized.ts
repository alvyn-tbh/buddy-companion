import { StreamingAvatarApi, AvatarQuality, VoiceEmotion } from '@heygen/streaming-avatar';
import { HeyGenConfig, SessionConfig } from './heygen-avatar-service';

interface OptimizationConfig {
  enablePreWarming?: boolean;
  connectionPoolSize?: number;
  enableResponseCaching?: boolean;
  maxCacheAge?: number; // in milliseconds
  enablePredictiveLoading?: boolean;
}

interface CachedResponse {
  text: string;
  response: string;
  timestamp: number;
}

export class OptimizedHeyGenAvatarService {
  private api: StreamingAvatarApi;
  private config: HeyGenConfig & OptimizationConfig;
  private sessionPool: Map<string, RTCPeerConnection> = new Map();
  private responseCache: Map<string, CachedResponse> = new Map();
  private preWarmConnection: RTCPeerConnection | null = null;
  private isPreWarming = false;
  private currentSession: {
    id: string;
    connection: RTCPeerConnection;
    stream: MediaStream;
  } | null = null;

  constructor(config: HeyGenConfig & OptimizationConfig) {
    this.config = {
      enablePreWarming: true,
      connectionPoolSize: 2,
      enableResponseCaching: true,
      maxCacheAge: 300000, // 5 minutes
      enablePredictiveLoading: true,
      ...config,
    };

    this.api = new StreamingAvatarApi({
      apiKey: config.apiKey,
      serverUrl: process.env.NEXT_PUBLIC_HEYGEN_API_URL || 'https://api.heygen.com',
    });

    // Start pre-warming if enabled
    if (this.config.enablePreWarming) {
      this.preWarmConnection();
    }
  }

  /**
   * Pre-warm WebRTC connection for faster initialization
   */
  private async preWarmConnection(): Promise<void> {
    if (this.isPreWarming) return;
    
    this.isPreWarming = true;
    try {
      // Create a standby connection that can be quickly activated
      this.preWarmConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceCandidatePoolSize: 10, // Pre-gather ICE candidates
      });

      // Prepare the connection
      const offer = await this.preWarmConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.preWarmConnection.setLocalDescription(offer);
      
      console.log('Pre-warmed WebRTC connection ready');
    } catch (error) {
      console.error('Error pre-warming connection:', error);
    } finally {
      this.isPreWarming = false;
    }
  }

  /**
   * Initialize avatar session with optimized connection reuse
   */
  async initialize(sessionConfig?: SessionConfig): Promise<void> {
    try {
      // Check if we can reuse an existing connection
      if (this.currentSession && this.currentSession.connection.connectionState === 'connected') {
        console.log('Reusing existing connection');
        return;
      }

      // Create session token
      const token = await this.createSessionToken();

      // Create streaming session
      const session = await this.api.createStreamingSession({
        quality: sessionConfig?.quality || AvatarQuality.High,
        avatarName: sessionConfig?.avatarName || this.config.avatarId || 'josh_lite3_20230714',
        voice: sessionConfig?.voice || {
          voiceId: this.config.voiceId || '2d5b0e6cf36f460aa7fc47e3eee4ba54',
          emotion: VoiceEmotion.EXCITED,
        },
        knowledgeBase: sessionConfig?.knowledgeBase,
      });

      // Use pre-warmed connection if available
      const connection = this.preWarmConnection || new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      });

      // Set up optimized connection
      await this.setupOptimizedWebRTC(session.sessionId, connection);

      // Pre-warm another connection for next use
      if (this.config.enablePreWarming) {
        setTimeout(() => this.preWarmConnection(), 1000);
      }
    } catch (error) {
      console.error('Error initializing avatar:', error);
      throw error;
    }
  }

  /**
   * Set up WebRTC with performance optimizations
   */
  private async setupOptimizedWebRTC(sessionId: string, connection: RTCPeerConnection): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000); // 10 second timeout

      let stream: MediaStream | null = null;

      connection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          stream = event.streams[0];
          
          // Apply audio optimizations
          const audioTracks = stream.getAudioTracks();
          audioTracks.forEach(track => {
            const constraints = track.getConstraints();
            track.applyConstraints({
              ...constraints,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            });
          });

          this.onStreamReady?.(stream);
        }
      };

      connection.onicecandidate = (event) => {
        if (event.candidate) {
          // Prioritize host candidates for lower latency
          if (event.candidate.type === 'host') {
            this.api.sendIceCandidate(sessionId, event.candidate);
          } else {
            // Delay other candidates slightly
            setTimeout(() => {
              this.api.sendIceCandidate(sessionId, event.candidate!);
            }, 100);
          }
        }
      };

      connection.onconnectionstatechange = async () => {
        if (connection.connectionState === 'connected') {
          clearTimeout(timeout);
          
          this.currentSession = {
            id: sessionId,
            connection,
            stream: stream!,
          };

          // Enable data channel for low-latency commands
          const dataChannel = connection.createDataChannel('commands', {
            ordered: false,
            maxRetransmits: 0,
          });

          this.onConnected?.();
          resolve();
        } else if (connection.connectionState === 'failed') {
          clearTimeout(timeout);
          reject(new Error('Connection failed'));
        }
      };

      // Complete the connection setup
      this.completeConnection(sessionId, connection).catch(reject);
    });
  }

  /**
   * Complete WebRTC connection with optimizations
   */
  private async completeConnection(sessionId: string, connection: RTCPeerConnection): Promise<void> {
    // Create optimized offer
    const offer = await connection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      voiceActivityDetection: false, // Reduce processing overhead
    });

    await connection.setLocalDescription(offer);

    // Exchange SDP with server
    const answer = await this.api.startSession(sessionId, offer);
    await connection.setRemoteDescription(answer);
  }

  /**
   * Speak with caching and optimization
   */
  async speak(text: string, useGPT: boolean = false): Promise<void> {
    if (!this.currentSession) {
      throw new Error('Avatar not initialized');
    }

    try {
      let finalText = text;

      // Check cache first if enabled
      if (this.config.enableResponseCaching && useGPT) {
        const cached = this.getCachedResponse(text);
        if (cached) {
          console.log('Using cached response');
          finalText = cached;
        } else {
          finalText = await this.processWithGPT(text);
          this.cacheResponse(text, finalText);
        }
      } else if (useGPT) {
        finalText = await this.processWithGPT(text);
      }

      // Send with optimized settings
      await this.api.speak(this.currentSession.id, {
        text: finalText,
        taskType: 'talk',
        taskMode: 'sync',
      });
    } catch (error) {
      console.error('Error in speak:', error);
      throw error;
    }
  }

  /**
   * Get cached response if available and not expired
   */
  private getCachedResponse(text: string): string | null {
    const cached = this.responseCache.get(text);
    if (cached && Date.now() - cached.timestamp < this.config.maxCacheAge!) {
      return cached.response;
    }
    this.responseCache.delete(text);
    return null;
  }

  /**
   * Cache a response
   */
  private cacheResponse(text: string, response: string): void {
    this.responseCache.set(text, {
      text,
      response,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    if (this.responseCache.size > 100) {
      const entries = Array.from(this.responseCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 50).forEach(([key]) => this.responseCache.delete(key));
    }
  }

  /**
   * Process with GPT (optimized)
   */
  private async processWithGPT(input: string): Promise<string> {
    // Use streaming API for faster initial response
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: input }],
        model: 'gpt-4',
        stream: false, // For caching purposes
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process with GPT');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || input;
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    // Clean up session
    if (this.currentSession) {
      await this.api.stopSession(this.currentSession.id);
      this.currentSession.connection.close();
      this.currentSession.stream.getTracks().forEach(track => track.stop());
      this.currentSession = null;
    }

    // Clean up pre-warmed connection
    if (this.preWarmConnection) {
      this.preWarmConnection.close();
      this.preWarmConnection = null;
    }

    // Clear caches
    this.responseCache.clear();
    this.sessionPool.clear();
  }

  // Event handlers
  onStreamReady?: (stream: MediaStream) => void;
  onConnected?: () => void;
  onError?: (error: Error) => void;

  /**
   * Create session token
   */
  private async createSessionToken(): Promise<string> {
    const response = await fetch('/api/heygen/session-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to create session token');
    }

    const data = await response.json();
    return data.token;
  }
}

// Export singleton manager
let optimizedInstance: OptimizedHeyGenAvatarService | null = null;

export function getOptimizedAvatarInstance(config?: HeyGenConfig & OptimizationConfig): OptimizedHeyGenAvatarService {
  if (!optimizedInstance && config) {
    optimizedInstance = new OptimizedHeyGenAvatarService(config);
  }
  if (!optimizedInstance) {
    throw new Error('Optimized avatar instance not initialized');
  }
  return optimizedInstance;
}

export function destroyOptimizedInstance(): void {
  if (optimizedInstance) {
    optimizedInstance.destroy();
    optimizedInstance = null;
  }
}