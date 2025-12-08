import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AuditTrailCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateRange, setDateRange] = useState('today');

  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-10-28 10:15:23",
      user: "Ahmad Rahman",
      userRole: "Agent",
      action: "Ticket Created",
      category: "Ticket Management",
      details: "Created ticket TK-2024-1028 for customer complaint",
      ipAddress: "192.168.1.45",
      severity: "Info",
      module: "Ticketing System"
    },
    {
      id: 2,
      timestamp: "2024-10-28 10:12:15",
      user: "Lim Wei Ming",
      userRole: "Admin",
      action: "User Account Modified",
      category: "User Management",
      details: "Updated role permissions for user siti.nurhaliza@jkdm.gov.my",
      ipAddress: "192.168.1.10",
      severity: "Warning",
      module: "Administration"
    },
    {
      id: 3,
      timestamp: "2024-10-28 10:08:42",
      user: "System",
      userRole: "System",
      action: "SLA Breach Alert",
      category: "System Alert",
      details: "SLA breach detected for ticket TK-2024-1025 - Response time exceeded",
      ipAddress: "127.0.0.1",
      severity: "Critical",
      module: "SLA Monitor"
    },
    {
      id: 4,
      timestamp: "2024-10-28 09:55:18",
      user: "Siti Nurhaliza",
      userRole: "Supervisor",
      action: "Report Generated",
      category: "Reporting",
      details: "Generated department performance report for October 2024",
      ipAddress: "192.168.1.25",
      severity: "Info",
      module: "Analytics"
    },
    {
      id: 5,
      timestamp: "2024-10-28 09:45:33",
      user: "Raj Kumar",
      userRole: "Agent",
      action: "Login Failed",
      category: "Authentication",
      details: "Failed login attempt - Invalid credentials",
      ipAddress: "192.168.1.67",
      severity: "Warning",
      module: "Authentication"
    },
    {
      id: 6,
      timestamp: "2024-10-28 09:30:12",
      user: "System",
      userRole: "System",
      action: "Backup Completed",
      category: "System Maintenance",
      details: "Daily database backup completed successfully - 2.3GB",
      ipAddress: "127.0.0.1",
      severity: "Info",
      module: "Backup System"
    }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'ticket-management', label: 'Ticket Management' },
    { value: 'user-management', label: 'User Management' },
    { value: 'system-alert', label: 'System Alert' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'authentication', label: 'Authentication' },
    { value: 'system-maintenance', label: 'System Maintenance' }
  ];

  const users = [
    { value: '', label: 'All Users' },
    { value: 'ahmad-rahman', label: 'Ahmad Rahman' },
    { value: 'siti-nurhaliza', label: 'Siti Nurhaliza' },
    { value: 'raj-kumar', label: 'Raj Kumar' },
    { value: 'lim-wei-ming', label: 'Lim Wei Ming' },
    { value: 'system', label: 'System' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      'Info': 'bg-blue-100 text-blue-800',
      'Warning': 'bg-warning/10 text-warning',
      'Critical': 'bg-error/10 text-error'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityConfig?.[severity]}`}>
        {severity}
      </span>
    );
  };

  const getSeverityIcon = (severity) => {
    const iconMap = {
      'Info': 'Info',
      'Warning': 'AlertTriangle',
      'Critical': 'AlertCircle'
    };
    return iconMap?.[severity] || 'Info';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExportLogs = () => {
    // Mock export functionality
    console.log('Exporting audit logs...');
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Audit Trail Center</h3>
            <p className="text-sm text-muted-foreground">Comprehensive activity logging and compliance monitoring</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              onClick={handleExportLogs}
            >
              Export Logs
            </Button>
            <Button variant="default" iconName="RefreshCw" iconPosition="left">
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="search"
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
          <Select
            placeholder="Filter by category"
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
          <Select
            placeholder="Filter by user"
            options={users}
            value={selectedUser}
            onChange={setSelectedUser}
          />
          <Select
            placeholder="Date range"
            options={dateRanges}
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="Info" size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-blue-900">1,247</p>
                <p className="text-sm text-blue-600">Info Events</p>
              </div>
            </div>
          </div>

          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-warning">23</p>
                <p className="text-sm text-warning">Warnings</p>
              </div>
            </div>
          </div>

          <div className="bg-error/5 border border-error/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <Icon name="AlertCircle" size={20} className="text-error" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-error">5</p>
                <p className="text-sm text-error">Critical</p>
              </div>
            </div>
          </div>

          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-success">99.8%</p>
                <p className="text-sm text-success">Compliance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Details</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Severity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs?.map((log) => (
                <tr key={log?.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm text-foreground font-mono">
                    {formatTimestamp(log?.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{log?.user}</div>
                      <div className="text-xs text-muted-foreground">{log?.userRole}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Icon name={getSeverityIcon(log?.severity)} size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{log?.action}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">{log?.category}</span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-sm text-foreground truncate" title={log?.details}>
                      {log?.details}
                    </p>
                    <p className="text-xs text-muted-foreground">{log?.module}</p>
                  </td>
                  <td className="py-3 px-4">
                    {getSeverityBadge(log?.severity)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground font-mono">
                    {log?.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing 1-6 of 1,275 audit entries
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="ChevronLeft">
              Previous
            </Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="default" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm" iconName="ChevronRight">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailCenter;