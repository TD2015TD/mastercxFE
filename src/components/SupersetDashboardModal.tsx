import React, { useEffect, useRef, useState } from 'react';
import Icon from './AppIcon';
import type { SupersetDashboard } from '../types/superset';
import { embedSupersetDashboard, unmountSupersetDashboard } from '../utils/supersetEmbed';

interface SupersetDashboardModalProps {
  dashboard: SupersetDashboard;
  isOpen: boolean;
  onClose: () => void;
}

const SupersetDashboardModal: React.FC<SupersetDashboardModalProps> = ({
  dashboard,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerId = `superset-dashboard-${dashboard.id}`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wait for container to be in DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        await embedSupersetDashboard(
          containerId,
          dashboard.superset_id,
          dashboard.ui_config || {}
        );

        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        setLoading(false);
      }
    };

    loadDashboard();

    // Cleanup on unmount
    return () => {
      unmountSupersetDashboard(containerId);
    };
  }, [isOpen, dashboard.id, dashboard.superset_id, dashboard.ui_config, containerId]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            {dashboard.icon && (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name={dashboard.icon} size={20} className="text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {dashboard.title}
              </h2>
              {dashboard.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {dashboard.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Dashboard Container */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-md text-center">
                <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-destructive" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Failed to Load Dashboard
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Superset Dashboard Container */}
          <div
            id={containerId}
            ref={containerRef}
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/30 flex-shrink-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {dashboard.category && (
              <div className="flex items-center space-x-1">
                <Icon name="Folder" size={14} />
                <span>{dashboard.category}</span>
              </div>
            )}
            {dashboard.tags && dashboard.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Icon name="Tag" size={14} />
                <div className="flex gap-1">
                  {dashboard.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open(`${import.meta.env.VITE_SUPERSET_URL}/superset/dashboard/${dashboard.superset_id}`, '_blank')}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors flex items-center space-x-2"
            >
              <Icon name="ExternalLink" size={14} />
              <span>Open in Superset</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupersetDashboardModal;
