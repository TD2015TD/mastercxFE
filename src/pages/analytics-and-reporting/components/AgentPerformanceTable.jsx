import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AgentPerformanceTable = () => {
  const [sortField, setSortField] = useState('ticketsResolved');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPeriod, setSelectedPeriod] = useState('this_week');

  const agentData = [
  {
    id: 1,
    name: "Ahmad Rahman",
    avatar: "https://images.unsplash.com/photo-1588178457501-31b7688a41a0",
    avatarAlt: "Professional headshot of Malaysian man with short black hair in white shirt",
    department: "Customs Declaration",
    ticketsAssigned: 45,
    ticketsResolved: 42,
    avgResolutionTime: "3.2h",
    slaCompliance: 95.6,
    customerSatisfaction: 4.7,
    escalationRate: 6.7,
    status: "online"
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    avatar: "https://images.unsplash.com/photo-1700560970703-82fd3150d5ac",
    avatarAlt: "Professional headshot of Malaysian woman with long black hair in blue blazer",
    department: "Tax & Duties",
    ticketsAssigned: 38,
    ticketsResolved: 36,
    avgResolutionTime: "2.8h",
    slaCompliance: 97.4,
    customerSatisfaction: 4.8,
    escalationRate: 5.3,
    status: "online"
  },
  {
    id: 3,
    name: "Muhammad Ali",
    avatar: "https://images.unsplash.com/photo-1585066047759-3438c34cf676",
    avatarAlt: "Professional headshot of Malaysian man with beard in dark suit",
    department: "Import/Export",
    ticketsAssigned: 52,
    ticketsResolved: 47,
    avgResolutionTime: "4.1h",
    slaCompliance: 90.4,
    customerSatisfaction: 4.5,
    escalationRate: 9.6,
    status: "away"
  },
  {
    id: 4,
    name: "Fatimah Zahra",
    avatar: "https://images.unsplash.com/photo-1724396528957-837b50041305",
    avatarAlt: "Professional headshot of Malaysian woman with hijab in white blouse",
    department: "General Inquiry",
    ticketsAssigned: 41,
    ticketsResolved: 39,
    avgResolutionTime: "3.5h",
    slaCompliance: 92.7,
    customerSatisfaction: 4.6,
    escalationRate: 7.3,
    status: "online"
  },
  {
    id: 5,
    name: "Hassan Ibrahim",
    avatar: "https://images.unsplash.com/photo-1719154718540-8ef3d94e7712",
    avatarAlt: "Professional headshot of Malaysian man with mustache in gray shirt",
    department: "Technical Support",
    ticketsAssigned: 29,
    ticketsResolved: 28,
    avgResolutionTime: "5.2h",
    slaCompliance: 96.6,
    customerSatisfaction: 4.9,
    escalationRate: 3.4,
    status: "offline"
  }];


  const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' }];


  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...agentData]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (typeof aValue === 'string' && aValue?.includes('h')) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':return 'bg-green-500';
      case 'away':return 'bg-yellow-500';
      case 'offline':return 'bg-gray-400';
      default:return 'bg-gray-400';
    }
  };

  const getPerformanceColor = (value, type) => {
    switch (type) {
      case 'sla':
        return value >= 95 ? 'text-green-600' : value >= 90 ? 'text-yellow-600' : 'text-red-600';
      case 'csat':
        return value >= 4.5 ? 'text-green-600' : value >= 4.0 ? 'text-yellow-600' : 'text-red-600';
      case 'escalation':
        return value <= 5 ? 'text-green-600' : value <= 10 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-foreground';
    }
  };

  const SortableHeader = ({ field, children }) =>
  <th
    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors duration-200"
    onClick={() => handleSort(field)}>

      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field &&
      <Icon
        name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
        size={14} />

      }
      </div>
    </th>;


  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Agent Performance</h3>
            <p className="text-sm text-muted-foreground">Individual agent metrics and productivity analysis</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e?.target?.value)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">

              {periodOptions?.map((option) =>
              <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              )}
            </select>
            
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              size="sm">

              Export
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Agent
              </th>
              <SortableHeader field="ticketsAssigned">Assigned</SortableHeader>
              <SortableHeader field="ticketsResolved">Resolved</SortableHeader>
              <SortableHeader field="avgResolutionTime">Avg Time</SortableHeader>
              <SortableHeader field="slaCompliance">SLA %</SortableHeader>
              <SortableHeader field="customerSatisfaction">CSAT</SortableHeader>
              <SortableHeader field="escalationRate">Escalation %</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedData?.map((agent) =>
            <tr key={agent?.id} className="hover:bg-muted/50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                      src={agent?.avatar}
                      alt={agent?.avatarAlt}
                      className="w-10 h-10 rounded-full object-cover" />

                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(agent?.status)} rounded-full border-2 border-card`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{agent?.name}</p>
                      <p className="text-xs text-muted-foreground">{agent?.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {agent?.ticketsAssigned}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  <div className="flex items-center space-x-2">
                    <span>{agent?.ticketsResolved}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(agent?.ticketsResolved / agent?.ticketsAssigned * 100)}%)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {agent?.avgResolutionTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${getPerformanceColor(agent?.slaCompliance, 'sla')}`}>
                    {agent?.slaCompliance}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-yellow-500" />
                    <span className={`font-medium ${getPerformanceColor(agent?.customerSatisfaction, 'csat')}`}>
                      {agent?.customerSatisfaction}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${getPerformanceColor(agent?.escalationRate, 'escalation')}`}>
                    {agent?.escalationRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <button className="text-primary hover:text-primary/80 transition-colors duration-200">
                      <Icon name="Eye" size={16} />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                      <Icon name="MessageSquare" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {sortedData?.length} agents</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Away</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default AgentPerformanceTable;