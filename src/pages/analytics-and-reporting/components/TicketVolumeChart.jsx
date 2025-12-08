import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';

const TicketVolumeChart = () => {
  const [chartType, setChartType] = useState('bar');
  const [timeframe, setTimeframe] = useState('7days');

  const chartData = [
    { name: 'Mon', tickets: 245, resolved: 198, pending: 47 },
    { name: 'Tue', tickets: 312, resolved: 267, pending: 45 },
    { name: 'Wed', tickets: 189, resolved: 156, pending: 33 },
    { name: 'Thu', tickets: 278, resolved: 234, pending: 44 },
    { name: 'Fri', tickets: 356, resolved: 298, pending: 58 },
    { name: 'Sat', tickets: 167, resolved: 145, pending: 22 },
    { name: 'Sun', tickets: 134, resolved: 112, pending: 22 }
  ];

  const monthlyData = [
    { name: 'Jan', tickets: 1847, resolved: 1623, pending: 224 },
    { name: 'Feb', tickets: 2156, resolved: 1934, pending: 222 },
    { name: 'Mar', tickets: 1923, resolved: 1745, pending: 178 },
    { name: 'Apr', tickets: 2234, resolved: 2012, pending: 222 },
    { name: 'May', tickets: 2567, resolved: 2298, pending: 269 },
    { name: 'Jun', tickets: 2134, resolved: 1923, pending: 211 }
  ];

  const currentData = timeframe === '7days' ? chartData : monthlyData;

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
              onClick={() => setTimeframe('7days')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                timeframe === '7days' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframe('6months')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                timeframe === '6months' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              6 Months
            </button>
          </div>
          
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded transition-colors duration-200 ${
                chartType === 'bar' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="BarChart3" size={16} />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded transition-colors duration-200 ${
                chartType === 'line' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="TrendingUp" size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tickets" fill="var(--color-primary)" name="Total Tickets" radius={[2, 2, 0, 0]} />
              <Bar dataKey="resolved" fill="var(--color-accent)" name="Resolved" radius={[2, 2, 0, 0]} />
              <Bar dataKey="pending" fill="var(--color-warning)" name="Pending" radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="tickets" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                name="Total Tickets"
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke="var(--color-accent)" 
                strokeWidth={3}
                name="Resolved"
                dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-sm text-muted-foreground">Total Tickets</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span className="text-sm text-muted-foreground">Resolved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-warning rounded-full"></div>
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default TicketVolumeChart;