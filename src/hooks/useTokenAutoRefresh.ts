import { useEffect, useState } from 'react';

/**
 * Custom hook to monitor JWT token auto-refresh events
 *
 * This hook listens for the 'token-refreshed' event dispatched by the API client
 * when a token is automatically refreshed by the backend middleware.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { lastRefresh, refreshCount } = useTokenAutoRefresh();
 *
 *   // Optional: Show notification or update UI when token refreshes
 *   return (
 *     <div>
 *       {lastRefresh && (
 *         <p>Session extended at {lastRefresh.toLocaleTimeString()}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenAutoRefresh() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    const handleTokenRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { token } = customEvent.detail;

      setLastRefresh(new Date());
      setRefreshCount((prev) => prev + 1);
      setCurrentToken(token);

      console.log('Token refresh detected in component:', {
        timestamp: new Date().toISOString(),
        tokenPreview: token?.substring(0, 20) + '...',
      });
    };

    // Listen for token refresh events from API interceptors
    window.addEventListener('token-refreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefresh);
    };
  }, []);

  return {
    lastRefresh,
    refreshCount,
    currentToken,
  };
}

/**
 * Decode JWT token to extract payload information
 *
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeJwtToken(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Get the expiration time from a JWT token
 *
 * @param token - JWT token string
 * @returns Expiration date or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) return null;

  return new Date((decoded.exp as number) * 1000);
}

/**
 * Get the time remaining until token expiration in seconds
 *
 * @param token - JWT token string
 * @returns Time remaining in seconds, or 0 if expired/invalid
 */
export function getTimeUntilExpiration(token: string): number {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;

  const now = new Date();
  const timeRemaining = Math.floor((expiration.getTime() - now.getTime()) / 1000);

  return Math.max(0, timeRemaining);
}

/**
 * Custom hook to monitor token expiration
 *
 * This hook tracks the current token's expiration time and provides
 * real-time information about how much time remains.
 *
 * Usage:
 * ```tsx
 * function SessionMonitor() {
 *   const { timeRemaining, expiresAt, isExpiringSoon } = useTokenExpiration();
 *
 *   if (isExpiringSoon) {
 *     return <div>Your session will expire soon!</div>;
 *   }
 *
 *   return (
 *     <div>
 *       Session expires in {Math.floor(timeRemaining / 60)} minutes
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenExpiration(warningThresholdSeconds = 300) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const updateExpiration = () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setTimeRemaining(0);
        setExpiresAt(null);
        setIsExpiringSoon(false);
        return;
      }

      const remaining = getTimeUntilExpiration(token);
      const expiration = getTokenExpiration(token);

      setTimeRemaining(remaining);
      setExpiresAt(expiration);
      setIsExpiringSoon(remaining > 0 && remaining < warningThresholdSeconds);
    };

    // Update immediately
    updateExpiration();

    // Update every 10 seconds
    const interval = setInterval(updateExpiration, 10000);

    // Also update when token is refreshed
    const handleTokenRefresh = () => {
      updateExpiration();
    };

    window.addEventListener('token-refreshed', handleTokenRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('token-refreshed', handleTokenRefresh);
    };
  }, [warningThresholdSeconds]);

  return {
    timeRemaining,
    expiresAt,
    isExpiringSoon,
    timeRemainingFormatted: formatTimeRemaining(timeRemaining),
  };
}

/**
 * Format time remaining into a human-readable string
 *
 * @param seconds - Time remaining in seconds
 * @returns Formatted string (e.g., "45 minutes", "2 hours 15 minutes")
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return minutes > 0
      ? `${hours}h ${minutes}m`
      : `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${secs}s`;
}

export default useTokenAutoRefresh;
