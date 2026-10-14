import { getEcho } from './echo';
import api from './api';
import { authService } from './authService';
import { customerInteractionService } from './customerInteractionService';

export type P2PCallStatus = 'idle' | 'calling' | 'ringing' | 'connecting' | 'active' | 'ended';

export interface P2PCallSession {
  peerUserId: number;
  peerName: string;
  direction: 'incoming' | 'outgoing';
  status: P2PCallStatus;
}

type Handler = (data?: unknown) => void;

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
];

// SDP strictly requires CRLF (\r\n) line endings, INCLUDING a trailing
// terminator after the very last line. Confirmed via server-side logging
// that createOffer()'s own .sdp string already omits that final \r\n —
// Chrome's own answerer then rejects the last line (e.g. the closing
// a=ssrc/msid line) as "Invalid SDP line" because it never sees a line
// terminator for it. Force every line to CRLF and guarantee one trailing
// CRLF at the end.
function normalizeSdpLineEndings(sdp: string): string {
  const normalized = sdp.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
  return normalized.endsWith('\r\n') ? normalized : normalized + '\r\n';
}

/**
 * Pure browser-to-browser WebRTC calling — no PBX, no Mitel, nothing in
 * the middle beyond our own Laravel Reverb signaling channel carrying the
 * SDP offer/answer and ICE candidates. Audio only.
 *
 * NOTE: STUN-only for now. Two agents behind restrictive/symmetric NATs
 * (common on some corporate networks) may fail to establish a direct
 * media path — that needs a TURN server, not added here yet.
 */
