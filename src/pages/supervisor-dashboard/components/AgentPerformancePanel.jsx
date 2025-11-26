import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AgentPerformancePanel = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');

  const agentPerformance = [
  {
    id: 1,
    name: "Ahmad Rahman",
    avatar: "https://images.unsplash.com/photo-1588178457501-31b7688a41a0",
    avatarAlt: "Professional headshot of Malaysian man with short black hair in white shirt",
    status: "available",
    ticketsHandled: 23,
    avgResponseTime: "2.3 min",
    resolutionRate: "92%",
    qualityScore: 4.8,
    department: "General Inquiry"
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    avatar: "https://images.unsplash.com/photo-1717842800198-2328ae5b2d5c",
    avatarAlt: "Professional headshot of Malaysian woman with hijab in blue blazer",
    status: "busy",
    ticketsHandled: 19,
    avgResponseTime: "3.1 min",
    resolutionRate: "89%",
    qualityScore: 4.6,
    department: "Technical Support"
  },
  {
    id: 3,
    name: "Raj Kumar",
    avatar: "https://images.unsplash.com/photo-1585066047759-3438c34cf676",
    avatarAlt: "Professional headshot of Indian man with beard in dark suit",
    status: "available",
    ticketsHandled: 21,
    avgResponseTime: "1.8 min",
    resolutionRate: "95%",
    qualityScore: 4.9,
    department: "Customs Declaration"
  },
  {
    id: 4,
    name: "Lim Wei Ming",
    avatar: "https://images.unsplash.com/photo-1727702079139-c5e78976dab5",
    avatarAlt: "Professional headshot of Chinese man with glasses in navy shirt",
    status: "break",
    ticketsHandled: 17,
    avgResponseTime: "2.7 min",
    resolutionRate: "88%",
    qualityScore: 4.5,
    department: "Import/Export"
  },
  {
    id: 5,
    name: "Fatimah Abdullah",
    avatar: "https://images.unsplash.com/photo-1570771888011-1bef53d75e0b",
    avatarAlt: "Professional headshot of Malaysian woman with hijab in green blouse",
    status: "available",
    ticketsHandled: 25,
    avgResponseTime: "2.1 min",
    resolutionRate: "93%",
    qualityScore: 4.7,
    department: "General Inquiry"
  }];


  const getStatusColor = (status) => {
    const statusMap = {
      'available': 'text-success bg-success/10',
      'busy': 'text-warning bg-warning/10',
      'break': 'text-muted-foreground bg-muted',
      'offline': 'text-error bg-error/10'
    };
    return statusMap?.[status] || 'text-muted-foreground bg-muted';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'available': 'Available',
      'busy': 'Busy',
      'break': 'On Break',
      'offline': 'Offline'
    };
    return labelMap?.[status] || 'Unknown';
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Agent Performance</h2>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e?.target?.value)}
              className="text-sm border border-border rounded-md px-3 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">

              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button className="p-2 hover:bg-muted rounded-md transition-colors duration-200">
              <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {agentPerformance?.map((agent) =>
          <div key={agent?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                  src={agent?.avatar}
                  alt={agent?.avatarAlt}
                  className="w-10 h-10 rounded-full object-cover" />

                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(agent?.status)?.split(' ')?.[1]}`}></div>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground">{agent?.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(agent?.status)}`}>
                      {getStatusLabel(agent?.status)}
                    </span>
                    <span>•</span>
                    <span>{agent?.department}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-foreground">{agent?.ticketsHandled}</div>
                  <div className="text-muted-foreground">Tickets</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{agent?.avgResponseTime}</div>
                  <div className="text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{agent?.resolutionRate}</div>
                  <div className="text-muted-foreground">Resolution</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-warning fill-current" />
                    <span className="font-medium text-foreground">{agent?.qualityScore}</span>
                  </div>
                  <div className="text-muted-foreground">Quality</div>
                </div>
                <button className="p-2 hover:bg-muted rounded-md transition-colors duration-200">
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

};

export default AgentPerformancePanel;