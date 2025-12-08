import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../../components/AppIcon';

const SLAPerformanceChart = () => {
  const [viewType, setViewType] = useState('pie');

  const slaData = [
    { name: 'Within SLA', value: 2684, percentage: 94.2, color: '#10B981' },
    { name: 'Breached SLA', value: 163, percentage: 5.8, color: '#DC2626' }
  ];

  const slaTimelineData = [
    { day: 'Mon', compliance: 96.2, breaches: 3.8 },
    { day: 'Tue', compliance: 94.8, breaches: 5.2 },
    { day: 'Wed', compliance: 97.1, breaches: 2.9 },
    { day: 'Thu', compliance: 93.5, breaches: 6.5 },
    { day: 'Fri', compliance: 91.8, breaches: 8.2 },
    { day: 'Sat', compliance: 95.4, breaches: 4.6 },
    { day: 'Sun', compliance: 96.7, breaches: 3.3 }
  ];

  const departmentSLA = [
    { department: 'Customs Declaration', compliance: 96.8, total: 1247, breached: 40 },
    { department: 'Tax & Duties', compliance: 93.2, total: 856, breached: 58 },
    { department: 'Import/Export', compliance: 91.5, total: 623, breached: 53 },
    { department: 'General Inquiry', compliance: 97.1, total: 421, breached: 12 }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">
            {data?.value} tickets ({data?.percentage}%)
          </p>
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
            onClick={() => setViewType('pie')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
              viewType === 'pie' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewType('timeline')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
              viewType === 'timeline' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewType('department')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
              viewType === 'department' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Departments
          </button>
        </div>
      </div>
      {viewType === 'pie' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {slaData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            {slaData?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item?.color }}
                  ></div>
                  <div>
                    <p className="font-medium text-foreground">{item?.name}</p>
                    <p className="text-sm text-muted-foreground">{item?.value} tickets</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{item?.percentage}%</p>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <span className="font-medium text-green-800">SLA Target: 95%</span>
              </div>
              <p className="text-sm text-green-700">
                Current performance is below target by 0.8%
              </p>
            </div>
          </div>
        </div>
      )}
      {viewType === 'timeline' && (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={slaTimelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="day" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                domain={[85, 100]}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload?.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-popover-foreground mb-2">{label}</p>
                        <p className="text-sm text-green-600">
                          Compliance: {payload?.[0]?.value}%
                        </p>
                        <p className="text-sm text-red-600">
                          Breaches: {payload?.[1]?.value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="compliance" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="breaches" 
                stackId="1"
                stroke="#DC2626" 
                fill="#DC2626"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {viewType === 'department' && (
        <div className="space-y-4">
          {departmentSLA?.map((dept, index) => (
            <div key={index} className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">{dept?.department}</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {dept?.total} tickets
                  </span>
                  <span className={`text-sm font-medium ${
                    dept?.compliance >= 95 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dept?.compliance}%
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    dept?.compliance >= 95 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${dept?.compliance}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{dept?.total - dept?.breached} within SLA</span>
                <span>{dept?.breached} breached</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SLAPerformanceChart;