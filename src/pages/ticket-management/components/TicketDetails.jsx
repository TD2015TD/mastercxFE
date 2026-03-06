import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ticketService } from '../../../services/ticketService';
import lookupService from '../../../services/lookupService';
import { contactService } from '../../../services/contactService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TicketDetails = ({ ticket, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [customerContacts, setCustomerContacts] = useState([]);
  
  const [editData, setEditData] = useState({
    priority: ticket?.priority,
    department: ticket?.department,
    assignedTo: ticket?.assignedTo,
    category: ticket?.category
  });

  // Load lookups when entering edit mode
  React.useEffect(() => {
    if (isEditing && departments.length === 0) {
      loadLookups();
    }
  }, [isEditing]);

  React.useEffect(() => {
    const loadCustomerContacts = async () => {
      if (!ticket?.customer?.id) {
        setCustomerContacts([]);
        return;
      }

      try {
        const response = await contactService.getCustomerContacts(ticket.customer.id, { per_page: 50 });
        setCustomerContacts(response?.data || []);
      } catch (error) {
        console.error('Error loading customer contacts:', error);
        setCustomerContacts([]);
      }
    };

    loadCustomerContacts();
  }, [ticket?.customer?.id]);

  const loadLookups = async () => {
    try {
      const [deptData, prioData] = await Promise.all([
        lookupService.getDepartments(),
        lookupService.getPriorities()
      ]);

      setDepartments(deptData.map(d => ({ value: d.name, label: d.name })));
      setPriorities(prioData.map(p => ({ value: p.code, label: `${p.code} - ${p.name}` })));
    } catch (err) {
      console.error('Error loading lookups:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Call API to update ticket
      const response = await ticketService.updateTicket(ticket.id, {
        priority: editData.priority,
        department: editData.department,
        category: editData.category,
        assigned_to: editData.assignedTo
      });

      if (response.success) {
        // Update parent component
        if (onUpdate) {
          onUpdate(editData);
        }
        setIsEditing(false);
        toast.success('Ticket updated successfully');
      } else {
        toast.error('Failed to update ticket: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
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
              <label className="text-sm font-medium text-muted-foreground">Contacts</label>
              {customerContacts.length > 0 ? (
                <div className="mt-1 space-y-1">
                  {customerContacts.map((contact) => (
                    <p key={contact.id} className="text-sm text-foreground">
                      <span className="text-muted-foreground mr-2">
                        {contact.contactType?.name_en || contact.contactType?.name_ms || 'Contact'}:
                      </span>
                      {contact.value}
                      {contact.is_primary ? <span className="ml-2 text-xs text-primary">(Primary)</span> : null}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground mt-1">-</p>
              )}
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

          {ticket?.case_id && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Case ID</label>
              <p className="text-sm font-mono text-foreground mt-1">{ticket.case_id}</p>
            </div>
          )}

          <div className="space-y-3">
            {isEditing ? (
              <>
                {/* Priority hidden — auto-closed tickets; kept for future use */}
                <div className="hidden">
                  <Select
                    label="Priority"
                    options={priorities.length > 0 ? priorities : [
                      { value: 'P1', label: 'P1 - Critical' },
                      { value: 'P2', label: 'P2 - High' },
                      { value: 'P3', label: 'P3 - Medium' },
                      { value: 'P4', label: 'P4 - Low' }
                    ]}
                    value={editData?.priority}
                    onChange={(value) => setEditData({...editData, priority: value})}
                  />
                </div>
                
                <Select
                  label="Department"
                  options={departments.length > 0 ? departments : [
                    { value: 'Customs Operations', label: 'Customs Operations' },
                    { value: 'Trade Facilitation', label: 'Trade Facilitation' }
                  ]}
                  value={editData?.department}
                  onChange={(value) => setEditData({...editData, department: value})}
                />
                
                <Input
                  label="Category"
                  type="text"
                  value={editData?.category}
                  onChange={(e) => setEditData({...editData, category: e?.target?.value})}
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
                  <label className="text-sm font-medium text-muted-foreground">Channel</label>
                  <p className="text-sm text-foreground mt-1 capitalize">{ticket?.channel?.replace('-', ' ') || '-'}</p>
                </div>

                {/* Priority hidden — auto-closed tickets; kept for future use */}
                <div className="hidden">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <p className="text-sm text-foreground mt-1">{ticket?.priority}</p>
                  </div>
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
      {/* Priority Matrix — hidden; kept for future use */}
      <div className="hidden mt-6 p-4 bg-muted rounded-lg">
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