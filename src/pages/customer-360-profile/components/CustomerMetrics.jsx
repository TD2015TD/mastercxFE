import React from 'react';
import Icon from '../../../components/AppIcon';

const CustomerMetrics = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total Tickets',
      value: metrics?.totalTickets,
      icon: 'Ticket',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: metrics?.ticketsTrend,
      changeType: metrics?.ticketsTrend > 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Avg Resolution Time',
      value: metrics?.avgResolutionTime,
      icon: 'Clock',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: metrics?.resolutionTrend,
      changeType: metrics?.resolutionTrend < 0 ? 'improvement' : 'decline'
    },
    {
      title: 'Satisfaction Score',
      value: `${metrics?.satisfactionScore}/5`,
      icon: 'Star',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: metrics?.satisfactionTrend,
      changeType: metrics?.satisfactionTrend > 0 ? 'increase' : 'decrease'
    },
    {
      title: 'SLA Compliance',
      value: `${metrics?.slaCompliance}%`,
      icon: 'Target',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: metrics?.slaTrend,
      changeType: metrics?.slaTrend > 0 ? 'increase' : 'decrease'
    }
  ];

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'increase': case'improvement':
        return 'TrendingUp';
      case 'decrease': case'decline':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'increase': case'improvement':
        return 'text-success';
      case 'decrease': case'decline':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Customer Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards?.map((metric, index) => (
          <div key={index} className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${metric?.bgColor} flex items-center justify-center`}>
                <Icon name={metric?.icon} size={20} className={metric?.color} />
              </div>
              {metric?.change !== 0 && (
                <div className={`flex items-center gap-1 ${getChangeColor(metric?.changeType)}`}>
                  <Icon name={getChangeIcon(metric?.changeType)} size={14} />
                  <span className="text-xs font-medium">
                    {Math.abs(metric?.change)}%
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {metric?.value}
              </p>
              <p className="text-sm text-muted-foreground">
                {metric?.title}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Insights */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Most Active Channel</span>
              <span className="text-foreground font-medium">{metrics?.mostActiveChannel}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Preferred Contact Time</span>
              <span className="text-foreground font-medium">{metrics?.preferredContactTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Escalation Rate</span>
              <span className="text-foreground font-medium">{metrics?.escalationRate}%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">First Contact Resolution</span>
              <span className="text-foreground font-medium">{metrics?.firstContactResolution}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Repeat Contact Rate</span>
              <span className="text-foreground font-medium">{metrics?.repeatContactRate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Response Time</span>
              <span className="text-foreground font-medium">{metrics?.avgResponseTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMetrics;