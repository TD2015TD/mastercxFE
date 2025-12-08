import api from './api';

export interface TicketHistory {
  id: number;
  ticket_id: number;
  user_id?: number;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface HistoryFilter {
  action?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

export const ticketHistoryService = {
  /**
   * Get all history entries for a ticket
   */
  getTicketHistory: async (ticketId: number, filters?: HistoryFilter) => {
    const response = await api.get(`/tickets/${ticketId}/history`, { params: filters });
    return response.data;
  },

  /**
   * Get recent history across all tickets (for activity feed)
   */
  getRecentHistory: async (limit: number = 20) => {
    const response = await api.get('/ticket-history/recent', { 
      params: { limit } 
    });
    return response.data;
  },

  /**
   * Get history for a specific user
   */
  getUserHistory: async (userId: number, limit: number = 50) => {
    const response = await api.get(`/ticket-history/user/${userId}`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Create a manual history entry (for custom actions)
   */
  createHistoryEntry: async (ticketId: number, data: {
    action: string;
    description?: string;
    field_name?: string;
    old_value?: string;
    new_value?: string;
    metadata?: Record<string, unknown>;
  }) => {
    const response = await api.post(`/tickets/${ticketId}/history`, data);
    return response.data;
  },

  /**
   * Format history action for display
   */
  formatAction: (action: string): string => {
    const actionMap: Record<string, string> = {
      'created': 'Created ticket',
      'updated': 'Updated',
      'status_changed': 'Changed status',
      'priority_changed': 'Changed priority',
      'assigned': 'Assigned ticket',
      'reassigned': 'Reassigned ticket',
      'commented': 'Added comment',
      'resolved': 'Resolved ticket',
      'closed': 'Closed ticket',
      'reopened': 'Reopened ticket',
      'escalated': 'Escalated ticket',
      'sla_breach': 'SLA breached',
      'attachment_added': 'Added attachment',
      'attachment_removed': 'Removed attachment',
      'customer_updated': 'Updated customer info',
      'department_changed': 'Changed department',
      'category_changed': 'Changed category',
    };
    
    return actionMap[action] || action;
  },

  /**
   * Get action icon name for display
   */
  getActionIcon: (action: string): string => {
    const iconMap: Record<string, string> = {
      'created': 'Plus',
      'updated': 'Edit',
      'status_changed': 'RefreshCw',
      'priority_changed': 'AlertTriangle',
      'assigned': 'UserPlus',
      'reassigned': 'Users',
      'commented': 'MessageSquare',
      'resolved': 'CheckCircle',
      'closed': 'XCircle',
      'reopened': 'RotateCcw',
      'escalated': 'TrendingUp',
      'sla_breach': 'AlertOctagon',
      'attachment_added': 'Paperclip',
      'attachment_removed': 'Trash',
      'customer_updated': 'User',
      'department_changed': 'Building',
      'category_changed': 'Tag',
    };
    
    return iconMap[action] || 'Activity';
  },

  /**
   * Get action color for display
   */
  getActionColor: (action: string): string => {
    const colorMap: Record<string, string> = {
      'created': 'text-blue-600',
      'updated': 'text-purple-600',
      'status_changed': 'text-indigo-600',
      'priority_changed': 'text-orange-600',
      'assigned': 'text-green-600',
      'reassigned': 'text-teal-600',
      'commented': 'text-cyan-600',
      'resolved': 'text-green-600',
      'closed': 'text-gray-600',
      'reopened': 'text-yellow-600',
      'escalated': 'text-red-600',
      'sla_breach': 'text-red-600',
      'attachment_added': 'text-blue-600',
      'attachment_removed': 'text-red-600',
      'customer_updated': 'text-purple-600',
      'department_changed': 'text-indigo-600',
      'category_changed': 'text-pink-600',
    };
    
    return colorMap[action] || 'text-gray-600';
  },
};
