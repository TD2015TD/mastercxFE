import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import Button from './ui/Button';
import { useMitelSignalR } from '../hooks/useMitelSignalR';
import mitelService from '../services/mitelService';
import mitelConfigService from '../services/mitelConfigService';
import customerInteractionService from '../services/customerInteractionService';
import { contactService } from '../services/contactService';
import { ticketService } from '../services/ticketService';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import VoiceContactsModal from './VoiceContactsModal';
import { usePermission } from './Can';
import { useWebRTCSoftphone } from '../hooks/useWebRTCSoftphone';
import softphoneService from '../services/webrtcSoftphone';

// The React-state isHotDeskActive from the hook is a snapshot from
// whenever the current render happened — reading it again after an
// `await` inside a callback still returns that same stale snapshot, since
// state updates don't rewrite variables a running function has already
// captured. The mihotdesk self-heal cycle (un-REGISTER → re-REGISTER →
// re-SUBSCRIBE) commonly finishes within a few seconds, so a single
// immediate check right after `initialize()` was catching it mid-cycle
// far more often than necessary. This polls the underlying service
// singleton directly (its own isHotDeskActive() reflects the truth at
// call time, not render time) so a call attempt actually waits out a
// brief self-heal instead of failing the instant it's asked.
const waitForHotDeskActive = (timeoutMs = 8000) => {
  if (softphoneService.isHotDeskActive()) return Promise.resolve(true);
  return new Promise((resolve) => {
    let settled = false;
    const onActive = () => { finish(true); };
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      softphoneService.off('hotDeskActive', onActive);
      resolve(result);
    };
    softphoneService.on('hotDeskActive', onActive);
    const timer = setTimeout(() => finish(softphoneService.isHotDeskActive()), timeoutMs);
  });
};

// sessionStorage (not React state) so the wrap-up countdown survives
// TelephonyBar remounting on every route navigation — see the comment on
// runWrapUpCountdownUntil below for why that happens on this app.
const WRAP_UP_STORAGE_KEY = 'mitel_wrapup_ends_at';

