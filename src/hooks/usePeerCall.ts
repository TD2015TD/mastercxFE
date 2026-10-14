import { useState, useEffect, useCallback } from 'react';
import p2pCallService from '../services/p2pCallService';
import type { P2PCallSession } from '../services/p2pCallService';

export function usePeerCall(currentUserId: number | null) {
  const [session, setSession] = useState<P2PCallSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) return;
    // Signaling channel subscription is independent of Available/Offline —
    // presence (who's callable) is driven separately by the CRM status
    // dropdown, see UserProfileDropdown.
    p2pCallService.initialize(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    const handleIncoming = (data: unknown) => setSession(data as P2PCallSession);
    const handleOutgoing = (data: unknown) => setSession(data as P2PCallSession);
    const handleStatusChanged = (data: unknown) => setSession({ ...(data as P2PCallSession) });
    const handleEnded = () => setSession(null);
    const handleRejected = () => setSession(null);

    const offIncoming = p2pCallService.on('incomingCall', handleIncoming);
    const offOutgoing = p2pCallService.on('outgoingCall', handleOutgoing);
    const offStatus = p2pCallService.on('statusChanged', handleStatusChanged);
    const offEnded = p2pCallService.on('callEnded', handleEnded);
    const offRejected = p2pCallService.on('callRejected', handleRejected);

    return () => {
      offIncoming();
      offOutgoing();
      offStatus();
      offEnded();
      offRejected();
    };
  }, []);

  const call = useCallback(async (targetUserId: number, targetName: string) => {
    try {
      setError(null);
      await p2pCallService.call(targetUserId, targetName);
    } catch (err: any) {
      setError(err.message || 'Failed to start call');
      throw err;
    }
  }, []);

  const accept = useCallback(async () => {
    try {
      console.log('[usePeerCall] accept() called');
      await p2pCallService.accept();
      console.log('[usePeerCall] accept() completed');
    } catch (err: any) {
      console.error('[usePeerCall] accept() failed:', err);
      setError(err.message || 'Failed to accept call');
    }
  }, []);

  const reject = useCallback(() => p2pCallService.reject(), []);
  const hangup = useCallback(() => p2pCallService.hangup(), []);
  const mute = useCallback(() => p2pCallService.mute(), []);
  const unmute = useCallback(() => p2pCallService.unmute(), []);

  return { session, error, call, accept, reject, hangup, mute, unmute };
}

export default usePeerCall;
