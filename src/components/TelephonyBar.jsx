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
  const [agentStatus, setAgentStatus] = useState('Offline');
  const [isReadyForCalls, setIsReadyForCalls] = useState(false);

  const intervalRef = useRef(null);
  const autoResetTimeoutRef = useRef(null);

  // ---- Mitel SignalR Hook ----
  const { state: connState, on, invoke, error } = useMitelSignalR({
    baseUrl: 'https://micc.telediant.com.my/MiccSdk/signalr',
    hubs: ['queueHub', 'employeeHub', 'agentHub'],
    token: localStorage.getItem('mitel_token')
  });

  // Subscribe to employee and queue monitoring when connected
  useEffect(() => {
    if (connState === 'connected') {
      console.log('🔗 SignalR Connected - No subscription needed, listening for events directly');

      // NOTE: Mitel may not require explicit subscription if you're already authenticated
      // Events should be pushed automatically once connected
      // If you find the correct subscription method name, add it here
    }
  }, [connState, invoke]);

  // ---- Map Mitel events → FSM ----
  useEffect(() => {
    console.log('🔗 Setting up Mitel event listeners...');

    // Media Stats Updated - This event is fired when call media stats are updated
    const offMediaStats = on('employeeHub', 'mediaStatsUpdated', (data) => {
      console.log('📊 Media Stats Updated:', JSON.stringify(data, null, 2));
      // This event indicates an active call is in progress
      // You can use this as an additional indicator that a call is active
    });

    // Alternative event names that might be used by Mitel
    const offConversationAssigned = on('employeeHub', 'conversationAssigned', (data) => {
      console.log('📞 Conversation ASSIGNED:', JSON.stringify(data, null, 2));
      if (data) {
        setCaller({
          name: data?.remotePartyName || data?.ani || data?.remoteParty || 'Unknown',
          number: data?.ani || data?.remoteParty || data?.dnis || 'Unknown',
          queue: data?.queueName || data?.queue?.name || 'General'
        });
        setTimer(0);
        setMuted(false);
        setStatus('RINGING');
        onCallEvent?.('telephony:incoming', data);
      }
    });

    const offEmployeeConversation = on('employeeHub', 'employeeConversation', (data) => {
      console.log('📞 Employee Conversation:', JSON.stringify(data, null, 2));
      // Handle various conversation events
      if (data?.state === 'Ringing' || data?.state === 'Alerting') {
        setCaller({
          name: data?.remotePartyName || data?.ani || data?.remoteParty || 'Unknown',
          number: data?.ani || data?.remoteParty || data?.dnis || 'Unknown',
          queue: data?.queueName || data?.queue?.name || 'General'
        });
        setTimer(0);
        setMuted(false);
        setStatus('RINGING');
        onCallEvent?.('telephony:incoming', data);
      } else if (data?.state === 'Connected' || data?.state === 'Active' || data?.state === 'Established') {
        setStatus('IN_CALL');
        onCallEvent?.('telephony:connected', data);
      }
    });

    // Employee conversation ADDED - Triggered when a new call/conversation is assigned to the agent
    const offConversationAdded = on('employeeHub', 'employeeConversationAdded', (data) => {
      console.log('📞 Conversation ADDED:', JSON.stringify(data, null, 2));

      // When a new conversation is added, it's likely an incoming call
      if (data) {
        setCaller({
          name: data?.remotePartyName || data?.ani || data?.remoteParty || 'Unknown',
          number: data?.ani || data?.remoteParty || data?.dnis || 'Unknown',
          queue: data?.queueName || data?.queue?.name || 'General'
        });
        setTimer(0);
        setMuted(false);
        setStatus('RINGING');
        onCallEvent?.('telephony:incoming', data);
      }
    });

    // Employee conversation CHANGED - Triggered when conversation state changes
    const offConversationChanged = on('employeeHub', 'employeeConversationChanged', (conversations) => {
      console.log('📞 Conversation CHANGED:', JSON.stringify(conversations, null, 2));

      // The event sends an ARRAY of conversations, get the first one
      const conversation = Array.isArray(conversations) ? conversations[0] : conversations;

      if (!conversation) return;

      const state = conversation.conversationState; // Note: it's conversationState, not state

      console.log(`📞 Conversation State: ${state}`);

      // Map conversation state to your FSM
      if (state === 'Offered' || state === 'Ringing' || state === 'Alerting') {
        console.log('📞 INCOMING CALL DETECTED!');
        setCaller({
          name: conversation.fromName || conversation.ani || 'Unknown',
          number: conversation.ani || conversation.fromAddress || 'Unknown',
          queue: conversation.queueName || 'Direct Call'
        });
        setTimer(0);
        setMuted(false);
        setStatus('RINGING');
        onCallEvent?.('telephony:incoming', conversation);
      } else if (state === 'Connected' || state === 'Active' || state === 'Established') {
        console.log('✅ Call connected/active');
        setStatus('IN_CALL');
        onCallEvent?.('telephony:connected', conversation);
      } else if (state === 'Disconnected' || state === 'Ended' || state === 'Completed') {
        console.log('❌ Call disconnected/ended');
        setStatus('ENDED');
        onCallEvent?.('telephony:ended', conversation);
      }
    });

    // Employee conversation REMOVED - Triggered when conversation is removed/ended
    const offConversationRemoved = on('employeeHub', 'employeeConversationRemoved', (data) => {
      console.log('📞 Conversation REMOVED:', JSON.stringify(data, null, 2));
      setStatus('ENDED');
      onCallEvent?.('telephony:ended', data);
    });

    // Employee state changes
    const offEmployeeState = on('employeeHub', 'employeeStateChanged', (data) => {
      console.log('👤 Employee State Changed:', data);

      // Update agent status based on presence state
      if (data?.presence?.aggregate?.state) {
        const newState = data.presence.aggregate.state;
        setAgentStatus(newState);

        // Prepare to accept calls when agent becomes Available
        if (newState === 'Available') {
          console.log('✅ Agent is now Available - Ready to accept calls');
          setIsReadyForCalls(true);

          // Reset telephony bar to IDLE state if it's not currently handling a call
          if (status === 'ENDED') {
            setStatus('IDLE');
            setCaller(null);
            setTimer(0);
            setMuted(false);
          }

          // Notify parent component that agent is ready for calls
          onCallEvent?.('telephony:ready', { agentStatus: newState, timestamp: new Date() });
        } else {
          console.log(`⚠️ Agent status changed to ${newState} - Not ready for calls`);
          setIsReadyForCalls(false);

          // Notify parent component that agent is not ready for calls
          onCallEvent?.('telephony:not_ready', { agentStatus: newState, timestamp: new Date() });
        }
      }
    });

    // Agent state changes (alternative event)
    const offAgentState = on('agentHub', 'onAgentStateChanged', (data) => {
      console.log('🎧 Agent State Changed:', data);

      // Alternative path to update agent status
      if (data?.state) {
        const newState = data.state;
        setAgentStatus(newState);

        // Prepare to accept calls when agent becomes Available
        if (newState === 'Available') {
          console.log('✅ Agent is now Available (via agentHub) - Ready to accept calls');
          setIsReadyForCalls(true);

          // Reset telephony bar to IDLE state if it's not currently handling a call
          if (status === 'ENDED') {
            setStatus('IDLE');
            setCaller(null);
            setTimer(0);
            setMuted(false);
          }

          // Notify parent component that agent is ready for calls
          onCallEvent?.('telephony:ready', { agentStatus: newState, timestamp: new Date() });
        } else {
          console.log(`⚠️ Agent status changed to ${newState} (via agentHub) - Not ready for calls`);
          setIsReadyForCalls(false);

          // Notify parent component that agent is not ready for calls
          onCallEvent?.('telephony:not_ready', { agentStatus: newState, timestamp: new Date() });
        }
      }
    });

    // Queue-level events - Monitor incoming calls in queues
    const offQueueConversationAdded = on('queueHub', 'queueConversationAdded', (data) => {
      console.log('📋 Queue Conversation ADDED:', JSON.stringify(data, null, 2));
      // This fires when a call enters the queue (before being assigned to an agent)
    });

    const offQueueConversationChanged = on('queueHub', 'queueConversationChanged', (data) => {
      console.log('📋 Queue Conversation CHANGED:', JSON.stringify(data, null, 2));
      // This fires when a call in queue changes state
    });

    const offQueueConversationRemoved = on('queueHub', 'queueConversationRemoved', (data) => {
      console.log('📋 Queue Conversation REMOVED:', JSON.stringify(data, null, 2));
      // This fires when a call is removed from queue (answered, abandoned, etc.)
    });

    return () => {
      offMediaStats();
      offConversationAssigned();
      offEmployeeConversation();
      offConversationAdded();
      offConversationChanged();
      offConversationRemoved();
      offEmployeeState();
      offAgentState();
      offQueueConversationAdded();
      offQueueConversationChanged();
      offQueueConversationRemoved();
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
      case 'IDLE':
        if (isReadyForCalls) {
          return { text:'Ready for Calls', className:'bg-green-100 text-green-700 border-green-300' };
        }
        return { text:'Not Ready', className:'bg-gray-100 text-gray-700 border-gray-300' };
      case 'RINGING': return { text:`Incoming from ${caller?.name} (${caller?.number})`, className:'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' };
      case 'IN_CALL': return { text:`In Call – ${formatTime(timer)}`, className:'bg-green-100 text-green-800 border-green-300' };
      case 'TRANSFERRING': return { text:`Transferring to ${transferTarget}...`, className:'bg-blue-100 text-blue-800 border-blue-300' };
      case 'ENDED': return { text:`Call Ended – ${formatTime(timer)}`, className:'bg-red-100 text-red-800 border-red-300' };
      default: return { text:'Not Ready', className:'bg-gray-100 text-gray-700 border-gray-300' };
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
          {/* Agent Status Indicator */}
          {agentStatus && (
            <div className="flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground border border-border" title={`Agent Status: ${agentStatus}`}>
              <Icon
                name={agentStatus === 'Available' ? 'CheckCircle2' : agentStatus === 'Busy' ? 'AlertCircle' : 'Circle'}
                size={12}
                className={`mr-1 ${agentStatus === 'Available' ? 'text-green-600' : agentStatus === 'Busy' ? 'text-red-600' : 'text-gray-600'}`}
              />
              <span>{agentStatus}</span>
            </div>
          )}
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