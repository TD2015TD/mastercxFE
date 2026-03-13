import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ticketService } from '../../services/ticketService';
import { agentService } from '../../services/agentService';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TicketHeader from './components/TicketHeader';
import TicketDetails from './components/TicketDetails';
import TicketActivityTimeline from './components/TicketActivityTimeline';
import TicketAttachments from './components/TicketAttachments';
import { toast } from 'react-toastify';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [liveTimeRemaining, setLiveTimeRemaining] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  // Live SLA countdown timer
  useEffect(() => {
    if (!ticket || !ticket.sla_due_at || ['Resolved', 'Closed', 'Cancelled'].includes(ticket.status)) {
      setLiveTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const dueDate = new Date(ticket.sla_due_at);
      const diffMs = dueDate - now;
      const diffSeconds = Math.floor(diffMs / 1000);

      if (diffSeconds < 0) {
        const absSeconds = Math.abs(diffSeconds);
        const hours = Math.floor(absSeconds / 3600);
        const mins = Math.floor((absSeconds % 3600) / 60);
        const secs = absSeconds % 60;
        
        let formatted = '';
        if (hours > 0) {
          formatted = `${hours}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
          formatted = `${mins}m ${secs}s`;
        } else {
          formatted = `${secs}s`;
        }
        return { formatted: `Overdue by ${formatted}`, isOverdue: true };
      } else {
        const hours = Math.floor(diffSeconds / 3600);
        const mins = Math.floor((diffSeconds % 3600) / 60);
        const secs = diffSeconds % 60;
        
        let formatted = '';
        if (hours > 0) {
          formatted = `${hours}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
          formatted = `${mins}m ${secs}s`;
        } else {
          formatted = `${secs}s`;
        }
        return { formatted, isOverdue: false };
      }
    };

    // Initial calculation
    setLiveTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setLiveTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket]);

  const loadTicket = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ticketService.getTicket(parseInt(id));
      
      if (response.success) {
        setTicket(response.data);
      } else {
        setError('Ticket not found');
      }
    } catch (err) {
      console.error('Error loading ticket:', err);
      setError('Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    setSelectedStatus(ticket.status);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus && selectedStatus !== ticket.status) {
      try {
        const response = await ticketService.updateStatus(ticket.id, selectedStatus);
        if (response.success) {
          setTicket(response.data);
          setShowStatusModal(false);
          toast.success('Ticket status updated successfully');
          await loadTicket();
        }
      } catch (err) {
        console.error('Error updating status:', err);
        toast.error('Failed to update status');
      }
    } else {
      setShowStatusModal(false);
    }
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'Open': 'Ticket has been created and is awaiting assignment or action',
      'In Progress': 'Agent is actively working on resolving the ticket',
      'Pending': 'Waiting for customer response or additional information',
      'On Hold': 'Ticket is temporarily paused due to external dependencies',
      'Resolved': 'Issue has been resolved, awaiting customer confirmation',
      'Closed': 'Ticket is completed and closed',
      'Cancelled': 'Ticket has been cancelled and will not be resolved'
    };
    return descriptions[status] || '';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Open': 'Circle',
      'In Progress': 'Clock',
      'Pending': 'AlertCircle',
      'On Hold': 'Pause',
      'Resolved': 'CheckCircle',
      'Closed': 'XCircle',
      'Cancelled': 'XOctagon'
    };
    return icons[status] || 'Circle';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'text-blue-600 bg-blue-50 border-blue-200',
      'In Progress': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Pending': 'text-orange-600 bg-orange-50 border-orange-200',
      'On Hold': 'text-purple-600 bg-purple-50 border-purple-200',
      'Resolved': 'text-green-600 bg-green-50 border-green-200',
      'Closed': 'text-gray-600 bg-gray-50 border-gray-200',
      'Cancelled': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const handleTransfer = async () => {
    setShowTransferModal(true);
    loadAgents();
  };

  const loadAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const response = await agentService.getAgents({
        status: 'active'
      });
      if (response.success) {
        setAgents(response.data.data || response.data);
      }
    } catch (err) {
      console.error('Error loading agents:', err);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleTransferConfirm = async () => {
    if (selectedAgent && selectedAgent !== ticket.assigned_to) {
      try {
        const response = await ticketService.assignTicket(ticket.id, selectedAgent);
        if (response.success) {
          setTicket(response.data);
          setShowTransferModal(false);
          setSelectedAgent(null);
          toast.success('Ticket transferred successfully');
          await loadTicket();
        }
      } catch (err) {
        console.error('Error transferring ticket:', err);
        toast.error('Failed to transfer ticket: ' + (err.response?.data?.message || err.message));
      }
    } else {
      setShowTransferModal(false);
    }
  };

  const handleClose = async () => {
    if (confirm(`Are you sure you want to close ticket ${ticket.ticket_number}?`)) {
      try {
        const response = await ticketService.closeTicket(ticket.id);
        if (response.success) {
          setTicket(response.data);
          toast.success('Ticket closed successfully');
          await loadTicket();
        }
      } catch (err) {
        console.error('Error closing ticket:', err);
        toast.error('Failed to close ticket');
      }
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const response = await ticketService.updateTicket(ticket.id, updatedData);
      if (response.success) {
        setTicket(response.data);
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
  };

  const handleAddAttachment = () => {
    // Switch to attachments tab and trigger file input
    setActiveTab('attachments');
    // Small delay to ensure tab renders before triggering input
    setTimeout(() => {
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.click();
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {error || 'Ticket Not Found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              The ticket you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/ticket-management')}>
              Back to Tickets
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: 'FileText' },
    { id: 'activity', label: 'Activity', icon: 'Activity' },
    { id: 'attachments', label: 'Attachments', icon: 'Paperclip' }
/*     { id: 'comments', label: 'Comments', icon: 'MessageSquare' } */
  ];

  return (
    <>
      <Helmet>
        <title>{ticket.ticket_number} - Ticket Management - JKDM CRM</title>
        <meta name="description" content={`Ticket ${ticket.ticket_number}: ${ticket.subject}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Ticket Header */}
          <TicketHeader 
            ticket={ticket}
            liveTimeRemaining={liveTimeRemaining}
            onStatusChange={handleStatusChange}
            onTransfer={handleTransfer}
            onClose={handleClose}
          />

          {/* Tabs */}

          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'details' && (
                <TicketDetails ticket={ticket} onUpdate={handleUpdate} />
              )}
              
              {activeTab === 'activity' && (
                <TicketActivityTimeline ticketId={ticket.id} autoRefresh />
              )}
              
              {activeTab === 'attachments' && (
                <TicketAttachments ticketId={ticket.id} />
              )}
              
              {activeTab === 'comments' && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Comments</h3>
                  <p className="text-muted-foreground">Comments feature coming soon...</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* SLA Information */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Clock" size={20} className="mr-2" />
                  SLA Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">SLA Status</p>
                    <p className={`text-lg font-semibold ${
                      ticket.sla_breached || (liveTimeRemaining && liveTimeRemaining.isOverdue) ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {ticket.sla_breached || (liveTimeRemaining && liveTimeRemaining.isOverdue) ? 'Breached' : 'On Track'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Remaining</p>
                    <p className={`text-lg font-semibold ${
                      liveTimeRemaining && liveTimeRemaining.isOverdue ? 'text-red-600' : 'text-foreground'
                    }`}>
                      {liveTimeRemaining ? liveTimeRemaining.formatted : (ticket.formatted_sla_remaining || 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="text-sm text-foreground">
                      {ticket.sla_due_at ? new Date(ticket.sla_due_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Zap" size={20} className="mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {/* <Button 
                    variant="outline" 
                    fullWidth 
                    iconName="MessageSquare" 
                    iconPosition="left"
                  >
                    Add Comment
                  </Button> */}
                  <Button 
                    variant="outline" 
                    fullWidth 
                    iconName="Paperclip" 
                    iconPosition="left"
                    onClick={handleAddAttachment}
                  >
                    Add Attachment
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Users"
                    iconPosition="left"
                    onClick={handleTransfer}
                  >
                    Transfer
                  </Button>
                </div>
              </div>

              {/* Related Tickets */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Link" size={20} className="mr-2" />
                  Related Tickets
                </h3>
                <p className="text-sm text-muted-foreground">No related tickets found</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Ticket Status"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Status</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket?.status)}`}>
                {ticket?.status}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Select New Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              {['Open', 'In Progress', 'Pending', 'On Hold', 'Resolved', 'Closed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                    selectedStatus === status
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <Icon 
                    name={getStatusIcon(status)} 
                    size={20} 
                    className={selectedStatus === status ? 'text-primary' : 'text-muted-foreground'} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{status}</span>
                      {status === ticket?.status && (
                        <span className="text-xs text-muted-foreground">(Current)</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getStatusDescription(status)}
                    </p>
                  </div>
                  {selectedStatus === status && (
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setSelectedAgent(null);
          setAgentSearchQuery('');
        }}
        title="Transfer Ticket"
        size="md"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTransferModal(false);
                setSelectedAgent(null);
                setAgentSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleTransferConfirm} disabled={!selectedAgent}>
              Transfer Ticket
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Current Assignment */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Currently Assigned To</p>
            {ticket?.assignedAgent?.user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{ticket.assignedAgent.user.name}</p>
                  <p className="text-sm text-muted-foreground">{ticket.assignedAgent.department}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Unassigned</p>
            )}
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search Agents
            </label>
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or employee ID..."
                value={agentSearchQuery}
                onChange={(e) => setAgentSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Agent List */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Available Agents
            </label>
            
            {isLoadingAgents ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader" size={24} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="border border-border rounded-lg max-h-96 overflow-y-auto">
                {agents.filter(agent => 
                  agentSearchQuery === '' || 
                  agent.user?.name?.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
                  agent.employee_id?.toLowerCase().includes(agentSearchQuery.toLowerCase())
                ).length === 0 ? (
                  <div className="p-8 text-center">
                    <Icon name="Users" size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No available agents found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {agents
                      .filter(agent => 
                        agentSearchQuery === '' || 
                        agent.user?.name?.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
                        agent.employee_id?.toLowerCase().includes(agentSearchQuery.toLowerCase())
                      )
                      .map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => setSelectedAgent(agent.id)}
                          className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left ${
                            selectedAgent === agent.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            agent.availability === 'available' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Icon name="User" size={20} className={
                              agent.availability === 'available' ? 'text-green-600' : 'text-gray-600'
                            } />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground truncate">{agent.user?.name}</p>
                              {agent.id === ticket?.assigned_to && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Current</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{agent.employee_id} • {agent.designation || agent.department}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center gap-1 text-xs ${
                                agent.availability === 'available' ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                  agent.availability === 'available' ? 'bg-green-600' : 'bg-gray-600'
                                }`} />
                                {agent.availability}
                              </span>
                            </div>
                          </div>
                          {selectedAgent === agent.id && (
                            <Icon name="Check" size={20} className="text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TicketDetailPage;
