import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
  getSystemHealth,
  getServiceStatus,
  performHealthCheck,
} from '../../../services/systemService';

const SystemHealthMonitor = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [healthRes, servicesRes] = await Promise.all([
        getSystemHealth(),
        getServiceStatus(),
      ]);

      if (healthRes.success) {
        setHealthMetrics(healthRes.data);
      }

      if (servicesRes.success) {
        setServices(servicesRes.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching system data:', err);
      setError(err.response?.data?.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const handleHealthCheck = async () => {
    try {
      const response = await performHealthCheck();
      if (response.success) {
        if (response.healthy) {
          toast.success('System is healthy!');
        } else {
          toast.warning('System health check detected issues');
        }
        fetchAllData();
      }
    } catch (err) {
      console.error('Error performing health check:', err);
      toast.error('Failed to perform health check');
    }
  };

  const systemMetrics = healthMetrics ? [
    {
      id: 1,
      name: "CPU Usage",
      value: healthMetrics.cpu_usage,
      unit: "%",
      status: healthMetrics.cpu_usage > 80 ? "Critical" : healthMetrics.cpu_usage > 60 ? "Warning" : "Normal",
      threshold: 80,
      icon: "Cpu",
      trend: "stable"
    },
    {
      id: 2,
      name: "Memory Usage",
      value: healthMetrics.memory_usage,
      unit: "%",
      status: healthMetrics.memory_usage > 85 ? "Critical" : healthMetrics.memory_usage > 70 ? "Warning" : "Normal",
      threshold: 85,
      icon: "HardDrive",
      trend: "increasing"
    },
    {
      id: 3,
      name: "Disk Usage",
      value: healthMetrics.disk_usage,
      unit: "%",
      status: healthMetrics.disk_usage > 90 ? "Critical" : healthMetrics.disk_usage > 75 ? "Warning" : "Normal",
      threshold: 75,
      icon: "Database",
      trend: "increasing"
    },
    {
      id: 4,
      name: "Network I/O",
      value: healthMetrics.network_io,
      unit: "Mbps",
      status: "Normal",
      threshold: 500,
      icon: "Wifi",
      trend: "stable"
    }
  ] : [];

  const getStatusBadge = (status) => {
    const normalized = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.[normalized]}`}>
        {normalized}
      </span>
    );
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
            <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={handleRefresh} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center">
              <Icon name="AlertTriangle" size={20} className="text-error mr-2" />
              <span className="text-sm text-error">{error}</span>
            </div>
          </div>
        )}

        {loading && !healthMetrics ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader" size={32} className="animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading system health data...</span>
          </div>
        ) : (
          <>
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
                      {formatTimestamp(service?.last_restart)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

          </>
        )}
      </div>
    </div>
  );
};

export default SystemHealthMonitor;