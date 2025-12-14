// Route configuration with breadcrumb metadata
// This configuration is used for routing and breadcrumb generation

export interface RouteConfig {
  label: string;
  parent: string | null;
  pattern?: string;
}

export const routeConfig: Record<string, RouteConfig> = {
  '/agent-dashboard': { 
    label: 'Agent Dashboard', 
    parent: null
  },
  '/supervisor-dashboard': { 
    label: 'Supervisor Dashboard', 
    parent: null
  },
  '/ticket-management': { 
    label: 'Ticket Management', 
    parent: null
  },
  '/ticket-management/create': { 
    label: 'Create Ticket', 
    parent: '/ticket-management'
  },
  '/ticket-management/:id': { 
    label: 'Ticket Details', 
    parent: '/ticket-management',
    pattern: '/ticket-management/:id'
  },
  '/customer-360-profile': { 
    label: 'Customer 360 Profile', 
    parent: '/agent-dashboard'
  },
  '/customer-360-profile/:id': { 
    label: 'Customer Details', 
    parent: '/customer-360-profile',
    pattern: '/customer-360-profile/:id'
  },
  '/knowledge-base-portal': { 
    label: 'Knowledge Base Portal', 
    parent: '/agent-dashboard'
  },
  '/knowledge-base-content-creator-portal': { 
    label: 'Content Creator Portal', 
    parent: '/knowledge-base-portal'
  },
  '/directory-search-and-browsing': { 
    label: 'Directory Search & Browsing', 
    parent: '/knowledge-base-portal'
  },
  '/system-administration': { 
    label: 'System Administration', 
    parent: null
  },
  '/system-administration/users/create': { 
    label: 'Create User', 
    parent: '/system-administration'
  },
  '/system-administration/users/:id/edit': { 
    label: 'Edit User', 
    parent: '/system-administration',
    pattern: '/system-administration/users/:id/edit'
  },
  '/analytics-and-reporting': { 
    label: 'Analytics & Reporting', 
    parent: '/supervisor-dashboard'
  },
  '/global-navigation-system': { 
    label: 'Global Navigation System', 
    parent: '/system-administration'
  },
  '/agent-management': {
    label: 'Agent Management',
    parent: '/system-administration'
  },
  '/employee-inbox': {
    label: 'Employee Inbox',
    parent: '/agent-dashboard'
  }
};
