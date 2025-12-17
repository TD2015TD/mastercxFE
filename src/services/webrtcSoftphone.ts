import JsSIP from 'jssip';
import { getAgentGroupPresence, getIntegratedSoftphoneCredentials } from './mitelService';

// Disable JsSIP debug logs in production
if (import.meta.env.PROD) {
  JsSIP.debug.disable('JsSIP:*');
} else {
  JsSIP.debug.enable('JsSIP:*');
}

export interface SoftphoneCredentials {
  gatewayMediaServerType: string;
  gatewayMediaServerDomain: string;
  gatewayMediaServerPort: string;
  gatewayMediaServerConsumerId: string;
  gatewayMediaServerSharedSecret: string;
  integratedSoftphonePassword: string;
  jwtIssuer: string;
}

export interface AgentGroupPresence {
  agentGroups: Array<{
    agentGroupId: string;
    agentGroupName: string;
    agentId: string;
    presenceState: string;
    mediaType: string;
  }>;
}

export interface CallSession {
  session: any;
  direction: 'incoming' | 'outgoing';
  remoteIdentity: string;
  status: 'ringing' | 'answered' | 'held' | 'ended';
}

class WebRTCSoftphone {
  private ua: any = null;
  private credentials: SoftphoneCredentials | null = null;
  private voiceAgentId: string | null = null;
  private currentSession: CallSession | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  private remoteAudio: HTMLAudioElement | null = null;

  constructor() {
    // Create remote audio element for receiving audio
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    document.body.appendChild(this.remoteAudio);
  }

  /**
   * Initialize the softphone by fetching credentials and connecting
   */
  async initialize(): Promise<void> {
    try {
      console.log('[WebRTC] Initializing softphone...');

      // Step 1: Get agent group presence to find Voice agent ID
      const presenceResponse = await getAgentGroupPresence('me');
      const presence: AgentGroupPresence = presenceResponse.data;

      // Find the Voice agent group
      const voiceAgent = presence.agentGroups.find(
        (group) => group.mediaType === 'Voice'
      );

      if (!voiceAgent) {
        throw new Error('No Voice agent group found for this user');
      }

      this.voiceAgentId = voiceAgent.agentId;
      console.log('[WebRTC] Voice Agent ID:', this.voiceAgentId);

      // Step 2: Get integrated softphone credentials using Voice agent ID
      const credentialsResponse = await getIntegratedSoftphoneCredentials(this.voiceAgentId);
      this.credentials = credentialsResponse.data;

      console.log('[WebRTC] Credentials received:', {
        gateway: this.credentials.gatewayMediaServerDomain,
        port: this.credentials.gatewayMediaServerPort,
        type: this.credentials.gatewayMediaServerType
      });

      // Step 3: Connect to Mitel Border Gateway
      await this.connect();

      console.log('[WebRTC] Softphone initialized successfully');
    } catch (error) {
      console.error('[WebRTC] Failed to initialize softphone:', error);
      throw error;
    }
  }

  /**
   * Connect to Mitel Border Gateway using SIP over WebSocket
   */
  private async connect(): Promise<void> {
    if (!this.credentials || !this.voiceAgentId) {
      throw new Error('Credentials not loaded. Call initialize() first.');
    }

    const {
      gatewayMediaServerDomain,
      gatewayMediaServerPort,
      gatewayMediaServerSharedSecret,
      integratedSoftphonePassword,
      gatewayMediaServerConsumerId
    } = this.credentials;

    // Construct SIP URI and WebSocket server
    const sipUri = `sip:${this.voiceAgentId}@${gatewayMediaServerDomain}`;
    const wsServer = `wss://${gatewayMediaServerDomain}:${gatewayMediaServerPort}`;

    console.log('[WebRTC] Connecting to:', wsServer);
    console.log('[WebRTC] SIP URI:', sipUri);

    // Configure JsSIP UA
    const configuration = {
      sockets: [new JsSIP.WebSocketInterface(wsServer)],
      uri: sipUri,
      password: integratedSoftphonePassword,
      realm: gatewayMediaServerDomain,
      display_name: this.voiceAgentId,
      register: true,
      session_timers: false,
      use_preloaded_route: false,
      // Additional configuration for Mitel
      authorization_user: this.voiceAgentId,
      contact_uri: sipUri
    };

    // Create User Agent
    this.ua = new JsSIP.UA(configuration);

    // Set up event handlers
    this.setupUAEventHandlers();

    // Start the User Agent
    this.ua.start();
  }

  /**
   * Set up User Agent event handlers
   */
  private setupUAEventHandlers(): void {
    if (!this.ua) return;

    // Connection events
    this.ua.on('connected', () => {
      console.log('[WebRTC] WebSocket connected');
      this.emit('connected');
    });

    this.ua.on('disconnected', () => {
      console.log('[WebRTC] WebSocket disconnected');
      this.emit('disconnected');
    });

    this.ua.on('registered', () => {
      console.log('[WebRTC] SIP registered successfully');
      this.emit('registered');
    });

    this.ua.on('unregistered', () => {
      console.log('[WebRTC] SIP unregistered');
      this.emit('unregistered');
    });

    this.ua.on('registrationFailed', (data: any) => {
      console.error('[WebRTC] SIP registration failed:', data);
      this.emit('registrationFailed', data);
    });

    // Incoming call
    this.ua.on('newRTCSession', (data: any) => {
      const { session, request } = data;

      if (session.direction === 'incoming') {
        console.log('[WebRTC] Incoming call from:', request.from.display_name || request.from.uri.user);

        this.currentSession = {
          session,
          direction: 'incoming',
          remoteIdentity: request.from.display_name || request.from.uri.user,
          status: 'ringing'
        };

        this.setupSessionEventHandlers(session);
        this.emit('incomingCall', this.currentSession);
      } else {
        // Outgoing call
        this.setupSessionEventHandlers(session);
      }
    });
  }

