import { useState, useEffect, useRef, useCallback } from 'react';

// Import your Mitel SignalR service and types
import { SignalRService, ConnectionState } from '../services/mitelSignalR';

export interface SignalRConfig {
  baseUrl: string;
  hubs: string[];
  token?: string | null;
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
    if (!options.autoConnect) return;

    let isMounted = true;

    service
      .connect()
      .catch((err) => isMounted && setError(err));

    return () => {
      isMounted = false;
      service.disconnect();
    };
  }, []);

  // Listen for connection state updates
  useEffect(() => {
    return service.onStateChange((s) => setState(s));
  }, []);

  // Listen for errors
  useEffect(() => {
    return service.onError((err) => {
      console.error("❌ SignalR Error:", err);
      setError(err);
    });
  }, []);

  // Listen for ALL messages + log them
  useEffect(() => {
    return service.onMessage((hub, method, ...args) => {
      console.groupCollapsed(`🔵 SignalR Message → ${hub}.${method}`);
      console.log("Arguments:", args);
      console.groupEnd();

      setLastMessage({ hub, method, args });
    });
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
