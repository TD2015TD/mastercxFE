import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DepartmentPerformanceChart = ({ data, loading }) => {
  // Transform the data to match the chart format
  const chartData = data || [];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Department Performance Overview</h3>
            <p className="text-sm text-gray-500 mt-1">Monthly performance comparison</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
              <span className="text-gray-600">Resolved</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No data available</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="department" 
              tick={{ fontSize: 12 }}
              stroke="#999"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#999"
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="resolved" fill="#EF4444" name="Resolved" radius={[4, 4, 0, 0]} />
            <Bar dataKey="in_progress" fill="#3B82F6" name="In Progress" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {!loading && chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <select className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="may-2025">May, 2025</option>
            <option value="apr-2025">April, 2025</option>
            <option value="mar-2025">March, 2025</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default DepartmentPerformanceChart;
