import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';
import { exportToCsv } from '../../../utils/exportCsv';

const TicketVolumeChart = ({ data, loading, timeframe, onTimeframeChange }) => {
  const [chartType, setChartType] = useState('bar');

  const handleExport = () => {
    const rows = [
      ['Date', 'Call', 'Email', 'Chat', 'Total', 'Resolved', 'Pending'],
      ...(data || []).map((d) => [d.date, d.call, d.email, d.chat, d.total, d.resolved, d.pending]),
    ];
    exportToCsv(rows, 'ticket-volume-by-date');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: {entry?.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Ticket Volume Trends</h3>
          <p className="text-sm text-muted-foreground">Track ticket creation and resolution patterns</p>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => onTimeframeChange?.('last_7_days')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                timeframe === 'last_7_days' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => onTimeframeChange?.('last_30_days')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                timeframe === 'last_30_days' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              30 Days
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded transition-colors duration-200 ${
                chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="BarChart3" size={16} />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded transition-colors duration-200 ${
                chartType === 'line' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="TrendingUp" size={16} />
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={!data?.length}
            title="Export CSV"
            className="p-2 rounded transition-colors duration-200 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="Download" size={16} />
          </button>
        </div>
      </div>

      <div className="h-80">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-muted rounded-lg" />
        ) : !data || data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No tickets in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="call" fill="var(--color-primary)" name="Call" radius={[2, 2, 0, 0]} />
                <Bar dataKey="email" fill="var(--color-accent)" name="Email" radius={[2, 2, 0, 0]} />
                <Bar dataKey="chat" fill="var(--color-warning)" name="Chat" radius={[2, 2, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="call"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  name="Call"
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="email"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  name="Email"
                  dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="chat"
                  stroke="var(--color-warning)"
                  strokeWidth={3}
                  name="Chat"
                  dot={{ fill: 'var(--color-warning)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-sm text-muted-foreground">Call</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span className="text-sm text-muted-foreground">Email</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-warning rounded-full"></div>
          <span className="text-sm text-muted-foreground">Chat</span>
        </div>
      </div>
    </div>
  );
};

export default TicketVolumeChart;
