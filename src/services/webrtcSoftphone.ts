// Minimal CallSession type for compatibility with useWebRTCSoftphone
export type CallSession = {
  id?: string;
  direction?: 'incoming' | 'outgoing';
  status?: string;
  // Add more fields as needed
};
import JsSIP from 'jssip';
import {
  getAgentGroupPresence,
  getIntegratedSoftphoneCredentials
} from './mitelService';

JsSIP.debug.enable('JsSIP:*');

interface SoftphoneCredentials {
  gatewayMediaServerDomain: string;
  gatewayMediaServerPort: string;
  integratedSoftphonePassword: string;
  gatewayMediaServerSharedSecret: string;
}

class WebRTCSoftphone {
  private ua: JsSIP.UA | null = null;
  private sipUser!: string;
  private credentials!: SoftphoneCredentials;
  private remoteAudio: HTMLAudioElement;
  private handlers: Record<string, Array<(data?: unknown) => void>> = {};

  // Track current call session (stub)
  private currentSession: CallSession | null = null;

  constructor() {
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    document.body.appendChild(this.remoteAudio);
  }

  async initialize(employeeId: string) {
    const presence = await getAgentGroupPresence(employeeId);
    const voice = presence._embedded.items[0].statuses.find(
      (s: { type: string; id: string; extension?: string }) => s.type === 'Voice'
    );

    if (!voice) throw new Error('No Voice agent found');

    const agentUuid = voice.id;
    const extension = voice.extension || '8001';
    this.sipUser = `${agentUuid}-${extension}`;

    this.credentials = await getIntegratedSoftphoneCredentials(agentUuid);
    if (!this.credentials) throw new Error('Credentials not loaded');

    await this.connect();
  }

  private async connect() {
    const {
      gatewayMediaServerDomain,
      gatewayMediaServerPort,
      gatewayMediaServerSharedSecret
    } = this.credentials;

    const extension = this.sipUser.split('-').pop(); // e.g., '8001'

    // Mitel logic usually results in 'FEC9' + last 8 of the GUID.
    // Based on your previous logs, the MAC is "FEC90DD2E412"
    const pseudoMAC = "FEC90DD2E412";

    // From Mitel source: l.pseudoMAC.substr(4).toLowerCase() + extension
    // "FEC90DD2E412".substr(4) -> "0DD2E412"
    const mitelClientId = pseudoMAC.substring(4).toLowerCase() + extension;

    const socket = new JsSIP.WebSocketInterface(
      `wss://${gatewayMediaServerDomain}:${gatewayMediaServerPort || '5063'}`
    );

    // Use 'any' for config to avoid UAConfiguration type error
    const config: any = {
      sockets: [socket],
      uri: `sip:${this.sipUser}@${gatewayMediaServerDomain}`,
      authorization_user: this.sipUser,
      password: gatewayMediaServerSharedSecret,
      realm: 'mbg',
      register: true,
      register_expires: 600,
      session_timers: false,
      registrar_server: `sip:${gatewayMediaServerDomain}`,
      via_host: `${gatewayMediaServerDomain}.invalid`,
      contact_uri: `sip:${this.sipUser}@${gatewayMediaServerDomain}.invalid;transport=ws`,
      extraHeaders: [
        `X-WebRTC-Client-Id: clientid="${mitelClientId}" browser="Chrome" version="143.0" setside="${this.sipUser}"`,
        `X-WebRTC-Supported: keepalive`,
        `X-Aastra-Id: type="33" model="01" mac="${pseudoMAC}"`,
        `Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY,SUBSCRIBE`
      ],
      user_agent: 'Mitel-Single-Line-UC-Endpoint'
    };

    this.ua = new JsSIP.UA(config);
    this.bindUA();
    this.ua.start();
  }

  private bindUA() {
    if (!this.ua) return;

    this.ua.on('registered', () => {
      console.log('[WebRTC] ✅ REGISTERED');
      this.emit('registered');
    });

    this.ua.on('registrationFailed', (e: unknown) => {
      console.error('[WebRTC] ❌ REGISTER FAILED', e);
      this.emit('registrationFailed', e);
    });

    this.ua.on('newRTCSession', (event: { session: any }) => {
      const session = event.session;
      session.on('confirmed', () => {
        const stream = new MediaStream();
        if (session.connection && typeof session.connection.getReceivers === 'function') {
          session.connection.getReceivers().forEach((r: { track?: MediaStreamTrack }) => {
            if (r.track) stream.addTrack(r.track);
          });
        }
        this.remoteAudio.srcObject = stream;
      });
    });
  }


  on(evt: string, fn: (data?: unknown) => void) {
    this.handlers[evt] ??= [];
    this.handlers[evt].push(fn);
  }


  off(evt: string, fn?: (data?: unknown) => void) {
    if (!this.handlers[evt]) return;
    this.handlers[evt] = fn ? this.handlers[evt].filter(f => f !== fn) : [];
  }


  private emit(evt: string, data?: unknown) {
    this.handlers[evt]?.forEach(fn => fn(data));
  }

  // --- Softphone control stubs for React hook compatibility ---
  async makeCall(destination: string) {
    // TODO: Implement actual call logic
    console.log('[WebRTCSoftphone] makeCall called', destination);
    this.currentSession = { id: 'dummy', direction: 'outgoing', status: 'active' };
    this.emit('callStarted', this.currentSession);
  }

  answerCall() {
    // TODO: Implement actual answer logic
    console.log('[WebRTCSoftphone] answerCall called');
    if (this.currentSession) this.currentSession.status = 'active';
    this.emit('callAnswered', this.currentSession);
  }

  endCall() {
    // TODO: Implement actual end logic
    console.log('[WebRTCSoftphone] endCall called');
    if (this.currentSession) this.currentSession.status = 'ended';
    this.emit('callEnded', this.currentSession);
    this.currentSession = null;
  }

  holdCall() {
    // TODO: Implement actual hold logic
    console.log('[WebRTCSoftphone] holdCall called');
    if (this.currentSession) this.currentSession.status = 'onhold';
    this.emit('callHeld', this.currentSession);
  }

  resumeCall() {
    // TODO: Implement actual resume logic
    console.log('[WebRTCSoftphone] resumeCall called');
    if (this.currentSession) this.currentSession.status = 'active';
    this.emit('callResumed', this.currentSession);
  }

  mute() {
    // TODO: Implement actual mute logic
    console.log('[WebRTCSoftphone] mute called');
    this.emit('muted');
  }

  unmute() {
    // TODO: Implement actual unmute logic
    console.log('[WebRTCSoftphone] unmute called');
    this.emit('unmuted');
  }

  disconnect() {
    // TODO: Implement actual disconnect logic
    console.log('[WebRTCSoftphone] disconnect called');
    this.emit('disconnected');
    this.currentSession = null;
  }
}

export const softphone = new WebRTCSoftphone();
export default softphone;