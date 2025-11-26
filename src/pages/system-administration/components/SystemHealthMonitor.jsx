import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemHealthMonitor = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const systemMetrics = [
    {
      id: 1,
      name: "CPU Usage",
      value: 45,
      unit: "%",
      status: "Normal",
      threshold: 80,
      icon: "Cpu",
      trend: "stable"
    },
    {
      id: 2,
      name: "Memory Usage",
      value: 62,
      unit: "%",
      status: "Normal",
      threshold: 85,
      icon: "HardDrive",
      trend: "increasing"
    },
    {
      id: 3,
      name: "Disk Usage",
      value: 78,
      unit: "%",
      status: "Warning",
      threshold: 75,
      icon: "Database",
      trend: "increasing"
    },
    {
      id: 4,
      name: "Network I/O",
      value: 234,
      unit: "Mbps",
      status: "Normal",
      threshold: 500,
      icon: "Wifi",
      trend: "stable"
    }
  ];

  const services = [
    {
      id: 1,
      name: "Web Server",
      status: "Running",
      uptime: "15d 8h 23m",
      port: "443",
      lastRestart: "2024-10-13 02:00:00",
      health: "Healthy"
    },
    {
      id: 2,
      name: "Database Server",
      status: "Running",
      uptime: "15d 8h 23m",
      port: "5432",
      lastRestart: "2024-10-13 02:00:00",
      health: "Healthy"
    },
    {
      id: 3,
      name: "Authentication Service",
      status: "Running",
      uptime: "7d 12h 45m",
      port: "8080",
      lastRestart: "2024-10-21 10:15:00",
      health: "Healthy"
    },
    {
      id: 4,
      name: "Email Service",
      status: "Warning",
      uptime: "2d 4h 12m",
      port: "587",
      lastRestart: "2024-10-26 06:30:00",
      health: "Degraded"
    },
    {
      id: 5,
      name: "Backup Service",
      status: "Running",
      uptime: "15d 8h 23m",
      port: "9000",
      lastRestart: "2024-10-13 02:00:00",
      health: "Healthy"
    }
  ];

  const alerts = [
    {
      id: 1,
      type: "Warning",
      message: "Disk usage approaching threshold on primary server",
      timestamp: "2024-10-28 10:15:00",
      severity: "Medium",
      acknowledged: false
    },
    {
      id: 2,
      type: "Info",
      message: "Scheduled maintenance completed successfully",
      timestamp: "2024-10-28 02:00:00",
      severity: "Low",
      acknowledged: true
    },
    {
      id: 3,
      type: "Warning",
      message: "Email service experiencing intermittent connectivity issues",
      timestamp: "2024-10-27 16:30:00",
      severity: "Medium",
      acknowledged: false
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Normal': 'bg-success/10 text-success',
      'Warning': 'bg-warning/10 text-warning',
      'Critical': 'bg-error/10 text-error',
      'Running': 'bg-success/10 text-success',
      'Stopped': 'bg-error/10 text-error',
      'Healthy': 'bg-success/10 text-success',
      'Degraded': 'bg-warning/10 text-warning',
      'Failed': 'bg-error/10 text-error'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.[status]}`}>
        {status}
      </span>
    );
  };

  const getAlertIcon = (type) => {
    const iconMap = {
      'Info': 'Info',
      'Warning': 'AlertTriangle',
      'Critical': 'AlertCircle'
    };
    return iconMap?.[type] || 'Info';
  };

  const getAlertColor = (type) => {
    const colorMap = {
      'Info': 'text-blue-600',
      'Warning': 'text-warning',
      'Critical': 'text-error'
    };
    return colorMap?.[type] || 'text-blue-600';
  };

  const getTrendIcon = (trend) => {
    const trendMap = {
      'increasing': 'TrendingUp',
      'decreasing': 'TrendingDown',
      'stable': 'Minus'
    };
    return trendMap?.[trend] || 'Minus';
  };

  const getTrendColor = (trend) => {
    const colorMap = {
      'increasing': 'text-error',
      'decreasing': 'text-success',
      'stable': 'text-muted-foreground'
    };
    return colorMap?.[trend] || 'text-muted-foreground';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('en-MY', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Health Monitor</h3>
            <p className="text-sm text-muted-foreground">Real-time system performance and service monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {currentTime?.toLocaleTimeString('en-MY')}
            </div>
            <Button variant="outline" iconName="RefreshCw" iconPosition="left">
              Refresh
            </Button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {systemMetrics?.map((metric) => (
            <div key={metric?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon name={metric?.icon} size={20} className="text-primary" />
                  <h4 className="text-sm font-medium text-foreground">{metric?.name}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={getTrendIcon(metric?.trend)} 
                    size={14} 
                    className={getTrendColor(metric?.trend)}
                  />
                  {getStatusBadge(metric?.status)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-foreground">{metric?.value}</span>
                  <span className="text-sm text-muted-foreground">{metric?.unit}</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric?.value >= metric?.threshold ? 'bg-error' :
                      metric?.value >= metric?.threshold * 0.8 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min((metric?.value / metric?.threshold) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Threshold: {metric?.threshold}{metric?.unit}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Services Status */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-foreground mb-4">Service Status</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Health</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Uptime</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Port</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Restart</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services?.map((service) => (
                  <tr key={service?.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{service?.name}</td>
                    <td className="py-3 px-4">{getStatusBadge(service?.status)}</td>
                    <td className="py-3 px-4">{getStatusBadge(service?.health)}</td>
                    <td className="py-3 px-4 text-sm text-foreground font-mono">{service?.uptime}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{service?.port}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatTimestamp(service?.lastRestart)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" iconName="RotateCcw">
                          Restart
                        </Button>
                        <Button variant="ghost" size="sm" iconName="Settings">
                          Config
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-foreground">System Alerts</h4>
            <Button variant="outline" size="sm" iconName="Bell">
              View All Alerts
            </Button>
          </div>
          
          <div className="space-y-3">
            {alerts?.map((alert) => (
              <div key={alert?.id} className={`border rounded-lg p-4 ${
                alert?.acknowledged ? 'border-border bg-muted/20' : 'border-warning bg-warning/5'
              }`}>
                <div className="flex items-start space-x-3">
                  <Icon 
                    name={getAlertIcon(alert?.type)} 
                    size={20} 
                    className={getAlertColor(alert?.type)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium text-foreground">{alert?.type} Alert</h5>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(alert?.timestamp)}
                        </span>
                        {!alert?.acknowledged && (
                          <Button variant="ghost" size="sm" iconName="Check">
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{alert?.message}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-muted-foreground">Severity: {alert?.severity}</span>
                      {alert?.acknowledged && (
                        <span className="text-xs text-success">✓ Acknowledged</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMonitor;