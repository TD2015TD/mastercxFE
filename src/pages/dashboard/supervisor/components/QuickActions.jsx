import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/AppIcon';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: "Generate Reports",
      description: "View performance analytics and reports",
      icon: "BarChart3",
      color: "text-primary bg-primary/10",
      action: () => navigate('/analytics-and-reporting')
    },
    {
      id: 2,
      title: "Manage Tickets",
      description: "View and manage all department tickets",
      icon: "Ticket",
      color: "text-accent bg-accent/10",
      action: () => navigate('/ticket-management')
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="w-full p-4 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <Icon name={action.icon} size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
