import { useState, useEffect, useCallback, useRef } from 'react';
import { softphone } from '../services/webrtcSoftphone';
import type { CallSession } from '../services/webrtcSoftphone';

interface SoftphoneState {
  isInitializing: boolean;
  isConnected: boolean;
  isRegistered: boolean;
  currentCall: CallSession | null;
  error: string | null;
}

export const useWebRTCSoftphone = () => {
  const [state, setState] = useState<SoftphoneState>({
    isInitializing: false,
    isConnected: false,
    isRegistered: false,
    currentCall: null,
    error: null
  });

  const isInitializedRef = useRef(false);

  /**
   * Initialize the softphone
   * @param employeeId - The employee ID to initialize the softphone for
   */
  const initialize = useCallback(async (employeeId: string) => {
    if (isInitializedRef.current) {
      console.log('[useWebRTCSoftphone] Already initialized');
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

    setState(prev => ({ ...prev, isInitializing: true, error: null }));

    try {
      await softphone.initialize(employeeId);
      isInitializedRef.current = true;
      setState(prev => ({ ...prev, isInitializing: false }));
    } catch (error: any) {
      console.error('[useWebRTCSoftphone] Initialization error:', error);
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: error.message || 'Failed to initialize softphone'
      }));
    }
  }, []);

  /**
   * Make an outgoing call
   */
  const makeCall = useCallback(async (destination: string) => {
    try {
      await softphone.makeCall(destination);
    } catch (error: any) {
      console.error('[useWebRTCSoftphone] Make call error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to make call'
      }));
    }
  }, []);

  /**
   * Answer incoming call
   */
  const answerCall = useCallback(() => {
    softphone.answerCall();
  }, []);

  /**
   * End current call
   */
  const endCall = useCallback(() => {
    softphone.endCall();
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
    softphone.resumeCall();
  }, []);

  /**
   * Mute microphone
   */
  const mute = useCallback(() => {
    softphone.mute();
  }, []);

  /**
   * Unmute microphone
   */
  const unmute = useCallback(() => {
    softphone.unmute();
  }, []);

  /**
   * Disconnect softphone
   */
  const disconnect = useCallback(() => {
    softphone.disconnect();
    isInitializedRef.current = false;
    setState({
      isInitializing: false,
      isConnected: false,
      isRegistered: false,
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
      setState(prev => ({ ...prev, isConnected: false, isRegistered: false }));
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
        error: 'SIP registration failed'
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
