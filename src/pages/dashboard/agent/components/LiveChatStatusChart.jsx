import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Colour per channel
const CHANNEL_COLORS = {
  phone:        '#3B82F6',
  email:        '#10B981',
  chat:         '#F59E0B',
  web:          '#8B5CF6',
  'walk-in':    '#EF4444',
  social_media: '#EC4899',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-4 py-2 text-sm">
        <p className="font-semibold text-gray-800">{d.label}</p>
        <p className="text-gray-600">{d.count} ticket{d.count !== 1 ? 's' : ''} hari ini</p>
      </div>
    );
  }
  return null;
};

const LiveChatStatusChart = ({ data, loading }) => {
  const chartData = data?.channels ?? [];
  const total     = data?.total ?? 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tiket Hari Ini Mengikut Channel</h3>
          <p className="text-sm text-gray-500 mt-1">Jumlah tiket masuk hari ini</p>
        </div>
        {!loading && total > 0 && (
          <span className="text-2xl font-bold text-gray-800">{total}</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      ) : total === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Tiada tiket hari ini</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              stroke="#999"
              interval={0}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#999"
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.channel}
                  fill={CHANNEL_COLORS[entry.channel] ?? '#6B7280'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      {!loading && total > 0 && (
        <div className="mt-3 flex flex-wrap gap-3 justify-center">
          {chartData.map((entry) => (
            <div key={entry.channel} className="flex items-center gap-1 text-xs text-gray-600">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: CHANNEL_COLORS[entry.channel] ?? '#6B7280' }}
              />
              {entry.label}: <span className="font-semibold">{entry.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveChatStatusChart;
