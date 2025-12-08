import React from 'react';
import Icon from '../../../../components/AppIcon';

const SlaPerformanceMetrics = () => {
  const departmentPerformance = [
    { department: 'Customer Service', compliance: 96.5, breaches: 8, avgResponse: '2.4h', tickets: 1250 },
    { department: 'Technical Support', compliance: 92.3, breaches: 15, avgResponse: '3.1h', tickets: 890 },
    { department: 'Customs Declaration', compliance: 97.8, breaches: 5, avgResponse: '1.8h', tickets: 620 },
    { department: 'Billing & Payments', compliance: 94.2, breaches: 10, avgResponse: '2.7h', tickets: 740 }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Overall Compliance</p>
          <p className="text-3xl font-bold text-success">94.2%</p>
          <p className="text-xs text-success mt-2">+2.1% vs last month</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Breaches</p>
          <p className="text-3xl font-bold text-error">38</p>
          <p className="text-xs text-error mt-2">-5 vs last month</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
          <p className="text-3xl font-bold text-foreground">2.5h</p>
          <p className="text-xs text-muted-foreground mt-2">Within target</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Tickets Processed</p>
          <p className="text-3xl font-bold text-foreground">3,500</p>
          <p className="text-xs text-success mt-2">+15% this month</p>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="BarChart" size={20} className="mr-2 text-primary" />
            Department Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Compliance Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">SLA Breaches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Avg Response</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Tickets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departmentPerformance.map((dept, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{dept.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                        <div 
                          className={`h-full rounded-full ${dept.compliance >= 95 ? 'bg-success' : dept.compliance >= 90 ? 'bg-warning' : 'bg-error'}`}
                          style={{ width: `${dept.compliance}%` }}
                        />
                      </div>
                      <span className="font-semibold text-foreground">{dept.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-error font-semibold">{dept.breaches}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{dept.avgResponse}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{dept.tickets}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Performance */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance by Priority</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'].map((priority, index) => (
            <div key={index} className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">{priority}</p>
              <p className="text-2xl font-bold text-foreground">{[98.5, 95.2, 93.8, 91.5][index]}%</p>
              <p className="text-xs text-muted-foreground mt-1">{[2, 8, 12, 16][index]} breaches</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlaPerformanceMetrics;
