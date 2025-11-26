import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SLAComplianceCenter = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const slaMetrics = {
    overall: {
      compliance: 94.2,
      target: 95.0,
      breaches: 8,
      warnings: 15
    },
    byPriority: [
      { priority: 'P1', compliance: 98.5, target: 99.0, count: 12 },
      { priority: 'P2', compliance: 96.2, target: 97.0, count: 34 },
      { priority: 'P3', compliance: 93.8, target: 95.0, count: 67 },
      { priority: 'P4', compliance: 91.5, target: 90.0, count: 89 },
      { priority: 'P5', compliance: 89.2, target: 85.0, count: 156 }
    ]
  };

  const recentBreaches = [
    {
      id: 1,
      ticketId: "TK-2024-1028",
      customer: "Syarikat ABC Sdn Bhd",
      priority: "P2",
      breachTime: "15 minutes ago",
      assignedAgent: "Ahmad Rahman",
      department: "Import/Export",
      status: "escalated"
    },
    {
      id: 2,
      ticketId: "TK-2024-1025",
      customer: "Individual - Tan Wei Liang",
      priority: "P1",
      breachTime: "32 minutes ago",
      assignedAgent: "Siti Nurhaliza",
      department: "Technical Support",
      status: "resolved"
    },
    {
      id: 3,
      ticketId: "TK-2024-1022",
      customer: "Malaysia Logistics Sdn Bhd",
      priority: "P3",
      breachTime: "1 hour ago",
      assignedAgent: "Raj Kumar",
      department: "Customs Declaration",
      status: "in_progress"
    }
  ];

  const upcomingWarnings = [
    {
      id: 1,
      ticketId: "TK-2024-1030",
      customer: "Global Trade Solutions",
      priority: "P2",
      timeRemaining: "12 minutes",
      assignedAgent: "Fatimah Abdullah",
      department: "General Inquiry"
    },
    {
      id: 2,
      ticketId: "TK-2024-1031",
      customer: "Individual - Lim Chong Wei",
      priority: "P1",
      timeRemaining: "28 minutes",
      assignedAgent: "Lim Wei Ming",
      department: "Technical Support"
    }
  ];

  const getPriorityColor = (priority) => {
    const colorMap = {
      'P1': 'text-error bg-error/10',
      'P2': 'text-warning bg-warning/10',
      'P3': 'text-accent bg-accent/10',
      'P4': 'text-primary bg-primary/10',
      'P5': 'text-muted-foreground bg-muted'
    };
    return colorMap?.[priority] || 'text-muted-foreground bg-muted';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'escalated': 'text-error bg-error/10',
      'resolved': 'text-success bg-success/10',
      'in_progress': 'text-warning bg-warning/10'
    };
    return colorMap?.[status] || 'text-muted-foreground bg-muted';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'escalated': 'Escalated',
      'resolved': 'Resolved',
      'in_progress': 'In Progress'
    };
    return labelMap?.[status] || 'Unknown';
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">SLA Compliance Center</h2>
          <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200">
            <Icon name="Settings" size={16} />
            <span className="text-sm">Configure SLA</span>
          </button>
        </div>

        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'overview' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('breaches')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'breaches' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recent Breaches
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'warnings' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Warnings
          </button>
        </div>
      </div>
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{slaMetrics?.overall?.compliance}%</div>
                <div className="text-sm text-muted-foreground">Overall Compliance</div>
                <div className="text-xs text-muted-foreground mt-1">Target: {slaMetrics?.overall?.target}%</div>
              </div>
              <div className="text-center p-4 bg-error/10 rounded-lg">
                <div className="text-2xl font-bold text-error">{slaMetrics?.overall?.breaches}</div>
                <div className="text-sm text-muted-foreground">Active Breaches</div>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">{slaMetrics?.overall?.warnings}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">358</div>
                <div className="text-sm text-muted-foreground">On Track</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">Compliance by Priority</h3>
              <div className="space-y-3">
                {slaMetrics?.byPriority?.map((item) => (
                  <div key={item?.priority} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item?.priority)}`}>
                        {item?.priority}
                      </span>
                      <span className="text-sm text-muted-foreground">{item?.count} tickets</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">{item?.compliance}%</div>
                        <div className="text-xs text-muted-foreground">Target: {item?.target}%</div>
                      </div>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item?.compliance >= item?.target ? 'bg-success' : 'bg-warning'
                          }`}
                          style={{ width: `${Math.min(item?.compliance, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breaches' && (
          <div className="space-y-4">
            {recentBreaches?.map((breach) => (
              <div key={breach?.id} className="p-4 bg-error/5 border border-error/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-foreground">{breach?.ticketId}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(breach?.priority)}`}>
                      {breach?.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(breach?.status)}`}>
                      {getStatusLabel(breach?.status)}
                    </span>
                  </div>
                  <span className="text-sm text-error">{breach?.breachTime}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer: </span>
                    <span className="text-foreground">{breach?.customer}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Agent: </span>
                    <span className="text-foreground">{breach?.assignedAgent}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department: </span>
                    <span className="text-foreground">{breach?.department}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'warnings' && (
          <div className="space-y-4">
            {upcomingWarnings?.map((warning) => (
              <div key={warning?.id} className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-foreground">{warning?.ticketId}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(warning?.priority)}`}>
                      {warning?.priority}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-warning">
                    <Icon name="Clock" size={16} />
                    <span className="text-sm font-medium">{warning?.timeRemaining} remaining</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer: </span>
                    <span className="text-foreground">{warning?.customer}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Agent: </span>
                    <span className="text-foreground">{warning?.assignedAgent}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department: </span>
                    <span className="text-foreground">{warning?.department}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SLAComplianceCenter;