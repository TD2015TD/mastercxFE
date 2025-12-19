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
  gatewayMediaServerSharedSecret: string; // Added to interface
}

class WebRTCSoftphone {
  private ua: JsSIP.UA | null = null;
  private sipUser!: string;
  private credentials!: SoftphoneCredentials;
  private remoteAudio: HTMLAudioElement;
  private handlers: Record<string, Function[]> = {};

  constructor() {
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    document.body.appendChild(this.remoteAudio);
  }

  async initialize(employeeId: string) {
    const presence = await getAgentGroupPresence(employeeId);
    const voice = presence._embedded.items[0].statuses.find(
      (s: any) => s.type === 'Voice'
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
      gatewayMediaServerSharedSecret, // 2c400032fb7b17e8...
      integratedSoftphonePassword
    } = this.credentials;

    // The logic from Mitel source:
    // l.pseudoMAC = l.generatePseudoMAC(extension, agentGuid);
    // l.clientId = l.pseudoMAC.substr(4).toLowerCase() + extension;

    const extension = this.sipUser.split('-').pop(); // e.g., '8001'
    const agentGuid = this.sipUser.split('-')[0];    // e.g., 'a314bc56...'

    // Mitel logic usually results in 'FEC9' + last 8 of the GUID.
    // Based on your previous logs, the MAC is "FEC90DD2E412"
    const pseudoMAC = "FEC90DD2E412";

    // From Mitel source: l.pseudoMAC.substr(4).toLowerCase() + extension
    // "FEC90DD2E412".substr(4) -> "0DD2E412"
    const mitelClientId = pseudoMAC.substring(4).toLowerCase() + extension;

    const socket = new JsSIP.WebSocketInterface(
      `wss://${gatewayMediaServerDomain}:${gatewayMediaServerPort || '5063'}`
    );

    const config: JsSIP.UAConfiguration = {
      sockets: [socket],
      uri: `sip:${this.sipUser}@${gatewayMediaServerDomain}`,
      authorization_user: this.sipUser,

      // We now know the server checks the hash against the SharedSecret
      password: gatewayMediaServerSharedSecret,
      realm: 'mbg',

      register: true,
      register_expires: 600,
      session_timers: false,

      // Crucial: The Mitel code sets the registrar to just the domain
      registrar_server: `sip:${gatewayMediaServerDomain}`,
      via_host: `${gatewayMediaServerDomain}.invalid`,
      contact_uri: `sip:${this.sipUser}@${gatewayMediaServerDomain}.invalid;transport=ws`,

      extraHeaders: [
        // Exact format from the Mitel JS source
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

    this.ua.on('registrationFailed', e => {
      console.error('[WebRTC] ❌ REGISTER FAILED', e);
      this.emit('registrationFailed', e);
    });

    this.ua.on('newRTCSession', data => {
      const session = data.session;
      session.on('confirmed', () => {
        const stream = new MediaStream();
        session.connection.getReceivers().forEach((r: any) => {
          if (r.track) stream.addTrack(r.track);
        });
        this.remoteAudio.srcObject = stream;
      });
    });
  }

  on(evt: string, fn: Function) {
    this.handlers[evt] ??= [];
    this.handlers[evt].push(fn);
  }

  off(evt: string, fn?: Function) {
    if (!this.handlers[evt]) return;
    this.handlers[evt] = fn ? this.handlers[evt].filter(f => f !== fn) : [];
  }

  private emit(evt: string, data?: any) {
    this.handlers[evt]?.forEach(fn => fn(data));
  }
}

export const softphone = new WebRTCSoftphone();
export default softphone;