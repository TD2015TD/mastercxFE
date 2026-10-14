import { useState, useEffect, useRef, useCallback } from 'react';

// Import your Mitel SignalR service and types
import { SignalRService, ConnectionState } from '../services/mitelSignalR';

export interface SignalRConfig {
  baseUrl: string;
  hubs: string[];
  token?: string;
  enabled?: boolean; // Allow disabling the connection
  employeeId?: string; // Passed through to SignalRService — see its own config for why this matters
}

export interface UseMitelSignalROptions {
  autoConnect?: boolean;
}

export function useMitelSignalR(
  config: SignalRConfig,
  options: UseMitelSignalROptions = { autoConnect: true }
) {
  const serviceRef = useRef<SignalRService | null>(null);
  const configRef = useRef(config);

  // Create service once
  if (!serviceRef.current) {
    serviceRef.current = new SignalRService(configRef.current);
  }

  const service = serviceRef.current;

  // React state
  const [state, setState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  // Auto-connect once
  useEffect(() => {
    // Skip connection if disabled
    if (config.enabled === false) {
      console.log('🔗 SignalR connection disabled (non-agent user)');
      setState(ConnectionState.Disconnected);
      return;
    }

    if (!options.autoConnect) return;

    let isMounted = true;

    // The service was constructed on first render, potentially before
    // baseUrl/token were actually available — sync the current values in
    // before every connect attempt, not just at construction time.
    service.updateConfig(config);
    service
      .connect()
      .catch((err) => isMounted && setError(err));

    return () => {
      isMounted = false;
      service.disconnect();
    };
  }, [config.enabled]);

  // Listen for connection state updates
  useEffect(() => {
    const cleanup = service.onStateChange((s) => setState(s));
    return () => { cleanup && cleanup(); };
  }, []);

  // Listen for errors
  useEffect(() => {
    const cleanup = service.onError((err) => {
      console.error("❌ SignalR Error:", err);
      setError(err);
    });
    return () => { cleanup && cleanup(); };
  }, []);

  // Listen for ALL messages + log them
  useEffect(() => {
    const cleanup = service.onMessage((hub, method, ...args) => {
      console.groupCollapsed(`🔵 SignalR Message → ${hub}.${method}`);
      console.log("Arguments:", args);
      console.groupEnd();

      setLastMessage({ hub, method, args });
    });
    return () => { cleanup && cleanup(); };
  }, []);

  // Invoke a server method
  const invoke = useCallback(
    (hub: string, method: string, ...args: any[]) =>
      service.invoke(hub, method, ...args),
    []
  );

  // Subscribe to events
  const on = useCallback(
    (hub: string, method: string, handler: (...args: any[]) => void) =>
      service.on(hub, method, handler),
    []
  );

  return {
    state,
    lastMessage,
    error,
    invoke,
    on,
  };
}
