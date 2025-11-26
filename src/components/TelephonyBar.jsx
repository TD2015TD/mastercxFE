import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';

const TelephonyBar = ({ className = '', onCallEvent }) => {
  // State management for the finite state machine
  const [status, setStatus] = useState('IDLE');
  const [caller, setCaller] = useState(null);
  const [timer, setTimer] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [showWrapUp, setShowWrapUp] = useState(false);
  const [wrapUpCode, setWrapUpCode] = useState('');
  const [wrapUpNotes, setWrapUpNotes] = useState('');
  
  const intervalRef = useRef(null);
  const autoResetTimeoutRef = useRef(null);

  // Mock caller data for demo
  const mockCaller = {
    name: 'Lim Wei Ming',
    number: '+6012-345-6789',
    queue: 'Customs Ops'
  };

  // Timer management
  useEffect(() => {
    if (status === 'IN_CALL') {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef?.current) {
        clearInterval(intervalRef?.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef?.current) {
        clearInterval(intervalRef?.current);
      }
    };
  }, [status]);

  // Auto-reset after call ends
  useEffect(() => {
    if (status === 'ENDED') {
      autoResetTimeoutRef.current = setTimeout(() => {
        setShowWrapUp(true);
      }, 3000);
    }

    return () => {
      if (autoResetTimeoutRef?.current) {
        clearTimeout(autoResetTimeoutRef?.current);
      }
    };
  }, [status]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  // Demo mode: simulate incoming call
  const demoIncoming = useCallback(() => {
    if (status !== 'IDLE') return;
    
    setCaller(mockCaller);
    setTimer(0);
    setMuted(false);
    setStatus('RINGING');
    
    // Fire telephony event
    onCallEvent?.('telephony:incoming', { caller: mockCaller });
  }, [status, onCallEvent]);

  // Accept incoming call
  const acceptCall = useCallback(() => {
    if (status === 'RINGING') {
      setStatus('IN_CALL');
      onCallEvent?.('telephony:connected', { caller, duration: timer });
    }
  }, [status, caller, timer, onCallEvent]);

  // Hang up call
  const hangUp = useCallback(() => {
    if (status === 'IN_CALL' || status === 'RINGING' || status === 'TRANSFERRING') {
      setStatus('ENDED');
      onCallEvent?.('telephony:ended', { caller, duration: timer });
    }
  }, [status, caller, timer, onCallEvent]);

  // Start transfer process
  const startTransfer = useCallback(() => {
    if (status === 'IN_CALL') {
      setIsTransferModalOpen(true);
    }
  }, [status]);

  // Execute transfer
  const executeTransfer = useCallback(() => {
    if (transferTarget?.trim()) {
      setStatus('TRANSFERRING');
      setIsTransferModalOpen(false);
      
      // Simulate transfer process
      setTimeout(() => {
        setStatus('ENDED');
        onCallEvent?.('telephony:transferred', { 
          caller, 
          target: transferTarget, 
          duration: timer 
        });
        setTransferTarget('');
      }, 2000);
    }
  }, [transferTarget, caller, timer, onCallEvent]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (status === 'IN_CALL') {
      setMuted(prev => !prev);
      onCallEvent?.('telephony:muted', { caller, muted: !muted });
    }
  }, [status, caller, muted, onCallEvent]);

  // Complete wrap-up and reset
  const completeWrapUp = useCallback(() => {
    // Create interaction log
    onCallEvent?.('telephony:wrap_up', {
      caller,
      duration: timer,
      wrapUpCode,
      notes: wrapUpNotes,
      type: 'voice'
    });

    // Reset to idle state
    setStatus('IDLE');
    setCaller(null);
    setTimer(0);
    setMuted(false);
    setShowWrapUp(false);
    setWrapUpCode('');
    setWrapUpNotes('');
  }, [caller, timer, wrapUpCode, wrapUpNotes, onCallEvent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for exact key combinations
      if (event?.ctrlKey && event?.shiftKey && event?.key === 'P') {
        event?.preventDefault();
        demoIncoming();
        return;
      }

      // Single key shortcuts (only when not typing in input fields)
      if (event?.target?.tagName === 'INPUT' || event?.target?.tagName === 'TEXTAREA') {
        return;
      }

      switch (event?.key?.toUpperCase()) {
        case 'A':
          if (status === 'RINGING') {
            event?.preventDefault();
            acceptCall();
          }
          break;
        case 'H':
          if (status === 'IN_CALL' || status === 'RINGING') {
            event?.preventDefault();
            hangUp();
          }
          break;
        case 'T':
          if (status === 'IN_CALL') {
            event?.preventDefault();
            startTransfer();
          }
          break;
        case 'M':
          if (status === 'IN_CALL') {
            event?.preventDefault();
            toggleMute();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [status, demoIncoming, acceptCall, hangUp, startTransfer, toggleMute]);

  // Get status pill styling and text
  const getStatusDisplay = () => {
    switch (status) {
      case 'IDLE':
        return {
          text: 'Ready',
          className: 'bg-gray-100 text-gray-700 border-gray-300'
        };
      case 'RINGING':
        return {
          text: `Incoming from ${caller?.name} (${caller?.number})`,
          className: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
        };
      case 'IN_CALL':
        return {
          text: `In Call — ${formatTime(timer)}`,
          className: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'TRANSFERRING':
        return {
          text: `Transferring to ${transferTarget}...`,
          className: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      case 'ENDED':
        return {
          text: `Call Ended — ${formatTime(timer)}`,
          className: 'bg-red-100 text-red-800 border-red-300'
        };
      default:
        return {
          text: 'Ready',
          className: 'bg-gray-100 text-gray-700 border-gray-300'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <>
      {/* Main Telephony Bar */}
      <div className={`h-12 w-full bg-card border border-border rounded-lg shadow-sm flex items-center justify-between px-4 ${className}`}>
        {/* Status Pill */}
        <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${statusDisplay?.className}`}>
          <Icon 
            name={status === 'RINGING' ? 'PhoneIncoming' : status === 'IN_CALL' ? 'Phone' : 'PhoneOff'} 
            size={14} 
            className="mr-2" 
          />
          {statusDisplay?.text}
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-2">
          {/* Call/Accept Button */}
          <Button
            variant="ghost"
            size="sm"
            iconName={status === 'RINGING' ? 'PhoneCall' : 'Phone'}
            onClick={status === 'RINGING' ? acceptCall : demoIncoming}
            disabled={status === 'IN_CALL' || status === 'TRANSFERRING' || status === 'ENDED'}
            className={`${status === 'RINGING' ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'}`}
            title={status === 'RINGING' ? 'Accept Call (A)' : 'Demo Incoming Call (Ctrl+Shift+P)'}
            aria-label={status === 'RINGING' ? 'Accept incoming call' : 'Start demo call'}
          />

          {/* Hang Up Button */}
          <Button
            variant="ghost"
            size="sm"
            iconName="PhoneOff"
            onClick={hangUp}
            disabled={status !== 'IN_CALL' && status !== 'RINGING' && status !== 'TRANSFERRING'}
            className="text-red-600 hover:text-red-700"
            title="Hang Up (H)"
            aria-label="Hang up call"
          />

          {/* Transfer Button */}
          <Button
            variant="ghost"
            size="sm"
            iconName="PhoneForwarded"
            onClick={startTransfer}
            disabled={status !== 'IN_CALL'}
            className="text-blue-600 hover:text-blue-700"
            title="Transfer Call (T)"
            aria-label="Transfer call"
          />

          {/* Wrap-Up Button */}
          <Button
            variant="ghost"
            size="sm"
            iconName="FileText"
            onClick={() => setShowWrapUp(true)}
            disabled={status !== 'ENDED'}
            className="text-purple-600 hover:text-purple-700"
            title="Wrap-Up"
            aria-label="Open wrap-up form"
          />

          {/* Mute Button */}
          <Button
            variant="ghost"
            size="sm"
            iconName={muted ? 'MicOff' : 'Mic'}
            onClick={toggleMute}
            disabled={status !== 'IN_CALL'}
            className={`${muted ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-gray-700'}`}
            title="Mute/Unmute (M)"
            aria-label={muted ? 'Unmute call' : 'Mute call'}
          />
        </div>

        {/* CTI Info (when applicable) */}
        {(status === 'RINGING' || status === 'IN_CALL') && caller && (
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span className="font-medium">{caller?.name}</span>
            <span className="mx-2">•</span>
            <span>{caller?.number}</span>
            <span className="mx-2">•</span>
            <span className="text-blue-600">{caller?.queue}</span>
          </div>
        )}
      </div>
      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Transfer Call</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="transfer-target" className="block text-sm font-medium mb-2">
                  Agent/Ext/Queue
                </label>
                <input
                  id="transfer-target"
                  type="text"
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e?.target?.value)}
                  placeholder="Enter extension, agent ID, or queue"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTransferModalOpen(false);
                    setTransferTarget('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={executeTransfer}
                  disabled={!transferTarget?.trim()}
                >
                  Transfer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Wrap-Up Modal */}
      {showWrapUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Call Wrap-Up</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="wrap-up-code" className="block text-sm font-medium mb-2">
                  Wrap-Up Code
                </label>
                <select
                  id="wrap-up-code"
                  value={wrapUpCode}
                  onChange={(e) => setWrapUpCode(e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a code...</option>
                  <option value="resolved">Issue Resolved</option>
                  <option value="information">Information Provided</option>
                  <option value="escalated">Escalated to Supervisor</option>
                  <option value="callback">Callback Required</option>
                  <option value="transferred">Transferred to Department</option>
                </select>
              </div>
              <div>
                <label htmlFor="wrap-up-notes" className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <textarea
                  id="wrap-up-notes"
                  value={wrapUpNotes}
                  onChange={(e) => setWrapUpNotes(e?.target?.value)}
                  placeholder="Enter call notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={completeWrapUp}
                >
                  Skip & Close
                </Button>
                <Button
                  variant="default"
                  onClick={completeWrapUp}
                >
                  Save & Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TelephonyBar;