import React from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const QuickActions = ({ onNewTicket, onTakeBreak, onViewReports, userStatus }) => {
  const quickActionItems = [
    {
      title: 'New Ticket',
      description: 'Create a new customer ticket',
      icon: 'Plus',
      color: 'bg-primary text-primary-foreground',
      action: onNewTicket,
      shortcut: 'Ctrl+N'
    },
    {
      title: 'Take Break',
      description: 'Set status to away',
      icon: 'Coffee',
      color: 'bg-warning text-warning-foreground',
      action: onTakeBreak,
      shortcut: 'Ctrl+B'
    },
    {
      title: 'View Reports',
      description: 'Access performance reports',
      icon: 'BarChart3',
      color: 'bg-accent text-accent-foreground',
      action: onViewReports,
      shortcut: 'Ctrl+R'
    }
  ];

  const statusOptions = [
    { value: 'available', label: 'Available', color: 'text-success', icon: 'CheckCircle' },
    { value: 'busy', label: 'Busy', color: 'text-warning', icon: 'Clock' },
    { value: 'away', label: 'Away', color: 'text-error', icon: 'Moon' },
    { value: 'do_not_disturb', label: 'Do Not Disturb', color: 'text-muted-foreground', icon: 'MinusCircle' }
  ];

  const currentStatus = statusOptions?.find(status => status?.value === userStatus) || statusOptions?.[0];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="flex items-center space-x-2">
          <Icon name={currentStatus?.icon} size={16} className={currentStatus?.color} />
          <span className={`text-sm font-medium ${currentStatus?.color}`}>
            {currentStatus?.label}
          </span>
        </div>
      </div>
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {quickActionItems?.map((item, index) => (
          <button
            key={index}
            onClick={item?.action}
            className={`${item?.color} p-4 rounded-lg hover:opacity-90 transition-opacity duration-200 text-left group`}
          >
            <div className="flex items-center space-x-3">
              <Icon name={item?.icon} size={20} />
              <div className="flex-1">
                <h3 className="font-medium">{item?.title}</h3>
                <p className="text-sm opacity-90">{item?.description}</p>
              </div>
              <div className="text-xs opacity-75 bg-black/10 px-2 py-1 rounded">
                {item?.shortcut}
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Status Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Change Status</h3>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions?.map((status) => (
            <button
              key={status?.value}
              className={`p-3 rounded-lg border transition-colors duration-200 text-left ${
                userStatus === status?.value
                  ? 'border-primary bg-primary/10' :'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name={status?.icon} size={16} className={status?.color} />
                <span className="text-sm font-medium text-foreground">{status?.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Additional Tools */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Tools</h3>
        <div className="space-y-2">
          <Button variant="outline" fullWidth iconName="Calculator">
            Duty Calculator
          </Button>
          <Button variant="outline" fullWidth iconName="Search">
            Customer Lookup
          </Button>
          <Button variant="outline" fullWidth iconName="FileText">
            Form Templates
          </Button>
        </div>
      </div>
      {/* Keyboard Shortcuts */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Keyboard Shortcuts</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>New Ticket</span>
            <kbd className="px-2 py-1 bg-muted rounded">Ctrl+N</kbd>
          </div>
          <div className="flex justify-between">
            <span>Search KB</span>
            <kbd className="px-2 py-1 bg-muted rounded">Ctrl+K</kbd>
          </div>
          <div className="flex justify-between">
            <span>Take Break</span>
            <kbd className="px-2 py-1 bg-muted rounded">Ctrl+B</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;