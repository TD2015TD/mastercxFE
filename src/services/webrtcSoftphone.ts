// Minimal CallSession type for compatibility with useWebRTCSoftphone
export type CallSession = {
  id?: string;
  direction?: 'incoming' | 'outgoing';
  status?: string;
  displayName?: string;
  number?: string;
};
import JsSIP from 'jssip';
// Not part of JsSIP's public API surface (missing from the top-level
// `jssip` export) but present in the package — imported directly by file
// path. Needed because a bare SIP REGISTER is NOT enough for Mitel's ACD
// to treat this device as ready: confirmed via a live WebSocket capture of
// a real Ignite session that a SIP SUBSCRIBE to the "mihotdesk" event
// (RFC 6665), sent right after REGISTER succeeds, is the actual missing
// step — the server responds 200 OK then pushes a NOTIFY
// (`<mihotdesk cause="0">`) confirming activation. Without this, voice
// presence stays stuck at Offline/LoggedOut in Mitel's ACD no matter what
// REST calls are made, which is exactly what was observed for every
// voice-only agent tested.
//
// JsSIP's built-in digest-auth retry (in RequestSender, shared by every SIP
// method including SUBSCRIBE) already handles the 401 challenge on its
// own — no custom retry code needed here, confirmed against a live
// unmodified run. The thing that actually broke every SUBSCRIBE attempt in
// this codebase was leftover state: a prior SIP session that never sent a
// proper un-REGISTER (Expires: 0) — e.g. a crashed tab, or disconnect()
// never getting called — leaves the device "registered" for up to 10
// minutes (Expires: 600), and the Border Gateway then rejects a SUBSCRIBE
// from a NEW session outright with 403 (no challenge at all) as a conflict
// with that stale one, instead of the normal 401. self-heals from exactly
// that below: if the first SUBSCRIBE attempt doesn't come up active, it
// forces a clean un-REGISTER/re-REGISTER cycle and tries once more.
// @ts-expect-error - no type declarations for this internal module path
import Subscriber from 'jssip/lib-es5/Subscriber';
import {
  getMitelEmployeeState,
  getIntegratedSoftphoneCredentials,
  getIntegratedSoftphoneTurnCredentials,
  makeOutboundCall
} from './mitelService';

JsSIP.debug.enable('JsSIP:*');

interface SoftphoneCredentials {
  gatewayMediaServerDomain: string;
  gatewayMediaServerPort: string;
  integratedSoftphonePassword: string;
  gatewayMediaServerSharedSecret: string;
  // "MitelBorderGateway" for this tenant — confirmed directly. The TURN
  // credentials endpoint is CMS-only by Mitel's own design (its server
  // throws "Integrated Softphone Gateway is not of type CMS" for any other
  // type, seen in MiccSdk's own logs) — MBG gateways were never meant to
  // use it at all.
  gatewayMediaServerType?: string;
}

class WebRTCSoftphone {
  private ua: JsSIP.UA | null = null;
  private sipUser!: string;
  private employeeId!: string;
  private deviceId!: string;
  private credentials!: SoftphoneCredentials;
  // Same device-identity values used on REGISTER and on the mihotdesk
  // SUBSCRIBE below — real Ignite sends identical values on both.
  private mitelClientId!: string;
  private pseudoMAC!: string;
  // See bindUA()'s 'registered' listener for why this exists.
  private selfHealing = false;
  // True only while a mihotdesk SUBSCRIBE is confirmed active — distinct
  // from SIP registration, which can succeed even when hot-desk login
  // never did (or later silently drops, e.g. the MBG-pushed
  // "Feature Failed" deactivation NOTIFY seen in testing). A REST-triggered
  // outbound call from an employee whose hot-desk session isn't actually
  // active gets rejected by Mitel with a 400 even though the CRM shows
  // "Available" — confirmed directly. Callers needing real call capability
  // (not just presence updates) should check this, not just isRegistered.
  private hotDeskActive = false;
  private remoteAudio: HTMLAudioElement;
  private iceServers: RTCIceServer[] = [];
  private handlers: Record<string, Array<(data?: unknown) => void>> = {};

  // Standing intent, not a one-time action — true from the moment
  // initialize() is called until disconnect() is explicitly called.
  // Confirmed directly on this tenant that the softphone can drop out from
  // under an agent mid-session in at least three distinct ways (MBG
  // transport closing, a bare REGISTER failing, or the mihotdesk
  // subscription silently deactivating after a call via a "Feature Failed"
  // NOTIFY) without the agent ever choosing to go offline — each of those
  // used to strand the agent until they manually re-toggled their status.
  // This flag is what lets the handlers below tell "we should still be
  // connected, go get us reconnected" apart from "disconnect() was called
  // on purpose, leave it alone".
  private shouldStayConnected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private reconnecting = false;
  private static readonly MAX_RECONNECT_ATTEMPTS = 10;

  // The live JsSIP RTCSession backing the current call, if any.
  private activeRTCSession: any = null;
  // Public-facing snapshot of the same call, kept for the React hook.
  private currentSession: CallSession | null = null;

