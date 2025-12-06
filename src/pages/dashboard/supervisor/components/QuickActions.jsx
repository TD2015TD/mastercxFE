import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: "Reassign Tickets",
      description: "Balance workload across agents",
      icon: "Shuffle",
      color: "text-primary bg-primary/10",
      action: () => console.log('Opening ticket reassignment tool')
    },
    {
      id: 2,
      title: "Adjust SLA Settings",
      description: "Configure department SLA rules",
      icon: "Settings",
      color: "text-accent bg-accent/10",
      action: () => console.log('Opening SLA configuration')
    },
    {
      id: 3,
      title: "Generate Reports",
      description: "Create performance analytics",
      icon: "BarChart3",
      color: "text-secondary bg-secondary/10",
      action: () => navigate('/analytics-and-reporting')
    },
    {
      id: 4,
      title: "Schedule Team Meeting",
      description: "Coordinate team discussions",
      icon: "Calendar",
      color: "text-success bg-success/10",
      action: () => console.log('Opening calendar scheduler')
    }
  ];

  const recentActions = [
    {
      id: 1,
      action: "Reassigned 5 tickets from Siti to Ahmad",
      timestamp: "10 minutes ago",
      type: "workload"
    },
    {
      id: 2,
      action: "Updated SLA settings for Technical Support",
      timestamp: "25 minutes ago",
      type: "configuration"
    },
    {
      id: 3,
      action: "Generated weekly performance report",
      timestamp: "1 hour ago",
      type: "report"
    },
    {
      id: 4,
      action: "Scheduled team meeting for tomorrow 2 PM",
      timestamp: "2 hours ago",
      type: "meeting"
    }
  ];

  const getActionIcon = (type) => {
    const iconMap = {
      'workload': 'Shuffle',
      'configuration': 'Settings',
      'report': 'FileText',
      'meeting': 'Calendar'
    };
    return iconMap?.[type] || 'Activity';
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions?.map((action) => (
              <button
                key={action?.id}
                onClick={action?.action}
                className="p-4 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action?.color} group-hover:scale-105 transition-transform duration-200`}>
                    <Icon name={action?.icon} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                      {action?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action?.description}
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Recent Actions */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Actions</h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {recentActions?.map((item) => (
              <div key={item?.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Icon name={getActionIcon(item?.type)} size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item?.action}</p>
                  <p className="text-xs text-muted-foreground">{item?.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Emergency Actions */}
      <div className="bg-card border border-error/20 rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} className="text-error" />
            <h3 className="text-lg font-semibold text-foreground">Emergency Actions</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            <Button
              variant="destructive"
              fullWidth
              iconName="AlertCircle"
              iconPosition="left"
              onClick={() => console.log('Initiating emergency escalation')}
            >
              Emergency Escalation Protocol
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              iconName="Phone"
              iconPosition="left"
              onClick={() => console.log('Calling emergency support')}
            >
              Call Emergency Support
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              iconName="MessageSquare"
              iconPosition="left"
              onClick={() => console.log('Broadcasting team message')}
            >
              Broadcast Team Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;