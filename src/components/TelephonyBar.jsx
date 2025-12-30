import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import Button from './ui/Button';
import { useMitelSignalR } from '../hooks/useMitelSignalR';
import mitelService from '../services/mitelService';
import mitelConfigService from '../services/mitelConfigService';
import customerInteractionService from '../services/customerInteractionService';
import { ticketService } from '../services/ticketService';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import VoiceContactsModal from './VoiceContactsModal';

const TelephonyBar = ({ className = '', onCallEvent }) => {
  const navigate = useNavigate();

  // Check if user is an agent
  const [isAgent, setIsAgent] = useState(false);
  const [telephonyEnabled, setTelephonyEnabled] = useState(false);
  const [signalRUrl, setSignalRUrl] = useState('');

  useEffect(() => {
    try {
      const userSession = JSON.parse(localStorage.getItem('user-session') || '{}');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = userSession?.role?.slug || user?.role?.slug || '';

      // Only enable telephony for agent roles
      const agentRoles = ['agent', 'supervisor', 'super-admin', 'admin'];
      const isAgentRole = agentRoles.includes(role.toLowerCase());
      setIsAgent(isAgentRole);

      // Load telephony enabled state from localStorage
      const savedTelephonyState = localStorage.getItem('telephony_enabled');
      const initialTelephonyState = savedTelephonyState !== null
        ? savedTelephonyState === 'true'
        : isAgentRole; // Default to enabled if user is an agent
      setTelephonyEnabled(initialTelephonyState);

      console.log('📞 TelephonyBar - User role:', role, 'Is Agent:', isAgentRole, 'Telephony Enabled:', initialTelephonyState);
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAgent(false);
      setTelephonyEnabled(false);
    }
  }, []);

  // Fetch SignalR URL from API when component mounts or when telephony is enabled
  useEffect(() => {
    if (isAgent && telephonyEnabled) {
      mitelConfigService.getSignalRUrl()
        .then(url => {
          console.log('📞 SignalR URL fetched from API:', url);
          setSignalRUrl(url);
        })
        .catch(err => {
          console.error('Failed to fetch SignalR URL:', err);
          // Fallback to default if API fails
          setSignalRUrl('https://micc.telediant.com.my/miccsdk/signalr');
        });
    }
  }, [isAgent, telephonyEnabled]);

  // FSM state
  const [status, setStatus] = useState('IDLE');
  const [caller, setCaller] = useState(null);
  const [timer, setTimer] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isVoiceContactsModalOpen, setIsVoiceContactsModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transferType, setTransferType] = useState('blind'); // 'blind' or 'consult'
  const [transferDestinationAgentId, setTransferDestinationAgentId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isInConsultation, setIsInConsultation] = useState(false);
  const [consultationConversationId, setConsultationConversationId] = useState(null);
  const [currentExtension, setCurrentExtension] = useState('8002');
  const [showWrapUp, setShowWrapUp] = useState(false);
  const [wrapUpCode, setWrapUpCode] = useState('');
  const [wrapUpNotes, setWrapUpNotes] = useState('');
  const [agentStatus, setAgentStatus] = useState('Offline');
  const [isReadyForCalls, setIsReadyForCalls] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [caseId, setCaseId] = useState(null);

  const intervalRef = useRef(null);
  const autoResetTimeoutRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const customerIdRef = useRef(null);
  const ticketIdRef = useRef(null);
  const conversationIdRef = useRef(null);
  const pendingInteractionIdsRef = useRef([]);

  // ---- Helper: Log Customer Interaction Asynchronously ----
  const logInteractionAsync = useCallback(async (interactionData) => {
    try {
      // Get agent info from localStorage or auth context
      const authData = authService.getCurrentUser();
      const agentId = authData?.agent?.id;

      const payload = {
        customer_id: customerIdRef.current,
        ticket_id: ticketIdRef.current,
        agent_id: agentId,
        conversation_id: conversationIdRef.current,
        interaction_at: new Date().toISOString(),
        ...interactionData,
      };

      // Log asynchronously without blocking UI
      customerInteractionService.createInteraction(payload)
        .then(response => {
          if (response.success && response.data?.id) {
            // Track this interaction ID if we don't have customer/ticket info yet
            if (!customerIdRef.current || !ticketIdRef.current) {
              pendingInteractionIdsRef.current.push(response.data.id);
              console.log('📝 Interaction logged without customer/ticket, tracking for update:', response.data.id);
            } else {
              console.log('✅ Interaction logged with customer/ticket:', response.data.id);
            }
          }
        })
        .catch(err => {
          console.error('Failed to log interaction:', err);
          // Silent fail - don't disrupt user experience
        });
    } catch (error) {
      console.error('Error preparing interaction log:', error);
    }
  }, []);

  // ---- Helper: Update Pending Interactions ----
  const updatePendingInteractions = useCallback(async (customerId, ticketId) => {
    const interactionIds = [...pendingInteractionIdsRef.current];

    if (interactionIds.length === 0) {
      console.log('📝 No pending interactions to update');
      return;
    }

    console.log(`📝 Updating ${interactionIds.length} pending interactions with customer_id: ${customerId}, ticket_id: ${ticketId}`);

    // Update each pending interaction
    for (const interactionId of interactionIds) {
      try {
        await customerInteractionService.updateInteraction(interactionId, {
          customer_id: customerId,
          ticket_id: ticketId,
        });
        console.log(`✅ Updated interaction ${interactionId} with customer/ticket info`);
      } catch (err) {
        console.error(`❌ Failed to update interaction ${interactionId}:`, err);
      }
    }

    // Clear pending interactions list
    pendingInteractionIdsRef.current = [];
  }, []);

  // ---- Helper: Check for existing ticket and navigate appropriately ----
  const checkExistingTicketAndNavigate = useCallback(async (conversationId, callerNumber) => {
    try {
      console.log(`🔍 Checking for existing ticket with conversationId: ${conversationId}`);

      const response = await ticketService.findByConversationId(conversationId);

      if (response?.success && response?.data?.data && response.data.data.length > 0) {
        // Found existing ticket - this is likely a transferred call
        const existingTicket = response.data.data[0];
        console.log(`✅ Found existing ticket #${existingTicket.ticket_number} (ID: ${existingTicket.id}) for conversation ${conversationId}`);

        // Update refs with existing ticket info
        if (existingTicket.customer_id) {
          customerIdRef.current = existingTicket.customer_id;
        }
        ticketIdRef.current = existingTicket.id;

        // Navigate to existing ticket details page
        navigate(`/ticket-management/${existingTicket.id}`);

        toast.info(`Transferred call - Ticket #${existingTicket.ticket_number} loaded`, {
          autoClose: 3000,
        });
      } else {
        // No existing ticket found - new call, navigate to create page
        console.log(`📝 No existing ticket found for conversation ${conversationId}, navigating to create new ticket`);
        const params = new URLSearchParams({
          callId: callerNumber,
          source: 'call',
          conversationId: conversationId
        });
        if (caseId) {
          params.append('caseId', caseId);
        }
        navigate(`/ticket-management/create?${params.toString()}`);
      }
    } catch (error) {
      console.error('❌ Error checking for existing ticket:', error);
      // On error, fallback to create page
      const params = new URLSearchParams({
        callId: callerNumber,
        source: 'call',
        conversationId: conversationId
      });
      if (caseId) {
        params.append('caseId', caseId);
      }
      navigate(`/ticket-management/create?${params.toString()}`);
    }
  }, [navigate, caseId]);

  // ---- Mitel SignalR Hook (only for agents with telephony enabled) ----
  // Wait for SignalR URL to be fetched before connecting, or use fallback
  const { state: connState, on, invoke, error } = useMitelSignalR({
    baseUrl: signalRUrl || 'https://micc.telediant.com.my/miccsdk/signalr',
    hubs: ['queueHub', 'employeeHub', 'agentHub'],
    token: localStorage.getItem('mitel_token'),
    // Only connect if: agent role + telephony enabled + URL is ready
    enabled: isAgent && telephonyEnabled && signalRUrl !== ''
  });

  // Subscribe to employee and queue monitoring when connected
  useEffect(() => {
    if (!isAgent || !telephonyEnabled) return; // Skip if not an agent or telephony is disabled

    if (connState === 'connected') {
      console.log('🔗 SignalR Connected - No subscription needed, listening for events directly');

      // Get current employee details to retrieve extension
      mitelService.getMe()
        .then(employeeData => {
          console.log('📞 Employee data:', employeeData);
          if (employeeData?.extension) {
            setCurrentExtension(employeeData.extension);
          }
        })
        .catch(err => {
          console.error('Failed to fetch employee details:', err);
        });

      // NOTE: Mitel may not require explicit subscription if you're already authenticated
      // Events should be pushed automatically once connected
      // If you find the correct subscription method name, add it here
    }
  }, [connState, invoke, isAgent, telephonyEnabled]);

  // ---- Map Mitel events → FSM ----
  useEffect(() => {
    if (!isAgent || !telephonyEnabled || signalRUrl === '') {
      console.log('🔗 Skipping Mitel event listeners - User is not an agent, telephony is disabled, or SignalR URL not ready');
      return;
    }

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
      const direction = conversation.direction; // 'Incoming' or 'Outgoing'

      console.log(`📞 Conversation State: ${state}, Direction: ${direction}`);

      // Map conversation state to your FSM
      // Handle both INCOMING and OUTGOING calls
      if (
        (state === 'Offered' || state === 'Ringing' || state === 'Alerting') ||
        (state === 'NonAcd' && direction === 'Incoming')
      ) {
        // INCOMING CALL
        console.log('📞 INCOMING CALL DETECTED!');
        setCurrentConversationId(conversation.conversationId);
        conversationIdRef.current = conversation.conversationId;

        const callerInfo = {
          name: conversation.fromName || conversation.ani || 'Unknown',
          number: conversation.ani || conversation.fromAddress || 'Unknown',
          queue: conversation.queueName || 'Direct Call'
        };

        setCaller(callerInfo);
        setTimer(0);
        setMuted(false);
        setStatus('RINGING');
        onCallEvent?.('telephony:incoming', conversation);

        // Log incoming call interaction asynchronously
        logInteractionAsync({
          interaction_type: 'call',
          channel: 'phone',
          subject: `Incoming call from ${callerInfo.name}`,
          description: `Call received from ${callerInfo.number} via ${callerInfo.queue}`,
          metadata: {
            conversationId: conversation.conversationId,
            callerNumber: callerInfo.number,
            callerName: callerInfo.name,
            queue: callerInfo.queue,
            callState: 'ringing',
            direction: 'inbound',
          },
        });

        // Check for existing ticket with this conversationId (for transferred calls)
        // If found, navigate to ticket details; otherwise, navigate to create page
        checkExistingTicketAndNavigate(conversation.conversationId, callerInfo.number);
      } else if (state === 'NonAcd' && direction === 'Outgoing') {
        // OUTGOING CALL - Show as IN_CALL immediately
        console.log('📞 OUTGOING CALL DETECTED!');
        setCurrentConversationId(conversation.conversationId);
        conversationIdRef.current = conversation.conversationId;

        const callInfo = {
          name: conversation.toName || conversation.dnis || 'Unknown',
          number: conversation.dnis || conversation.toAddress || 'Unknown',
          queue: 'Outgoing Call'
        };

        setCaller(callInfo);
        setTimer(0);
        setMuted(false);
        setStatus('IN_CALL');
        callStartTimeRef.current = new Date();
        onCallEvent?.('telephony:outgoing', conversation);

        // Log outgoing call interaction asynchronously
        logInteractionAsync({
          interaction_type: 'call',
          channel: 'phone',
          subject: `Outgoing call to ${callInfo.name}`,
          description: `Agent initiated call to ${callInfo.number}`,
          metadata: {
            conversationId: conversation.conversationId,
            calledNumber: callInfo.number,
            calledName: callInfo.name,
            callState: 'outgoing',
            direction: 'outbound',
          },
        });
      } else if (state === 'Connected' || state === 'Active' || state === 'Established') {
        console.log('✅ Call connected/active');
        setCurrentConversationId(conversation.conversationId);
        setStatus('IN_CALL');

        // Set call start time if not already set
        if (!callStartTimeRef.current) {
          callStartTimeRef.current = new Date();
        }

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
  }, [on, onCallEvent, isAgent, telephonyEnabled, signalRUrl, checkExistingTicketAndNavigate, logInteractionAsync]);

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
    if (status === 'RINGING' && currentConversationId) {
      try {
        console.log(`📞 Accepting call: ${currentConversationId}`);
        await mitelService.acceptConversation(currentConversationId);
        console.log('✅ Call accepted');

        // Immediately change status to IN_CALL
        setStatus('IN_CALL');
        callStartTimeRef.current = new Date();

        // Log call answered interaction asynchronously
        logInteractionAsync({
          interaction_type: 'call',
          channel: 'phone',
          subject: `Call answered - ${caller?.name || 'Unknown'}`,
          description: `Agent answered call from ${caller?.number || 'Unknown'}`,
          metadata: {
            conversationId: currentConversationId,
            callerNumber: caller?.number,
            callerName: caller?.name,
            queue: caller?.queue,
            callState: 'answered',
            answeredAt: new Date().toISOString(),
          },
        });

        // State will also be updated by SignalR event
      } catch (err) {
        console.error('❌ Failed to accept call:', err);
        toast.error(`Failed to accept call: ${err.message}`);
      }
    }
  }, [status, currentConversationId, caller, logInteractionAsync]);

  const hangUp = useCallback(async () => {
    if (['IN_CALL', 'RINGING', 'TRANSFERRING'].includes(status) && currentConversationId) {
      try {
        console.log(`📞 Ending call: ${currentConversationId}`);

        // Calculate call duration
        const callDuration = callStartTimeRef.current
          ? Math.floor((new Date() - callStartTimeRef.current) / 1000 / 60) // in minutes
          : timer ? Math.floor(timer / 60) : 0;

        await mitelService.endConversation(currentConversationId);
        console.log('✅ Call ended');

        // Log call ended interaction asynchronously
        logInteractionAsync({
          interaction_type: 'call',
          channel: 'phone',
          subject: `Call ended - ${caller?.name || 'Unknown'}`,
          description: `Call ended with ${caller?.number || 'Unknown'}. Duration: ${callDuration} minutes`,
          duration_minutes: callDuration,
          metadata: {
            conversationId: currentConversationId,
            callerNumber: caller?.number,
            callerName: caller?.name,
            queue: caller?.queue,
            callState: 'ended',
            endedAt: new Date().toISOString(),
            durationSeconds: timer,
          },
        });

        // Reset call start time
        callStartTimeRef.current = null;

        // State will be updated by SignalR event
      } catch (err) {
        console.error('❌ Failed to end call:', err);
        toast.error(`Failed to end call: ${err.message}`);
      }
    }
  }, [status, currentConversationId, caller, timer, logInteractionAsync]);

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
    if (status === 'IN_CALL' && !isInConsultation) {
      setIsTransferModalOpen(true);
      setTransferType('blind'); // Default to blind transfer
    }
  }, [status, isInConsultation]);

  const executeBlindTransfer = useCallback(async () => {
    if (!transferTarget.trim()) {
      toast.error('Please enter a transfer destination');
      return;
    }

    setIsTransferModalOpen(false);

    try {
      console.log(`📞 Executing blind transfer to: ${transferTarget}`);

      const callDuration = callStartTimeRef.current
        ? Math.floor((new Date() - callStartTimeRef.current) / 1000 / 60)
        : timer ? Math.floor(timer / 60) : 0;

      // Call the blind transfer API with enhanced transfer
      // Use agentId if available, otherwise fall back to id or transferDestinationAgentId
      const transferDestId = selectedContact?.agentId || selectedContact?.id || transferDestinationAgentId || transferTarget;

      await mitelService.blindTransferCall(
        'me',
        currentConversationId,
        transferTarget,
        ticketIdRef.current,
        transferDestId,
        selectedContact?.type || 'Employee'
      );

      toast.success(`Call transferred to ${transferTarget}`);
      setStatus('ENDED');
      onCallEvent?.('telephony:blind_transferred', {
        caller,
        target: transferTarget,
        duration: timer,
        ticketId: ticketIdRef.current
      });

      // Log call transfer interaction asynchronously
      logInteractionAsync({
        interaction_type: 'call',
        channel: 'phone',
        subject: `Call blind transferred - ${caller?.name || 'Unknown'}`,
        description: `Call from ${caller?.number || 'Unknown'} blind transferred to ${transferTarget}`,
        duration_minutes: callDuration,
        metadata: {
          conversationId: currentConversationId,
          callerNumber: caller?.number,
          callerName: caller?.name,
          queue: caller?.queue,
          callState: 'blind_transferred',
          transferTarget: transferTarget,
          transferredAt: new Date().toISOString(),
          durationSeconds: timer,
          ticketId: ticketIdRef.current,
        },
      });

      setTransferTarget('');
      setTransferDestinationAgentId(null);
      callStartTimeRef.current = null;
      console.log('✅ Blind transfer completed');
    } catch (err) {
      console.error('❌ Blind transfer failed:', err);
      toast.error(`Failed to transfer call: ${err.message}`);
    }
  }, [transferTarget, transferDestinationAgentId, selectedContact, caller, timer, currentConversationId, onCallEvent, logInteractionAsync]);

  const initiateConsultation = useCallback(async () => {
    if (!transferTarget.trim()) {
      toast.error('Please enter a transfer destination');
      return;
    }

    setIsTransferModalOpen(false);

    try {
      console.log(`📞 Initiating consultation transfer to: ${transferTarget}`);

      // Call the initiate consult transfer API with enhanced transfer
      // Use agentId if available, otherwise fall back to id or transferDestinationAgentId
      const transferDestId = selectedContact?.agentId || selectedContact?.id || transferDestinationAgentId || transferTarget;

      await mitelService.initiateConsultTransfer(
        'me',
        currentConversationId,
        transferTarget,
        transferDestId,
        selectedContact?.type || 'Employee'
      );

      setIsInConsultation(true);
      setConsultationConversationId(currentConversationId);
      setStatus('CONSULTING');
      toast.info(`Consultation call initiated with ${transferTarget}`);

      console.log('✅ Consultation initiated');
    } catch (err) {
      console.error('❌ Consultation initiation failed:', err);
      toast.error(`Failed to initiate consultation: ${err.message}`);
    }
  }, [transferTarget, currentConversationId, selectedContact, transferDestinationAgentId]);

  const completeConsultTransfer = useCallback(async () => {
    try {
      console.log(`📞 Completing consultation transfer`);

      const callDuration = callStartTimeRef.current
        ? Math.floor((new Date() - callStartTimeRef.current) / 1000 / 60)
        : timer ? Math.floor(timer / 60) : 0;

      // Complete the consultation transfer
      await mitelService.completeConsultTransfer(
        'me',
        currentConversationId,
        ticketIdRef.current,
        transferDestinationAgentId
      );

      toast.success('Transfer completed successfully');
      setStatus('ENDED');
      setIsInConsultation(false);
      setConsultationConversationId(null);

      onCallEvent?.('telephony:consult_transferred', {
        caller,
        target: transferTarget,
        duration: timer,
        ticketId: ticketIdRef.current
      });

      // Log call transfer interaction asynchronously
      logInteractionAsync({
        interaction_type: 'call',
        channel: 'phone',
        subject: `Call consultation transferred - ${caller?.name || 'Unknown'}`,
        description: `Call from ${caller?.number || 'Unknown'} transferred to ${transferTarget} after consultation`,
        duration_minutes: callDuration,
        metadata: {
          conversationId: currentConversationId,
          callerNumber: caller?.number,
          callerName: caller?.name,
          queue: caller?.queue,
          callState: 'consult_transferred',
          transferTarget: transferTarget,
          transferredAt: new Date().toISOString(),
          durationSeconds: timer,
          ticketId: ticketIdRef.current,
        },
      });

      setTransferTarget('');
      setTransferDestinationAgentId(null);
      callStartTimeRef.current = null;
      console.log('✅ Consultation transfer completed');
    } catch (err) {
      console.error('❌ Consultation transfer completion failed:', err);
      toast.error(`Failed to complete transfer: ${err.message}`);
    }
  }, [transferTarget, transferDestinationAgentId, caller, timer, currentConversationId, onCallEvent, logInteractionAsync]);

  const cancelConsultation = useCallback(async () => {
    try {
      console.log(`📞 Canceling consultation transfer`);

      // Cancel the consultation
      await mitelService.cancelConsultTransfer('me', consultationConversationId || currentConversationId);

      toast.info('Consultation canceled, returned to original call');
      setStatus('IN_CALL');
      setIsInConsultation(false);
      setConsultationConversationId(null);
      setTransferTarget('');
      setTransferDestinationAgentId(null);

      console.log('✅ Consultation canceled');
    } catch (err) {
      console.error('❌ Consultation cancelation failed:', err);
      toast.error(`Failed to cancel consultation: ${err.message}`);
    }
  }, [consultationConversationId, currentConversationId]);

  const completeWrapUp = useCallback(() => {
    const callDuration = Math.floor(timer / 60);

    onCallEvent?.('telephony:wrap_up', { caller, duration: timer, wrapUpCode, notes: wrapUpNotes, type: 'voice' });

    // Log wrap-up interaction asynchronously
    if (wrapUpCode || wrapUpNotes) {
      logInteractionAsync({
        interaction_type: 'note',
        channel: 'phone',
        subject: `Call wrap-up - ${wrapUpCode || 'No code selected'}`,
        description: wrapUpNotes || 'No wrap-up notes provided',
        duration_minutes: callDuration,
        notes: wrapUpNotes,
        metadata: {
          conversationId: currentConversationId,
          callerNumber: caller?.number,
          callerName: caller?.name,
          queue: caller?.queue,
          wrapUpCode: wrapUpCode,
          callState: 'wrapped_up',
          wrappedUpAt: new Date().toISOString(),
          durationSeconds: timer,
        },
      });
    }

    setStatus('IDLE');
    setCaller(null);
    setTimer(0);
    setMuted(false);
    setShowWrapUp(false);
    setWrapUpCode('');
    setWrapUpNotes('');
    setCurrentConversationId(null);
    customerIdRef.current = null;
    ticketIdRef.current = null;
  }, [caller, timer, wrapUpCode, wrapUpNotes, currentConversationId, onCallEvent, logInteractionAsync]);

  const toggleTelephony = useCallback(() => {
    const newState = !telephonyEnabled;
    setTelephonyEnabled(newState);
    localStorage.setItem('telephony_enabled', newState.toString());

    if (newState) {
      toast.success('Telephony enabled - Connecting to Mitel...');
      console.log('📞 Telephony enabled by user');
    } else {
      toast.info('Telephony disabled - Disconnecting from Mitel...');
      console.log('📞 Telephony disabled by user');

      // Reset telephony state when disabling
      setStatus('IDLE');
      setCaller(null);
      setTimer(0);
      setMuted(false);
      setCurrentConversationId(null);
    }
  }, [telephonyEnabled]);

  const handleContactSelect = useCallback((destination, contact) => {
    setTransferTarget(destination);
    setSelectedContact(contact);
    if (contact?.agentId) {
      setTransferDestinationAgentId(contact.agentId);
    }
  }, []);

  // ---- Listen for Ticket Created Events ----
  useEffect(() => {
    const handleTicketCreated = (event) => {
      const { ticketId, customerId, ticketNumber, conversationId } = event.detail;

      console.log('📋 Ticket created event received:', {
        ticketId,
        customerId,
        ticketNumber,
        conversationId,
        currentConversationId: currentConversationId,
      });

      // Check if this ticket is for the current conversation
      if (conversationId && conversationId === currentConversationId) {
        // Update refs with customer and ticket IDs
        if (customerId) {
          customerIdRef.current = customerId;
          console.log('✅ Customer ID set:', customerId);
        }

        if (ticketId) {
          ticketIdRef.current = ticketId;
          console.log('✅ Ticket ID set:', ticketId);
        }

        // Update all pending interactions with customer and ticket IDs
        if (customerId || ticketId) {
          updatePendingInteractions(customerId, ticketId);
        }
      }
    };

    window.addEventListener('ticketCreated', handleTicketCreated);
    return () => window.removeEventListener('ticketCreated', handleTicketCreated);
  }, [currentConversationId, updatePendingInteractions]);

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
    // If telephony is disabled, show disabled status
    if (!telephonyEnabled) {
      return { text:'Telephony Disabled', className:'bg-gray-100 text-gray-600 border-gray-300' };
    }

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
  // Don't render telephony bar for non-agents
  if (!isAgent) {
    return null;
  }

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
          {/* Telephony Toggle Button */}
          <Button
            variant={telephonyEnabled ? "default" : "ghost"}
            size="sm"
            iconName={telephonyEnabled ? "Power" : "PowerOff"}
            onClick={toggleTelephony}
            disabled={status !== 'IDLE'}
            title={telephonyEnabled ? 'Disable Telephony' : 'Enable Telephony'}
            className={telephonyEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-gray-500'}
          />
          <div className="w-px h-6 bg-border" />
          <Button variant="ghost" size="sm" iconName={status==='RINGING'?'PhoneCall':'Phone'} onClick={status==='RINGING'?acceptCall:demoIncoming} disabled={!telephonyEnabled || ['IN_CALL','TRANSFERRING','ENDED'].includes(status)} title={status==='RINGING'?'Accept Call (A)':'Demo Incoming Call (Ctrl+Shift+P)'} />
          <Button variant="ghost" size="sm" iconName="PhoneOff" onClick={hangUp} disabled={!telephonyEnabled || !['IN_CALL','RINGING','TRANSFERRING'].includes(status)} title="Hang Up (H)" />
          <Button variant="ghost" size="sm" iconName="PhoneForwarded" onClick={startTransfer} disabled={!telephonyEnabled || status!=='IN_CALL'} title="Transfer Call (T)" />
          <Button variant="ghost" size="sm" iconName="FileText" onClick={()=>setShowWrapUp(true)} disabled={status!=='ENDED'} title="Wrap-Up" />
          <Button variant="ghost" size="sm" iconName={muted?'MicOff':'Mic'} onClick={toggleMute} disabled={!telephonyEnabled || status!=='IN_CALL'} title="Mute/Unmute (M)" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={()=>{setIsTransferModalOpen(false);setTransferTarget('');setTransferType('blind');}}>
          <div className="bg-card border border-border rounded-lg p-6 w-[500px]" onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon name="phone-forwarded" className="mr-2" />
              Transfer Call
            </h3>

            {/* Transfer Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Transfer Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTransferType('blind')}
                  className={`flex-1 px-4 py-2 rounded-md border transition-colors ${
                    transferType === 'blind'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  <div className="font-medium">Blind Transfer</div>
                  <div className="text-xs opacity-70">Transfer immediately</div>
                </button>
                <button
                  onClick={() => setTransferType('consult')}
                  className={`flex-1 px-4 py-2 rounded-md border transition-colors ${
                    transferType === 'consult'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  <div className="font-medium">Consultation</div>
                  <div className="text-xs opacity-70">Talk before transfer</div>
                </button>
              </div>
            </div>

            {/* Transfer Destination */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Destination</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={transferTarget}
                  onChange={e=>setTransferTarget(e.target.value)}
                  placeholder="Extension or phone number"
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  onKeyPress={e => {
                    if (e.key === 'Enter' && transferTarget.trim()) {
                      if (transferType === 'blind') {
                        executeBlindTransfer();
                      } else {
                        initiateConsultation();
                      }
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => setIsVoiceContactsModalOpen(true)}
                  className="flex items-center"
                  iconName="Search"
                  title="Search Directory"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Ticket Info */}
            {ticketIdRef.current && (
              <div className="mb-4 p-3 bg-accent rounded-md">
                <div className="flex items-center text-sm">
                  <Icon name="ticket" className="mr-2 text-primary" />
                  <span className="font-medium">Ticket #{ticketIdRef.current} will be transferred with the call</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={()=>{setIsTransferModalOpen(false);setTransferTarget('');setTransferType('blind');}}>
                Cancel
              </Button>
              {transferType === 'blind' ? (
                <Button
                  variant="default"
                  onClick={executeBlindTransfer}
                  disabled={!transferTarget.trim()}
                  className="flex items-center"
                >
                  <Icon name="phone-forwarded" className="mr-2" />
                  Blind Transfer
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={initiateConsultation}
                  disabled={!transferTarget.trim()}
                  className="flex items-center"
                >
                  <Icon name="phone-call" className="mr-2" />
                  Start Consultation
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Consultation In Progress Modal */}
      {isInConsultation && status === 'CONSULTING' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-card border border-border rounded-lg p-6 w-[500px]">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon name="users" className="mr-2 text-primary" />
              Consultation in Progress
            </h3>

            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent rounded-md">
                <div>
                  <div className="text-sm font-medium">Original Caller</div>
                  <div className="text-xs text-muted-foreground">{caller?.name || caller?.number || 'Unknown'}</div>
                </div>
                <div className="px-3 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                  On Hold
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md">
                <div>
                  <div className="text-sm font-medium">Consulting With</div>
                  <div className="text-xs text-muted-foreground">{transferTarget}</div>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  Active
                </div>
              </div>
            </div>

            {ticketIdRef.current && (
              <div className="mb-4 p-3 bg-accent rounded-md">
                <div className="flex items-center text-sm">
                  <Icon name="ticket" className="mr-2 text-primary" />
                  <span>Ticket #{ticketIdRef.current} will be transferred</span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={cancelConsultation}
                className="flex items-center"
              >
                <Icon name="x" className="mr-2" />
                Cancel & Return
              </Button>
              <Button
                variant="default"
                onClick={completeConsultTransfer}
                className="flex items-center bg-green-600 hover:bg-green-700"
              >
                <Icon name="check" className="mr-2" />
                Complete Transfer
              </Button>
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

      {/* Voice Contacts Modal */}
      <VoiceContactsModal
        isOpen={isVoiceContactsModalOpen}
        onClose={() => setIsVoiceContactsModalOpen(false)}
        onSelect={handleContactSelect}
        currentExtension={currentExtension}
      />
    </>
  );
};

export default TelephonyBar;