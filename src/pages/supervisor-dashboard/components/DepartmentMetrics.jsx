import React from 'react';
import Icon from '../../../components/AppIcon';

const DepartmentMetrics = () => {
  const departmentStats = [
    {
      id: 1,
      title: "Active Tickets",
      value: 127,
      change: "+12",
      changeType: "increase",
      icon: "Ticket",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: 2,
      title: "SLA Compliance",
      value: "94.2%",
      change: "+2.1%",
      changeType: "increase",
      icon: "Clock",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      id: 3,
      title: "Agents Available",
      value: 18,
      change: "-2",
      changeType: "decrease",
      icon: "Users",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: 4,
      title: "Escalations",
      value: 8,
      change: "+3",
      changeType: "increase",
      icon: "AlertTriangle",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {departmentStats?.map((stat) => (
        <div key={stat?.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              stat?.changeType === 'increase' ? 'text-success' : 'text-error'
            }`}>
              <Icon 
                name={stat?.changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
              />
              <span>{stat?.change}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat?.value}</h3>
            <p className="text-sm text-muted-foreground">{stat?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DepartmentMetrics;