  constructor() {
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    document.body.appendChild(this.remoteAudio);
  }

  async initialize(employeeId: string) {
    this.employeeId = employeeId;
    this.shouldStayConnected = true;
    this.clearReconnectTimer();
    const employeeState = await getMitelEmployeeState(employeeId);
    const voice = employeeState?.data?.presence?.voice?.[0];

    if (!voice) throw new Error('No Voice device found for employee');
    if (!voice.deviceId) throw new Error('No device ID found for Voice agent');
    if (!voice.reporting) throw new Error('No extension (reporting) found for Voice agent');

    const agentUuid = voice.deviceId;
    const extension = voice.reporting;
    this.deviceId = agentUuid;
    this.sipUser = `${agentUuid}-${extension}`;

    this.credentials = await getIntegratedSoftphoneCredentials(agentUuid);
    if (!this.credentials) throw new Error('Credentials not loaded');

    // Always have at least a STUN server as a floor — confirmed directly
    // (both in testing here and in a live agent's own browser) that with
    // iceServers left completely empty, answerCall()'s RTCPeerConnection
    // stalls forever at createLocalDescription(): no SIP 200 OK is ever
    // sent back for the ringback leg, so the call rings forever and never
    // clears — which then blocks the PBX line for the next several
    // minutes (SXERR_FEATURE_NOT_ALLOWED on every call attempt in that
    // window, confirmed directly from Mitel's own MiTAIProxyServerLog).
    // Ignite's own fallback for exactly this ("Mitel Web SDK"/MBG
    // registration path, same gateway type as this tenant) is Mitel's own
    // public STUN server, not a third-party one — pulled directly from
    // Ignite's bundle. Matching it in case this network's firewall allows
    // Mitel's own domains but not arbitrary external STUN servers.
    this.iceServers = [{ urls: 'stun:stun.mitel.io:3478' }];

    // The TURN credentials endpoint is CMS-gateway-only by Mitel's own
    // design — confirmed directly from MiccSdk's own server log: it throws
    // "Integrated Softphone Gateway is not of type CMS" internally
    // (Mitel.MiccSdk.Controllers.AgentController.GetIntegratedSoftphoneTurn)
    // for any other gateway type, logged as a genuine server-side
    // exception every single time it's called for this tenant. Ignite
    // itself never calls this for MBG gateways (only its separate CMS SDK
    // registration path does) — skip it here too instead of generating a
    // guaranteed-to-fail request and a server-side exception on every
    // connect for no benefit.
    if (this.credentials.gatewayMediaServerType === 'MitelBorderGateway') {
      console.log('[WebRTCSoftphone] MBG gateway — skipping CMS-only TURN endpoint, using STUN fallback');
    } else {
      try {
        const turn = await getIntegratedSoftphoneTurnCredentials(agentUuid, this.credentials.gatewayMediaServerDomain);
        const urls = turn?.urls ?? turn?.uris;
        if (urls) {
          this.iceServers = [{
            urls,
            username: turn.username,
            credential: turn.credential ?? turn.password,
          }, ...this.iceServers];
        }
      } catch (turnErr) {
        console.warn('[WebRTCSoftphone] Failed to fetch TURN credentials, continuing with STUN-only ICE', turnErr);
      }
    }

    await this.connect();
  }

