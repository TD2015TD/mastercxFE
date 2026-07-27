import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { exportToCsv } from '../../../utils/exportCsv';

const AgentPerformanceTable = ({ agents, loading, periodLabel }) => {
  const [sortField, setSortField] = useState('total_tickets');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleExport = () => {
    const rows = [
      ['Name', 'Agent Code', 'Total Tickets', 'Resolved', 'Avg Resolution Time (min)', 'SLA Compliance (%)', 'CSAT', 'Total Calls', 'Talk Time (min)'],
      ...(agents || []).map((a) => [
        a.name, a.agent_code, a.total_tickets, a.resolved,
        a.avg_resolution_time_minutes, a.sla_compliance_rate, a.csat,
        a.total_calls, a.talk_time_minutes,
      ]),
    ];
    exportToCsv(rows, `agent-performance-${periodLabel || 'report'}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...(agents || [])].sort((a, b) => {
    const aValue = a?.[sortField] ?? 0;
    const bValue = b?.[sortField] ?? 0;
    return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  const getPerformanceColor = (value, type) => {
    switch (type) {
      case 'sla':
        return value >= 95 ? 'text-green-600' : value >= 90 ? 'text-yellow-600' : 'text-red-600';
      case 'csat':
        return value >= 4.5 ? 'text-green-600' : value >= 4.0 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-foreground';
    }
  };

  const SortableHeader = ({ field, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <Icon name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
        )}
      </div>
    </th>
  );

  if (loading) {
    return <div className="bg-card border border-border rounded-lg h-96 animate-pulse" />;
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Agent Performance</h3>
            <p className="text-sm text-muted-foreground">Individual agent metrics for the selected period</p>
          </div>

          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" iconName="Download" iconPosition="left" size="sm" onClick={handleExport} disabled={!agents?.length}>
              Export
            </Button>
          </div>
        </div>
      </div>

      {!agents || agents.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">No agents found in this department.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent</th>
                <SortableHeader field="total_tickets">Assigned</SortableHeader>
                <SortableHeader field="resolved">Resolved</SortableHeader>
                <SortableHeader field="avg_resolution_time_minutes">Avg Time (min)</SortableHeader>
                <SortableHeader field="sla_compliance_rate">SLA %</SortableHeader>
                <SortableHeader field="csat">CSAT</SortableHeader>
                <SortableHeader field="total_calls">Total Calls</SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {sortedData.map((agent) => (
                <tr key={agent.agent_id} className="hover:bg-muted/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {agent.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.agent_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{agent.total_tickets}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    <div className="flex items-center space-x-2">
                      <span>{agent.resolved}</span>
                      {agent.total_tickets > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({Math.round((agent.resolved / agent.total_tickets) * 100)}%)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {agent.avg_resolution_time_minutes ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getPerformanceColor(agent.sla_compliance_rate, 'sla')}`}>
                      {agent.sla_compliance_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-yellow-500" />
                      <span className={`font-medium ${getPerformanceColor(agent.csat, 'csat')}`}>
                        {agent.csat ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {agent.total_calls || 0}
                    {agent.talk_time_minutes > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">({agent.talk_time_minutes} min)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-6 py-4 border-t border-border bg-muted/30 text-sm text-muted-foreground">
        Showing {sortedData.length} agent{sortedData.length === 1 ? '' : 's'}
      </div>
    </div>
  );
};

export default AgentPerformanceTable;