class P2PCallService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement;
  private currentUserId: number | null = null;
  private pendingOffer: RTCSessionDescriptionInit | null = null;
  // Candidates that arrive before `this.pc` exists — the caller starts
  // gathering/sending ICE candidates within milliseconds of calling, but
  // the callee's `pc` isn't created until they click Accept (human
  // reaction time, seconds later). Without this queue those early
  // candidates were silently dropped in handleSignal's 'ice-candidate'
  // case, so the callee never learned any of the caller's candidates and
  // ICE negotiation could never complete — call stuck on "Connecting".
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private connectedAt: number | null = null;
  private handlers: Record<string, Handler[]> = {};

  private session: P2PCallSession | null = null;

  constructor() {
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    document.body.appendChild(this.remoteAudio);
  }

  initialize(userId: number) {
    if (this.currentUserId === userId) return; // already listening
    this.currentUserId = userId;

    // A connection hiccup here (Reverb unreachable, bad config, etc.) must
    // never take the whole app down with it — this runs inside a
    // useEffect, and an uncaught throw there gets caught by the nearest
    // React error boundary, blanking the entire page.
    try {
      this.subscribe(userId);
    } catch (err) {
      console.error('[P2PCallService] Failed to initialize signaling channel', err);
    }
  }

  private subscribe(userId: number) {
    getEcho()
      .private(`signaling.${userId}`)
      .listen('.signal', (data: {
        fromUserId: number;
        fromUserName: string;
        type: string;
        payload: Record<string, unknown>;
      }) => {
        this.handleSignal(data);
      });
  }

  private async handleSignal(data: { fromUserId: number; fromUserName: string; type: string; payload: Record<string, unknown> }) {
    switch (data.type) {
      case 'offer': {
        const offerPayload = data.payload as unknown as RTCSessionDescriptionInit;
        this.pendingOffer = {
          ...offerPayload,
          sdp: offerPayload.sdp ? normalizeSdpLineEndings(offerPayload.sdp) : offerPayload.sdp,
        };
        this.session = { peerUserId: data.fromUserId, peerName: data.fromUserName, direction: 'incoming', status: 'ringing' };
        this.emit('incomingCall', this.session);
        break;
      }

      case 'answer':
        if (this.pc) {
          const answerPayload = data.payload as unknown as RTCSessionDescriptionInit;
          await this.pc.setRemoteDescription({
            ...answerPayload,
            sdp: answerPayload.sdp ? normalizeSdpLineEndings(answerPayload.sdp) : answerPayload.sdp,
          });
          if (this.session) {
            this.session.status = 'connecting';
            this.emit('statusChanged', this.session);
          }
        }
        break;

      case 'ice-candidate':
        if (data.payload?.candidate) {
          const candidate = data.payload as unknown as RTCIceCandidateInit;
          if (this.pc) {
            console.log('[P2PCall] received ICE candidate (applying now):', candidate.candidate);
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error('[P2PCall] Failed to add ICE candidate', err);
            }
          } else {
            // No peer connection yet (callee hasn't clicked Accept, or
            // caller hasn't finished setting up) — queue it and replay
            // once `pc` exists, instead of dropping it on the floor.
            console.log('[P2PCall] received ICE candidate before pc exists, queueing:', candidate.candidate);
            this.pendingIceCandidates.push(candidate);
          }
        }
        break;

      case 'reject':
        this.emit('callRejected', { peerUserId: data.fromUserId });
        this.cleanup();
        break;

      case 'hangup':
        this.cleanup();
        break;
    }
  }

  private async send(targetUserId: number, type: string, payload: Record<string, unknown>) {
    await api.post(`/signaling/${targetUserId}`, { type, payload });
  }

  private async flushPendingIceCandidates() {
    if (!this.pc || this.pendingIceCandidates.length === 0) return;
    const queued = this.pendingIceCandidates;
    this.pendingIceCandidates = [];
    console.log(`[P2PCall] flushing ${queued.length} queued ICE candidate(s)`);
    for (const candidate of queued) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[P2PCall] Failed to add queued ICE candidate', err);
      }
    }
  }

  private createPeerConnection(targetUserId: number) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[P2PCall] local ICE candidate:', event.candidate.type, event.candidate.candidate);
        this.send(targetUserId, 'ice-candidate', { candidate: event.candidate.toJSON() })
          .catch((err) => console.error('[P2PCall] Failed to send ICE candidate', err));
      } else {
        console.log('[P2PCall] ICE candidate gathering complete (null candidate)');
      }
    };

    pc.onicecandidateerror = (event: any) => {
      console.error('[P2PCall] ICE candidate error:', event.errorCode, event.errorText, event.url);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[P2PCall] ICE connection state:', pc.iceConnectionState);
    };

    pc.onicegatheringstatechange = () => {
      console.log('[P2PCall] ICE gathering state:', pc.iceGatheringState);
    };

    pc.onsignalingstatechange = () => {
      console.log('[P2PCall] Signaling state:', pc.signalingState);
    };

    pc.ontrack = (event) => {
      console.log('[P2PCall] Remote track received:', event.track.kind);
      this.remoteAudio.srcObject = event.streams[0];
    };

    pc.onconnectionstatechange = () => {
      console.log('[P2PCall] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected' && this.session) {
        this.session.status = 'active';
        this.connectedAt ??= Date.now();
        this.emit('statusChanged', this.session);
      }
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        this.cleanup();
      }
    };

    return pc;
  }

  async call(targetUserId: number, targetName: string) {
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    this.pc = this.createPeerConnection(targetUserId);
    this.localStream.getTracks().forEach((track) => this.pc!.addTrack(track, this.localStream!));
    await this.flushPendingIceCandidates();

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    console.log('[P2PCall] SENDING offer sdp (JSON-escaped):', JSON.stringify(offer.sdp));

    this.session = { peerUserId: targetUserId, peerName: targetName, direction: 'outgoing', status: 'calling' };
    this.emit('outgoingCall', this.session);

    await this.send(targetUserId, 'offer', offer as unknown as Record<string, unknown>);
  }

  async accept() {
    console.log('[P2PCall] accept() start', { hasPendingOffer: !!this.pendingOffer, hasSession: !!this.session });
    if (!this.pendingOffer || !this.session) {
      console.warn('[P2PCall] accept() aborted — no pending offer or session');
      return;
    }
    const targetUserId = this.session.peerUserId;

    console.log('[P2PCall] requesting microphone...');
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    console.log('[P2PCall] microphone granted');

    this.pc = this.createPeerConnection(targetUserId);
    this.localStream.getTracks().forEach((track) => this.pc!.addTrack(track, this.localStream!));

    console.log('[P2PCall] setting remote description (offer)...');
    await this.pc.setRemoteDescription(this.pendingOffer);
    await this.flushPendingIceCandidates();
    console.log('[P2PCall] creating answer...');
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    console.log('[P2PCall] local description (answer) set');

    this.session.status = 'connecting';
    this.emit('statusChanged', this.session);

    console.log('[P2PCall] sending answer to', targetUserId);
    await this.send(targetUserId, 'answer', answer as unknown as Record<string, unknown>);
    console.log('[P2PCall] answer sent successfully');
    this.pendingOffer = null;
  }

  async reject() {
    if (!this.session) return;
    await this.send(this.session.peerUserId, 'reject', {});
    this.cleanup();
  }

  async hangup() {
    if (!this.session) return;
    await this.send(this.session.peerUserId, 'hangup', {});
    this.cleanup();
  }

  mute() {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = false));
  }

  unmute() {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = true));
  }

  private cleanup() {
    if (this.session) {
      this.logInteraction(this.session, this.connectedAt);
    }

    this.pc?.close();
    this.pc = null;
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.remoteAudio.srcObject = null;
    this.pendingOffer = null;
    this.pendingIceCandidates = [];
    this.connectedAt = null;
    this.session = null;
    // Always tell the UI the call is fully gone — emitting 'statusChanged'
    // here left the hook's session state stuck at {status:'ended'} forever
    // (never null), making the UI look like hangup silently did nothing.
    this.emit('callEnded');
  }

  // Internal call, no customer involved (confirmed with the business owner
  // — these are agent-to-agent calls, not customer-facing), so this is a
  // plain audit record rather than a ticket: the `tickets` table requires
  // a real customer_id (NOT NULL FK), which doesn't exist here.
  // customer_interactions.customer_id IS nullable, so this fits without
  // any schema change. Fire-and-forget — a logging failure must never
  // disrupt the call UI, same pattern as logInteractionAsync in
  // TelephonyBar.jsx for Mitel calls.
  private logInteraction(session: P2PCallSession, connectedAt: number | null) {
    try {
      const agentId = authService.getCurrentUser()?.agent?.id;
      const durationMinutes = connectedAt ? Math.round((Date.now() - connectedAt) / 60000) : 0;
      const outcome = connectedAt ? 'completed' : session.direction === 'incoming' ? 'missed' : 'unanswered';

      customerInteractionService
        .createInteraction({
          agent_id: agentId,
          interaction_type: 'call',
          channel: 'phone',
          subject: `Internal call ${session.direction === 'outgoing' ? 'to' : 'from'} ${session.peerName}`,
          duration_minutes: durationMinutes,
          interaction_at: new Date().toISOString(),
          metadata: {
            p2p: true,
            peerUserId: session.peerUserId,
            peerName: session.peerName,
            direction: session.direction,
            outcome,
          },
        })
        .catch((err) => console.error('[P2PCall] Failed to log call interaction', err));
    } catch (err) {
      console.error('[P2PCall] Error preparing call interaction log', err);
    }
  }

  getSession() {
    return this.session;
  }

  on(evt: string, fn: Handler) {
    (this.handlers[evt] ??= []).push(fn);
    return () => this.off(evt, fn);
  }

  off(evt: string, fn: Handler) {
    this.handlers[evt] = (this.handlers[evt] || []).filter((h) => h !== fn);
  }

  private emit(evt: string, data?: unknown) {
    this.handlers[evt]?.forEach((fn) => fn(data));
  }
}

export const p2pCallService = new P2PCallService();
export default p2pCallService;
