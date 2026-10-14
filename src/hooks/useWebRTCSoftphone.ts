import { useState, useEffect, useCallback, useRef } from 'react';
import { softphone } from '../services/webrtcSoftphone';
import type { CallSession } from '../services/webrtcSoftphone';

interface SoftphoneState {
  isInitializing: boolean;
  isConnected: boolean;
  isRegistered: boolean;
  // True only while a mihotdesk SUBSCRIBE is confirmed active — distinct
  // from isRegistered (bare SIP REGISTER can succeed while hot-desk login
  // never did, or later silently drops out from under an otherwise-healthy
  // registration). Placing an outbound call while this is false gets
  // rejected by Mitel with a 400, even though isRegistered/isReady looks
  // fine — confirmed directly against this tenant.
  isHotDeskActive: boolean;
  // True while the service is silently retrying a dropped connection in the
  // background (see webrtcSoftphone.ts's scheduleReconnect) — distinct from
  // isInitializing, which only covers the very first, explicit connect.
  isReconnecting: boolean;
  currentCall: CallSession | null;
  error: string | null;
}

export const useWebRTCSoftphone = () => {
  const [state, setState] = useState<SoftphoneState>({
    isInitializing: false,
    isConnected: false,
    isRegistered: false,
    isHotDeskActive: false,
    isReconnecting: false,
    currentCall: null,
    error: null
  });

  // Guards against a second initialize() firing while one is already in
  // flight. Deliberately NOT "have we ever initialized" — connect() in the
  // underlying service already tears down any existing registration before
  // creating a new one, so re-running initialize() after a disconnect must
  // be allowed, not permanently blocked.
  const isInitializingRef = useRef(false);

  /**
   * Initialize the softphone
   * @param employeeId - The employee ID to initialize the softphone for
   */
  const initialize = useCallback(async (employeeId: string) => {
    if (isInitializingRef.current) {
      console.log('[useWebRTCSoftphone] Initialization already in progress');
      return;
    }

    if (!employeeId) {
      console.error('[useWebRTCSoftphone] Employee ID is required');
      setState(prev => ({
        ...prev,
        error: 'Employee ID is required to initialize softphone'
      }));
      return;
    }

    isInitializingRef.current = true;
    setState(prev => ({ ...prev, isInitializing: true, error: null }));

    try {
      await softphone.initialize(employeeId);
      setState(prev => ({ ...prev, isInitializing: false }));
    } catch (error: any) {
      console.error('[useWebRTCSoftphone] Initialization error:', error);
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: error.message || 'Failed to initialize softphone'
      }));
      throw error;
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  /**
   * Make an outgoing call
   */
  const makeCall = useCallback(async (destination: string, contact?: { id?: string; name?: string; type?: string; agentId?: string | null }) => {
    try {
      await softphone.makeCall(destination, contact);
    } catch (error: any) {
      console.error('[useWebRTCSoftphone] Make call error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to make call'
      }));
      throw error;
    }
  }, []);

  /**
   * Answer incoming call
   */
  const answerCall = useCallback(() => {
    return softphone.answerCall();
  }, []);

  /**
   * End current call
   */
  const endCall = useCallback(() => {
    return softphone.endCall();
  }, []);

  /**
   * Hold current call
   */
  const holdCall = useCallback(() => {
     softphone.holdCall();
  }, []);

  /**
   * Resume current call
   */
  const resumeCall = useCallback(() => {
    return softphone.resumeCall();
  }, []);

  /**
   * Mute microphone
   */
  const mute = useCallback(() => {
    return softphone.mute();
  }, []);

  /**
   * Unmute microphone
   */
  const unmute = useCallback(() => {
    return softphone.unmute();
  }, []);

  /**
   * Disconnect softphone
   */
  const disconnect = useCallback(async () => {
    await softphone.disconnect();
    setState({
      isInitializing: false,
      isConnected: false,
      isRegistered: false,
      isHotDeskActive: false,
      isReconnecting: false,
      currentCall: null,
      error: null
    });
  }, []);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    // Connection events
    const handleConnected = () => {
      console.log('[useWebRTCSoftphone] Connected');
      setState(prev => ({ ...prev, isConnected: true }));
    };

    const handleDisconnected = () => {
      console.log('[useWebRTCSoftphone] Disconnected');
      setState(prev => ({ ...prev, isConnected: false, isRegistered: false, isHotDeskActive: false }));
    };

    const handleRegistered = () => {
      console.log('[useWebRTCSoftphone] Registered');
      setState(prev => ({ ...prev, isRegistered: true, error: null }));
    };

    const handleUnregistered = () => {
      console.log('[useWebRTCSoftphone] Unregistered');
      setState(prev => ({ ...prev, isRegistered: false }));
    };

    const handleRegistrationFailed = (data: any) => {
      console.error('[useWebRTCSoftphone] Registration failed:', data);
      setState(prev => ({
        ...prev,
        isRegistered: false,
        isHotDeskActive: false,
        error: 'SIP registration failed'
      }));
    };

    const handleHotDeskActive = () => {
      console.log('[useWebRTCSoftphone] Hot-desk active');
      setState(prev => ({ ...prev, isHotDeskActive: true }));
    };

    const handleHotDeskInactive = (data: any) => {
      console.warn('[useWebRTCSoftphone] Hot-desk inactive:', data);
      setState(prev => ({ ...prev, isHotDeskActive: false }));
    };

    const handleReconnecting = (data: any) => {
      console.log('[useWebRTCSoftphone] Reconnecting:', data);
      setState(prev => ({ ...prev, isReconnecting: true }));
    };

    const handleReconnected = () => {
      console.log('[useWebRTCSoftphone] Reconnected');
      setState(prev => ({ ...prev, isReconnecting: false, error: null }));
    };

    const handleReconnectFailed = (data: any) => {
      console.error('[useWebRTCSoftphone] Reconnect failed:', data);
      setState(prev => ({
        ...prev,
        isReconnecting: false,
        error: 'Softphone lost connection and could not automatically reconnect'
      }));
    };

    // Call events
    const handleIncomingCall = (callSession: CallSession) => {
      console.log('[useWebRTCSoftphone] Incoming call:', callSession);
      setState(prev => ({ ...prev, currentCall: callSession }));
    };

    const handleOutgoingCall = (callSession: CallSession) => {
      console.log('[useWebRTCSoftphone] Outgoing call:', callSession);
      setState(prev => ({ ...prev, currentCall: callSession }));
    };

    const handleCallAccepted = () => {
      console.log('[useWebRTCSoftphone] Call accepted');
      setState(prev => ({
        ...prev,
        currentCall: prev.currentCall ? { ...prev.currentCall, status: 'answered' } : null
      }));
    };

    const handleCallConfirmed = () => {
      console.log('[useWebRTCSoftphone] Call confirmed');
      setState(prev => ({
        ...prev,
        currentCall: prev.currentCall ? { ...prev.currentCall, status: 'active' } : null
      }));
    };

    const handleCallEnded = () => {
      console.log('[useWebRTCSoftphone] Call ended');
      setState(prev => ({ ...prev, currentCall: null }));
    };

    const handleCallFailed = (data: any) => {
      console.error('[useWebRTCSoftphone] Call failed:', data);
      setState(prev => ({
        ...prev,
        currentCall: null,
        error: 'Call failed'
      }));
    };

    const handleCallHold = () => {
      console.log('[useWebRTCSoftphone] Call on hold');
      setState(prev => ({
        ...prev,
        currentCall: prev.currentCall ? { ...prev.currentCall, status: 'held' } : null
      }));
    };

    const handleCallUnhold = () => {
      console.log('[useWebRTCSoftphone] Call resumed');
      setState(prev => ({
        ...prev,
        currentCall: prev.currentCall ? { ...prev.currentCall, status: 'answered' } : null
      }));
    };

    // Register event listeners
    softphone.on('connected', handleConnected);
    softphone.on('disconnected', handleDisconnected);
    softphone.on('registered', handleRegistered);
    softphone.on('unregistered', handleUnregistered);
    softphone.on('registrationFailed', handleRegistrationFailed);
    softphone.on('hotDeskActive', handleHotDeskActive);
    softphone.on('hotDeskInactive', handleHotDeskInactive);
    softphone.on('reconnecting', handleReconnecting);
    softphone.on('reconnected', handleReconnected);
    softphone.on('reconnectFailed', handleReconnectFailed);
    softphone.on('incomingCall', (data) => handleIncomingCall(data as CallSession));
    softphone.on('outgoingCall', (data) => handleOutgoingCall(data as CallSession));
    softphone.on('callAccepted', handleCallAccepted);
    softphone.on('callConfirmed', handleCallConfirmed);
    softphone.on('callEnded', handleCallEnded);
    softphone.on('callFailed', handleCallFailed);
    softphone.on('callHold', handleCallHold);
    softphone.on('callUnhold', handleCallUnhold);

    // Cleanup
    return () => {
      softphone.off('connected', handleConnected);
      softphone.off('disconnected', handleDisconnected);
      softphone.off('registered', handleRegistered);
      softphone.off('unregistered', handleUnregistered);
      softphone.off('registrationFailed', handleRegistrationFailed);
      softphone.off('hotDeskActive', handleHotDeskActive);
      softphone.off('hotDeskInactive', handleHotDeskInactive);
      softphone.off('reconnecting', handleReconnecting);
      softphone.off('reconnected', handleReconnected);
      softphone.off('reconnectFailed', handleReconnectFailed);
      softphone.off('incomingCall', (data) => handleIncomingCall(data as CallSession));
      softphone.off('outgoingCall', (data) => handleOutgoingCall(data as CallSession));
      softphone.off('callAccepted', handleCallAccepted);
      softphone.off('callConfirmed', handleCallConfirmed);
      softphone.off('callEnded', handleCallEnded);
      softphone.off('callFailed', handleCallFailed);
      softphone.off('callHold', handleCallHold);
      softphone.off('callUnhold', handleCallUnhold);
    };
  }, []);

  return {
    // State
    ...state,
    isReady: state.isRegistered,

    // Methods
    initialize,
    makeCall,
    answerCall,
    endCall,
    holdCall,
    resumeCall,
    mute,
    unmute,
    disconnect
  };
};

export default useWebRTCSoftphone;
