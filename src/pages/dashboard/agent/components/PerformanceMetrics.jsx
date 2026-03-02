import Icon from '../../../../components/AppIcon';

const PerformanceMetrics = ({ metrics }) => {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatAvgResponseTime = (minutes) => {
    if (!minutes && minutes !== 0) return 'N/A';
    if (minutes === 0) return '0 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    return `${Math.round(minutes / 60)} hr`;
  };

  const csat = metrics?.customerSatisfaction ?? 0;
  const csatDisplay = csat > 0 ? `${csat.toFixed(1)} / 5` : 'N/A';

  const metricCards = [
    {
      title: 'Tickets Resolved Today',
      value: metrics?.ticketsResolvedToday ?? 0,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Average Response Time',
      value: formatAvgResponseTime(metrics?.avgResponseTime),
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'SLA Compliance Rate',
      value: `${metrics?.slaComplianceRate ?? 0}%`,
      icon: 'Target',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Customer Satisfaction',
      value: csatDisplay,
      icon: 'Star',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Daily Performance</h2>
        <div className="flex items-center space-x-2">
          <Icon name="Calendar" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{today}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metricCards.map((metric, index) => (
          <div key={index} className="p-4 rounded-lg border border-border bg-background">
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon name={metric.icon} size={20} className={metric.color} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
              <span className="text-2xl font-bold text-foreground">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceMetrics;
