import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const DashboardPersonalization = () => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState({
    name: 'My Analytics Dashboard',
    widgets: [
      { id: 'metrics_overview', name: 'Metrics Overview', enabled: true, position: 1 },
      { id: 'ticket_volume', name: 'Ticket Volume Chart', enabled: true, position: 2 },
      { id: 'sla_performance', name: 'SLA Performance', enabled: true, position: 3 },
      { id: 'agent_performance', name: 'Agent Performance Table', enabled: true, position: 4 },
      { id: 'customer_satisfaction', name: 'Customer Satisfaction', enabled: false, position: 5 },
      { id: 'department_breakdown', name: 'Department Breakdown', enabled: false, position: 6 }
    ],
    alerts: [
      { id: 'sla_breach', name: 'SLA Breach Warning', enabled: true, threshold: 15 },
      { id: 'high_volume', name: 'High Ticket Volume', enabled: true, threshold: 100 },
      { id: 'low_satisfaction', name: 'Low Customer Satisfaction', enabled: false, threshold: 3.5 }
    ],
    refreshInterval: 300,
    theme: 'system'
  });

  const [savedDashboards, setSavedDashboards] = useState([
    {
      id: 1,
      name: 'Executive Summary',
      description: 'High-level metrics for management',
      isDefault: false,
      createdAt: '2024-10-25T10:30:00Z'
    },
    {
      id: 2,
      name: 'Agent Performance Focus',
      description: 'Detailed agent productivity metrics',
      isDefault: true,
      createdAt: '2024-10-20T14:15:00Z'
    },
    {
      id: 3,
      name: 'SLA Monitoring',
      description: 'SLA compliance and breach tracking',
      isDefault: false,
      createdAt: '2024-10-18T09:45:00Z'
    }
  ]);

  const refreshIntervalOptions = [
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: 'Sun' },
    { value: 'dark', label: 'Dark', icon: 'Moon' },
    { value: 'system', label: 'System', icon: 'Monitor' }
  ];

  const handleWidgetToggle = (widgetId) => {
    setDashboardConfig(prev => ({
      ...prev,
      widgets: prev?.widgets?.map(widget =>
        widget?.id === widgetId
          ? { ...widget, enabled: !widget?.enabled }
          : widget
      )
    }));
  };

  const handleAlertToggle = (alertId) => {
    setDashboardConfig(prev => ({
      ...prev,
      alerts: prev?.alerts?.map(alert =>
        alert?.id === alertId
          ? { ...alert, enabled: !alert?.enabled }
          : alert
      )
    }));
  };

  const handleAlertThresholdChange = (alertId, threshold) => {
    setDashboardConfig(prev => ({
      ...prev,
      alerts: prev?.alerts?.map(alert =>
        alert?.id === alertId
          ? { ...alert, threshold: parseFloat(threshold) }
          : alert
      )
    }));
  };

  const handleSaveDashboard = () => {
    const newDashboard = {
      id: Date.now(),
      name: dashboardConfig?.name,
      description: 'Custom dashboard configuration',
      isDefault: false,
      createdAt: new Date()?.toISOString(),
      config: dashboardConfig
    };

    setSavedDashboards(prev => [...prev, newDashboard]);
    setIsCustomizing(false);
    toast.success('Dashboard saved successfully!');
  };

  const handleLoadDashboard = (dashboard) => {
    if (dashboard?.config) {
      setDashboardConfig(dashboard?.config);
    }
    toast.success(`Loaded dashboard: ${dashboard?.name}`);
  };

  const handleSetDefault = (dashboardId) => {
    setSavedDashboards(prev =>
      prev?.map(dashboard => ({
        ...dashboard,
        isDefault: dashboard?.id === dashboardId
      }))
    );
    toast.success('Default dashboard updated');
  };

  const handleDeleteDashboard = (dashboardId) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      setSavedDashboards(prev => prev?.filter(d => d?.id !== dashboardId));
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Dashboard Personalization</h3>
          <p className="text-sm text-muted-foreground">Customize your analytics dashboard layout and preferences</p>
        </div>
        
        <Button
          variant={isCustomizing ? "outline" : "default"}
          iconName={isCustomizing ? "X" : "Settings"}
          iconPosition="left"
          onClick={() => setIsCustomizing(!isCustomizing)}
        >
          {isCustomizing ? 'Cancel' : 'Customize'}
        </Button>
      </div>
      {isCustomizing ? (
        <div className="space-y-8">
          {/* Dashboard Settings */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Dashboard Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Dashboard Name"
                type="text"
                value={dashboardConfig?.name}
                onChange={(e) => setDashboardConfig(prev => ({ ...prev, name: e?.target?.value }))}
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Auto Refresh Interval
                </label>
                <select
                  value={dashboardConfig?.refreshInterval}
                  onChange={(e) => setDashboardConfig(prev => ({ ...prev, refreshInterval: parseInt(e?.target?.value) }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {refreshIntervalOptions?.map(option => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-foreground mb-3">Theme Preference</label>
              <div className="flex items-center space-x-4">
                {themeOptions?.map(theme => (
                  <button
                    key={theme?.value}
                    onClick={() => setDashboardConfig(prev => ({ ...prev, theme: theme?.value }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                      dashboardConfig?.theme === theme?.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Icon name={theme?.icon} size={16} />
                    <span className="text-sm font-medium">{theme?.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Widget Configuration */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Widget Configuration</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Select which widgets to display on your dashboard
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardConfig?.widgets?.map(widget => (
                <div key={widget?.id} className="p-4 border border-border rounded-lg">
                  <Checkbox
                    label={widget?.name}
                    description={`Position: ${widget?.position}`}
                    checked={widget?.enabled}
                    onChange={() => handleWidgetToggle(widget?.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Alert Configuration */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Alert Configuration</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Set up notifications for important metrics and thresholds
            </p>
            
            <div className="space-y-4">
              {dashboardConfig?.alerts?.map(alert => (
                <div key={alert?.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Checkbox
                      label={alert?.name}
                      checked={alert?.enabled}
                      onChange={() => handleAlertToggle(alert?.id)}
                    />
                  </div>
                  
                  {alert?.enabled && (
                    <div className="ml-6">
                      <Input
                        label="Threshold"
                        type="number"
                        value={alert?.threshold}
                        onChange={(e) => handleAlertThresholdChange(alert?.id, e?.target?.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setIsCustomizing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              iconName="Save"
              iconPosition="left"
              onClick={handleSaveDashboard}
            >
              Save Dashboard
            </Button>
          </div>
        </div>
      ) : (
        /* Saved Dashboards */
        (<div>
          <h4 className="text-md font-medium text-foreground mb-4">Saved Dashboards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDashboards?.map(dashboard => (
              <div key={dashboard?.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-foreground">{dashboard?.name}</h5>
                      {dashboard?.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{dashboard?.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(dashboard.createdAt)?.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleLoadDashboard(dashboard)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
                      title="Load Dashboard"
                    >
                      <Icon name="Play" size={16} />
                    </button>
                    <button
                      onClick={() => handleSetDefault(dashboard?.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
                      title="Set as Default"
                    >
                      <Icon name="Star" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteDashboard(dashboard?.id)}
                      className="p-1 text-muted-foreground hover:text-red-600 transition-colors duration-200"
                      title="Delete Dashboard"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadDashboard(dashboard)}
                  >
                    Load
                  </Button>
                  
                  {!dashboard?.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(dashboard?.id)}
                    >
                      Set Default
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>)
      )}
    </div>
  );
};

export default DashboardPersonalization;