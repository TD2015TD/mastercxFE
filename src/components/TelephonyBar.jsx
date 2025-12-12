import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { useMitelSignalR } from '../hooks/useMitelSignalR';

const TelephonyBar = ({ className = '', onCallEvent }) => {
  // FSM state
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

  // ---- Mitel SignalR Hook ----
  const { state: connState, on, invoke, error } = useMitelSignalR({
    baseUrl: 'https://micc.telediant.com.my/MiccSdk/signalr',
    hubs: ['queueHub', 'employeeHub', 'agentHub'],
    token: localStorage.getItem('mitel_token')
  });

  // ---- Map Mitel events → FSM ----
  useEffect(() => {
    console.log('🔗 Setting up Mitel event listeners...');

    // Employee conversation events (this is what Mitel actually uses for calls)
    const offConversationChanged = on('employeeHub', 'employeeConversationChanged', (data) => {
      console.log('📞 Conversation Changed:', data);
      
      // Map conversation state to your FSM
      if (data?.state === 'Ringing' || data?.state === 'Alerting') {
        setCaller({
          name: data?.remotePartyName || data?.ani,
          number: data?.ani || data?.remoteParty,
          queue: data?.queueName
        });
        setTimer(0);
        setMuted(false);
        setStatus('RINGING');
        onCallEvent?.('telephony:incoming', data);
      } else if (data?.state === 'Connected' || data?.state === 'Active') {
        setStatus('IN_CALL');
        onCallEvent?.('telephony:connected', data);
      }
    });

    const offConversationRemoved = on('employeeHub', 'employeeConversationRemoved', (data) => {
      console.log('📞 Conversation Removed:', data);
      setStatus('ENDED');
      onCallEvent?.('telephony:ended', data);
    });

    // Employee state changes
    const offEmployeeState = on('employeeHub', 'employeeStateChanged', (data) => {
      console.log('👤 Employee State Changed:', data);
      // You can track agent presence here if needed
    });

    // Agent state changes (alternative event)
    const offAgentState = on('agentHub', 'onAgentStateChanged', (data) => {
      console.log('🎧 Agent State Changed:', data);
    });

    // Queue-level events (if you add queue monitors)
    const offQueueConversation = on('queueHub', 'queueConversationChanged', (data) => {
      console.log('📋 Queue Conversation Changed:', data);
    });

    return () => {
      offConversationChanged();
      offConversationRemoved();
      offEmployeeState();
      offAgentState();
      offQueueConversation();
    };
  }, [on, onCallEvent]);

  // ---- Timer management ----
  useEffect(() => {
    if (status === 'IN_CALL') {
      intervalRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  // ---- Auto-wrap-up modal ----
  useEffect(() => {
    if (status === 'ENDED') {
      autoResetTimeoutRef.current = setTimeout(() => setShowWrapUp(true), 3000);
    }
    return () => clearTimeout(autoResetTimeoutRef.current);
  }, [status]);

  // ---- Format timer ----
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ---- Demo mode ----
  const mockCaller = { name: 'Lim Wei Ming', number: '+6012-345-6789', queue: 'Customs Ops' };
  const demoIncoming = useCallback(() => {
    if (status !== 'IDLE') return;
    setCaller(mockCaller);
    setTimer(0);
    setMuted(false);
    setStatus('RINGING');
    onCallEvent?.('telephony:incoming', { caller: mockCaller });
  }, [status, onCallEvent]);

  // ---- Action handlers ----
  const acceptCall = useCallback(async () => {
    if (status === 'RINGING') {
      try {
        // Mitel method to answer call - check your API docs for exact method name
        await invoke('employeeHub', 'answerConversation', { /* conversation ID */ });
        console.log('✅ Answered call');
      } catch (err) {
        console.error('❌ Failed to answer call:', err);
      }
    }
  }, [status, invoke]);

  const hangUp = useCallback(async () => {
    if (['IN_CALL', 'RINGING', 'TRANSFERRING'].includes(status)) {
      try {
        // Mitel method to end call
        await invoke('employeeHub', 'endConversation', { /* conversation ID */ });
        console.log('✅ Call ended');
      } catch (err) {
        console.error('❌ Failed to end call:', err);
      }
    }
  }, [status, invoke]);

  const toggleMute = useCallback(async () => {
    if (status === 'IN_CALL') {
      try {
        await invoke('employeeHub', muted ? 'unmute' : 'mute', { /* conversation ID */ });
        setMuted(prev => !prev);
        console.log(`✅ ${muted ? 'Unmuted' : 'Muted'}`);
      } catch (err) {
        console.error('❌ Failed to toggle mute:', err);
      }
    }
  }, [status, muted, invoke]);

  const startTransfer = useCallback(() => {
    if (status === 'IN_CALL') setIsTransferModalOpen(true);
  }, [status]);

  const executeTransfer = useCallback(async () => {
    if (!transferTarget.trim()) return;
    setStatus('TRANSFERRING');
    setIsTransferModalOpen(false);

    try {
      await invoke('employeeHub', 'transferConversation', {
        target: transferTarget,
        // Add conversation ID and other required params
      });
      setStatus('ENDED');
      onCallEvent?.('telephony:transferred', { caller, target: transferTarget, duration: timer });
      setTransferTarget('');
      console.log('✅ Transfer initiated');
    } catch (err) {
      console.error('❌ Transfer failed:', err);
      setStatus('IN_CALL'); // Revert on error
    }
  }, [transferTarget, caller, timer, invoke, onCallEvent]);

  const completeWrapUp = useCallback(() => {
    onCallEvent?.('telephony:wrap_up', { caller, duration: timer, wrapUpCode, notes: wrapUpNotes, type: 'voice' });
    setStatus('IDLE');
    setCaller(null);
    setTimer(0);
    setMuted(false);
    setShowWrapUp(false);
    setWrapUpCode('');
    setWrapUpNotes('');
  }, [caller, timer, wrapUpCode, wrapUpNotes, onCallEvent]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') { e.preventDefault(); demoIncoming(); return; }
      if (['INPUT','TEXTAREA'].includes(e.target?.tagName)) return;
      switch(e.key.toUpperCase()){
        case 'A': if(status==='RINGING'){e.preventDefault();acceptCall();} break;
        case 'H': if(['IN_CALL','RINGING'].includes(status)){e.preventDefault();hangUp();} break;
        case 'T': if(status==='IN_CALL'){e.preventDefault();startTransfer();} break;
        case 'M': if(status==='IN_CALL'){e.preventDefault();toggleMute();} break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [status, demoIncoming, acceptCall, hangUp, startTransfer, toggleMute]);

  // ---- Status display ----
  const getStatusDisplay = () => {
    switch(status){
      case 'IDLE': return { text:'Ready', className:'bg-gray-100 text-gray-700 border-gray-300' };
      case 'RINGING': return { text:`Incoming from ${caller?.name} (${caller?.number})`, className:'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' };
      case 'IN_CALL': return { text:`In Call – ${formatTime(timer)}`, className:'bg-green-100 text-green-800 border-green-300' };
      case 'TRANSFERRING': return { text:`Transferring to ${transferTarget}...`, className:'bg-blue-100 text-blue-800 border-blue-300' };
      case 'ENDED': return { text:`Call Ended – ${formatTime(timer)}`, className:'bg-red-100 text-red-800 border-red-300' };
      default: return { text:'Ready', className:'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };
  const statusDisplay = getStatusDisplay();

  // ---- Connection indicator ----
  const connectionStatus = {
    'connected': '🟢',
    'connecting': '🟡',
    'reconnecting': '🟡',
    'disconnected': '🔴'
  }[connState] || '⚪';

  // ---- Render ----
  return (
    <>
      <div className={`h-12 w-full bg-card border border-border rounded-lg shadow-sm flex items-center justify-between px-4 ${className}`}>
        <div className="flex items-center gap-2">
          <span title={`SignalR: ${connState}`}>{connectionStatus}</span>
          <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${statusDisplay?.className}`}>
            <Icon name={status==='RINGING'?'PhoneIncoming':status==='IN_CALL'?'Phone':'PhoneOff'} size={14} className="mr-2"/>
            {statusDisplay?.text}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" iconName={status==='RINGING'?'PhoneCall':'Phone'} onClick={status==='RINGING'?acceptCall:demoIncoming} disabled={['IN_CALL','TRANSFERRING','ENDED'].includes(status)} title={status==='RINGING'?'Accept Call (A)':'Demo Incoming Call (Ctrl+Shift+P)'} />
          <Button variant="ghost" size="sm" iconName="PhoneOff" onClick={hangUp} disabled={!['IN_CALL','RINGING','TRANSFERRING'].includes(status)} title="Hang Up (H)" />
          <Button variant="ghost" size="sm" iconName="PhoneForwarded" onClick={startTransfer} disabled={status!=='IN_CALL'} title="Transfer Call (T)" />
          <Button variant="ghost" size="sm" iconName="FileText" onClick={()=>setShowWrapUp(true)} disabled={status!=='ENDED'} title="Wrap-Up" />
          <Button variant="ghost" size="sm" iconName={muted?'MicOff':'Mic'} onClick={toggleMute} disabled={status!=='IN_CALL'} title="Mute/Unmute (M)" />
        </div>

        {(status==='RINGING'||status==='IN_CALL') && caller && (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={()=>{setIsTransferModalOpen(false);setTransferTarget('');}}>
          <div className="bg-card border border-border rounded-lg p-6 w-96" onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Transfer Call</h3>
            <input type="text" value={transferTarget} onChange={e=>setTransferTarget(e.target.value)} placeholder="Enter agent/queue" className="w-full px-3 py-2 border rounded-md mb-4"/>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={()=>{setIsTransferModalOpen(false);setTransferTarget('');}}>Cancel</Button>
              <Button variant="default" onClick={executeTransfer} disabled={!transferTarget.trim()}>Transfer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Wrap-Up Modal */}
      {showWrapUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={()=>{setShowWrapUp(false);setWrapUpCode('');setWrapUpNotes('');}}>
          <div className="bg-card border border-border rounded-lg p-6 w-96" onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Call Wrap-Up</h3>
            <select value={wrapUpCode} onChange={e=>setWrapUpCode(e.target.value)} className="w-full px-3 py-2 border rounded-md mb-2">
              <option value="">Select a code...</option>
              <option value="resolved">Issue Resolved</option>
              <option value="information">Information Provided</option>
              <option value="escalated">Escalated to Supervisor</option>
              <option value="callback">Callback Required</option>
              <option value="transferred">Transferred</option>
            </select>
            <textarea value={wrapUpNotes} onChange={e=>setWrapUpNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md mb-4" placeholder="Notes..."/>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={completeWrapUp}>Skip & Close</Button>
              <Button variant="default" onClick={completeWrapUp}>Save & Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TelephonyBar;