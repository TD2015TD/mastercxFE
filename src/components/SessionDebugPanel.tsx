/**
 * Session Debug Panel Component
 *
 * Optional component for monitoring JWT token auto-refresh in development.
 * Shows real-time session information and refresh events.
 *
 * Usage:
 * ```tsx
 * // Add to your main layout or App.tsx (development only)
 * import { SessionDebugPanel } from '@/components/SessionDebugPanel';
 *
 * function App() {
 *   return (
 *     <div>
 *       {import.meta.env.DEV && <SessionDebugPanel />}
 *       {/* Rest of your app *\/}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState } from 'react';
import { useTokenAutoRefresh, useTokenExpiration } from '@/hooks/useTokenAutoRefresh';

export function SessionDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { lastRefresh, refreshCount } = useTokenAutoRefresh();
  const { timeRemaining, expiresAt, isExpiringSoon, timeRemainingFormatted } = useTokenExpiration();

  const token = localStorage.getItem('jwt_token');
  const hasToken = !!token;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: '#1f2937',
        color: '#f3f4f6',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        minWidth: '250px',
        maxWidth: '350px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isExpanded ? '8px' : '0',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: hasToken
                ? isExpiringSoon
                  ? '#fbbf24'
                  : '#10b981'
                : '#ef4444',
            }}
          />
          <strong>Session Debug</strong>
        </div>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          {isExpanded ? '▼' : '▲'}
        </span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ marginTop: '8px' }}>
          {/* Token Status */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ opacity: 0.7, fontSize: '10px', marginBottom: '4px' }}>
              TOKEN STATUS
            </div>
            <div>
              {hasToken ? (
                <>
                  <div style={{ color: isExpiringSoon ? '#fbbf24' : '#10b981' }}>
                    ● Active
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    Expires: {timeRemainingFormatted}
                  </div>
                  {expiresAt && (
                    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                      {expiresAt.toLocaleString()}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#ef4444' }}>● No Token</div>
              )}
            </div>
          </div>

          {/* Refresh Stats */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ opacity: 0.7, fontSize: '10px', marginBottom: '4px' }}>
              AUTO-REFRESH
            </div>
            <div>
              <div>Refreshed: {refreshCount} times</div>
              {lastRefresh && (
                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                  Last: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Token Preview */}
          {hasToken && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ opacity: 0.7, fontSize: '10px', marginBottom: '4px' }}>
                TOKEN PREVIEW
              </div>
              <div
                style={{
                  background: '#374151',
                  padding: '6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  wordBreak: 'break-all',
                  maxHeight: '60px',
                  overflow: 'auto',
                }}
              >
                {token?.substring(0, 50)}...
              </div>
            </div>
          )}

          {/* Time Progress Bar */}
          {hasToken && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ opacity: 0.7, fontSize: '10px', marginBottom: '4px' }}>
                TIME REMAINING
              </div>
              <div
                style={{
                  background: '#374151',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  height: '6px',
                }}
              >
                <div
                  style={{
                    background: isExpiringSoon ? '#fbbf24' : '#10b981',
                    height: '100%',
                    width: `${Math.max(0, Math.min(100, (timeRemaining / 3600) * 100))}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #374151',
              fontSize: '10px',
              opacity: 0.6,
            }}
          >
            Check browser console and Network tab for auto-refresh events
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionDebugPanel;