  private async connect() {
    if (this.ua) {
      await this.disconnect();
    }

    const {
      gatewayMediaServerDomain,
      gatewayMediaServerPort,
      integratedSoftphonePassword
    } = this.credentials;

    const extension = this.sipUser.split('-').pop(); // e.g., '8001'

    // Derived from the voice device's own UUID — NOT a constant. Confirmed
    // by decoding a real Ignite SIP capture: device
    // "70ea5416-9bc3-4d6b-bb47-bc6be1f825ea" produced X-Aastra-Id
    // mac="70EA54169BC3", which is exactly the first two dash-separated
    // UUID segments concatenated and uppercased. This was previously
    // hardcoded to a single value ("FEC90DD2E412") observed for one
    // account and wrongly assumed constant — sent the wrong device
    // identity for every account, which the Border Gateway silently
    // rejected the "mihotdesk" SUBSCRIBE for (REGISTER itself tolerated
    // it, SUBSCRIBE did not).
    const uuidParts = this.deviceId.split('-');
    const pseudoMAC = `${uuidParts[0]}${uuidParts[1]}`.toUpperCase();

    // From Mitel source: l.pseudoMAC.substr(4).toLowerCase() + extension
    const mitelClientId = pseudoMAC.substring(4).toLowerCase() + extension;
    this.pseudoMAC = pseudoMAC;
    this.mitelClientId = mitelClientId;

    const socket = new JsSIP.WebSocketInterface(
      `wss://${gatewayMediaServerDomain}:${gatewayMediaServerPort || '5063'}`
    );

    // Real Ignite generates a random per-session pseudo-hostname here
    // (e.g. "h1e13cqvh10v.invalid") — confirmed via live SIP capture, not
    // derived from the gateway domain at all. We previously hardcoded the
    // SAME literal "{domain}.invalid" for every session/account, which
    // REGISTER tolerates fine but the mihotdesk SUBSCRIBE flatly rejects
    // (403, no auth challenge) even for an account whose real Ignite
    // session succeeds with the identical request otherwise — the Border
    // Gateway most likely needs this value to uniquely identify one
    // specific registration binding, and a value shared across every
    // session/account breaks that.
    const pseudoHost = `${Math.random().toString(36).slice(2, 13)}.invalid`;

    // Use 'any' for config to avoid UAConfiguration type error
    const config: any = {
      sockets: [socket],
      uri: `sip:${this.sipUser}@${gatewayMediaServerDomain}`,
      authorization_user: this.sipUser,
      password: integratedSoftphonePassword,
      realm: 'mbg',
      register: true,
      register_expires: 600,
      session_timers: false,
      // Ignite's own captured registration config explicitly sets
      // sendKeepAlives:true — confirmed directly (DevTools capture) — but
      // this was never set here, meaning our WebSocket carried zero
      // transport-level keepalives the entire session. MBG likely uses
      // their absence to treat an otherwise-valid, still-registered
      // session as unreliable for originating NEW calls specifically
      // (FeatureNotAllowed), even though presence reads and the bare
      // REGISTER refresh keep succeeding regardless. Sends a double-CRLF
      // ping over the socket every 30s, matching typical SIP keepalive
      // cadence.
      keep_alive_interval: 30,
      registrar_server: `sip:${gatewayMediaServerDomain}`,
      via_host: pseudoHost,
      contact_uri: `sip:${this.sipUser}@${pseudoHost};transport=ws`,
      extraHeaders: [
        `X-WebRTC-Client-Id: clientid="${mitelClientId}" browser="Chrome" version="143.0" setside="${this.sipUser}"`,
        `X-WebRTC-Supported: keepalive`,
        `X-Aastra-Id: type="33" model="01" mac="${pseudoMAC}"`,
        `Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY,SUBSCRIBE`
      ],
      user_agent: 'Mitel-Single-Line-UC-Endpoint'
    };

    this.ua = new JsSIP.UA(config);

    // ROOT CAUSE of the mihotdesk SUBSCRIBE always getting a flat 403,
    // confirmed directly from Mitel's own Border Gateway logs (TUG log,
    // gsCalculateFakeMac): JsSIP's Registrator keeps its own private header
    // list for REGISTER, entirely separate from the UA-level `extraHeaders`
    // config above — that config only reaches requests built through the
    // generic OutgoingRequest path (like our SUBSCRIBE), never REGISTER.
    // Without this call, our REGISTER went out with none of the
    // X-WebRTC-Client-Id/X-Aastra-Id headers, so the Border Gateway derived
    // the device's "fake MAC" identity from the SIP +sip.instance GUID
    // instead — a DIFFERENT MAC than the one it derives from
    // X-WebRTC-Client-Id on the SUBSCRIBE right after. Two different MAC
    // identities for the same device means the SUBSCRIBE looks like it's
    // coming from a device that was never registered, hence the 403 (no
    // challenge — it's not an auth failure, MBG just doesn't recognize the
    // "device"). A real Ignite session sends these same headers on REGISTER
    // too, which is why its REGISTER and SUBSCRIBE resolve to the same MAC
    // and it always works.
    (this.ua as any).registrator().setExtraHeaders(config.extraHeaders);

    this.bindUA();

    // Wait for the real SIP REGISTER handshake to actually finish before
    // resolving — previously this returned right after calling ua.start()
    // (fire-and-forget: JsSIP's WebSocket connect + REGISTER/401-challenge/
    // re-REGISTER round trip takes hundreds of ms, all asynchronous).
    // Callers awaiting initialize() would then fire the Mitel "Available"
    // state PUT before the device had actually finished registering with
    // the SIP gateway. Confirmed directly: that PUT reports 200 OK, but
    // Mitel silently never applies it for a not-yet-registered device —
    // the agent's state stays "Unknown" indefinitely, with no error
    // anywhere to explain why.
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout);
        this.off('registered', onRegistered);
        this.off('registrationFailed', onFailed);
      };
      const onRegistered = () => {
        cleanup();
        resolve();
      };
      // Unlike the success path, a failed/timed-out attempt must also stop
      // the UA — JsSIP keeps retrying the WebSocket in the background on
      // its own (this is what a WSS abnormal-closure loop, e.g. close code
      // 1006, looks like from here: no registrationFailed event, just
      // silent reconnect attempts). Without this, a UA that never got past
      // its first REGISTER before the caller gave up keeps running
      // unobserved, and if it eventually registers anyway it leaves a
      // stale binding for the NEXT initialize() attempt to collide with —
      // the same class of conflict subscribeHotDesk()'s self-heal cycle
      // exists to clean up, but for REGISTER itself instead of SUBSCRIBE.
      const failCleanup = () => {
        cleanup();
        const ua = this.ua;
        this.ua = null;
        ua?.stop();
      };
      const onFailed = (err: unknown) => {
        failCleanup();
        reject(err instanceof Error ? err : new Error('SIP registration failed'));
      };
      const timeout = setTimeout(() => {
        failCleanup();
        reject(new Error('SIP registration timed out after 15s'));
      }, 15000);

      this.on('registered', onRegistered);
      this.on('registrationFailed', onFailed);

      this.ua!.start();
    });
  }

  private bindUA() {
    if (!this.ua) return;

    // Transport-level visibility we never had before: JsSIP auto-reconnects
    // the WebSocket on its own, silently, with no event we were listening
    // for. Confirmed via live MiTAI logs that a call can get accepted
    // (SX_OK) but never actually ring the agent's device at all (no
    // CallReceivedEvent, no [ICE] activity client-side) right after MiTAI
    // logged an OutOfServiceEvent on this DN — i.e. the transport dropped
    // and came back, and a call landed in that gap where MBG had nothing
    // to deliver the INVITE to. Logging these so a drop is directly visible
    // next time instead of inferred after the fact from a stuck call.
    this.ua.on('disconnected', (e: unknown) => {
      console.warn('[WebRTC] ⚠️ Transport disconnected', e);
      this.emit('transportDisconnected', e);
      this.scheduleReconnect('transport disconnected');
    });
    this.ua.on('connecting', (e: unknown) => {
      console.log('[WebRTC] Transport connecting...', e);
    });
    this.ua.on('connected', (e: unknown) => {
      console.log('[WebRTC] ✅ Transport connected');
      this.emit('transportConnected', e);
    });

    this.ua.on('registered', () => {
      console.log('[WebRTC] ✅ REGISTERED');
      // subscribeHotDesk()'s own self-heal cycle calls ua.stop()/ua.start()
      // on this SAME ua instance, which fires this exact 'registered'
      // listener again — without this guard, that second firing kicked off
      // its own independent (non-retry) subscribeHotDesk() call, which on
      // failure started its OWN self-heal cycle, which fired 'registered'
      // again, forever. selfHealing marks "already being handled by an
      // explicit .once() elsewhere" so this persistent listener skips it.
      if (this.selfHealing) return;
      // A successful REGISTER is the genuine "we're back" signal, whether
      // this came from a fresh login or from attemptReconnect() retrying in
      // the background — reset the backoff counter and tell anyone
      // listening (e.g. a UI toast) that an in-progress reconnect just
      // succeeded.
      const wasReconnecting = this.reconnectAttempts > 0;
      this.reconnectAttempts = 0;
      // Wait for the hot-desk login itself (including its self-heal retry
      // cycle, which can take a few seconds) before telling callers we're
      // "registered" — connect()'s caller uses this event to know it's safe
      // to PUT state=Available. Emitting it right after the bare SIP
      // REGISTER (as before) meant the PUT could fire, get verified, and
      // give up — all before the hot-desk SUBSCRIBE had even finished.
      this.subscribeHotDesk().finally(() => {
        this.emit('registered');
        if (wasReconnecting) this.emit('reconnected');
      });
      // Fire-and-forget, same as Ignite's own equivalent call at this exact
      // point — see detectMitelStunServer()'s own comment for why this
      // matters far more than it looks.
      this.detectMitelStunServer();
    });

    this.ua.on('registrationFailed', (e: unknown) => {
      console.error('[WebRTC] ❌ REGISTER FAILED', e);
      this.emit('registrationFailed', e);
      this.scheduleReconnect('registration failed');
    });

    this.ua.on('newRTCSession', (event: { session: any }) => {
      const session = event.session;
      this.activeRTCSession = session;

      const callSession: CallSession = {
        id: session.id,
        direction: session.direction,
        status: session.direction === 'incoming' ? 'ringing' : 'calling',
        displayName: session.remote_identity?.display_name || undefined,
        number: session.remote_identity?.uri?.user || undefined,
      };
      this.currentSession = callSession;

      if (session.direction === 'incoming') {
        this.emit('incomingCall', callSession);
      } else {
        this.emit('outgoingCall', callSession);
      }

      // Diagnostic instrumentation: MiTAI never emits CallOriginatedEvent
      // (i.e. the PBX never actually dials the destination) for some
      // outbound calls, and it happens silently — no JsSIP/console error at
      // all. Confirmed by comparing MiTAI's own event log for a working
      // call (CallReceivedEvent -> CallOriginatedEvent ~3s later) against a
      // stuck one (CallReceivedEvent, then nothing, ever). The leading
      // theory is our own leg's ICE/media never actually finishes
      // connecting even though JsSIP reports the SIP dialog as answered —
      // logging real ICE state here, timestamped, is what lets that be
      // checked against a live MiTAI log pull instead of guessed at.
      session.on('peerconnection', (e: { peerconnection: RTCPeerConnection }) => {
        const pc = e.peerconnection;
        const tag = `[ICE ${session.direction} ${new Date().toISOString()}]`;
        console.log(`${tag} peerconnection created, iceConnectionState=${pc.iceConnectionState}`);
        pc.addEventListener('iceconnectionstatechange', () => {
          console.log(`${tag} iceConnectionState -> ${pc.iceConnectionState}`);
          // 'disconnected' is often transient (a brief network blip, or a
          // mid-call re-INVITE settling) and can recover on its own within
          // a few seconds — treating it as fatal immediately would drop
          // calls that were actually fine. Only 'failed' means the
          // connection is genuinely broken and won't come back by itself;
          // for that, trigger a real ICE restart via JsSIP's own
          // renegotiate() — this sends an actual re-INVITE with fresh ICE
          // credentials and completes the SDP O/A cycle end-to-end.
          // (RTCPeerConnection.restartIce() alone would only flag the next
          // createOffer() — nothing here calls createOffer() on its own,
          // so that alone would never actually renegotiate anything.)
          // JsSIP's own renegotiate() already terminates the session with
          // a proper "Media Renegotiation Failed" cause if this doesn't
          // work, so there's no dangling broken-but-alive call either way.
          // Confirmed directly: a call can go disconnected->failed mid-call
          // during a Mitel-initiated renegotiation, and previously had no
          // recovery attempt at all — it just silently died.
          if (pc.iceConnectionState === 'failed') {
            console.warn(`${tag} ICE failed — attempting renegotiate() with iceRestart`);
            try {
              session.renegotiate({ rtcOfferConstraints: { iceRestart: true } }, () => {
                console.log(`${tag} ICE restart renegotiation succeeded`);
              });
            } catch (err) {
              console.error(`${tag} renegotiate() threw`, err);
            }
          } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            console.log(`${tag} ICE (re)connected`);
          }
        });
        pc.addEventListener('icegatheringstatechange', () => {
          console.log(`${tag} iceGatheringState -> ${pc.iceGatheringState}`);
        });
        pc.addEventListener('icecandidateerror', (ev: any) => {
          console.warn(`${tag} icecandidateerror`, { errorCode: ev.errorCode, errorText: ev.errorText, url: ev.url });
        });
        pc.addEventListener('connectionstatechange', () => {
          console.log(`${tag} connectionState -> ${pc.connectionState}`);
        });
      });

      // Ignite's real softphone (read directly from its production bundle,
      // ICE_GATHERING_TIMEOUT_MS = 1000) never waits for full ICE candidate
      // gathering to finish — it starts a 1-second timer on the FIRST
      // candidate and forces the SDP answer/offer out with whatever
      // candidates exist by then, regardless of whether iceGatheringState
      // ever reaches "complete". Without this, JsSIP's default behavior
      // (used here before this fix) is to wait for gathering to genuinely
      // finish before sending anything back — and gathering can take far
      // longer than that, or on some networks never cleanly reach
      // "complete" at all. Confirmed repeatedly and reproducibly on this
      // tenant: calls stuck exactly at "peerconnection created,
      // iceGatheringState -> gathering" with nothing after it, sometimes
      // for 18+ seconds, until Mitel itself gave up and canceled the call.
      // Matching Ignite's bounded wait here directly targets that.
      let iceGatheringTimer: ReturnType<typeof setTimeout> | undefined;
      session.on('icecandidate', (e: { candidate: unknown; ready: () => void }) => {
        if (iceGatheringTimer !== undefined) return;
        iceGatheringTimer = setTimeout(() => {
          if (session.connection && session.connection.iceGatheringState !== 'complete') {
            console.log('[WebRTC] ICE gathering timeout (1s) — proceeding with candidates gathered so far');
            e.ready();
          }
          iceGatheringTimer = undefined;
        }, 1000);
      });

      session.on('accepted', () => {
        if (this.currentSession) this.currentSession.status = 'answered';
        this.emit('callAccepted', this.currentSession);
      });

      session.on('confirmed', () => {
        const stream = new MediaStream();
        if (session.connection && typeof session.connection.getReceivers === 'function') {
          session.connection.getReceivers().forEach((r: { track?: MediaStreamTrack }) => {
            if (r.track) stream.addTrack(r.track);
          });
        }
        this.remoteAudio.srcObject = stream;
        if (this.currentSession) this.currentSession.status = 'active';
        this.emit('callConfirmed', this.currentSession);
      });

      session.on('ended', (e: unknown) => {
        console.log('[WebRTC] Call ended', e);
        this.emit('callEnded', this.currentSession);
        if (this.activeRTCSession === session) this.activeRTCSession = null;
        this.currentSession = null;
        this.remoteAudio.srcObject = null;
      });

      session.on('failed', (e: unknown) => {
        console.error('[WebRTC] Call failed', e);
        this.emit('callFailed', e);
        if (this.activeRTCSession === session) this.activeRTCSession = null;
        this.currentSession = null;
        this.remoteAudio.srcObject = null;
      });
    });
  }

  // RFC 6665 SUBSCRIBE to the "mihotdesk" event — this is the actual
  // hot-desk LOGIN action (confirmed with Telediant and by capturing a real
  // Ignite session end-to-end): only a successful SUBSCRIBE actually logs
  // the voice device into the PABX (MiVB) hot-desk association, after which
  // plain presence PUTs (state=Available) start taking effect. Plain,
  // unmodified JsSIP handles this correctly on its own (its RequestSender
  // already retries a 401 challenge automatically, for any SIP method) —
  // confirmed against a live unmodified run using the same account and
  // device this whole investigation was blocked on.
  //
  // What actually broke every attempt in this codebase was stale state: a
  // prior SIP session that never sent a proper un-REGISTER (e.g. a crashed
  // tab, or disconnect() never getting called) leaves the device registered
  // for up to 10 minutes, and the Border Gateway then flatly rejects a
  // SUBSCRIBE from a new session (403, no challenge at all) as a conflict
  // with that stale one instead of the normal 401. isRetry below self-heals
  // from exactly that: a clean un-REGISTER/re-REGISTER cycle, then one more
  // attempt, before giving up.
  //
  // Best-effort: must never block/break the softphone if this fails, since
  // the SIP REGISTER itself already succeeded and is independently useful.
  // Returns a promise that settles once the hot-desk login attempt is
  // actually done (active, or given up after one self-heal retry) — never
  // rejects, since a REGISTER-only device is still independently useful.
  // bindUA() waits on this before telling callers "registered", so a
  // caller's subsequent PUT state=Available doesn't race ahead of a
  // self-heal cycle that's still in flight.
  private subscribeHotDesk(isRetry = false): Promise<void> {
    return new Promise((resolveOuter) => {
      if (!this.ua || !this.credentials) {
        resolveOuter();
        return;
      }
      try {
        const target = `sip:${this.sipUser}@${this.credentials.gatewayMediaServerDomain}`;
        const sub = new Subscriber(this.ua, target, 'mihotdesk', 'application/mihotdesk', {
          expires: 600,
          extraHeaders: [
            `X-WebRTC-Client-Id: clientid="${this.mitelClientId}" browser="Chrome" version="143.0" setside="${this.sipUser}"`,
            `X-WebRTC-Supported: keepalive`,
            `X-Aastra-Id: type="33" model="01" mac="${this.pseudoMAC}"`,
          ],
        });

        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          clearTimeout(safetyTimeout);
          resolveOuter();
        };
        // Guards against 'terminated' never firing (e.g. a hung transport) —
        // without this, a stuck attempt would block the caller's PUT
        // indefinitely instead of just proceeding best-effort.
        const safetyTimeout = setTimeout(() => {
          console.warn('[WebRTC] mihotdesk subscribe attempt timed out waiting for a response');
          settle();
        }, 5000);

        sub.on('active', () => {
          console.log('[WebRTC] ✅ mihotdesk subscription active — hot-desk login confirmed');
          this.hotDeskActive = true;
          this.emit('hotDeskActive');
          settle();
        });
        sub.on('notify', (isFinal: boolean, _request: unknown, body: unknown) => {
          console.log('[WebRTC] mihotdesk NOTIFY received', { isFinal, body });
        });
        sub.on('terminated', (code: unknown, reason: unknown) => {
          const wasActive = settled;
          this.hotDeskActive = false;

          if (wasActive) {
            // Was genuinely active and just got deactivated out from under
            // us (e.g. MBG pushing a "Feature Failed" NOTIFY later in the
            // session) — not the initial-subscribe retry path below. Tell
            // callers so anything gating on hot-desk-active (like placing
            // an outbound call) doesn't act on stale state.
            console.warn('[WebRTC] mihotdesk subscription deactivated after being active', { code, reason });
            this.emit('hotDeskInactive', { code, reason });
            // This is the "agent shows connected but a call after it (or
            // sometimes nothing at all) silently drops hot-desk activation"
            // symptom reported directly by agents on this tenant — a full
            // reconnect (fresh REGISTER + fresh SUBSCRIBE) is the same
            // recovery a manual re-toggle of Available used to force, just
            // automatic now.
            this.scheduleReconnect('hot-desk deactivated after being active');
            return;
          }
          console.warn('[WebRTC] mihotdesk subscription terminated before becoming active', { code, reason, isRetry });

          if (isRetry || !this.ua) {
            this.emit('hotDeskInactive', { code, reason });
            settle(); // already retried once, or nothing left to retry with — give up quietly
            return;
          }

          // Entering the retry path — this attempt's own safety timeout no
          // longer applies (the retry call sets up its own); without
          // clearing it, it could fire mid-retry and resolve the outer
          // promise before the retry actually finishes.
          clearTimeout(safetyTimeout);
          const ua = this.ua;
          console.log('[WebRTC] Forcing a clean un-REGISTER/re-REGISTER cycle to clear any stale hot-desk session...');
          // Suppresses bindUA()'s own 'registered' listener for the
          // re-REGISTER below — otherwise it fires its own independent
          // subscribeHotDesk() call alongside this explicit retry, and on
          // failure that one starts a self-heal cycle of its own too,
          // looping forever.
          this.selfHealing = true;
          ua.once('unregistered', () => {
            ua.once('registered', () => {
              this.selfHealing = false;
              this.subscribeHotDesk(true).then(settle);
            });
            ua.start();
          });
          ua.stop();
        });

        sub.subscribe();
        console.log('[WebRTC] mihotdesk SUBSCRIBE sent to', target);
      } catch (err) {
        console.error('[WebRTC] Failed to subscribe to mihotdesk event', err);
        resolveOuter();
      }
    });
  }

  // Pulled directly from Ignite's own "Mitel Web SDK" (MBG) registration
  // path — this is the actual mechanism it uses for ICE, not a hardcoded
  // public STUN server. MBG itself runs a STUN service, on a port it
  // hands out dynamically: send it a SIP OPTIONS with header
  // "X-STUNPortRequest: Yes", and its response's reason phrase carries
  // "STUNPort=<port>". The real ICE server is then
  // stun:{this same MBG domain}:{that port} — MBG's own address, which
  // we already know is reliably reachable (it's the same server carrying
  // REGISTER/SUBSCRIBE the whole session). Confirmed directly this is
  // the actual reason our calls only cleared ~half the time even after
  // adding a public STUN fallback (stun.mitel.io): a generic external
  // STUN server has its own independent reachability from wherever the
  // agent's browser sits, unrelated to whether MBG itself is reachable —
  // querying MBG's own STUN port removes that variable entirely. Runs
  // fire-and-forget right after REGISTER succeeds, same timing Ignite
  // uses; this.iceServers keeps its STUN fallback until/unless this
  // resolves, so a call placed before it settles still has something.
  private detectMitelStunServer() {
    if (!this.ua || !this.credentials) return;
    const target = `sip:${this.sipUser}@${this.credentials.gatewayMediaServerDomain}`;
    try {
      (this.ua as any).sendOptions(target, undefined, {
        extraHeaders: ['X-STUNPortRequest: Yes'],
        eventHandlers: {
          succeeded: (e: any) => {
            const reasonPhrase: string = e?.response?.reason_phrase || '';
            const match = /STUNPort\s*=\s*(\d+)/i.exec(reasonPhrase);
            if (match) {
              const stunUrl = `stun:${this.credentials.gatewayMediaServerDomain}:${match[1]}`;
              console.log('[WebRTC] Detected MBG STUN server:', stunUrl);
              this.iceServers = [{ urls: stunUrl }];
            } else {
              console.warn('[WebRTC] STUN-port OPTIONS probe succeeded but no STUNPort in reason phrase — keeping fallback ICE server:', reasonPhrase);
            }
          },
          failed: (e: any) => {
            console.warn('[WebRTC] STUN-port OPTIONS probe failed, keeping fallback ICE server:', e?.cause);
          },
        },
      });
    } catch (err) {
      console.warn('[WebRTC] Failed to send STUN-detection OPTIONS request', err);
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Capped exponential backoff (2s, 4s, 8s, 16s, 30s, 30s, ...) instead of
  // hammering MBG every couple seconds if it's genuinely down, but still
  // fast enough that a brief blip (the common case observed on this tenant)
  // recovers almost immediately. Gives up after MAX_RECONNECT_ATTEMPTS so a
  // truly unrecoverable failure (e.g. revoked credentials) doesn't retry
  // forever in the background with no visible error.
  private scheduleReconnect(reason: string) {
    if (!this.shouldStayConnected || !this.employeeId) return;
    if (this.reconnectTimer || this.reconnecting) return;
    if (this.reconnectAttempts >= WebRTCSoftphone.MAX_RECONNECT_ATTEMPTS) {
      console.error(`[WebRTC] ❌ Giving up auto-reconnect after ${this.reconnectAttempts} attempts (${reason})`);
      this.emit('reconnectFailed', { reason, attempts: this.reconnectAttempts });
      return;
    }
    this.reconnectAttempts += 1;
    const delay = Math.min(30000, 2000 * Math.pow(2, this.reconnectAttempts - 1));
    console.warn(`[WebRTC] ⏳ Auto-reconnect attempt ${this.reconnectAttempts}/${WebRTCSoftphone.MAX_RECONNECT_ATTEMPTS} in ${delay}ms (${reason})`);
    this.emit('reconnecting', { attempt: this.reconnectAttempts, reason });
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.attemptReconnect();
    }, delay);
  }

  private async attemptReconnect() {
    if (!this.shouldStayConnected || !this.employeeId) return;
    this.reconnecting = true;
    const employeeId = this.employeeId;
    try {
      console.log('[WebRTC] Attempting automatic reconnect...');
      await this.initialize(employeeId);
      console.log('[WebRTC] ✅ Automatic reconnect succeeded');
    } catch (err) {
      console.error('[WebRTC] Automatic reconnect attempt failed', err);
      this.reconnecting = false;
      this.scheduleReconnect('retry after failed reconnect attempt');
      return;
    }
    this.reconnecting = false;
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

  // --- Softphone call control ---
  // Origination goes through Mitel's REST API, not a raw SIP INVITE from
  // this UA — Mitel sets up both call legs server-side and rings our own
  // registered device for the agent's leg, which arrives back here as a
  // normal incoming newRTCSession.
  async makeCall(destination: string, contact?: { id?: string; name?: string; type?: string; agentId?: string | null }) {
    console.log('[WebRTCSoftphone] makeCall requesting outbound call to', destination, contact);
    if (!this.employeeId) throw new Error('Softphone not initialized');
    try {
      // lightDirectoryEntryModels is for routing TO another employee
      // (it's what let internal calls succeed) — for a plain external
      // number there's no employee/agent to describe, so leave it empty
      // and let Mitel dial the raw number via `to` alone.
      const lightDirectoryEntryModels = contact?.type === 'Employee'
        ? [{
            id: contact.id || destination,
            name: contact.name || destination,
            phone: destination,
            agentId: contact.agentId || null,
            type: 'Employee',
          }]
        : [];
      // Use the registered SIP device ID — same identity used successfully
      // for SIP registration and getIntegratedSoftphoneCredentials(). 'me'
      // and the employee-level GUID both failed identically; Mitel may
      // require call origination to name the actual registered device.
      await makeOutboundCall(this.deviceId, destination, { type: 'Voice', lightDirectoryEntryModels });
    } catch (error) {
      console.error('[WebRTCSoftphone] makeCall failed', error);
      this.emit('callFailed', error);
      throw error;
    }
  }

  async answerCall() {
    const session = this.activeRTCSession;
    if (!session) {
      console.warn('[WebRTCSoftphone] answerCall called with no active session');
      return;
    }
    try {
      // Ignite's real softphone (read directly from its production bundle)
      // always fetches the local mic stream itself and hands JsSIP a ready
      // MediaStream via `mediaStream`, instead of letting JsSIP's own
      // answer() call getUserMedia() internally partway through its promise
      // chain. Confirmed repeatedly and reproducibly on this tenant: our
      // calls could create the RTCPeerConnection fine (the 'peerconnection'
      // event fires) but then never progress any further at all — no
      // getUserMedia call, no setRemoteDescription, ICE stuck at "new"
      // forever, the ringback leg just rings until Mitel's own timeout
      // kills it minutes later and jams the DN for every call after it.
      // Matching Ignite's approach removes JsSIP's internal getUserMedia()
      // step entirely as a place that can silently stall.
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const options: any = { mediaConstraints: { audio: true, video: false }, mediaStream };
      if (this.iceServers.length > 0) {
        options.pcConfig = { iceServers: this.iceServers };
      }
      session.answer(options);
    } catch (error) {
      console.error('[WebRTCSoftphone] answerCall failed', error);
      this.emit('callFailed', error);
    }
  }

  endCall() {
    if (!this.activeRTCSession) {
      console.warn('[WebRTCSoftphone] endCall called with no active session');
      return;
    }
    try {
      this.activeRTCSession.terminate();
    } catch (error) {
      console.error('[WebRTCSoftphone] endCall failed', error);
    }
  }

  holdCall() {
    if (!this.activeRTCSession) return;
    try {
      this.activeRTCSession.hold();
      if (this.currentSession) this.currentSession.status = 'onhold';
      this.emit('callHold', this.currentSession);
    } catch (error) {
      console.error('[WebRTCSoftphone] holdCall failed', error);
    }
  }

  resumeCall() {
    if (!this.activeRTCSession) return;
    try {
      this.activeRTCSession.unhold();
      if (this.currentSession) this.currentSession.status = 'active';
      this.emit('callUnhold', this.currentSession);
    } catch (error) {
      console.error('[WebRTCSoftphone] resumeCall failed', error);
    }
  }

  mute() {
    if (!this.activeRTCSession) return;
    this.activeRTCSession.mute({ audio: true });
    this.emit('muted');
  }

  unmute() {
    if (!this.activeRTCSession) return;
    this.activeRTCSession.unmute({ audio: true });
    this.emit('unmuted');
  }

  isHotDeskActive(): boolean {
    return this.hotDeskActive;
  }

  disconnect(): Promise<void> {
    console.log('[WebRTCSoftphone] disconnect called');
    // Explicit, deliberate disconnect — clear the standing "should be
    // connected" intent so none of the transport/registration/hot-desk
    // event handlers above try to auto-reconnect behind the caller's back.
    this.shouldStayConnected = false;
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    const ua = this.ua;
    this.ua = null;
    this.hotDeskActive = false;

    if (!ua) {
      this.emit('disconnected');
      this.activeRTCSession = null;
      this.currentSession = null;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        this.emit('disconnected');
        this.activeRTCSession = null;
        this.currentSession = null;
        resolve();
      };

      // Wait for the SIP server to confirm unregistration before letting the
      // caller re-register — reconnecting too early causes a duplicate
      // binding conflict that gets the agent force-logged-out server-side.
      const timeout = setTimeout(finish, 1500);
      const onUnregistered = () => {
        clearTimeout(timeout);
        ua.off('unregistered', onUnregistered);
        finish();
      };
      ua.on('unregistered', onUnregistered);
      ua.stop();
    });
  }
}

export const softphone = new WebRTCSoftphone();
export default softphone;