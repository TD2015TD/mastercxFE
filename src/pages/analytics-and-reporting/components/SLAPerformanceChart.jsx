import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../../components/AppIcon';

const SLA_TARGET_PCT = 95;

const SLAPerformanceChart = ({ summary, byPriority, loading }) => {
  const [viewType, setViewType] = useState('overview');

  if (loading) {
    return <div className="bg-card border border-border rounded-lg p-6 h-96 animate-pulse" />;
  }

  if (!summary || summary.total_tickets === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
        No SLA data for the selected period.
      </div>
    );
  }

  const pieData = [
    { name: 'Within SLA', value: summary.sla_met, color: '#10B981' },
    { name: 'Breached SLA', value: summary.sla_breached, color: '#DC2626' },
  ];

  const priorityData = Object.entries(byPriority || {}).map(([priority, stats]) => ({
    priority,
    total: stats.total,
    breached: stats.breached,
    met: stats.total - stats.breached,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{data?.name || data?.priority}</p>
          <p className="text-sm text-muted-foreground">{data?.value ?? data?.total} tickets</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">SLA Performance</h3>
          <p className="text-sm text-muted-foreground">Service level agreement compliance tracking</p>
        </div>

        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1 mt-4 sm:mt-0">
          <button
            onClick={() => setViewType('overview')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
              viewType === 'overview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewType('priority')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
              viewType === 'priority' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            By Priority
          </button>
        </div>
      </div>

      {viewType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.value} tickets</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    {summary.total_tickets > 0 ? Math.round((item.value / summary.total_tickets) * 1000) / 10 : 0}%
                  </p>
                </div>
              </div>
            ))}

            <div className={`mt-6 p-4 rounded-lg border ${
              summary.compliance_rate >= SLA_TARGET_PCT
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Icon
                  name={summary.compliance_rate >= SLA_TARGET_PCT ? 'CheckCircle' : 'AlertTriangle'}
                  size={20}
                  className={summary.compliance_rate >= SLA_TARGET_PCT ? 'text-green-600' : 'text-amber-600'}
                />
                <span className={`font-medium ${summary.compliance_rate >= SLA_TARGET_PCT ? 'text-green-800' : 'text-amber-800'}`}>
                  SLA Target: {SLA_TARGET_PCT}%
                </span>
              </div>
              <p className={`text-sm ${summary.compliance_rate >= SLA_TARGET_PCT ? 'text-green-700' : 'text-amber-700'}`}>
                Current performance is {summary.compliance_rate}%
                {summary.compliance_rate >= SLA_TARGET_PCT
                  ? ` — ${(summary.compliance_rate - SLA_TARGET_PCT).toFixed(1)}% above target`
                  : ` — ${(SLA_TARGET_PCT - summary.compliance_rate).toFixed(1)}% below target`}
              </p>
            </div>
          </div>
        </div>
      )}

      {viewType === 'priority' && (
        <div className="h-80">
          {priorityData.every((p) => p.total === 0) ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No priority data for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="priority" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="met" fill="#10B981" name="Within SLA" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="breached" fill="#DC2626" name="Breached" stackId="a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default SLAPerformanceChart;
