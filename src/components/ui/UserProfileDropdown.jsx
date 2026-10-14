import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import languageService from '../../services/languageService';
import { updateEmployeeStateDirect, createPresenceStatePayload, getMitelEmployeeState, connectMitelAccount, disconnectMitelAccount } from '../../services/mitelService';
import { toast } from 'react-toastify';
import BusyReasonModal from '../BusyReasonModal';
import HotDeskLoginDialog from '../HotDeskLoginDialog';
import { authService } from '../../services/authService';
import { useWebRTCSoftphone } from '../../hooks/useWebRTCSoftphone';
import { softphone as softphoneService } from '../../services/webrtcSoftphone';
import mitelConfigService from '../../services/mitelConfigService';
import presenceService from '../../services/presenceService';

const UserProfileDropdown = ({ user = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availability, setAvailability] = useState('Offline'); // Default to Offline until we fetch status
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isBusyReasonModalOpen, setIsBusyReasonModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingStatusType, setPendingStatusType] = useState(null);
  const [isLoadingInitialStatus, setIsLoadingInitialStatus] = useState(true);
  const [isAgent, setIsAgent] = useState(false);
  const [telephonyEnabled, setTelephonyEnabled] = useState(false);
  const [mitelConnected, setMitelConnected] = useState(false);
  const [showMitelConnectForm, setShowMitelConnectForm] = useState(false);
  const [mitelUsernameInput, setMitelUsernameInput] = useState('');
  const [mitelPasswordInput, setMitelPasswordInput] = useState('');
  const [isConnectingMitel, setIsConnectingMitel] = useState(false);
  const [showHotDeskDialog, setShowHotDeskDialog] = useState(false);
  const [hotDeskExtension, setHotDeskExtension] = useState('');
  const [isHotDeskLoggingIn, setIsHotDeskLoggingIn] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch telephony enabled state from admin configuration
  useEffect(() => {
    mitelConfigService.getTelephonyEnabled()
      .then(enabled => setTelephonyEnabled(enabled))
      .catch(() => setTelephonyEnabled(false));
  }, []);

  const handleConnectMitelAccount = async (e) => {
    e.preventDefault();
    if (!mitelPasswordInput) return;
    try {
      setIsConnectingMitel(true);
      const result = await connectMitelAccount(mitelPasswordInput, mitelUsernameInput || undefined);
      // A previous account's "Available" intent must not carry over —
      // confirmed directly: connecting a different account (e.g.
      // testcallonly, which has zero queue membership and can never
      // actually sustain Available) while this was still "Available" from
      // an earlier session made fetchInitialStatus below force an
      // Available transition + WebRTC init on the NEW account
      // automatically, instead of leaving it at whatever its actual
      // current state is. Each newly-connected account starts intent-free.
      localStorage.removeItem('mitel_desired_status');
      // The old 'mitel_token' in localStorage is still whatever this CRM
      // session logged in with — usually an impersonation token, since that
      // token is only minted once at CRM login time and connecting a Mitel
      // account here doesn't touch it. Without swapping it in immediately,
      // every Mitel API call (softphone credentials, presence writes, etc)
      // kept using the old impersonation token and failing (401) until the
      // agent fully logged out and back into the CRM.
      if (result?.mitel_token) {
        localStorage.setItem('mitel_token', result.mitel_token);
      }
      // connectMitelAccount() only updates the backend — the 'user-session'
      // snapshot in localStorage that a page refresh reloads from is still
      // the old one (mitel_connected: false). Without this, a refresh right
      // after connecting silently reverted the UI back to "Not connected"
      // even though the backend was already correctly linked.
      await authService.me();
      setMitelConnected(true);
      setShowMitelConnectForm(false);
      setMitelPasswordInput('');
      // TelephonyBar gates its SignalR subscription (and therefore whether
      // it can receive any call events at all) on this same connected state
      // — without the event, it wouldn't know to start until a full refresh.
      window.dispatchEvent(new CustomEvent('mitel_account_connected'));
      toast.success('Mitel account connected.');

      // Real Ignite always shows its "Log in to a phone" dialog right after
      // login, before the account can go Available — mirroring that here
      // instead of silently deciding the device type behind the scenes.
      const employeeId = currentUser?.agent?.employee_id || authService.getCurrentUser()?.agent?.employee_id;
      if (employeeId) {
        try {
          const stateResp = await getMitelEmployeeState(employeeId);
          setHotDeskExtension(stateResp?.data?.reporting || stateResp?.data?.presence?.aggregate?.reporting || '');
        } catch {
          setHotDeskExtension('');
        }
      }
      setShowHotDeskDialog(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not connect Mitel account — check the username/password and try again.');
    } finally {
      setIsConnectingMitel(false);
    }
  };

  const handleDisconnectMitelAccount = async () => {
    try {
      await disconnectMitelAccount();
      await authService.me();
      setMitelConnected(false);

      // An explicit disconnect means the agent no longer wants to be
      // reachable — without clearing this, the next page load/refresh sees
      // mitel_desired_status still "Available" and tries to silently
      // reconnect the softphone right back (see fetchInitialStatus above).
      localStorage.removeItem('mitel_desired_status');
      setAvailability('Offline');

      if (isWebRTCRegistered) {
        try {
          await disconnectWebRTC();
        } catch (sipErr) {
          console.error('❌ Failed to disconnect WebRTC softphone:', sipErr);
        }
      }

      // TelephonyBar has its own independent call FSM (RINGING/IN_CALL/etc.)
      // that nothing here otherwise resets — without this, a stale
      // "Incoming from ..." banner from before the disconnect stays stuck on
      // screen even though the agent is no longer reachable at all.
      window.dispatchEvent(new CustomEvent('mitel_account_disconnected'));

      toast.success('Mitel account disconnected.');
    } catch (error) {
      toast.error('Failed to disconnect Mitel account.');
    }
  };

  // Listen for admin changes to telephony enabled state.
  // Only fires within the tab that made the change — an admin toggling the
  // flag elsewhere doesn't reach this dropdown any other way, that's what
  // the poll below is for.
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

  // Poll for admin changes to telephony enabled state. Bypasses the cached
  // getTelephonyEnabled() on purpose — a cached read would just keep
  // returning the stale value. Also checks the instant the tab regains
  // focus/visibility, not just on the interval — a tester flipping the
  // admin toggle in one tab and alt-tabbing straight back to the agent's
  // tab shouldn't have to wait out the interval to see it take effect.
  // Same pattern as TelephonyBar.jsx.
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

  // P2P call presence follows this CRM status directly — independent of
  // Mitel — so "Offline" here genuinely means uncallable, not just "browser
  // tab happens to be open".
  useEffect(() => {
    if (availability === 'Available') {
      presenceService.join();
    } else {
      presenceService.leave();
    }
  }, [availability]);

  // Keep this dropdown's status display in sync with the live SignalR feed.
  // Without this, availability here only ever reflects the last action this
  // component itself took — it never learns about changes confirmed later
  // by the server (or made elsewhere), and silently drifts out of sync with
  // what TelephonyBar shows.
  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      const mitelState = detail.state;
      const uiState = mitelState === 'DoNotDisturb' ? 'Do Not Disturb' : mitelState;

      // Tell the agent WHY their status just changed when it wasn't their
      // own choice — e.g. Mitel's ACD offering a queued email pushes the
      // agent to Busy on its own. Without this, going Available and then
      // immediately landing back on Busy looked like a silent, unexplained
      // flip instead of "ACD gave you an item on another channel."
      const desiredStatus = localStorage.getItem('mitel_desired_status');
      const desiredUiState = desiredStatus === 'DoNotDisturb' ? 'Do Not Disturb' : desiredStatus;
      if (uiState !== desiredUiState && detail.reason) {
        toast.info(`Status changed to ${uiState} — ${detail.reason}`);
      }

      setAvailability(uiState);
    };
    window.addEventListener('mitel_agent_status_changed', handler);
    return () => window.removeEventListener('mitel_agent_status_changed', handler);
  }, []);

  // WebRTC Softphone hook — provides the device registration Mitel's ACD
  // requires before it will actually honor an Available transition.
  const { initialize: initializeWebRTC, isRegistered: isWebRTCRegistered, disconnect: disconnectWebRTC } = useWebRTCSoftphone();

  // The service itself (webrtcSoftphone.ts) auto-retries a dropped
  // connection in the background for as long as the agent intends to stay
  // Available — this only needs to speak up for the case that background
  // retrying can't fix on its own (credentials revoked, MBG genuinely
  // unreachable, etc.), after it's already given up.
  useEffect(() => {
    const handleReconnectFailed = () => {
      toast.error('Softphone lost connection and could not automatically reconnect. Try toggling your status to reconnect manually.');
    };
    softphoneService.on('reconnectFailed', handleReconnectFailed);
    return () => softphoneService.off('reconnectFailed', handleReconnectFailed);
  }, []);


  const defaultUser = {
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@jkdm.gov.my',
    role: 'agent',
    department: 'Customer Service',
    avatar: null
  };

  const currentUser = user || defaultUser;

  useEffect(() => {
    // currentUser (the `user` prop) comes from Layout.tsx, which rebuilds a
    // stripped-down object (name/email/role/department/avatar only) from
    // localStorage — it never carries `agent` at all. Reading
    // currentUser?.agent here always saw undefined, so this showed
    // "Not connected" on every mount/refresh regardless of whether the
    // account was actually still linked on the backend. The full object
    // (including agent.mitel_connected) is still sitting in the same
    // 'user-session' localStorage entry, just under authService's own
    // getCurrentUser() — read that instead.
    const authData = authService.getCurrentUser();
    setMitelConnected(!!(currentUser?.agent?.mitel_connected || authData?.agent?.mitel_connected));
  }, [currentUser]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Check if user is an agent
  useEffect(() => {
    try {
      const userSession = JSON.parse(localStorage.getItem('user-session') || '{}');
      const authData = authService.getCurrentUser();
      const role = userSession?.role?.slug || authData?.role?.slug || currentUser?.role || '';
      const agentRoles = ['agent', 'supervisor', 'super-admin', 'admin'];
      const isAgentUser = agentRoles.includes(role.toLowerCase());

      setIsAgent(isAgentUser);
      console.log('👤 UserProfileDropdown - User role:', role, 'Is Agent:', isAgentUser);
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAgent(false);
    }
  }, [currentUser]);

  // Fetch initial Mitel status on mount
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        setIsLoadingInitialStatus(true);

        // Get employee_id from user object (from localStorage or props)
        const authData = authService.getCurrentUser();
        console.log(authData);

        // Check if user is an agent
        const userSession = JSON.parse(localStorage.getItem('user-session') || '{}');
        const role = userSession?.role?.slug || authData?.role?.slug || currentUser?.role || '';
        const agentRoles = ['agent', 'supervisor', 'super-admin', 'admin'];
        const isAgent = agentRoles.includes(role.toLowerCase());

        if (!isAgent) {
          console.log('⚠️ User is not an agent, skipping Mitel status fetch');
          setAvailability('Offline');
          setIsLoadingInitialStatus(false);
          return;
        }

        const employeeId = currentUser?.agent?.employee_id || authData?.agent?.employee_id;

        if (!employeeId) {
          console.warn('⚠️ No employee ID found, cannot fetch Mitel status');
          setAvailability('Offline');
          setIsLoadingInitialStatus(false);
          return;
        }

        const response = await getMitelEmployeeState(employeeId);

        // Handle both response formats: { success: true } and { status: "success" }
        const isSuccess = response.success || response.status === 'success';
        const mitelState = response.data?.presence?.aggregate?.state;

        // What the agent actually asked for, tracked separately from
        // whatever Mitel happens to report at this exact instant — a page
        // refresh/relogin always drops the in-memory SIP connection
        // (unavoidable browser behavior), and Mitel's own reported state
        // is not reliably "Available" even when it should be (see the
        // ongoing mihotdesk SUBSCRIBE issue). Relying solely on Mitel's
        // fetched state here meant a refresh could silently strand the
        // agent on Offline with no automatic retry, looking exactly like
        // an unwanted logout even though they never chose that.
        const desiredStatus = localStorage.getItem('mitel_desired_status');

        if (isSuccess && mitelState) {
          // Map Mitel state to UI state
          let uiState = mitelState;
          if (mitelState === 'DoNotDisturb') {
            uiState = 'Do Not Disturb';
          }

          // Prefer the agent's own last choice over Mitel's possibly-stale
          // report — still show it as Available and attempt to reconnect,
          // rather than falling back to whatever Mitel says right now.
          if (desiredStatus === 'Available') {
            uiState = 'Available';
          }

          setAvailability(uiState);
          console.log('✅ Initial Mitel status fetched:', mitelState, '(showing', uiState, 'based on last intent) for employee:', employeeId);

          if (uiState === 'Available' && !isWebRTCRegistered) {
            console.log('📞 Status is Available on load, initializing WebRTC softphone...');
            try {
              await initializeWebRTC(employeeId);
              console.log('✅ WebRTC softphone initialized successfully on load');
            } catch (error) {
              console.error('❌ Failed to initialize WebRTC softphone on load:', error);
              toast.warning('Could not connect softphone device. Available status may not hold.');
            }
          }
        } else if (desiredStatus === 'Available') {
          // Mitel's fetch itself failed/came back empty, but the agent's
          // last choice was still Available — same reasoning as above,
          // don't strand them on Offline without even trying to reconnect.
          console.log('⚠️ Could not confirm Mitel status, but last intent was Available — attempting reconnect anyway');
          setAvailability('Available');
          if (!isWebRTCRegistered) {
            try {
              await initializeWebRTC(employeeId);
            } catch (error) {
              console.error('❌ Failed to initialize WebRTC softphone on load:', error);
              toast.warning('Could not connect softphone device. Available status may not hold.');
            }
          }
        } else {
          console.warn('⚠️ Could not fetch initial Mitel status, defaulting to Offline');
          console.log('Response:', response);
          setAvailability('Offline');
        }
      } catch (error) {
        console.error('❌ Failed to fetch initial Mitel status:', error);
        setAvailability('Offline');
      } finally {
        setIsLoadingInitialStatus(false);
      }
    };

    fetchInitialStatus();
  }, [currentUser]);

  // Auto-login the softphone device whenever the Mitel account is already
  // connected — on this tenant, SIP hot-desk registration and ACD presence
  // (Available/Busy/Offline) are two separate things (confirmed directly: a
  // device can be registered while Away/Busy/Offline), so this deliberately
  // does NOT wait for an Available status like fetchInitialStatus above.
  // Covers the case agents kept hitting: Mitel Account shows "Connected"
  // (the backend session survived a refresh/relogin) but the actual SIP
  // device does not, because fetchInitialStatus only reconnects it when the
  // agent's last known intent was specifically Available. Deliberately runs
  // AFTER fetchInitialStatus settles (isLoadingInitialStatus gate) so it
  // never races that effect's own initializeWebRTC() call for the Available
  // case — useWebRTCSoftphone's isInitializingRef guard would no-op the
  // second call anyway, this just avoids firing it pointlessly.
  useEffect(() => {
    if (!mitelConnected || !isAgent || !telephonyEnabled) return;
    if (isLoadingInitialStatus || isWebRTCRegistered) return;
    if (authService.isMitelImpersonated?.()) return;

    const authData = authService.getCurrentUser();
    const employeeId = currentUser?.agent?.employee_id || authData?.agent?.employee_id;
    if (!employeeId) return;

    console.log('📞 Mitel account already connected — auto-logging in softphone device...');
    initializeWebRTC(employeeId)
      .then(() => console.log('✅ Softphone auto-login succeeded'))
      .catch((error) => console.error('❌ Softphone auto-login failed:', error));
  }, [mitelConnected, isAgent, telephonyEnabled, isLoadingInitialStatus, isWebRTCRegistered, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (language) => {
    // Clear language cache to force fresh translations
    languageService.clearCache();
    
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language);
    setIsOpen(false);
    
    // Reload page to apply new language across all components
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails, clear storage and redirect
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      window.location.href = '/agent-login';
    }
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
  };

  const handleAvailabilityChange = async (status) => {
    // Check if user is an agent
    const userSession = JSON.parse(localStorage.getItem('user-session') || '{}');
    const authData = authService.getCurrentUser();
    const role = userSession?.role?.slug || authData?.role?.slug || currentUser?.role || '';
    const agentRoles = ['agent', 'supervisor', 'super-admin', 'admin'];
    const isAgent = agentRoles.includes(role.toLowerCase());

    if (!isAgent) {
      toast.error('Status changes are only available for agents');
      return;
    }

    // Check if status requires reason code
    if (status === 'Busy' || status === 'Do Not Disturb') {
      // Show BusyReasonModal
      setPendingStatus(status);
      setPendingStatusType(status === 'Do Not Disturb' ? 'Dnd' : 'Busy');
      setIsBusyReasonModalOpen(true);
      return;
    }

    // For other statuses, update directly
    await updateStatusWithReason(status, null);
  };

  const handleBusyReasonSelected = async (reason) => {
    console.log('Busy/DND reason selected:', reason);
    // reason object contains: { id, name, reporting, type }

    await updateStatusWithReason(pendingStatus, reason.id);

    // Clear pending state
    setPendingStatus(null);
    setPendingStatusType(null);
  };

  const handleBusyReasonModalClose = () => {
    setIsBusyReasonModalOpen(false);
    setPendingStatus(null);
    setPendingStatusType(null);
  };

  const handleHotDeskLogin = async () => {
    setIsHotDeskLoggingIn(true);
    try {
      // Register the SIP device only — do NOT force state=Available.
      // Confirmed directly: real Ignite's "Log in to a phone" only logs
      // the phone in and reflects whatever Mitel's ACD naturally reports
      // afterward; it never pushes an explicit Available itself. Forcing
      // it here meant accounts that structurally can't sustain Available
      // (e.g. testcallonly, zero queue membership) fought the ACD on
      // every single hot-desk login instead of just landing on their real
      // state (Away/Busy/whatever it actually is).
      const authData = authService.getCurrentUser();
      const employeeId = currentUser?.agent?.employee_id || authData?.agent?.employee_id;
      if (!employeeId) {
        toast.error('Cannot log in: Employee ID not found');
        return;
      }
      if (!isWebRTCRegistered) {
        await initializeWebRTC(employeeId);
      }
      try {
        const stateResp = await getMitelEmployeeState(employeeId);
        const mitelState = stateResp?.data?.presence?.aggregate?.state;
        if (mitelState) {
          setAvailability(mitelState === 'DoNotDisturb' ? 'Do Not Disturb' : mitelState);
        }
      } catch (err) {
        console.warn('⚠️ Failed to fetch state after hot-desk login:', err);
      }
      setShowHotDeskDialog(false);
    } finally {
      setIsHotDeskLoggingIn(false);
    }
  };

  const updateStatusWithReason = async (status, reasonCodeId = null) => {
    try {
      setIsUpdatingStatus(true);

      // Get employee_id from user object
      const authData = authService.getCurrentUser();
      const employeeId = currentUser?.agent?.employee_id || authData?.agent?.employee_id;

      if (!employeeId) {
        toast.error('Cannot update status: Employee ID not found');
        console.error('❌ No employee ID available for status update');
        setIsUpdatingStatus(false);
        return;
      }

      // An impersonation-mode Mitel token (no agent password on file at
      // login) has the app itself as its principal, not the agent — Mitel
      // silently refuses to apply presence/state changes submitted with
      // it, even on a 200 OK. Confirmed directly via backend logs. Catch
      // it here instead of a confusing "did not apply" verification error.
      if (authService.isMitelImpersonated()) {
        toast.error('Your Mitel session isn\'t fully connected (running in limited mode) — please log out and log back in.');
        setIsUpdatingStatus(false);
        return;
      }

      console.log('🩺 [updateStatusWithReason] status:', status, 'isWebRTCRegistered:', isWebRTCRegistered, 'employeeId:', employeeId);

      // The agent's own intent, persisted independently of whether Mitel
      // actually confirms it — read back on the next page load/login to
      // decide whether to auto-reconnect. Set up front (not only on
      // success) so a refresh mid-attempt still remembers what they were
      // trying to do, instead of quietly reverting to "was never asked".
      localStorage.setItem('mitel_desired_status', status);

      // Mitel's ACD only honors ANY non-Offline transition — Available,
      // Busy, or DoNotDisturb alike — if a device is already registered for
      // this agent. Confirmed directly against this tenant: a presence PUT
      // for Busy or DoNotDisturb with a perfectly valid reason code is a
      // silent no-op (200 OK, but the state stays exactly where it was —
      // "Offline"/"LoggedOut") when sent to a device that was never SIP
      // hot-desk logged in. This used to only register before Available,
      // which is why choosing Busy or DND straight from Offline appeared to
      // "become Offline" — it never actually left Offline in the first
      // place. Register BEFORE asking for any of these, not after — asking
      // first and registering second is what caused this same silent
      // revert originally for Available too.
      if (status !== 'Offline' && !isWebRTCRegistered) {
        console.log(`📞 Registering WebRTC softphone device before requesting ${status}...`);
        try {
          await initializeWebRTC(employeeId);
          console.log('✅ WebRTC softphone device registered');
        } catch (error) {
          console.error('❌ Failed to register WebRTC softphone device:', error);
          toast.error(`Could not connect softphone device — ${status} status will not hold. ` + (error?.message || ''));
          setIsUpdatingStatus(false);
          return;
        }
      }

      // Map UI status to Mitel status
      const mitelStatus = status === 'Do Not Disturb' ? 'DoNotDisturb' : status;

      // Create the payload using the helper function — no deviceId (present
      // in Mitel's documented schema, but confirmed via a real Ignite HAR
      // capture that it doesn't actually send one for this transition;
      // adding it risked being a regression rather than a fix). `availability`
      // is still the PRE-transition status here (only set after a successful
      // verify, below) — passed through so createPresenceStatePayload can
      // pick the right availableReason for whatever's being cleared (see its
      // own comment: "Login" only applies to the very first Offline→Available
      // login, not clearing Busy or DoNotDisturb).
      const payload = createPresenceStatePayload(mitelStatus, reasonCodeId, availability);

      // Confirmed directly against this Mitel tenant: the state PUT can
      // return 200 OK and still not actually apply — most likely a
      // propagation delay between the SIP device just finishing
      // registration and Mitel's ACD/presence engine recognizing it as
      // usable. A single 200 response is not proof the state actually
      // changed, so verify it by re-reading the state afterward, and retry
      // the whole PUT (not just wait) if it hasn't taken effect yet.
      // Set by applyAndVerify from the last state check, so a failure can
      // explain itself instead of always showing the same generic message —
      // e.g. "LoggedInNotPresent" specifically means this Mitel account has
      // no voice queue assigned at all, which no amount of retrying fixes
      // (confirmed directly: a device with zero queue memberships logs into
      // the SIP/hot-desk layer fine but can never reach voice state
      // "Available", landing on "Away"/"LoggedInNotPresent" instead).
      let lastVoiceAcdState = null;

      const applyAndVerify = async () => {
        const response = await updateEmployeeStateDirect(employeeId, payload);
        if (!(response.success || response.status === 'success')) {
          throw new Error(response.message || 'Failed to update status');
        }
        if (status === 'Offline') return true; // nothing to verify — logging out always "succeeds"

        for (let attempt = 0; attempt < 4; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          try {
            const check = await getMitelEmployeeState(employeeId);
            // Checking the VOICE channel specifically, not the aggregate —
            // the aggregate reflects ALL channels combined (voice + email +
            // chat), so it can sit on "Busy"/"Overloaded" even when voice
            // itself is genuinely Available, e.g. the instant Mitel's ACD
            // offers the agent an unrelated pending email from the queue.
            // Confirmed directly: voice showed
            // {state:"Available",acdState:"Idle"} while aggregate showed
            // {state:"Busy",reason:"Overloaded"} because of an old queued
            // email being offered at that exact moment — the aggregate check
            // reported "failed" for a login that had actually succeeded.
            // Same reasoning applies to Busy/DoNotDisturb: confirmed
            // directly that a presence PUT for either one is a silent no-op
            // (200 OK, state stays exactly where it was) if the device
            // wasn't SIP-registered first, so those need the same
            // apply-then-verify treatment Available already got, checked
            // against the voice channel reaching mitelStatus specifically.
            const voiceEntry = check?.data?.presence?.voice?.[0];
            lastVoiceAcdState = voiceEntry?.acdState ?? lastVoiceAcdState;
            if (voiceEntry?.state === mitelStatus) return true;
          } catch (err) {
            console.warn('⚠️ Failed to verify Mitel state after update', err);
          }
        }
        return false;
      };

      let verified = await applyAndVerify();
      if (!verified && status !== 'Offline') {
        console.warn(`⚠️ Mitel state did not apply after first attempt, retrying once...`);
        verified = await applyAndVerify();
      }

      if (!verified && status !== 'Offline') {
        if (status === 'Available' && lastVoiceAcdState === 'LoggedInNotPresent') {
          toast.error('This Mitel account isn\'t assigned to any voice queue, so it can\'t go Available for calls — ask Telediant to assign it to a voice queue (e.g. KASTAM-VOICE).');
        } else {
          toast.error(`Mitel accepted the request but never actually went ${status} — this needs Mitel/Telediant to investigate, not something retrying again will fix.`);
        }
        console.error('❌ Mitel state update accepted (200) but never verified as applied after retries', { employeeId, payload, lastVoiceAcdState });
      } else {
        setAvailability(status);
        console.log('✅ Mitel status updated and verified:', status, reasonCodeId ? `with reason: ${reasonCodeId}` : '', 'for employee:', employeeId);

        if (reasonCodeId) {
          toast.success(`Status changed to ${status}`);
        }

        // Disconnect the device only on a genuine logout (Offline) — Busy
        // and DoNotDisturb both need the SIP session to STAY registered
        // (that's the whole reason they now register it above, same as
        // Available does); disconnecting here for those would immediately
        // undo the registration this same call just did, and the agent
        // would silently drop back to Offline moments later.
        if (status === 'Offline' && isWebRTCRegistered) {
          console.log('📞 Status changed to Offline, disconnecting WebRTC softphone...');
          try {
            await disconnectWebRTC();
            console.log('✅ WebRTC softphone disconnected');
          } catch (error) {
            console.error('❌ Failed to disconnect WebRTC softphone:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to update Mitel status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'agent': 'Customer Service Agent',
      'supervisor': 'Supervisor',
      'admin': 'System Administrator'
    };
    return roleMap?.[role] || 'User';
  };

  const getInitials = (name) => {
    return name?.split(' ')?.map(word => word?.charAt(0))?.join('')?.toUpperCase()?.slice(0, 2);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    // { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
          {currentUser?.avatar ? (
            <img 
              src={currentUser?.avatar} 
              alt={currentUser?.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(currentUser?.name)
          )}
        </div>
        
        {/* User Info - Hidden on mobile */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-foreground">{currentUser?.name}</div>
          <div className="text-xs text-muted-foreground">{getRoleDisplayName(currentUser?.role)}</div>
        </div>
        
        <Icon 
          name={isOpen ? 'ChevronUp' : 'ChevronDown'} 
          size={16} 
          className="text-muted-foreground hidden md:block"
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-lg shadow-modal z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser?.avatar} 
                    alt={currentUser?.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(currentUser?.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-popover-foreground truncate">
                  {currentUser?.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentUser?.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getRoleDisplayName(currentUser?.role)} • {currentUser?.department}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile Settings */}
            {/* <button
              onClick={handleProfileSettings}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
            >
              <Icon name="User" size={16} />
              <span>Profile Settings</span>
            </button> */}

            {/* Language Selection */}
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">Language</div>
              <div className="space-y-1">
                {languages?.map((language) => (
                  <button
                    key={language?.code}
                    onClick={() => handleLanguageChange(language?.code)}
                    className={`w-full flex items-center space-x-3 px-2 py-1 rounded text-sm transition-colors duration-200 ${
                      currentLanguage === language?.code
                        ? 'bg-primary text-primary-foreground'
                        : 'text-popover-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{language?.flag}</span>
                    <span>{language?.name}</span>
                    {currentLanguage === language?.code && (
                      <Icon name="Check" size={14} className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Status Section - hidden when telephony is disabled */}
            {telephonyEnabled && (
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between">
                <span>Status</span>
                {isUpdatingStatus && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                )}
                {!isAgent && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <Icon name="Lock" size={10} />
                    <span>Agent only</span>
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {['Available', 'Busy', 'Do Not Disturb', 'Away', 'Offline'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleAvailabilityChange(status)}
                    disabled={isUpdatingStatus || !isAgent}
                    title={!isAgent ? 'Status changes are only available for agents' : ''}
                    className={`w-full flex items-center space-x-3 px-2 py-1 rounded text-sm transition-colors duration-200 ${
                      availability === status
                        ? 'bg-primary text-primary-foreground'
                        : 'text-popover-foreground hover:bg-muted'
                    } ${(isUpdatingStatus || !isAgent) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{status}</span>
                    {availability === status && (
                      <Icon name="Check" size={14} className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              {!isAgent && (
                <div className="mt-2 text-xs text-muted-foreground italic">
                  Status management is available for agent roles only
                </div>
              )}
            </div>
            )}

            {/* Mitel account connection — one-time real login so status
                changes actually apply (impersonation-based tokens are
                silently ignored by Mitel's ACD for presence writes). No
                Ignite involved; this goes straight to our own backend. */}
            {telephonyEnabled && isAgent && (
              <div className="px-4 py-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">Mitel Account</div>
                {mitelConnected ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <Icon name="CheckCircle2" size={14} />
                      Connected
                    </span>
                    <button
                      onClick={handleDisconnectMitelAccount}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : showMitelConnectForm ? (
                  <form onSubmit={handleConnectMitelAccount} className="space-y-2">
                    <input
                      type="text"
                      autoFocus
                      autoComplete="username"
                      value={mitelUsernameInput}
                      onChange={(e) => setMitelUsernameInput(e.target.value)}
                      placeholder="Mitel username"
                      className="w-full px-2 py-1 text-sm rounded border border-border bg-background"
                    />
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={mitelPasswordInput}
                      onChange={(e) => setMitelPasswordInput(e.target.value)}
                      placeholder="Mitel password"
                      className="w-full px-2 py-1 text-sm rounded border border-border bg-background"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isConnectingMitel || !mitelPasswordInput || !mitelUsernameInput}
                        className="flex-1 px-2 py-1 text-xs rounded bg-primary text-primary-foreground disabled:opacity-50"
                      >
                        {isConnectingMitel ? 'Logging in...' : 'Log in'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowMitelConnectForm(false); setMitelPasswordInput(''); setMitelUsernameInput(''); }}
                        className="px-2 py-1 text-xs rounded text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setMitelUsernameInput(currentUser?.agent?.agent_username || '');
                      setShowMitelConnectForm(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1 text-sm rounded text-amber-600 hover:bg-muted"
                  >
                    <Icon name="AlertTriangle" size={14} />
                    Not connected — click to log in
                  </button>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border my-2"></div>

            {/* Help & Support */}
            {/* <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
            >
              <Icon name="HelpCircle" size={16} />
              <span>Help & Support</span>
            </button> */}

            {/* Session Info */}
            {/* <div className="px-4 py-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Session expires in 45 minutes
              </div>
            </div> */}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-200"
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Busy Reason Modal */}
      <BusyReasonModal
        isOpen={isBusyReasonModalOpen}
        statusType={pendingStatusType}
        onClose={handleBusyReasonModalClose}
        onSelectReason={handleBusyReasonSelected}
        employeeId={currentUser?.agent?.employee_id || JSON.parse(localStorage.getItem('user') || '{}')?.agent?.employee_id}
      />

      <HotDeskLoginDialog
        isOpen={showHotDeskDialog}
        onClose={() => setShowHotDeskDialog(false)}
        onLogin={handleHotDeskLogin}
        extension={hotDeskExtension}
        isLoggingIn={isHotDeskLoggingIn}
      />
    </div>
  );
};

export default UserProfileDropdown;