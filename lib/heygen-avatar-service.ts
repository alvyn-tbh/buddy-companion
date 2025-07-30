import { StreamingAvatarApi, AvatarQuality, VoiceEmotion } from '@heygen/streaming-avatar';

export interface HeyGenConfig {
  apiKey: string;
  avatarId?: string;
  voiceId?: string;
  quality?: AvatarQuality;
}

export interface SessionConfig {
  quality?: AvatarQuality;
  avatarName?: string;
  voice?: {
    voiceId: string;
    emotion?: VoiceEmotion;
  };
  knowledgeBase?: string;
}

export class HeyGenAvatarService {
  private api: StreamingAvatarApi;
  private sessionToken: string | null = null;
  private sessionId: string | null = null;
  private config: HeyGenConfig;
  private peerConnection: RTCPeerConnection | null = null;
  private mediaStream: MediaStream | null = null;
  private isInitialized = false;

  constructor(config: HeyGenConfig) {
    this.config = config;
    this.api = new StreamingAvatarApi({
      apiKey: config.apiKey,
      serverUrl: process.env.NEXT_PUBLIC_HEYGEN_API_URL || 'https://api.heygen.com',
    });
  }

  /**
   * Create a session token for authentication
   */
  async createSessionToken(): Promise<string> {
    try {
      const response = await fetch('/api/heygen/session-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create session token');
      }

      const data = await response.json();
      this.sessionToken = data.token;
      return data.token;
    } catch (error) {
      console.error('Error creating session token:', error);
      throw error;
    }
  }

  /**
   * Initialize the avatar session with optimized settings
   */
  async initialize(sessionConfig?: SessionConfig): Promise<void> {
    try {
      if (!this.sessionToken) {
        await this.createSessionToken();
      }

      // Create new streaming session with optimized settings
      const session = await this.api.createStreamingSession({
        quality: sessionConfig?.quality || AvatarQuality.High,
        avatarName: sessionConfig?.avatarName || this.config.avatarId || 'josh_lite3_20230714',
        voice: sessionConfig?.voice || {
          voiceId: this.config.voiceId || '2d5b0e6cf36f460aa7fc47e3eee4ba54',
          emotion: VoiceEmotion.EXCITED,
        },
        knowledgeBase: sessionConfig?.knowledgeBase,
      });

      this.sessionId = session.sessionId;

      // Set up WebRTC connection for low-latency streaming
      await this.setupWebRTC(session);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing HeyGen avatar:', error);
      throw error;
    }
  }

  /**
   * Set up WebRTC connection for real-time streaming
   */
  private async setupWebRTC(session: any): Promise<void> {
    // Create peer connection with optimized configuration
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    // Handle incoming media stream
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.mediaStream = event.streams[0];
        this.onStreamReady?.(event.streams[0]);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.sessionId) {
        this.api.sendIceCandidate(this.sessionId, event.candidate);
      }
    };

    // Set up connection state monitoring
    this.peerConnection.onconnectionstatechange = () => {
      console.log('WebRTC connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
        this.onConnected?.();
      }
    };

    // Create and set local description
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.peerConnection.setLocalDescription(offer);

    // Exchange SDP with server
    const answer = await this.api.startSession(this.sessionId!, offer);
    await this.peerConnection.setRemoteDescription(answer);
  }

  /**
   * Send text to avatar for speech synthesis with GPT integration
   */
  async speak(text: string, useGPT: boolean = false): Promise<void> {
    if (!this.isInitialized || !this.sessionId) {
      throw new Error('Avatar not initialized');
    }

    try {
      let finalText = text;

      // If useGPT is true, process through GPT first
      if (useGPT) {
        finalText = await this.processWithGPT(text);
      }

      // Send text to avatar for speech synthesis
      await this.api.speak(this.sessionId, {
        text: finalText,
        taskType: 'talk',
        taskMode: 'sync',
      });
    } catch (error) {
      console.error('Error sending text to avatar:', error);
      throw error;
    }
  }

  /**
   * Process text with GPT model
   */
  private async processWithGPT(input: string): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: input,
            },
          ],
          model: 'gpt-4',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process with GPT');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || input;
    } catch (error) {
      console.error('Error processing with GPT:', error);
      return input; // Fallback to original input
    }
  }

  /**
   * Start voice chat mode for real-time interaction
   */
  async startVoiceChat(): Promise<void> {
    if (!this.isInitialized || !this.sessionId) {
      throw new Error('Avatar not initialized');
    }

    try {
      await this.api.startVoiceChat(this.sessionId, {
        useSilenceDetection: true,
      });
    } catch (error) {
      console.error('Error starting voice chat:', error);
      throw error;
    }
  }

  /**
   * Interrupt current speech
   */
  async interrupt(): Promise<void> {
    if (!this.sessionId) return;

    try {
      await this.api.interrupt(this.sessionId);
    } catch (error) {
      console.error('Error interrupting avatar:', error);
    }
  }

  /**
   * Get current media stream
   */
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  /**
   * Destroy the session and cleanup resources
   */
  async destroy(): Promise<void> {
    try {
      if (this.sessionId) {
        await this.api.stopSession(this.sessionId);
      }

      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      this.sessionId = null;
      this.sessionToken = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('Error destroying avatar session:', error);
    }
  }

  // Event handlers (to be set by consumer)
  onStreamReady?: (stream: MediaStream) => void;
  onConnected?: () => void;
  onError?: (error: Error) => void;
}

// Singleton instance manager for optimal performance
let avatarInstance: HeyGenAvatarService | null = null;

export function getAvatarInstance(config?: HeyGenConfig): HeyGenAvatarService {
  if (!avatarInstance && config) {
    avatarInstance = new HeyGenAvatarService(config);
  }
  if (!avatarInstance) {
    throw new Error('Avatar instance not initialized. Please provide config.');
  }
  return avatarInstance;
}

export function destroyAvatarInstance(): void {
  if (avatarInstance) {
    avatarInstance.destroy();
    avatarInstance = null;
  }
}