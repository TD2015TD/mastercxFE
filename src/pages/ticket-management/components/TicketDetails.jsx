import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TicketDetails = ({ ticket, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    priority: ticket?.priority,
    department: ticket?.department,
    assignedTo: ticket?.assignedTo,
    category: ticket?.category
  });

  const priorityOptions = [
    { value: 'P1', label: 'P1 - Critical' },
    { value: 'P2', label: 'P2 - High' },
    { value: 'P3', label: 'P3 - Medium' },
    { value: 'P4', label: 'P4 - Low' },
    { value: 'P5', label: 'P5 - Very Low' }
  ];

  const departmentOptions = [
    { value: 'Customs Operations', label: 'Customs Operations' },
    { value: 'Trade Facilitation', label: 'Trade Facilitation' },
    { value: 'Enforcement', label: 'Enforcement' },
    { value: 'Revenue Collection', label: 'Revenue Collection' },
    { value: 'IT Support', label: 'IT Support' }
  ];

  const categoryOptions = [
    { value: 'Import Declaration', label: 'Import Declaration' },
    { value: 'Export Declaration', label: 'Export Declaration' },
    { value: 'Duty Payment', label: 'Duty Payment' },
    { value: 'Permit Application', label: 'Permit Application' },
    { value: 'System Issue', label: 'System Issue' },
    { value: 'General Inquiry', label: 'General Inquiry' }
  ];

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      priority: ticket?.priority,
      department: ticket?.department,
      assignedTo: ticket?.assignedTo,
      category: ticket?.category
    });
    setIsEditing(false);
  };

  const getImpactUrgencyMatrix = () => {
    const impact = ticket?.impact || 'Medium';
    const urgency = ticket?.urgency || 'Medium';
    
    const matrix = {
      'High-High': 'P1',
      'High-Medium': 'P2',
      'High-Low': 'P3',
      'Medium-High': 'P2',
      'Medium-Medium': 'P3',
      'Medium-Low': 'P4',
      'Low-High': 'P3',
      'Low-Medium': 'P4',
      'Low-Low': 'P5'
    };
    
    return matrix?.[`${impact}-${urgency}`] || 'P3';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Ticket Details</h3>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground mb-3">Customer Information</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm text-foreground mt-1">{ticket?.customer?.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm text-foreground mt-1">{ticket?.customer?.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-sm text-foreground mt-1">{ticket?.customer?.phone}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company</label>
              <p className="text-sm text-foreground mt-1">{ticket?.customer?.company}</p>
            </div>
          </div>
        </div>

        {/* Ticket Classification */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground mb-3">Classification</h4>
          
          <div className="space-y-3">
            {isEditing ? (
              <>
                <Select
                  label="Priority"
                  options={priorityOptions}
                  value={editData?.priority}
                  onChange={(value) => setEditData({...editData, priority: value})}
                />
                
                <Select
                  label="Department"
                  options={departmentOptions}
                  value={editData?.department}
                  onChange={(value) => setEditData({...editData, department: value})}
                />
                
                <Select
                  label="Category"
                  options={categoryOptions}
                  value={editData?.category}
                  onChange={(value) => setEditData({...editData, category: value})}
                />
                
                <Input
                  label="Assigned To"
                  type="text"
                  value={editData?.assignedTo}
                  onChange={(e) => setEditData({...editData, assignedTo: e?.target?.value})}
                />
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <p className="text-sm text-foreground mt-1">{ticket?.priority}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm text-foreground mt-1">{ticket?.department}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm text-foreground mt-1">{ticket?.category}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                  <p className="text-sm text-foreground mt-1">{ticket?.assignedTo}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Priority Matrix */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium text-foreground mb-3">Priority Matrix (Impact × Urgency)</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Impact: </span>
            <span className="text-foreground font-medium">{ticket?.impact || 'Medium'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Urgency: </span>
            <span className="text-foreground font-medium">{ticket?.urgency || 'Medium'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Calculated Priority: </span>
            <span className="text-foreground font-medium">{getImpactUrgencyMatrix()}</span>
          </div>
        </div>
      </div>
      {/* Issue Description */}
      <div className="mt-6">
        <h4 className="font-medium text-foreground mb-3">Issue Description</h4>
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-foreground leading-relaxed">{ticket?.description}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;