  /**
   * Set up session (call) event handlers
   */
  private setupSessionEventHandlers(session: any): void {
    session.on('progress', () => {
      console.log('[WebRTC] Call progress (ringing)');
      if (this.currentSession) {
        this.currentSession.status = 'ringing';
      }
      this.emit('callProgress');
    });

    session.on('accepted', () => {
      console.log('[WebRTC] Call accepted/answered');
      if (this.currentSession) {
        this.currentSession.status = 'answered';
      }
      this.emit('callAccepted');
    });

    session.on('confirmed', () => {
      console.log('[WebRTC] Call confirmed (established)');

      // Attach remote stream to audio element
      const remoteStream = new MediaStream();
      const receivers = session.connection.getReceivers();

      receivers.forEach((receiver: RTCRtpReceiver) => {
        if (receiver.track) {
          remoteStream.addTrack(receiver.track);
        }
      });

      if (this.remoteAudio) {
        this.remoteAudio.srcObject = remoteStream;
      }

      this.emit('callConfirmed');
    });

    session.on('ended', () => {
      console.log('[WebRTC] Call ended');
      if (this.currentSession) {
        this.currentSession.status = 'ended';
      }
      this.currentSession = null;
      this.emit('callEnded');
    });

    session.on('failed', (data: any) => {
      console.error('[WebRTC] Call failed:', data);
      this.currentSession = null;
      this.emit('callFailed', data);
    });

    session.on('hold', () => {
      console.log('[WebRTC] Call on hold');
      if (this.currentSession) {
        this.currentSession.status = 'held';
      }
      this.emit('callHold');
    });

    session.on('unhold', () => {
      console.log('[WebRTC] Call resumed from hold');
      if (this.currentSession) {
        this.currentSession.status = 'answered';
      }
      this.emit('callUnhold');
    });
  }

  /**
   * Make an outgoing call
   */
  async makeCall(destination: string): Promise<void> {
    if (!this.ua || !this.ua.isRegistered()) {
      throw new Error('Softphone not registered. Cannot make call.');
    }

    console.log('[WebRTC] Making call to:', destination);

    const eventHandlers = {
      progress: () => console.log('[WebRTC] Outgoing call - ringing'),
      failed: (data: any) => console.error('[WebRTC] Outgoing call failed:', data),
      ended: () => console.log('[WebRTC] Outgoing call ended'),
      confirmed: () => console.log('[WebRTC] Outgoing call confirmed')
    };

    const options = {
      eventHandlers,
      mediaConstraints: {
        audio: true,
        video: false
      }
    };

    const session = this.ua.call(destination, options);

    this.currentSession = {
      session,
      direction: 'outgoing',
      remoteIdentity: destination,
      status: 'ringing'
    };

    this.setupSessionEventHandlers(session);
    this.emit('outgoingCall', this.currentSession);
  }

  /**
   * Answer an incoming call
   */
  answerCall(): void {
    if (!this.currentSession || this.currentSession.direction !== 'incoming') {
      console.warn('[WebRTC] No incoming call to answer');
      return;
    }

    console.log('[WebRTC] Answering call');

    const options = {
      mediaConstraints: {
        audio: true,
        video: false
      }
    };

    this.currentSession.session.answer(options);
  }

  /**
   * End/hangup the current call
   */
  endCall(): void {
    if (!this.currentSession) {
      console.warn('[WebRTC] No active call to end');
      return;
    }

    console.log('[WebRTC] Ending call');
    this.currentSession.session.terminate();
    this.currentSession = null;
  }

  /**
   * Hold the current call
   */
  holdCall(): void {
    if (!this.currentSession) {
      console.warn('[WebRTC] No active call to hold');
      return;
    }

    console.log('[WebRTC] Holding call');
    this.currentSession.session.hold();
  }

  /**
   * Resume (unhold) the current call
   */
  resumeCall(): void {
    if (!this.currentSession) {
      console.warn('[WebRTC] No active call to resume');
      return;
    }

    console.log('[WebRTC] Resuming call');
    this.currentSession.session.unhold();
  }

  /**
   * Mute the microphone
   */
  mute(): void {
    if (!this.currentSession) {
      console.warn('[WebRTC] No active call to mute');
      return;
    }

    console.log('[WebRTC] Muting microphone');
    this.currentSession.session.mute({ audio: true });
  }

  /**
   * Unmute the microphone
   */
  unmute(): void {
    if (!this.currentSession) {
      console.warn('[WebRTC] No active call to unmute');
      return;
    }

    console.log('[WebRTC] Unmuting microphone');
    this.currentSession.session.unmute({ audio: true });
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    console.log('[WebRTC] Disconnecting softphone');

    if (this.currentSession) {
      this.endCall();
    }

    if (this.ua) {
      this.ua.stop();
      this.ua = null;
    }

    this.credentials = null;
    this.voiceAgentId = null;
    this.emit('disconnected');
  }

  /**
   * Check if softphone is registered and ready
   */
  isReady(): boolean {
    return this.ua !== null && this.ua.isRegistered();
  }

  /**
   * Get current call session
   */
  getCurrentSession(): CallSession | null {
    return this.currentSession;
  }

  /**
   * Event emitter - add event listener
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Event emitter - remove event listener
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Event emitter - emit event
   */
  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}

// Export singleton instance
export const softphone = new WebRTCSoftphone();
export default softphone;
