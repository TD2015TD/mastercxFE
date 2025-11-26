import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkloadManagement = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const workloadData = [
  {
    id: 1,
    name: "Ahmad Rahman",
    avatar: "https://images.unsplash.com/photo-1588178457501-31b7688a41a0",
    avatarAlt: "Professional headshot of Malaysian man with short black hair in white shirt",
    currentLoad: 8,
    maxCapacity: 12,
    department: "General Inquiry",
    status: "available",
    avgHandleTime: "12 min",
    efficiency: 92
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    avatar: "https://images.unsplash.com/photo-1717842800198-2328ae5b2d5c",
    avatarAlt: "Professional headshot of Malaysian woman with hijab in blue blazer",
    currentLoad: 11,
    maxCapacity: 10,
    department: "Technical Support",
    status: "overloaded",
    avgHandleTime: "18 min",
    efficiency: 88
  },
  {
    id: 3,
    name: "Raj Kumar",
    avatar: "https://images.unsplash.com/photo-1585066047759-3438c34cf676",
    avatarAlt: "Professional headshot of Indian man with beard in dark suit",
    currentLoad: 6,
    maxCapacity: 12,
    department: "Customs Declaration",
    status: "available",
    avgHandleTime: "10 min",
    efficiency: 95
  },
  {
    id: 4,
    name: "Lim Wei Ming",
    avatar: "https://images.unsplash.com/photo-1727702079139-c5e78976dab5",
    avatarAlt: "Professional headshot of Chinese man with glasses in navy shirt",
    currentLoad: 9,
    maxCapacity: 12,
    department: "Import/Export",
    status: "busy",
    avgHandleTime: "15 min",
    efficiency: 90
  },
  {
    id: 5,
    name: "Fatimah Abdullah",
    avatar: "https://images.unsplash.com/photo-1570771888011-1bef53d75e0b",
    avatarAlt: "Professional headshot of Malaysian woman with hijab in green blouse",
    currentLoad: 4,
    maxCapacity: 12,
    department: "General Inquiry",
    status: "available",
    avgHandleTime: "11 min",
    efficiency: 94
  }];


  const pendingAssignments = [
  {
    id: 1,
    ticketId: "TK-2024-1032",
    priority: "P2",
    category: "Technical Support",
    customer: "Malaysia Tech Solutions",
    estimatedTime: "15 min"
  },
  {
    id: 2,
    ticketId: "TK-2024-1033",
    priority: "P1",
    category: "Customs Declaration",
    customer: "Global Shipping Ltd",
    estimatedTime: "20 min"
  },
  {
    id: 3,
    ticketId: "TK-2024-1034",
    priority: "P3",
    category: "General Inquiry",
    customer: "Individual - Ahmad Zaki",
    estimatedTime: "10 min"
  }];


  const getLoadPercentage = (current, max) => {
    return Math.round(current / max * 100);
  };

  const getLoadColor = (current, max) => {
    const percentage = getLoadPercentage(current, max);
    if (percentage >= 100) return 'bg-error';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'available': 'text-success bg-success/10',
      'busy': 'text-warning bg-warning/10',
      'overloaded': 'text-error bg-error/10',
      'break': 'text-muted-foreground bg-muted'
    };
    return colorMap?.[status] || 'text-muted-foreground bg-muted';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      'P1': 'text-error bg-error/10',
      'P2': 'text-warning bg-warning/10',
      'P3': 'text-accent bg-accent/10'
    };
    return colorMap?.[priority] || 'text-muted-foreground bg-muted';
  };

  const handleReassignTicket = (ticketId, fromAgent, toAgent) => {
    console.log(`Reassigning ${ticketId} from ${fromAgent} to ${toAgent}`);
  };

  const handleAutoBalance = () => {
    console.log('Auto-balancing workload...');
  };

  return (
    <div className="space-y-6">
      {/* Workload Overview */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Workload Management</h2>
            <Button
              variant="outline"
              iconName="Shuffle"
              iconPosition="left"
              onClick={handleAutoBalance}>

              Auto Balance
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {workloadData?.map((agent) =>
            <div key={agent?.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                    src={agent?.avatar}
                    alt={agent?.avatarAlt}
                    className="w-10 h-10 rounded-full object-cover" />

                    <div>
                      <h3 className="font-medium text-foreground">{agent?.name}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent?.status)}`}>
                          {agent?.status?.charAt(0)?.toUpperCase() + agent?.status?.slice(1)}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{agent?.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground">
                        {agent?.currentLoad}/{agent?.maxCapacity}
                      </div>
                      <div className="text-xs text-muted-foreground">Tickets</div>
                    </div>

                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Load</span>
                        <span>{getLoadPercentage(agent?.currentLoad, agent?.maxCapacity)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                        className={`h-2 rounded-full ${getLoadColor(agent?.currentLoad, agent?.maxCapacity)}`}
                        style={{ width: `${Math.min(getLoadPercentage(agent?.currentLoad, agent?.maxCapacity), 100)}%` }}>
                      </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground">{agent?.avgHandleTime}</div>
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground">{agent?.efficiency}%</div>
                      <div className="text-xs text-muted-foreground">Efficiency</div>
                    </div>

                    <button
                    onClick={() => setSelectedAgent(selectedAgent === agent?.id ? null : agent?.id)}
                    className="p-2 hover:bg-muted rounded-md transition-colors duration-200">

                      <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {selectedAgent === agent?.id &&
              <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Reassign Tickets
                      </Button>
                      <Button variant="outline" size="sm">
                        Adjust Capacity
                      </Button>
                    </div>
                  </div>
              }
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Pending Assignments */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Pending Assignments</h3>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {pendingAssignments?.map((ticket) =>
            <div key={ticket?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-foreground">{ticket?.ticketId}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                    {ticket?.priority}
                  </span>
                  <span className="text-sm text-muted-foreground">{ticket?.category}</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="text-foreground">{ticket?.customer}</div>
                    <div className="text-muted-foreground">Est. {ticket?.estimatedTime}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Assign
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

};

export default WorkloadManagement;