import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const StatusWorkflow = ({ ticket, onStatusUpdate, onSLAPause }) => {
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status);
  const [wrapUpCode, setWrapUpCode] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [showWrapUp, setShowWrapUp] = useState(false);

  const statusFlow = [
    { value: 'Open', label: 'Open', color: 'bg-blue-500', next: ['In Progress'] },
    { value: 'In Progress', label: 'In Progress', color: 'bg-yellow-500', next: ['On Hold', 'Resolved'] },
    { value: 'On Hold', label: 'On Hold', color: 'bg-orange-500', next: ['In Progress'] },
    { value: 'Resolved', label: 'Resolved', color: 'bg-green-500', next: ['Closed', 'In Progress'] },
    { value: 'Closed', label: 'Closed', color: 'bg-gray-500', next: [] }
  ];

  const wrapUpCodes = [
    { value: 'RESOLVED_FIRST_CONTACT', label: 'Resolved - First Contact' },
    { value: 'RESOLVED_FOLLOW_UP', label: 'Resolved - Follow Up Required' },
    { value: 'RESOLVED_ESCALATED', label: 'Resolved - Escalated to Supervisor' },
    { value: 'RESOLVED_TRANSFERRED', label: 'Resolved - Transferred to Department' },
    { value: 'CLOSED_DUPLICATE', label: 'Closed - Duplicate Ticket' },
    { value: 'CLOSED_SPAM', label: 'Closed - Spam/Invalid' },
    { value: 'CLOSED_CUSTOMER_REQUEST', label: 'Closed - Customer Request' }
  ];

  const getCurrentStatus = () => {
    return statusFlow?.find(status => status?.value === ticket?.status);
  };

  const getAvailableStatuses = () => {
    const current = getCurrentStatus();
    return current ? current?.next : [];
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    
    if (newStatus === 'Resolved' || newStatus === 'Closed') {
      setShowWrapUp(true);
    } else {
      setShowWrapUp(false);
      setWrapUpCode('');
      setResolutionSummary('');
    }
  };

  const handleUpdate = () => {
    const updateData = {
      status: selectedStatus,
      wrapUpCode: showWrapUp ? wrapUpCode : null,
      resolutionSummary: showWrapUp ? resolutionSummary : null,
      updatedAt: new Date(),
      updatedBy: 'Ahmad Rahman'
    };
    
    onStatusUpdate(updateData);
    setShowWrapUp(false);
  };

  const handleSLAPause = () => {
    onSLAPause(!ticket?.sla?.isPaused);
  };

  const canUpdate = () => {
    if (selectedStatus === ticket?.status) return false;
    if (showWrapUp && (!wrapUpCode || !resolutionSummary?.trim())) return false;
    return true;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Status Workflow</h3>
      {/* Current Status Flow */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Current Progress</h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {statusFlow?.map((status, index) => {
            const isCurrent = status?.value === ticket?.status;
            const isPast = statusFlow?.findIndex(s => s?.value === ticket?.status) > index;
            const isActive = isCurrent || isPast;
            
            return (
              <React.Fragment key={status?.value}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary-foreground' : status?.color}`}></div>
                  <span className="text-sm font-medium">{status?.label}</span>
                  {isCurrent && <Icon name="Clock" size={14} />}
                </div>
                {index < statusFlow?.length - 1 && (
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {/* Status Update */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Update Status</label>
          <Select
            options={getAvailableStatuses()?.map(status => ({
              value: status,
              label: status
            }))}
            value={selectedStatus}
            onChange={handleStatusChange}
            placeholder="Select new status..."
          />
        </div>

        {/* SLA Controls */}
        {ticket?.status === 'In Progress' && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">SLA Timer</p>
              <p className="text-xs text-muted-foreground">
                {ticket?.sla?.isPaused ? 'Currently paused' : 'Currently running'}
              </p>
            </div>
            <Button
              variant={ticket?.sla?.isPaused ? "default" : "outline"}
              size="sm"
              iconName={ticket?.sla?.isPaused ? "Play" : "Pause"}
              iconPosition="left"
              onClick={handleSLAPause}
            >
              {ticket?.sla?.isPaused ? 'Resume' : 'Pause'} SLA
            </Button>
          </div>
        )}

        {/* Wrap-up Section */}
        {showWrapUp && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground">Resolution Details</h4>
            
            <Select
              label="Wrap-up Code"
              options={wrapUpCodes}
              value={wrapUpCode}
              onChange={setWrapUpCode}
              required
            />
            
            <Input
              label="Resolution Summary"
              type="text"
              placeholder="Provide a brief summary of the resolution..."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e?.target?.value)}
              required
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="default"
            iconName="Check"
            iconPosition="left"
            onClick={handleUpdate}
            disabled={!canUpdate()}
          >
            Update Status
          </Button>
          
          <Button
            variant="outline"
            iconName="ArrowRight"
            iconPosition="left"
            onClick={() => window.location.href = '/customer-360-profile'}
          >
            View Customer
          </Button>
          
          <Button
            variant="outline"
            iconName="Copy"
            iconPosition="left"
            onClick={() => {
              navigator.clipboard?.writeText(ticket?.id);
            }}
          >
            Copy Ticket ID
          </Button>
        </div>
      </div>
      {/* Recent Updates */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Recent Status Updates</h4>
        <div className="space-y-2">
          {ticket?.statusHistory?.slice(0, 3)?.map((update, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
              <span className="text-muted-foreground">
                {update?.from} → {update?.to}
              </span>
              <span className="text-muted-foreground">
                by {update?.updatedBy}
              </span>
              <span className="text-muted-foreground ml-auto">
                {new Date(update.timestamp)?.toLocaleDateString('en-GB')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusWorkflow;