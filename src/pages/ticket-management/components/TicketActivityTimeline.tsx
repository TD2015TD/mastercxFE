import React, { useState, useEffect } from 'react';
import { ticketHistoryService } from '../../../services/ticketHistoryService';
import type { TicketHistory } from '../../../services/ticketHistoryService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

interface TicketActivityTimelineProps {
  ticketId: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const TicketActivityTimeline: React.FC<TicketActivityTimelineProps> = ({ 
  ticketId, 
  autoRefresh = false,
  refreshInterval = 30000 
}) => {
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ticketHistoryService.getTicketHistory(ticketId);
      
      if (response.success) {
        setHistory(response.data || []);
      }
    } catch (err) {
      console.error('Error loading ticket history:', err);
      setError('Failed to load activity history');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadHistory();
    
    if (autoRefresh) {
      const interval = setInterval(loadHistory, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadHistory, autoRefresh, refreshInterval]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHistoryItem = (item: TicketHistory) => {
    const icon = ticketHistoryService.getActionIcon(item.action);
    const color = ticketHistoryService.getActionColor(item.action);
    const actionLabel = ticketHistoryService.formatAction(item.action);

    return (
      <div key={item.id} className="relative pb-8 last:pb-0">
        {/* Timeline Line */}
        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
        
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-card border-2 border-border ${color}`}>
            <Icon name={icon} size={16} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {actionLabel}
                  {item.field_name && (
                    <span className="text-muted-foreground"> - {item.field_name}</span>
                  )}
                </p>
                
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
                
                {/* Show value changes */}
                {item.old_value && item.new_value && (
                  <div className="mt-2 text-sm">
                    <span className="text-red-600 line-through mr-2">{item.old_value}</span>
                    <Icon name="ArrowRight" size={14} className="inline mx-1" />
                    <span className="text-green-600 font-medium">{item.new_value}</span>
                  </div>
                )}
                
                {/* Metadata */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="mt-2 bg-muted rounded-md p-2">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(item.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                
                {/* User and timestamp */}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  {item.user && (
                    <>
                      <Icon name="User" size={12} />
                      <span>{item.user.name}</span>
                      <span>•</span>
                    </>
                  )}
                  <Icon name="Clock" size={12} />
                  <span>{formatTimestamp(item.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader" size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={loadHistory}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Activity" size={20} className="mr-2" />
          Activity Timeline
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="RefreshCw"
          onClick={loadHistory}
        >
          Refresh
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No activity recorded yet</p>
        </div>
      ) : (
        <div className="relative">
          {history.map(renderHistoryItem)}
        </div>
      )}
    </div>
  );
};

export default TicketActivityTimeline;
