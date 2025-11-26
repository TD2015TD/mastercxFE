import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


import { Checkbox } from '../../../components/ui/Checkbox';

const SystemConfigurationPanel = () => {
  const [activeTab, setActiveTab] = useState('sla');

  const departments = [
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'customs-operations', label: 'Customs Operations' },
    { value: 'trade-compliance', label: 'Trade Compliance' },
    { value: 'it-operations', label: 'IT Operations' }
  ];

  const priorityLevels = [
    { value: 'p1', label: 'P1 - Critical' },
    { value: 'p2', label: 'P2 - High' },
    { value: 'p3', label: 'P3 - Medium' },
    { value: 'p4', label: 'P4 - Low' },
    { value: 'p5', label: 'P5 - Planning' }
  ];

  const slaConfigurations = [
    {
      id: 1,
      department: "Customer Service",
      priority: "P1 - Critical",
      responseTime: "15 minutes",
      resolutionTime: "4 hours",
      escalationEnabled: true,
      escalationTime: "30 minutes"
    },
    {
      id: 2,
      department: "Customer Service",
      priority: "P2 - High",
      responseTime: "1 hour",
      resolutionTime: "8 hours",
      escalationEnabled: true,
      escalationTime: "2 hours"
    },
    {
      id: 3,
      department: "Customs Operations",
      priority: "P1 - Critical",
      responseTime: "30 minutes",
      resolutionTime: "6 hours",
      escalationEnabled: true,
      escalationTime: "1 hour"
    }
  ];

  const emailTemplates = [
    {
      id: 1,
      name: "SLA Breach Warning",
      type: "System Alert",
      subject: "SLA Breach Alert - Ticket #{ticketId}",
      lastModified: "2024-10-25",
      status: "Active"
    },
    {
      id: 2,
      name: "Ticket Assignment",
      type: "User Notification",
      subject: "New Ticket Assigned - #{ticketId}",
      lastModified: "2024-10-20",
      status: "Active"
    },
    {
      id: 3,
      name: "Customer Response",
      type: "Customer Communication",
      subject: "Your Request Update - #{ticketId}",
      lastModified: "2024-10-18",
      status: "Draft"
    }
  ];

  const integrationSettings = [
    {
      id: 1,
      name: "Active Directory",
      type: "Authentication",
      status: "Connected",
      lastSync: "2024-10-28 09:30:00",
      health: "Healthy"
    },
    {
      id: 2,
      name: "OKTA SSO",
      type: "Authentication",
      status: "Connected",
      lastSync: "2024-10-28 09:15:00",
      health: "Healthy"
    },
    {
      id: 3,
      name: "Email Gateway",
      type: "Communication",
      status: "Connected",
      lastSync: "2024-10-28 10:00:00",
      health: "Warning"
    },
    {
      id: 4,
      name: "SMS Provider",
      type: "Communication",
      status: "Disconnected",
      lastSync: "2024-10-27 15:45:00",
      health: "Error"
    }
  ];

  const tabs = [
    { id: 'sla', label: 'SLA Configuration', icon: 'Clock' },
    { id: 'email', label: 'Email Templates', icon: 'Mail' },
    { id: 'integration', label: 'Integrations', icon: 'Plug' },
    { id: 'backup', label: 'Backup & Recovery', icon: 'Database' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': 'bg-success/10 text-success',
      'Draft': 'bg-warning/10 text-warning',
      'Connected': 'bg-success/10 text-success',
      'Disconnected': 'bg-error/10 text-error',
      'Healthy': 'bg-success/10 text-success',
      'Warning': 'bg-warning/10 text-warning',
      'Error': 'bg-error/10 text-error'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.[status]}`}>
        {status}
      </span>
    );
  };

  const renderSLAConfiguration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium text-foreground">SLA Parameters</h4>
          <p className="text-sm text-muted-foreground">Configure response and resolution times by department and priority</p>
        </div>
        <Button variant="default" iconName="Plus" iconPosition="left">
          Add SLA Rule
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priority</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Response Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Resolution Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Auto-Escalation</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slaConfigurations?.map((config) => (
              <tr key={config?.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4 text-sm text-foreground">{config?.department}</td>
                <td className="py-3 px-4 text-sm text-foreground">{config?.priority}</td>
                <td className="py-3 px-4 text-sm text-foreground">{config?.responseTime}</td>
                <td className="py-3 px-4 text-sm text-foreground">{config?.resolutionTime}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={config?.escalationEnabled} />
                    <span className="text-sm text-muted-foreground">{config?.escalationTime}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" iconName="Edit">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" iconName="Trash2">
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEmailTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium text-foreground">Email Templates</h4>
          <p className="text-sm text-muted-foreground">Manage notification templates with government branding</p>
        </div>
        <Button variant="default" iconName="Plus" iconPosition="left">
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {emailTemplates?.map((template) => (
          <div key={template?.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h5 className="text-sm font-medium text-foreground">{template?.name}</h5>
                <p className="text-xs text-muted-foreground">{template?.type}</p>
              </div>
              {getStatusBadge(template?.status)}
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Subject:</p>
              <p className="text-sm text-foreground font-mono bg-muted p-2 rounded text-xs">
                {template?.subject}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Modified: {template?.lastModified}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="Edit" fullWidth>
                Edit
              </Button>
              <Button variant="ghost" size="sm" iconName="Copy">
                Clone
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium text-foreground">System Integrations</h4>
          <p className="text-sm text-muted-foreground">Manage external system connections and API configurations</p>
        </div>
        <Button variant="default" iconName="Plus" iconPosition="left">
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrationSettings?.map((integration) => (
          <div key={integration?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Plug" size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-foreground">{integration?.name}</h5>
                  <p className="text-xs text-muted-foreground">{integration?.type}</p>
                </div>
              </div>
              {getStatusBadge(integration?.status)}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Health Status:</span>
                {getStatusBadge(integration?.health)}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last Sync:</span>
                <span className="text-foreground">{new Date(integration.lastSync)?.toLocaleString('en-MY')}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="Settings" fullWidth>
                Configure
              </Button>
              <Button variant="ghost" size="sm" iconName="RefreshCw">
                Sync
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBackupRecovery = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-medium text-foreground">Backup & Recovery</h4>
        <p className="text-sm text-muted-foreground">Configure automated backups and recovery procedures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground">Backup Schedule</h5>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Daily Database Backup</p>
                <p className="text-xs text-muted-foreground">Every day at 2:00 AM</p>
              </div>
              <Checkbox checked />
            </div>
            
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Weekly Full System Backup</p>
                <p className="text-xs text-muted-foreground">Every Sunday at 1:00 AM</p>
              </div>
              <Checkbox checked />
            </div>
            
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Configuration Backup</p>
                <p className="text-xs text-muted-foreground">After each system change</p>
              </div>
              <Checkbox />
            </div>
          </div>
          
          <Button variant="outline" iconName="Settings" fullWidth>
            Configure Schedule
          </Button>
        </div>

        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground">Recent Backups</h5>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Database Backup</p>
                <p className="text-xs text-muted-foreground">28 Oct 2024, 02:00 AM</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge('Active')}
                <Button variant="ghost" size="sm" iconName="Download">
                  Download
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Full System Backup</p>
                <p className="text-xs text-muted-foreground">27 Oct 2024, 01:00 AM</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge('Active')}
                <Button variant="ghost" size="sm" iconName="Download">
                  Download
                </Button>
              </div>
            </div>
          </div>
          
          <Button variant="default" iconName="Database" fullWidth>
            Create Manual Backup
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
            <p className="text-sm text-muted-foreground">Configure system parameters and integrations</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab?.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {activeTab === 'sla' && renderSLAConfiguration()}
        {activeTab === 'email' && renderEmailTemplates()}
        {activeTab === 'integration' && renderIntegrations()}
        {activeTab === 'backup' && renderBackupRecovery()}
      </div>
    </div>
  );
};

export default SystemConfigurationPanel;