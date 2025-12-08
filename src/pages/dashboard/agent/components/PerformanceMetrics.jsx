import React from 'react';
import Icon from '../../../../components/AppIcon';

const PerformanceMetrics = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Tickets Resolved Today',
      value: metrics?.ticketsResolvedToday,
      target: metrics?.dailyTarget,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Average Response Time',
      value: `${metrics?.avgResponseTime}m`,
      target: '15m',
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '-5%',
      changeType: 'positive'
    },
    {
      title: 'SLA Compliance Rate',
      value: `${metrics?.slaComplianceRate}%`,
      target: '95%',
      icon: 'Target',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: '+3%',
      changeType: 'positive'
    },
    {
      title: 'Customer Satisfaction',
      value: `${metrics?.customerSatisfaction}/5`,
      target: '4.5/5',
      icon: 'Star',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+0.2',
      changeType: 'positive'
    }
  ];

  const getProgressPercentage = (value, target) => {
    if (typeof value === 'string') {
      value = parseFloat(value);
    }
    if (typeof target === 'string') {
      target = parseFloat(target);
    }
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Daily Performance</h2>
        <div className="flex items-center space-x-2">
          <Icon name="Calendar" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Today, Oct 28</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metricCards?.map((metric, index) => (
          <div key={index} className="p-4 rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric?.bgColor}`}>
                <Icon name={metric?.icon} size={20} className={metric?.color} />
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded ${
                metric?.changeType === 'positive' ?'text-success bg-success/10' :'text-error bg-error/10'
              }`}>
                {metric?.change}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">{metric?.title}</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-foreground">{metric?.value}</span>
                <span className="text-sm text-muted-foreground">/ {metric?.target}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metric?.color === 'text-success' ? 'bg-success' :
                    metric?.color === 'text-warning' ? 'bg-warning' :
                    metric?.color === 'text-accent' ? 'bg-accent' : 'bg-primary'
                  }`}
                  style={{ 
                    width: `${getProgressPercentage(metric?.value, metric?.target)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Weekly Trend */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">Weekly Trend</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']?.map((day, index) => {
            const isToday = index === 0; // Monday as today for demo
            const performance = [85, 92, 88, 95, 90, 0, 0]?.[index];
            
            return (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground mb-2">{day}</div>
                <div className={`h-12 rounded flex items-end justify-center ${
                  isToday ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  {performance > 0 && (
                    <div 
                      className={`w-full rounded transition-all duration-300 ${
                        performance >= 90 ? 'bg-success' :
                        performance >= 80 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ height: `${(performance / 100) * 100}%` }}
                    ></div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {performance > 0 ? `${performance}%` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;