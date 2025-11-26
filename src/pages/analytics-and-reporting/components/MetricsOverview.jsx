import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsOverview = ({ dateRange }) => {
  const metricsData = [
    {
      id: 1,
      title: "Total Tickets",
      value: "2,847",
      change: "+12.5%",
      changeType: "increase",
      icon: "Ticket",
      color: "bg-blue-500",
      description: "Total tickets processed this period"
    },
    {
      id: 2,
      title: "SLA Compliance",
      value: "94.2%",
      change: "+2.1%",
      changeType: "increase",
      icon: "Clock",
      color: "bg-green-500",
      description: "Tickets resolved within SLA timeframe"
    },
    {
      id: 3,
      title: "Avg Resolution Time",
      value: "4.2h",
      change: "-0.8h",
      changeType: "decrease",
      icon: "Timer",
      color: "bg-amber-500",
      description: "Average time to resolve tickets"
    },
    {
      id: 4,
      title: "Customer Satisfaction",
      value: "4.6/5",
      change: "+0.2",
      changeType: "increase",
      icon: "Star",
      color: "bg-purple-500",
      description: "Average customer satisfaction rating"
    },
    {
      id: 5,
      title: "Active Agents",
      value: "127",
      change: "+5",
      changeType: "increase",
      icon: "Users",
      color: "bg-indigo-500",
      description: "Currently active support agents"
    },
    {
      id: 6,
      title: "Escalation Rate",
      value: "8.3%",
      change: "-1.2%",
      changeType: "decrease",
      icon: "TrendingUp",
      color: "bg-red-500",
      description: "Percentage of tickets escalated"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricsData?.map((metric) => (
        <div key={metric?.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${metric?.color} rounded-lg flex items-center justify-center`}>
              <Icon name={metric?.icon} size={24} color="white" />
            </div>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              metric?.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              <Icon 
                name={metric?.changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
              />
              <span>{metric?.change}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{metric?.title}</h3>
            <p className="text-2xl font-bold text-foreground">{metric?.value}</p>
            <p className="text-xs text-muted-foreground">{metric?.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;