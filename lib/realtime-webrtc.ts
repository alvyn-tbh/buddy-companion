export interface RealtimeSession {
  id: string;
  client_secret: {
    value: string;
    expires_at: number;
  };
  model?: string;
}

export interface RealtimeConfig {
  model: string;
  voice: string;
  instructions?: string;
}

export class RealtimeWebRTC {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private session: RealtimeSession | null = null;
  private isConnected = false;
  private config: RealtimeConfig | null = null;

  // Event handlers
  private onTranscript?: (transcript: string) => void;
  private onResponse?: (response: string) => void;
  private onStatusChange?: (status: string) => void;
  private onError?: (error: string) => void;

  constructor() {
    // Initialize RTCPeerConnection with STUN servers
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Set up audio element for playing AI responses
    this.audioElement = document.createElement('audio');
    this.audioElement.autoplay = true;
    this.audioElement.style.display = 'none';
    document.body.appendChild(this.audioElement);

    // Handle incoming audio tracks from OpenAI
    this.peerConnection.ontrack = (event) => {
      if (this.audioElement) {
        this.audioElement.srcObject = event.streams[0];
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        switch (this.peerConnection.connectionState) {
          case 'connected':
            this.isConnected = true;
            this.onStatusChange?.('Connected');
            break;
          case 'disconnected':
          case 'failed':
            this.isConnected = false;
            this.onStatusChange?.('Disconnected');
            break;
          case 'connecting':
            this.onStatusChange?.('Connecting...');
            break;
        }
      }
    };
  }

  /**
   * Create a new Realtime session
   */
  async createSession(config: RealtimeConfig): Promise<RealtimeSession> {
    try {
      this.config = config;
      const response = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const session = await response.json();
      this.session = session;
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Connect to OpenAI Realtime via WebRTC
   */
  async connect(): Promise<void> {
    if (!this.session) {
      throw new Error('No session available. Call createSession() first.');
    }

    try {
      this.onStatusChange?.('Initializing connection...');

      // Get user media for microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      // Add local audio track to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });

      // Create data channel for sending/receiving events
      if (this.peerConnection) {
        this.dataChannel = this.peerConnection.createDataChannel('oai-events');
        this.setupDataChannelHandlers();
      }

      // Create and send offer
      if (this.peerConnection) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        // Send offer to OpenAI
        const model = this.config?.model || 'gpt-4o-realtime-preview-2024-12-17';
        const sdpResponse = await fetch(
          `https://api.openai.com/v1/realtime?model=${model}`,
          {
            method: 'POST',
            body: offer.sdp,
            headers: {
              'Authorization': `Bearer ${this.session.client_secret.value}`,
              'Content-Type': 'application/sdp',
            },
          }
        );

        if (!sdpResponse.ok) {
          throw new Error(`Failed to establish WebRTC connection: ${sdpResponse.statusText}`);
        }

        // Set remote description (OpenAI's answer)
        const answer: RTCSessionDescriptionInit = {
          type: 'answer',
          sdp: await sdpResponse.text()
        };
        await this.peerConnection.setRemoteDescription(answer);

        this.onStatusChange?.('Connection established');
      }
    } catch (error) {
      console.error('Error connecting to Realtime API:', error);
      this.onError?.(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  /**
   * Set up data channel event handlers
   */
  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.addEventListener('open', () => {
      this.onStatusChange?.('Data channel open');
      // Send initial session update
      this.updateSession({
        instructions: "You are a helpful AI assistant. Respond naturally and conversationally to user input."
      });
    });

    this.dataChannel.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('Error parsing realtime event:', error);
        // Notify error handler about malformed data
        this.onError?.(`Failed to parse realtime event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    this.dataChannel.addEventListener('close', () => {
      this.onStatusChange?.('Data channel closed');
    });

    this.dataChannel.addEventListener('error', (error) => {
      console.error('Data channel error:', error);
      this.onError?.('Data channel error');
    });
  }

  /**
   * Handle realtime events from OpenAI
   */
  private handleRealtimeEvent(event: {
    type: string;
    delta?: { text?: string };
    error?: { message?: string };
    name?: string;
  }): void {
    switch (event.type) {
      case 'session.created':
        this.onStatusChange?.('Session created');
        break;

      case 'session.updated':
        this.onStatusChange?.('Session updated');
        break;

      case 'input_audio_buffer.speech_started':
        this.onStatusChange?.('User started speaking');
        break;

      case 'input_audio_buffer.speech_stopped':
        this.onStatusChange?.('User stopped speaking');
        break;

      case 'response.audio_transcript.delta':
        if (event.delta?.text) {
          this.onTranscript?.(event.delta.text);
        }
        break;

      case 'response.done':
        this.onStatusChange?.('Response completed');
        break;

      case 'error':
        this.onError?.(event.error?.message || 'Unknown error');
        break;

      default:
        console.log('Unhandled realtime event:', event);
    }
  }

  /**
   * Update session configuration
   */
  updateSession(updates: Partial<{ instructions: string; voice: string }>): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('Data channel not ready for session update');
      return;
    }

    const event = {
      type: 'session.update',
      session: updates
    };

    this.dataChannel.send(JSON.stringify(event));
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    try {
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Close data channel
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Remove audio element
      if (this.audioElement) {
        this.audioElement.remove();
        this.audioElement = null;
      }

      this.isConnected = false;
      this.session = null;
      this.config = null;
      this.onStatusChange?.('Disconnected');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  /**
   * Check if connected
   */
  getConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Set event handlers
   */
  on(event: 'transcript' | 'response' | 'status' | 'error', handler: (data: string) => void): void {
    switch (event) {
      case 'transcript':
        this.onTranscript = handler;
        break;
      case 'response':
        this.onResponse = handler;
        break;
      case 'status':
        this.onStatusChange = handler;
        break;
      case 'error':
        this.onError = handler;
        break;
    }
  }
} 