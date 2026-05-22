import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const LiveChatStatusChart = ({ data, loading }) => {
  // Transform the data to match the chart format
  const chartData = data ? [
    { name: 'Solved', value: data.solved, percentage: data.solved_percentage },
    { name: 'Unsolved', value: data.unsolved, percentage: data.unsolved_percentage },
  ] : [];

  const COLORS = ['#1F2937', '#EF4444']; // Dark gray for solved, Red for unsolved

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage === 0) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">LiveChat Ticket Handling Status</h3>
        <p className="text-sm text-gray-500 mt-1">Current resolution status</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      ) : !data || data.total === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No LiveChat tickets available</div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name, props) => [
                  `${value} tickets (${props.payload.percentage}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-800 rounded-sm mr-2"></div>
                <span className="text-sm text-gray-600">
                  Solved {data.solved_percentage}% ({data.solved})
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                <span className="text-sm text-gray-600">
                  Unsolved {data.unsolved_percentage}% ({data.unsolved})
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveChatStatusChart;