const TelephonyBar = ({ className = '', onCallEvent }) => {
  const navigate = useNavigate();
  const { can } = usePermission();

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

      console.log('📞 TelephonyBar - User role:', role, 'Is Agent:', isAgentRole);
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAgent(false);
    }
  }, []);

  // Fetch telephony enabled state from admin configuration
  useEffect(() => {
    mitelConfigService.getTelephonyEnabled()
      .then(enabled => setTelephonyEnabled(enabled))
      .catch(() => setTelephonyEnabled(false));
  }, []);

  // Listen for admin changes to telephony enabled state.
  // Only fires within the tab that made the change — an admin toggling the flag doesn't reach a
  // separately logged-in agent's tab this way, that's what the poll below is for.
  useEffect(() => {
    const handler = (e) => setTelephonyEnabled(e.detail);
    window.addEventListener('telephony_enabled_changed', handler);
    return () => window.removeEventListener('telephony_enabled_changed', handler);
  }, []);

  // Instant push for a DIFFERENT agent's tab: backend broadcasts
  // TelephonyConfigChanged over Reverb the moment an admin flips the flag,
  // so this reacts immediately instead of waiting on the poll below.
  useEffect(() => {
    return mitelConfigService.onTelephonyEnabledChanged(setTelephonyEnabled);
  }, []);

  // Poll for admin changes to telephony enabled state.
  // Every <Route> in Routes.tsx wraps its own separate <Layout> element
  // rather than sharing one via an <Outlet> (confirmed directly there) —
  // so TelephonyBar DOES remount on in-app navigation, but an agent who
  // just leaves a tab sitting open on one page has no other way to notice
  // an admin flipping the flag elsewhere. Bypasses the cached
  // getTelephonyEnabled() on purpose — a cached read would just keep
  // returning the stale value.
  //
  // The interval alone tested as "needs a refresh" in practice: a tester
  // flips the admin toggle in one tab, alt-tabs back to the agent's tab
  // within a couple seconds, and the poll simply hasn't fired yet. Checking
  // again the moment the tab regains focus/visibility covers exactly that
  // real usage pattern instead of making them wait out the interval.
  useEffect(() => {
    if (!isAgent) return;

    const checkFresh = () => {
      mitelConfigService.getTelephonyEnabledFresh()
        .then(enabled => setTelephonyEnabled(prev => (prev !== enabled ? enabled : prev)))
        .catch(() => {});
    };

    const interval = setInterval(checkFresh, 5000);
    const onVisible = () => { if (document.visibilityState === 'visible') checkFresh(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', checkFresh);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', checkFresh);
    };
  }, [isAgent]);

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
  const [isCallContactsModalOpen, setIsCallContactsModalOpen] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
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
  // Countdown until Mitel's own queue-level after-call wrap-up timer
  // auto-releases the agent back to Available — purely informational, we
  // don't control this duration ourselves (it's the queue's own
  // workTimer/queueIsWrapUpTimeEnabled config, seen directly in every
  // conversation payload on this tenant). null = no countdown showing.
  const [wrapUpSecondsLeft, setWrapUpSecondsLeft] = useState(null);
  const wrapUpCountdownIntervalRef = useRef(null);
  const [isReadyForCalls, setIsReadyForCalls] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [caseId, setCaseId] = useState(null);

  const clearWrapUpCountdown = useCallback(() => {
    if (wrapUpCountdownIntervalRef.current) {
      clearInterval(wrapUpCountdownIntervalRef.current);
      wrapUpCountdownIntervalRef.current = null;
    }
    setWrapUpSecondsLeft(null);
    try { sessionStorage.removeItem(WRAP_UP_STORAGE_KEY); } catch { /* private-mode storage access can throw */ }
  }, []);

  // Every <Route> in Routes.tsx wraps its own separate <Layout> element
  // (e.g. <Layout><TicketCreatePage /></Layout>) rather than sharing one via
  // an <Outlet> — confirmed directly in that file. That means TelephonyBar
  // (mounted inside Layout's Header) is a BRAND NEW component instance on
  // every navigate(), including the automatic redirect to Create Ticket
  // right after a call ends. A plain in-memory countdown never survives
  // that: the 'Ended' SignalR event that starts it fires on the OLD
  // instance, which then immediately unmounts, and the new instance mounts
  // with wrapUpSecondsLeft back at null with no way to know a countdown was
  // ever running. Storing the absolute end time (not a duration to decrement)
  // in sessionStorage — same tab/session only — lets the new instance ask
  // "am I still in a wrap-up window?" on mount and resume the display
  // exactly where it left off, instead of losing it to the redirect.
  const runWrapUpCountdownUntil = useCallback((endsAt) => {
    if (wrapUpCountdownIntervalRef.current) {
      clearInterval(wrapUpCountdownIntervalRef.current);
      wrapUpCountdownIntervalRef.current = null;
    }
    const tick = () => {
      const secondsLeft = Math.ceil((endsAt - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        if (wrapUpCountdownIntervalRef.current) {
          clearInterval(wrapUpCountdownIntervalRef.current);
          wrapUpCountdownIntervalRef.current = null;
        }
        setWrapUpSecondsLeft(null);
        try { sessionStorage.removeItem(WRAP_UP_STORAGE_KEY); } catch { /* ignore */ }
        return;
      }
      setWrapUpSecondsLeft(secondsLeft);
    };
    tick();
    wrapUpCountdownIntervalRef.current = setInterval(tick, 1000);
  }, []);

  // Mitel sends the queue's wrap-up duration as "HH:MM:SS" on the
  // conversation payload itself (workTimer) — parsing that directly means
  // this countdown always matches whatever this specific queue is actually
  // configured for, instead of guessing/hardcoding a duration. Also accepts
  // a bare number of seconds and tolerates fractional seconds ("00:02:00.0")
  // in case the exact shape varies by call type — logged either way (see
  // caller) so a missing/unparseable value is visible in the console instead
  // of just silently not showing a countdown.
  const startWrapUpCountdown = useCallback((workTimer) => {
    let totalSeconds = null;
    if (typeof workTimer === 'number' && workTimer > 0) {
      totalSeconds = Math.round(workTimer);
    } else {
      const match = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(String(workTimer ?? '').trim());
      if (match) {
        totalSeconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Math.round(Number(match[3]));
      }
    }
    if (!totalSeconds) {
      console.warn('[WrapUp] No usable workTimer on this conversation — not showing a countdown:', workTimer);
      return;
    }

    const endsAt = Date.now() + totalSeconds * 1000;
    try { sessionStorage.setItem(WRAP_UP_STORAGE_KEY, String(endsAt)); } catch { /* ignore */ }
    runWrapUpCountdownUntil(endsAt);
  }, [runWrapUpCountdownUntil]);

  // Resume an in-progress wrap-up countdown that was already running before
  // this particular TelephonyBar instance mounted (see comment above).
  useEffect(() => {
    let storedEndsAt = null;
    try {
      const raw = sessionStorage.getItem(WRAP_UP_STORAGE_KEY);
      if (raw) storedEndsAt = Number(raw);
    } catch { /* ignore */ }

    if (storedEndsAt && storedEndsAt > Date.now()) {
      runWrapUpCountdownUntil(storedEndsAt);
    } else if (storedEndsAt) {
      try { sessionStorage.removeItem(WRAP_UP_STORAGE_KEY); } catch { /* ignore */ }
    }
  }, [runWrapUpCountdownUntil]);

  useEffect(() => {
    return () => {
      if (wrapUpCountdownIntervalRef.current) {
        clearInterval(wrapUpCountdownIntervalRef.current);
      }
    };
  }, []);

  // ---- Mitel softphone (JsSIP, the AUDIO leg for real external calls) ----
  // The underlying `softphone` service is a singleton — registration itself
  // is triggered elsewhere (UserProfileDropdown.jsx, tied to the agent
  // setting their CRM status to Available) so it isn't duplicated here.
  // This hook just subscribes to that same singleton's events/methods so
  // Accept/Hang Up below can actually answer/end the real SIP session, not
  // just the Mitel REST "conversation" bookkeeping call. Without this,
  // clicking Accept told Mitel's ACD engine the agent accepted the call,
  // but never answered the actual SIP INVITE — no audio ever connected.
  const softphone = useWebRTCSoftphone();

  useEffect(() => {
    if (softphone.error) {
      toast.error(`Softphone error: ${softphone.error}`);
    }
  }, [softphone.error]);

  // Auto-answer the caller's own ringback leg for a call THIS agent just
  // placed via the Mitel contact picker — see justDialedContactRef's
  // comment for why this leg exists and needs answering at all.
  //
  // NOT gated on justDialedContactRef's timing anymore (see git history —
  // MBG can deliver this leg's INVITE minutes late, up to 22 minutes
  // observed once, well past any fixed window). Gated instead on caller
  // identity: our own ringback leg's INVITE always arrives with no display
  // name or number (confirmed repeatedly — `displayName: undefined, number:
  // undefined`), while a genuine incoming ACD/queue call ALSO arrives as a
  // raw SIP INVITE to this same extension but always carries a real caller
  // identity (confirmed directly: a live customer call through the
  // KASTAM-VOICE queue showed up as `displayName: 'KASTAM-VOICE', number:
  // '5100'`). Auto-answering unconditionally — the previous version of this
  // fix — silently answered that real incoming call before the agent ever
  // clicked Accept, then threw when the agent's own Accept click tried to
  // answer the same already-answered SIP session a second time. Only the
  // identity-less case is safe to auto-answer; anything with a caller
  // identity must wait for the agent's own Accept action.
  useEffect(() => {
    const call = softphone.currentCall;
    if (call?.direction === 'incoming' && call?.status === 'ringing' && !call?.displayName && !call?.number) {
      justDialedContactRef.current = null;
      console.log('📞 Auto-answering own ringback leg for outbound contact call');
      try {
        softphone.answerCall();
        // Do NOT mark the call as IN_CALL here — answering our own ringback
        // leg only tells the PBX we're ready, it doesn't mean the far end
        // (the contact being dialed) has picked up, or even that the PBX
        // successfully bridged to them at all. Confirmed directly: this can
        // silently fail server-side (no conversation ever created, the
        // contact's own device never rings) while our leg still answers
        // fine — showing "In Call" at this point would be a lie. The real
        // IN_CALL transition happens below, from the same SignalR
        // conversation event any other outgoing call relies on; the
        // dial-timeout effect further down catches the case where that
        // event never arrives.
      } catch (err) {
        console.error('❌ Failed to auto-answer outbound call ringback:', err);
      }
    }
  }, [softphone.currentCall, softphone.answerCall]);

  const intervalRef = useRef(null);
  const autoResetTimeoutRef = useRef(null);
  const callStartTimeRef = useRef(null);
  // The 20s "didn't connect" giveup timer from the last dial attempt.
  // Without tracking this, clicking Call again (or the same call reaching
  // DIALING_OUT twice) before the previous timer fires leaves it dangling —
  // it later fires against whatever the CURRENT call happens to be, since
  // its own check is only `status === 'DIALING_OUT'` with no way to tell
  // that state apart from a completely different, possibly already-
  // succeeding call. Confirmed directly: a stale timer from an earlier
  // attempt killed a later call that was fine, well after Mitel's own logs
  // showed it had already connected. Every place that (re)schedules or
  // resolves this timer must go through dialingOutTimeoutRef so only one
  // is ever live at a time.
  const dialingOutTimeoutRef = useRef(null);
  // Set true right after acceptCall() successfully issues the SIP answer,
  // for an incoming call we're waiting to genuinely confirm — see the
  // effect below that watches for it, and acceptCall()'s own comment for
  // why this replaces setting IN_CALL directly at that point.
  const awaitingConfirmRef = useRef(false);
  // Set right before placing an outbound call via the Mitel contact picker,
  // to { name, number } for the contact being dialed (null otherwise).
  // Mitel's click-to-dial flow rings the CALLER's own device first (leg A)
  // and only bridges to the destination once that leg is answered — that
  // ring arrives as a normal SIP INVITE, indistinguishable at the SIP layer
  // from someone calling this agent directly. Confirmed directly: without
  // answering it, the call just sits there silently ringing the agent's own
  // softphone with no visible UI change, which is exactly what looked like
  // "clicking a contact does nothing". Auto-answering it here means the
  // agent doesn't have to notice and manually answer their own outbound
  // call's ringback — they already showed clear intent by picking the
  // contact to call. The stored name/number also lets the auto-answer
  // effect populate the status pill immediately, without waiting on the
  // SignalR event that normally drives it.
  const justDialedContactRef = useRef(null);
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

  // ---- Helper: Find customer by phone number from contacts ----
  const findCustomerByPhoneFromInteractions = useCallback(async (phoneNumber) => {
    try {
      if (!phoneNumber || phoneNumber === 'Unknown') {
        console.log('⚠️ Invalid phone number for lookup');
        return null;
      }

      console.log(`🔍 Searching for customer with phone number: ${phoneNumber} in contacts`);

      // Search contacts table using the findByPhone endpoint
      const response = await contactService.findByPhone(phoneNumber);

      if (response?.success && response?.data) {
        const { contact, customer } = response.data;
        
        if (customer && customer.id) {
          console.log(`✅ Found matching contact with customer_id: ${customer.id}`);
          return {
            customerId: customer.id,
            customerName: customer.name || 'Unknown',
            customerEmail: customer.email || '',
            phoneNumber: contact.value
          };
        } else {
          console.log(`📝 Contact found but customer not linked: ${phoneNumber}`);
          return null;
        }
      } else {
        console.log(`📝 No contacts found with phone number: ${phoneNumber}`);
        return null;
      }
    } catch (error) {
      // If API call fails (404 or error), gracefully handle and return null
      console.error('ℹ️ No customer found with this phone or API error:', error?.response?.status);
      return null;
    }
  }, []);

  // ---- Helper: Check for existing ticket and navigate appropriately ----
  const checkExistingTicketAndNavigate = useCallback(async (conversationId, callerNumber, callerName) => {
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
        // No existing ticket found - try to find customer by phone number from interactions
        console.log(`📝 No existing ticket found for conversation ${conversationId}, searching for customer by phone`);
        
        const customerInfo = await findCustomerByPhoneFromInteractions(callerNumber);
        
        if (customerInfo?.customerId) {
          // Customer found from previous interactions — still used to link
          // the ticket to the right CRM customer record, but the displayed
          // name comes straight from Mitel's own caller info below, not
          // this matched contact's stored name.
          console.log(`✅ Found customer ${customerInfo.customerId} with this phone number`);
          customerIdRef.current = customerInfo.customerId;

          const params = new URLSearchParams({
            callId: callerNumber,
            source: 'call',
            conversationId: conversationId,
            customerId: customerInfo.customerId,
            customerName: callerName || customerInfo.customerName,
            customerEmail: customerInfo.customerEmail
          });
          if (caseId) {
            params.append('caseId', caseId);
          }
          navigate(`/ticket-management/create?${params.toString()}`);

          toast.info(`Customer identified from previous call`, {
            autoClose: 3000,
          });
        } else {
          // No customer found - create new call record, still showing
          // whatever name Mitel itself reported for the caller.
          console.log(`🆕 New caller - no customer history found`);
          const params = new URLSearchParams({
            callId: callerNumber,
            source: 'call',
            conversationId: conversationId
          });
          if (callerName) {
            params.append('customerName', callerName);
          }
          if (caseId) {
            params.append('caseId', caseId);
          }
          navigate(`/ticket-management/create?${params.toString()}`);
        }
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
  }, [navigate, caseId, findCustomerByPhoneFromInteractions]);

  // Whether this agent has an actual linked Mitel login (UserProfileDropdown's
  // "Mitel Account" card). Tracked here too because the SignalR subscription
  // below was previously wired up independent of this — it kept receiving
  // real ACD call events for the agent's employeeId even while the CRM
  // showed "Not connected", because Mitel's ACD was still routing to that
  // employee from an earlier/underlying session regardless of our own
  // account-linking state. "Not connected" needs to actually mean
  // unreachable, not just "no stored password for next login".
  const [mitelAccountConnected, setMitelAccountConnected] = useState(
    () => !!authService.getCurrentUser()?.agent?.mitel_connected
  );
  useEffect(() => {
    const handleConnected = () => setMitelAccountConnected(true);
    const handleDisconnected = () => setMitelAccountConnected(false);
    window.addEventListener('mitel_account_connected', handleConnected);
    window.addEventListener('mitel_account_disconnected', handleDisconnected);
    return () => {
      window.removeEventListener('mitel_account_connected', handleConnected);
      window.removeEventListener('mitel_account_disconnected', handleDisconnected);
    };
  }, []);

  // ---- Mitel SignalR Hook (only for agents with telephony enabled) ----
  // Wait for SignalR URL to be fetched before connecting, or use fallback
  const mitelEmployeeId = authService.getCurrentUser()?.agent?.employee_id;
  const { state: connState, on, invoke, error } = useMitelSignalR({
    baseUrl: signalRUrl,
    hubs: ['queueHub', 'employeeHub', 'agentHub'],
    token: localStorage.getItem('mitel_token'),
    employeeId: mitelEmployeeId,
    // Only connect if: agent role + telephony enabled + URL is ready + the
    // agent actually has a linked Mitel account — otherwise this receives
    // live call events for an account the CRM itself says isn't connected.
    enabled: isAgent && telephonyEnabled && signalRUrl !== '' && mitelAccountConnected
  });

  // Fetch employee extension once connected. The actual monitor
  // subscriptions (addSelfMonitor/addStateMonitor/addConcurrentStateMonitor
  // — confirmed required via a real Ignite HAR capture, see mitelSignalR.ts)
  // happen automatically inside SignalRService.connect(), not here.
  useEffect(() => {
    if (!isAgent || !telephonyEnabled) return; // Skip if not an agent or telephony is disabled

    if (connState === 'connected') {
      mitelService.getMe()
        .then(employeeData => {
          console.log('📞 Employee data:', employeeData);
          // Mitel's own employee object calls this field "reporting", not
          // "extension" — confirmed directly (every /employees/{id} and
          // presence.voice[0] response uses "reporting"). Checking the
          // wrong field name meant this never fired, so currentExtension
          // stayed on its "8002" placeholder default for the entire
          // session, every session — not a timing race, a permanent bug.
          if (employeeData?.reporting) {
            setCurrentExtension(employeeData.reporting);
          }
        })
        .catch(err => {
          console.error('Failed to fetch employee details:', err);
        });
    }
  }, [connState, invoke, isAgent, telephonyEnabled]);

  // ---- Map Mitel events → FSM ----
  useEffect(() => {
    // Must match useMitelSignalR's own `enabled` condition above exactly —
    // when it's false, the hub connections underneath are never created, so
    // calling on('employeeHub', ...) throws synchronously ("Hub not found:
    // employeeHub") instead of silently failing. That throw happens inside
    // a useEffect, so React treats it as a render-time error and the
    // nearest ErrorBoundary takes down the whole page — this crashed every
    // agent-dashboard load whenever the Mitel account wasn't connected
    // (i.e. the default state for most agents right now).
    if (!isAgent || !telephonyEnabled || signalRUrl === '' || !mitelAccountConnected) {
      console.log('🔗 Skipping Mitel event listeners - User is not an agent, telephony is disabled, SignalR URL not ready, or Mitel account not connected');
      return;
    }

    console.log('🔗 Setting up Mitel event listeners...');

    // TelephonyBar is the voice call bar — Email/Chat/SMS conversations have
    // their own dedicated UI (EmployeeInbox, ConversationNotification) and
    // must not drive this FSM. Every one of these employeeHub events fires
    // for ALL conversation types, not just voice, so without this an
    // incoming email (e.g. a "KASTAM-EMAIL" queue conversation) rendered
    // here as a fake "Incoming call" with a phone icon. mediaType is absent
    // on a couple of legacy/alternate event shapes below — treat missing as
    // voice (matches this bar's original behavior for those) rather than
    // silently dropping real calls.
    const isVoiceMedia = (obj) => {
      const mt = (obj?.mediaType || obj?.media_type || '').toLowerCase();
      return mt === '' || mt === 'voice' || mt === 'phone';
    };

    // Media Stats Updated - This event is fired when call media stats are updated
    const offMediaStats = on('employeeHub', 'mediaStatsUpdated', (data) => {
      console.log('📊 Media Stats Updated:', JSON.stringify(data, null, 2));
      // This event indicates an active call is in progress
      // You can use this as an additional indicator that a call is active
    });

    // Alternative event names that might be used by Mitel
    const offConversationAssigned = on('employeeHub', 'conversationAssigned', (data) => {
      console.log('📞 Conversation ASSIGNED:', JSON.stringify(data, null, 2));
      if (data && isVoiceMedia(data)) {
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
      if (!isVoiceMedia(data)) return;
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
      if (data && isVoiceMedia(data)) {
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

      if (!conversation || !isVoiceMedia(conversation)) return;

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
        checkExistingTicketAndNavigate(conversation.conversationId, callerInfo.number, callerInfo.name);
      } else if (state === 'NonAcd' && direction === 'Outgoing') {
        // OUTGOING CALL — dialing has started, but this state fires as soon
        // as the outbound leg is created, well before the far end has
        // actually picked up. Confirmed directly: this used to jump
        // straight to "In Call" here, so the agent saw a fully-connected
        // pill while the destination was still just ringing. Show
        // DIALING_OUT instead — the 'Connected'/'Active'/'Established'
        // branch below is what genuinely confirms the far end answered,
        // and is the only place that should ever flip this to IN_CALL.
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
        setStatus(prev => (prev === 'IN_CALL' ? prev : 'DIALING_OUT'));
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
      } else if (
        state === 'Connected' || state === 'Active' || state === 'Established' ||
        (state === 'Acd' && conversation.fromAddress && conversation.fromAddress !== conversation.ani)
      ) {
        // 'Acd' is the real conversationState Mitel sends for a call routed
        // through an ACD queue (e.g. calling into 5000/KASTAM-VOICE) —
        // confirmed directly from a live SignalR payload. isConnected is
        // NOT usable here — confirmed directly that it never becomes true
        // at all on the caller's own feed, even for a call that fully
        // connected and ran for minutes.
        //
        // Confirmed directly instead: Mitel sends TWO separate 'Acd'
        // updates for the same conversationId, ~5s apart. The first has
        // fromAddress equal to the caller's own number (ani) — it's just
        // our own leg being offered/auto-answered, NOT the other party
        // answering. The second arrives once the far end genuinely picks
        // up, with fromAddress switched to THEIR number (and a new
        // agentAndAnsweringQueue field naming their agent). Only the
        // second one is real proof of an actual answer — gating on
        // fromAddress !== ani is what tells them apart; trusting the
        // first 'Acd' alone (an earlier version of this fix) flipped the
        // pill to "In Call" seconds after dialing, before the other party
        // had answered at all.
        console.log('✅ Call connected/active');
        // Clear the dial-timeout giveup timer the moment we know the call
        // genuinely connected — see dialingOutTimeoutRef's own comment.
        // Without this it can still fire later and, if a NEW call happens
        // to be in DIALING_OUT by then, kill that unrelated one instead.
        if (dialingOutTimeoutRef.current) {
          clearTimeout(dialingOutTimeoutRef.current);
          dialingOutTimeoutRef.current = null;
        }
        setCurrentConversationId(conversation.conversationId);
        setStatus('IN_CALL');

        // Set call start time if not already set. Prefer Mitel's own
        // timeAgentEstablished from the conversation payload over each
        // client's local `new Date()` — both parties' clients process this
        // SignalR event at slightly different real times (network/
        // processing jitter), so two independently-taken local timestamps
        // drift apart and the two agents see different elapsed times for
        // the same call. Using the one shared, server-provided timestamp
        // gives both sides the same reference point instead.
        if (!callStartTimeRef.current) {
          const established = conversation.timeAgentEstablished && new Date(conversation.timeAgentEstablished);
          callStartTimeRef.current = (established && !isNaN(established)) ? established : new Date();
        }

        onCallEvent?.('telephony:connected', conversation);
      } else if (state === 'Disconnected' || state === 'Ended' || state === 'Completed' || state === 'Abandoned' || state === 'WorkTimer') {
        // 'Abandoned' is a real conversationState seen directly from live
        // SignalR payloads on this tenant. Same class of bug as 'Acd' being
        // missing from the connected-state check above: whichever party's
        // side receives 'Abandoned' instead of one of the other three
        // strings for a call that just ended would never recognize it as
        // over, leaving their pill stuck on "In Call" indefinitely even
        // though the call had already cleared properly on Mitel's own side
        // (confirmed via MiTAI: both DNs' ClearCall attempts returning
        // "no call to clear" — the teardown already happened, only this
        // side's UI never found out).
        //
        // 'WorkTimer' is a separate, distinct conversationState from any of
        // the above — confirmed directly via a live captured payload: Mitel
        // sends THIS specific state (not 'Ended'/'Disconnected'/etc) the
        // moment a call moves into its queue wrap-up period, carrying the
        // real workTimer duration on the same payload. This state was
        // missing here entirely, which is the actual reason the wrap-up
        // countdown never showed — startWrapUpCountdown() was never even
        // called, because this branch's condition never matched.
        console.log('❌ Call disconnected/ended');
        console.log('[WrapUp] raw fields on ended conversation:', {
          workTimer: conversation.workTimer,
          queueIsWrapUpTimeEnabled: conversation.queueIsWrapUpTimeEnabled,
          state,
        });
        setStatus('ENDED');
        startWrapUpCountdown(conversation.workTimer);
        onCallEvent?.('telephony:ended', conversation);

        // Auto-close email ticket when an OpenMedia interaction ends
        const mediaType = (conversation.mediaType || conversation.media_type || '').toLowerCase();
        if ((mediaType === 'openmedia' || mediaType === 'email') && conversation.conversationId) {
          ticketService.closeByMitelId(conversation.conversationId).catch(() => {});
        }
      }
    });

    // Employee conversation REMOVED - Triggered when conversation is removed/ended
    const offConversationRemoved = on('employeeHub', 'employeeConversationRemoved', (data) => {
      console.log('📞 Conversation REMOVED:', JSON.stringify(data, null, 2));

      if (isVoiceMedia(data)) {
        setStatus('ENDED');
        onCallEvent?.('telephony:ended', data);
      }

      // Auto-close email ticket when an OpenMedia interaction is removed
      const mediaType = (data?.mediaType || data?.media_type || '').toLowerCase();
      if ((mediaType === 'openmedia' || mediaType === 'email') && data?.conversationId) {
        ticketService.closeByMitelId(data.conversationId).catch(() => {});
      }
    });

    // Employee state changes
    const offEmployeeState = on('employeeHub', 'employeeStateChanged', (data) => {
      console.log('👤 Employee State Changed:', data);

      // Update agent status based on presence state
      if (data?.presence?.aggregate?.state) {
        const newState = data.presence.aggregate.state;
        setAgentStatus(newState);
        // reason/isMakeBusyReason let the UI tell the difference between an
        // agent's own explicit status choice and the ACD pushing them Busy
        // on its own (e.g. offering a queued item) — Mitel reports both the
        // same way otherwise, which is why this used to look like a silent,
        // unexplained status flip.
        window.dispatchEvent(new CustomEvent('mitel_agent_status_changed', {
          detail: {
            state: newState,
            reason: data.presence.aggregate.reason,
            isMakeBusyReason: data.presence.aggregate.isMakeBusyReason,
          },
        }));

        // Prepare to accept calls when agent becomes Available
        if (newState === 'Available') {
          console.log('✅ Agent is now Available - Ready to accept calls');
          setIsReadyForCalls(true);
          clearWrapUpCountdown();

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
        // Same detail shape as the employeeHub dispatch above, even though
        // this alternate payload may not carry a reason — the consumer
        // handles a missing reason gracefully either way.
        window.dispatchEvent(new CustomEvent('mitel_agent_status_changed', {
          detail: { state: newState, reason: data.reason, isMakeBusyReason: data.isMakeBusyReason },
        }));

        // Prepare to accept calls when agent becomes Available
        if (newState === 'Available') {
          console.log('✅ Agent is now Available (via agentHub) - Ready to accept calls');
          setIsReadyForCalls(true);
          clearWrapUpCountdown();

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
  }, [on, onCallEvent, isAgent, telephonyEnabled, signalRUrl, mitelAccountConnected, checkExistingTicketAndNavigate, logInteractionAsync]);

  // ---- Reset the call FSM on disconnect ----
  // Nothing else here ever clears status/caller when the agent stops being
  // reachable — an agent that goes RINGING and then disconnects (Mitel
  // account disconnect, or the SignalR link itself dropping) was left with
  // a permanently stuck "Incoming from ..." banner, since the SignalR event
  // that would normally clear it (employeeConversationRemoved) never
  // arrives once the connection is already gone.
  const resetCallState = useCallback(() => {
    setStatus('IDLE');
    setCaller(null);
    setTimer(0);
    setMuted(false);
    setCurrentConversationId(null);
    setIsReadyForCalls(false);
    setAgentStatus('Offline');
    callStartTimeRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mitel_account_disconnected', resetCallState);
    return () => window.removeEventListener('mitel_account_disconnected', resetCallState);
  }, [resetCallState]);

  const prevConnStateRef = useRef(connState);
  useEffect(() => {
    if (connState === 'disconnected' && prevConnStateRef.current !== 'disconnected') {
      resetCallState();
    }
    prevConnStateRef.current = connState;
  }, [connState, resetCallState]);

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

  // ---- Action handlers ----
  const acceptCall = useCallback(async () => {
    if (status === 'RINGING' && currentConversationId) {
      try {
        console.log(`📞 Accepting call: ${currentConversationId}`);
        await mitelService.acceptConversation(currentConversationId);
        console.log('✅ Call accepted');

        // Answer the actual SIP session so audio connects — the REST call
        // above only tells Mitel's ACD engine the agent accepted, it never
        // touches the real call media. answerCall() is async (it awaits the
        // mic before answering) and can genuinely fail — this MUST be
        // awaited and checked before claiming "In Call", otherwise a failed
        // SIP answer (mic denied, etc.) still flips the pill to "In Call"
        // while a separate "Softphone error" toast fires from the
        // 'callFailed' event, leaving the agent looking connected with no
        // actual audio on either end.
        try {
          await softphone.answerCall();
        } catch (sipErr) {
          console.error('❌ Failed to answer SIP session:', sipErr);
          toast.error(`Failed to connect audio: ${sipErr.message || sipErr}`);
          return;
        }

        // Do NOT set IN_CALL here. answerCall() resolving only means our
        // own .answer() call didn't throw — it says nothing about whether
        // the call actually finished connecting. Matching Ignite's real
        // mechanism (read directly from its production bundle):
        // _onEventAccepted/_onEventConfirmed are what call _onCallConnected
        // and flip the UI to connected — i.e. the genuine SIP-level
        // confirmation of the session, not the answer() call merely being
        // issued. The awaitingConfirmRef-driven effect below is that same
        // signal for us (softphone's 'confirmed' event -> currentCall.status
        // 'active'), and is what actually sets IN_CALL.
        awaitingConfirmRef.current = true;

        // State will also be updated by SignalR event
      } catch (err) {
        console.error('❌ Failed to accept call:', err);
        toast.error(`Failed to accept call: ${err.message}`);
      }
    }
  }, [status, currentConversationId, caller, logInteractionAsync, softphone.answerCall]);

  // The actual "call connected" signal for an incoming call we just
  // answered — mirrors Ignite's _onEventAccepted/_onEventConfirmed ->
  // _onCallConnected exactly: driven by the real SIP session reaching
  // 'confirmed', not by our own answer() call merely having been issued.
  useEffect(() => {
    if (!awaitingConfirmRef.current) return;
    if (softphone.currentCall?.status !== 'active') return;
    awaitingConfirmRef.current = false;

    setStatus('IN_CALL');
    callStartTimeRef.current = new Date();

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
  }, [softphone.currentCall, currentConversationId, caller, logInteractionAsync]);

  // Detect the call ending from our own real SIP session, not only from
  // Mitel's SignalR conversation broadcast. Confirmed directly: a call can
  // be fully and correctly torn down on Mitel's own side (both DNs'
  // ClearCall attempts returning "no call to clear" — nothing left to
  // clear because it already cleared) while one party's SignalR connection
  // never delivers (or sends with some state string we don't recognize)
  // the event telling that side's UI the call is over — leaving that pill
  // stuck on "In Call" indefinitely with a climbing timer for a call that
  // no longer exists. Our own softphone session already knows the instant
  // the real call ends (a genuine SIP BYE arrives on it) completely
  // independent of SignalR, so use that as a second, unconditional source
  // of truth for leaving the call screen — mirrors the same
  // SIP-events-are-authoritative principle Ignite itself uses throughout,
  // just applied to hangup instead of just answer.
  useEffect(() => {
    if (softphone.currentCall) return;
    if (!['IN_CALL', 'RINGING', 'TRANSFERRING'].includes(status)) return;
    console.log('📞 SIP session ended — leaving call screen (SignalR may not have told us)');
    setStatus('ENDED');
  }, [softphone.currentCall, status]);

  const hangUp = useCallback(async () => {
    if (['IN_CALL', 'RINGING', 'TRANSFERRING'].includes(status)) {
      // Tear down the real SIP session FIRST and unconditionally — this is
      // what actually disconnects the audio on both ends. Confirmed
      // directly against live MiTAI logs: with this after the REST
      // endConversation() call inside the same try block, a failure (or a
      // silent no-op) from that REST call meant this line was never
      // reached at all — the agent's own leg (and the far end) just kept
      // ringing/connected with nothing ever sent to Mitel, forcing the
      // OTHER party to hang up instead. The REST bookkeeping call below is
      // best-effort and must never gate the real teardown.
      try {
        softphone.endCall();
      } catch (sipErr) {
        console.error('❌ Failed to end SIP session:', sipErr);
      }

      try {
        console.log(`📞 Ending call: ${currentConversationId}`);

        // Calculate call duration
        const callDuration = callStartTimeRef.current
          ? Math.floor((new Date() - callStartTimeRef.current) / 1000 / 60) // in minutes
          : timer ? Math.floor(timer / 60) : 0;

        if (currentConversationId) {
          await mitelService.endConversation(currentConversationId);
          console.log('✅ Call ended');
        }

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
  }, [status, currentConversationId, caller, timer, logInteractionAsync, softphone.endCall]);

  const toggleMute = useCallback(async () => {
    if (status === 'IN_CALL') {
      try {
        await invoke('employeeHub', muted ? 'unmute' : 'mute', { /* conversation ID */ });
        // Actually mute the real audio track — the SignalR invoke above is
        // Mitel's own ACD-level mute bookkeeping, separate from the local
        // mic track this softphone is actually sending.
        muted ? softphone.unmute() : softphone.mute();
        setMuted(prev => !prev);
        console.log(`✅ ${muted ? 'Unmuted' : 'Muted'}`);
      } catch (err) {
        console.error('❌ Failed to toggle mute:', err);
      }
    }
  }, [status, muted, invoke, softphone.mute, softphone.unmute]);

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

  const handleContactSelect = useCallback((destination, contact) => {
    setTransferTarget(destination);
    setSelectedContact(contact);
    if (contact?.agentId) {
      setTransferDestinationAgentId(contact.agentId);
    }
  }, []);

  // ---- Call a Mitel contact directly (real PBX call, not P2P) ----
  const handleCallContactSelect = useCallback(async (destination, contact) => {
    setIsCallContactsModalOpen(false);
    if (!destination) {
      toast.error('This contact has no dialable number.');
      return;
    }
    // Confirmed directly (backend logs): a login that falls back to
    // impersonation gets a Mitel token whose principal is the app itself,
    // not the agent — call origination then fails with "FeatureNotAllowed"
    // with zero indication why, even though presence/other calls still
    // look fine. Catch it here instead of letting the agent hit a
    // mysterious server error.
    if (authService.isMitelImpersonated()) {
      toast.error('Your Mitel session isn\'t fully connected (running in limited mode) — please log out and log back in, then try calling again.');
      return;
    }
    setIsDialing(true);
    try {
      // Mitel refuses to originate ANY call — 400 "Could not find an agent
      // for employee [...] to create a new [Voice] conversation" — unless
      // the CALLER's own voice device is already SIP-registered AND its
      // mihotdesk hot-desk session is actually active, confirmed directly
      // against this tenant (including a live repro: isReady/isRegistered
      // was true, the call still 400'd, because the hot-desk session had
      // silently dropped in the background — "Available" in the CRM isn't
      // enough on its own). Checks the service singleton directly, not the
      // hook's isHotDeskActive — that's a render-time snapshot that goes
      // stale the instant this async function starts.
      if (!softphoneService.isHotDeskActive()) {
        if (!mitelEmployeeId) {
          toast.error('Cannot place call: your own employee ID is missing.');
          return;
        }
        console.log('📞 Softphone not hot-desk active — (re)registering before placing outbound call...');
        await softphone.initialize(mitelEmployeeId);
        // A single immediate re-check here was catching the mihotdesk
        // self-heal cycle (un-REGISTER → re-REGISTER → re-SUBSCRIBE) mid-
        // flight far more often than necessary — that cycle commonly
        // settles within a few seconds. Give it a real window instead of
        // failing the instant initialize() returns.
        const becameActive = await waitForHotDeskActive(8000);
        if (!becameActive) {
          toast.error('Your softphone isn\'t logged into the PBX right now — the call was not placed. Please try again in a few seconds.');
          return;
        }
      }

      // See justDialedContactRef's own comment — set right before the call
      // that's about to make our own device ring back.
      const dialedContactName = contact?.name || destination;
      justDialedContactRef.current = { name: dialedContactName, number: destination };
      setTimeout(() => { justDialedContactRef.current = null; }, 30000);

      // Confirmed directly against a real Ignite call (DevTools capture):
      // calling another EMPLOYEE must target their device/agent UUID in
      // `to` (e.g. "70ea5416-...") — NOT their phone extension ("7010").
      // Sending the extension there is what caused every "Could not find an
      // agent"/"FeatureNotAllowed" failure calling internal contacts. `from`
      // must also carry the CALLER's own extension — Ignite always sends
      // it. External (non-employee) numbers have no agentId, so they still
      // fall back to dialing the raw destination.
      const callTo = contact?.agentId || destination;

      // NOT currentExtension — that's populated by a separate effect gated
      // on the SignalR connection reaching 'connected', which can still be
      // pending when the agent clicks to call, leaving it stuck on its
      // hardcoded '8002' placeholder default. Confirmed directly: a real
      // call sent "from":"8002" and Mitel rejected it with
      // "FeatureNotAllowed" even though the token and `to` were both
      // correct. Fetch the caller's own extension fresh right here instead
      // of trusting that side effect to have already run.
      let ownExtension = currentExtension;
      try {
        const myState = await mitelService.getMitelEmployeeState(mitelEmployeeId);
        const reporting = myState?.data?.presence?.voice?.[0]?.reporting;
        if (reporting) ownExtension = reporting;
      } catch (err) {
        console.warn('⚠️ Failed to fetch own extension fresh, falling back to cached value:', err);
      }

      // Confirmed directly against a real, working Ignite call (DevTools
      // capture, Demo1 dialing 5000): Ignite ALWAYS includes a
      // lightDirectoryEntryModels entry, even for queue/IVR numbers like
      // "5000" that only ever resolve to a generic "Dummy" directory match
      // with no real id. Gating this on contact?.id meant we sent an EMPTY
      // array for every one of those — the exact case this feature exists
      // for (dialing a queue/IVR pilot number, not a specific employee) —
      // while Ignite's identical request (non-empty, name/phone populated)
      // succeeds. Build it from name/phone whenever we have either, not
      // only when a real directory id exists.
      const hasContactInfo = contact?.id || contact?.name || contact?.phone || destination;
      await mitelService.makeOutboundCall('me', callTo, {
        from: ownExtension,
        lightDirectoryEntryModels: hasContactInfo ? [{
          id: contact?.id || null,
          name: contact?.name || destination,
          phone: contact?.phone || destination,
          mobilePhone: contact?.mobilePhone || destination,
          agentId: contact?.agentId || null,
          type: contact?.type || 'Dummy',
        }] : [],
      });

      // Give the agent immediate feedback that the click registered — this
      // is what "calling Demo1 does nothing" looked like before: nothing
      // visibly changed until (if ever) the real SignalR conversation event
      // showed up. This is deliberately NOT "In Call" — we have no
      // confirmation yet that Mitel actually bridged to the destination,
      // only that our own request was accepted.
      setCaller({ name: dialedContactName, number: destination, queue: 'Outgoing Call' });
      setStatus('DIALING_OUT');

      // The real IN_CALL transition comes from the same
      // employeeConversationChanged SignalR event any other outgoing call
      // relies on. Confirmed directly against this tenant that the PBX can
      // silently drop an outbound request — our own leg answers fine, but
      // no conversation is ever created and the destination never rings —
      // so if that event hasn't arrived within 20s, tell the agent instead
      // of leaving the pill stuck on a call that isn't actually happening.
      // Cancel any leftover timer from a previous dial attempt before
      // scheduling this one — see dialingOutTimeoutRef's own comment for
      // why an uncancelled one is dangerous, not just wasteful.
      if (dialingOutTimeoutRef.current) {
        clearTimeout(dialingOutTimeoutRef.current);
      }
      dialingOutTimeoutRef.current = setTimeout(() => {
        dialingOutTimeoutRef.current = null;
        setStatus(prev => {
          if (prev !== 'DIALING_OUT') return prev;
          // Resetting the UI here is not enough on its own: our leg (the
          // ringback INVITE auto-answered above) is still a live, answered
          // SIP session even when the PBX never bridges to the destination.
          // Confirmed against live MiTAI logs — left alone, that call sits
          // un-cleared on the agent's DN for several minutes (observed up
          // to ~7) before the PBX times it out on its own, and ANY dial
          // attempt on that DN during that window fails immediately with
          // SXERR_FEATURE_NOT_ALLOWED/1245. That's the actual mechanism
          // behind "FeatureNotAllowed" on retry, not a STUN/ICE issue.
          // Sending a real SIP BYE via endCall() clears our leg right away
          // so a retry a few seconds later doesn't collide with it.
          try {
            softphoneService.endCall();
          } catch (err) {
            console.error('❌ Failed to clear stuck outbound leg after dial timeout:', err);
          }
          toast.error(`Call to ${dialedContactName} didn't connect — no answer from the PBX. Try again.`);
          setCaller(null);
          return 'IDLE';
        });
      }, 20000);
    } catch (err) {
      console.error('❌ Failed to call contact:', err);
      toast.error(`Failed to call ${contact?.name || destination}: ${err.message}`);
    } finally {
      setIsDialing(false);
    }
    // softphone is a fresh object every render (from useWebRTCSoftphone) —
    // an empty dep array here previously froze softphone.isHotDeskActive at
    // its mount-time value (always false), so every call unconditionally
    // forced a full SIP teardown/reconnect right before dialing even when
    // already registered and hot-desk active. That reconnect is what was
    // colliding with the outbound call and stopping the destination from
    // ever actually ringing — confirmed via repro logs showing the SIP
    // transport closing and re-registering right as the call was placed.
  }, [softphone, mitelEmployeeId, currentExtension]);

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
      if (['INPUT','TEXTAREA'].includes(e.target?.tagName)) return;
      switch(e.key.toUpperCase()){
        case 'A':
          if (status==='RINGING') { e.preventDefault(); acceptCall(); }
          break;
        case 'H':
          if (['IN_CALL','RINGING'].includes(status)) { e.preventDefault(); hangUp(); }
          break;
        case 'T': if(status==='IN_CALL'){e.preventDefault();startTransfer();} break;
        case 'M': if(status==='IN_CALL'){e.preventDefault();toggleMute();} break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [status, acceptCall, hangUp, startTransfer, toggleMute]);

  // ---- Status display ----
  const getStatusDisplay = () => {
    switch(status){
      case 'IDLE':
        if (isReadyForCalls) {
          return { text:'Ready for Calls', className:'bg-green-100 text-green-700 border-green-300' };
        }
        return { text:'Not Ready', className:'bg-gray-100 text-gray-700 border-gray-300' };
      case 'RINGING': return { text:`Incoming from ${caller?.name} (${caller?.number})`, className:'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' };
      case 'DIALING_OUT': return { text:`Calling ${caller?.name}...`, className:'bg-blue-100 text-blue-800 border-blue-300 animate-pulse' };
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
  // Don't render the telephony bar for non-agents or when telephony is disabled. Readiness
  // (isReadyForCalls) is NOT a visibility gate — it only arrives via a live Mitel SignalR
  // presence echo, which can lag or never arrive if the PBX connection is slow/down. Hiding the
  // whole bar on that meant an agent could have the flag on and be logged in and still see no
  // voice controls at all. getStatusDisplay() already renders a "Not Ready" state for this case
  // (see IDLE branch above) — that state should be visible, not suppressed.
  if (!isAgent || !telephonyEnabled) {
    return null;
  }

  return (
    <>
      <div className={`h-12 w-full bg-card border border-border rounded-lg shadow-sm flex items-center justify-between px-4 ${className}`}>
        <div className="flex items-center gap-2">
          <span title={`SignalR: ${connState}`}>{connectionStatus}</span>
          <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${statusDisplay?.className}`}>
            <Icon name={
              status==='RINGING' ? 'PhoneIncoming' :
              status==='DIALING_OUT' ? 'PhoneOutgoing' :
              status==='IN_CALL' ? 'Phone' :
              status==='IDLE' && isReadyForCalls ? 'PhoneCall' :
              'PhoneOff'
            } size={14} className="mr-2"/>
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
          {/* Wrap-up countdown — shows remaining seconds of Mitel's
              queue-level after-call work timer before the agent auto-returns
              to Available. Purely informational; the timer itself is
              server-side (queueIsWrapUpTimeEnabled/workTimer) and not
              something this UI can shorten. */}
          {wrapUpSecondsLeft !== null && (
            <div className="flex items-center px-2 py-1 rounded-md text-xs bg-amber-50 text-amber-700 border border-amber-200" title="Time remaining in after-call wrap-up before you're marked Ready">
              <Icon name="Clock" size={12} className="mr-1" />
              <span>
                Wrap-up: {String(Math.floor(wrapUpSecondsLeft / 60)).padStart(2, '0')}:{String(wrapUpSecondsLeft % 60).padStart(2, '0')}
              </span>
            </div>
          )}
          {/* Softphone integration indicator — deliberately separate from
              Agent Status above. That badge reflects ACD presence (which
              can show "Away" for reasons that have nothing to do with the
              softphone itself, e.g. zero queue membership) while this one
              answers the actual question agents kept needing to debug: is
              the SIP/WebRTC device itself registered and hot-desk active
              right now, or not. */}
          {(() => {
            const softphoneStatus = softphone.isInitializing
              ? { text: 'Softphone: Connecting…', icon: 'Loader', className: 'text-amber-600' }
              : softphone.isReconnecting
              ? { text: 'Softphone: Reconnecting…', icon: 'Loader', className: 'text-amber-600' }
              : softphone.isHotDeskActive
              ? { text: 'Softphone: Connected', icon: 'CheckCircle2', className: 'text-green-600' }
              : softphone.isReady
              ? { text: 'Softphone: Registered (not active)', icon: 'AlertTriangle', className: 'text-amber-600' }
              : { text: 'Softphone: Disconnected', icon: 'XCircle', className: 'text-gray-500' };
            return (
              <div
                className="flex items-center px-2 py-1 rounded-md text-xs bg-muted border border-border"
                title="Whether your SIP/WebRTC softphone device is actually registered with the PBX right now — separate from your ACD presence status."
              >
                <Icon name={softphoneStatus.icon} size={12} className={`mr-1 ${softphoneStatus.className}`} />
                <span className={softphoneStatus.className}>{softphoneStatus.text}</span>
              </div>
            );
          })()}
        </div>

        <div className="flex items-center space-x-2">
          {can('mitel.call') && (
            <>
              <Button
                variant="ghost" size="sm"
                iconName={status === 'RINGING' ? 'PhoneCall' : 'Phone'}
                onClick={acceptCall}
                disabled={status !== 'RINGING'}
                title={status === 'RINGING' ? 'Accept Call (A)' : 'No incoming call'}
              />
              <Button
                variant="ghost" size="sm" iconName="PhoneOff"
                onClick={hangUp}
                disabled={!['IN_CALL', 'RINGING', 'TRANSFERRING'].includes(status)}
                title="Hang Up (H)"
              />
            </>
          )}
          {can('mitel.transfer') && (
            <Button variant="ghost" size="sm" iconName="PhoneForwarded" onClick={startTransfer} disabled={status!=='IN_CALL'} title="Transfer Call (T)" />
          )}
          <Button variant="ghost" size="sm" iconName="FileText" onClick={()=>setShowWrapUp(true)} disabled={status!=='ENDED'} title="Wrap-Up" />
          {can('mitel.call') && (
            <Button variant="ghost" size="sm" iconName={muted?'MicOff':'Mic'} onClick={toggleMute} disabled={status!=='IN_CALL'} title="Mute/Unmute (M)" />
          )}
          {can('mitel.call') && (
            <Button
              variant="ghost" size="sm" iconName="Contact"
              onClick={() => setIsCallContactsModalOpen(true)}
              disabled={status !== 'IDLE' || isDialing}
              title={isDialing ? 'Dialing...' : 'Call a Mitel contact'}
            />
          )}
        </div>

        {(status==='RINGING'||status==='DIALING_OUT'||status==='IN_CALL') && caller && (
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
      {isTransferModalOpen && can('mitel.transfer') && (
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

      {/* Voice Contacts Modal (transfer target) */}
      <VoiceContactsModal
        isOpen={isVoiceContactsModalOpen}
        onClose={() => setIsVoiceContactsModalOpen(false)}
        onSelect={handleContactSelect}
        currentExtension={currentExtension}
      />

      {/* Voice Contacts Modal (dial directly — Mitel's own directory) */}
      <VoiceContactsModal
        isOpen={isCallContactsModalOpen}
        onClose={() => setIsCallContactsModalOpen(false)}
        onSelect={handleCallContactSelect}
        currentExtension={currentExtension}
      />
    </>
  );
};

export default TelephonyBar;