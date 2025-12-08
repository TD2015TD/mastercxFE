import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import TelephonyBar from '../../components/TelephonyBar';
import TicketHeader from './components/TicketHeader';
import TicketDetails from './components/TicketDetails';
import CommunicationPanel from './components/CommunicationPanel';
import KnowledgeBaseSidebar from './components/KnowledgeBaseSidebar';
import StatusWorkflow from './components/StatusWorkflow';
import TicketCreateForm from './components/TicketCreateForm';
import AgentScriptAssistant from '../../components/AgentScriptAssistant';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const TicketManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketId } = useParams();
  
  // Get logged-in user data from localStorage
  const getUserData = () => {
    try {
      const userSession = localStorage.getItem('user-session');
      if (userSession) {
        const userData = JSON.parse(userSession);
        return {
          name: userData.name || 'User',
          email: userData.email || '',
          role: userData.role || 'agent',
          department: userData.department || 'Customer Service',
        };
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
    }
    return {
      name: 'Ahmad Rahman',
      email: 'ahmad.rahman@jkdm.gov.my',
      role: 'agent',
      department: 'Customer Service'
    };
  };

  const [currentUser] = useState(getUserData());
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('details');
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);

  // Check if we're in "new ticket" mode
  useEffect(() => {
    const action = searchParams?.get('action');
    const isNewTicketRoute = location?.pathname === '/ticket/new';
    setIsCreatingNew(action === 'new' || isNewTicketRoute);
  }, [searchParams, location]);

  // Load ticket data from API
  useEffect(() => {
    if (ticketId && !isCreatingNew) {
      loadTicket();
    }
  }, [ticketId, isCreatingNew]);

  const loadTicket = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ticketService.getTicket(ticketId);
      if (response.success && response.data) {
        setTicket(transformTicketData(response.data));
      }
    } catch (err) {
      console.error('Error loading ticket:', err);
      setError('Failed to load ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Transform API ticket data to match component expectations
  const transformTicketData = (apiTicket) => {
    return {
      id: apiTicket.ticket_number,
      subject: apiTicket.subject,
      description: apiTicket.description,
      status: apiTicket.status,
      priority: apiTicket.priority,
      category: apiTicket.category,
      department: apiTicket.department,
      assignedTo: apiTicket.assignedAgent?.user?.name || 'Unassigned',
      impact: apiTicket.impact || 'Medium',
      urgency: apiTicket.urgency || 'Medium',
      createdAt: new Date(apiTicket.created_at),
      updatedAt: new Date(apiTicket.updated_at),
      customer: apiTicket.customer ? {
        name: apiTicket.customer.name,
        email: apiTicket.customer.email,
        phone: apiTicket.customer.phone_number,
        company: apiTicket.customer.company_name || '',
        avatar: null,
        avatarAlt: apiTicket.customer.name
      } : null,
      sla: {
        status: apiTicket.sla_breached ? 'Breached' : (apiTicket.sla_remaining_minutes < 60 ? 'At Risk' : 'On Track'),
        timeRemaining: apiTicket.formatted_sla_remaining || '0m',
        responseTime: `${Math.floor((apiTicket.sla_duration_minutes || 240) / 60)}h`,
        resolutionTime: `${Math.floor((apiTicket.sla_duration_minutes || 240) / 60)}h`,
        isPaused: false
      },
      histories: apiTicket.histories || [],
      rawData: apiTicket // Keep original for updates
    };
  };

  // Handle ticket creation
  const handleCreateTicket = async (ticketData) => {
    try {
      setIsLoading(true);
      const response = await ticketService.createTicket(ticketData);
      if (response.success && response.data) {
        // Navigate to the created ticket
        navigate(`/ticket-management/${response.data.id}`);
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ticket assignment
  const handleAssignTicket = async (agentId) => {
    if (!ticket?.rawData?.id) return;
    
    try {
      setIsLoading(true);
      const response = await ticketService.assignTicket(ticket.rawData.id, agentId);
      if (response.success) {
        await loadTicket(); // Reload to get updated data
      }
    } catch (err) {
      console.error('Error assigning ticket:', err);
      alert('Failed to assign ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus, notes = '') => {
    if (!ticket?.rawData?.id) return;
    
    try {
      setIsLoading(true);
      const response = await ticketService.updateStatus(ticket.rawData.id, newStatus, notes);
      if (response.success) {
        await loadTicket(); // Reload to get updated data
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update ticket status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock ticket data for fallback (when no ticket is loaded)
  const mockTicket = {
    id: 'TK-2024-1028',
    subject: 'Import Declaration Processing Issue - Container MSKU123456',
    description: `Customer is experiencing difficulties submitting import declaration for container MSKU123456. The system shows error "Invalid HS Code" when trying to declare electronic goods. Customer has provided all required documents including commercial invoice, packing list, and bill of lading.\n\nThe declared value is RM 45,000 for electronic components imported from Singapore. Customer needs urgent resolution as container is scheduled for clearance tomorrow morning.`,
    status: 'In Progress',
    priority: 'P2',
    category: 'Import Declaration',
    department: 'Customs Operations',
    assignedTo: 'Ahmad Rahman',
    impact: 'High',
    urgency: 'Medium',
    createdAt: new Date('2024-10-28T08:30:00'),
    updatedAt: new Date('2024-10-28T14:15:00'),
    customer: {
      name: 'Lim Wei Ming',
      email: 'lim.weiming@techimport.com.my',
      phone: '+60 12-345-6789',
      company: 'Tech Import Solutions Sdn Bhd',
      avatar: "https://images.unsplash.com/photo-1629272039203-7d76fdaf1324",
      avatarAlt: 'Professional headshot of Asian businessman in dark suit with friendly smile'
    },
    sla: {
      status: 'At Risk',
      timeRemaining: '2h 45m',
      responseTime: '4 hours',
      resolutionTime: '24 hours',
      isPaused: false
    },
    communications: [
    {
      id: 1,
      channel: 'email',
      author: 'Lim Wei Ming',
      content: 'I am having trouble submitting my import declaration. The system keeps showing "Invalid HS Code" error for electronic components. I have checked the HS code 8517.12.00 multiple times and it should be correct.',
      timestamp: new Date('2024-10-28T08:30:00'),
      attachments: [
      { name: 'commercial_invoice.pdf', size: '245 KB' },
      { name: 'packing_list.pdf', size: '156 KB' }]

    },
    {
      id: 2,
      channel: 'note',
      author: 'Ahmad Rahman',
      content: 'Initial review completed. HS code 8517.12.00 is valid for electronic components. Checking system logs for potential technical issues.',
      timestamp: new Date('2024-10-28T09:15:00')
    },
    {
      id: 3,
      channel: 'phone',
      author: 'Ahmad Rahman',
      content: 'Called customer to verify details. Confirmed that the error appears during final submission step. Customer mentioned similar issue occurred last month with different container.',
      timestamp: new Date('2024-10-28T10:30:00')
    },
    {
      id: 4,
      channel: 'chat',
      author: 'Lim Wei Ming',
      content: 'Saya masih menghadapi masalah yang sama. Boleh tolong check sistem?',
      originalLanguage: 'Bahasa Malaysia',
      originalText: 'Saya masih menghadapi masalah yang sama. Boleh tolong check sistem?',
      timestamp: new Date('2024-10-28T11:45:00')
    },
    {
      id: 5,
      channel: 'system',
      author: 'System',
      content: 'Escalated to IT Support team for system validation. Ticket reference: IT-2024-0892',
      timestamp: new Date('2024-10-28T12:00:00')
    },
    {
      id: 6,
      channel: 'note',
      author: 'Ahmad Rahman',
      content: 'IT team confirmed temporary system glitch affecting HS code validation for electronic goods category. Fix deployed at 13:30. Advised customer to retry submission.',
      timestamp: new Date('2024-10-28T14:15:00')
    }],
    statusHistory: [
    {
      from: 'Open',
      to: 'In Progress',
      timestamp: new Date('2024-10-28T09:00:00'),
      updatedBy: 'Ahmad Rahman'
    },
    {
      from: 'In Progress',
      to: 'On Hold',
      timestamp: new Date('2024-10-28T12:00:00'),
      updatedBy: 'Ahmad Rahman'
    },
    {
      from: 'On Hold',
      to: 'In Progress',
      timestamp: new Date('2024-10-28T14:00:00'),
      updatedBy: 'Ahmad Rahman'
    }],
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTicketUpdate = async (updateData) => {
    if (!ticket?.rawData?.id) return;
    
    try {
      setIsLoading(true);
      const response = await ticketService.updateTicket(ticket.rawData.id, updateData);
      if (response.success) {
        await loadTicket(); // Reload to get updated data
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Failed to update ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCommunication = (communication) => {
    setTicket((prev) => ({
      ...prev,
      communications: [
      ...prev?.communications,
      {
        ...communication,
        id: prev?.communications?.length + 1
      }]

    }));
  };

  const handleTranslate = async (messageId, content) => {
    // Simulate translation API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Translation completed for:', content);
        resolve();
      }, 1000);
    });
  };

  const handleCopyToNote = (content) => {
    setTicket((prev) => ({
      ...prev,
      communications: [
      ...prev?.communications,
      {
        id: prev?.communications?.length + 1,
        channel: 'note',
        author: currentUser?.name,
        content: content,
        timestamp: new Date()
      }]

    }));
  };

  const handleSLAPause = (isPaused) => {
    setTicket((prev) => ({
      ...prev,
      sla: {
        ...prev?.sla,
        isPaused
      }
    }));
  };

  const handleTicketCreate = (newTicket) => {
    console.log('New ticket created:', newTicket);
    // In a real implementation, this would save to the backend
    setTicket(newTicket);
    setIsCreatingNew(false);
  };

  const handleInsertScriptToTicket = (scriptContent) => {
    // Insert script into current communication or note
    const newCommunication = {
      channel: 'note',
      author: currentUser?.name,
      content: `[Script Used] ${scriptContent}`,
      timestamp: new Date()
    };
    handleAddCommunication(newCommunication);
  };

  const handleCallEvent = (eventType, data) => {
    console.log('Telephony Event in Ticket:', eventType, data);
    
    // Handle different telephony events in ticket context
    switch (eventType) {
      case 'telephony:incoming':
        // Could auto-create ticket or link to existing customer
        if (data?.caller?.phone) {
          // Search for existing customer by phone number
          console.log('Searching for customer:', data?.caller?.phone);
        }
        break;
      case 'telephony:connected':
        // Update ticket with call start time
        handleAddCommunication({
          channel: 'phone',
          author: currentUser?.name,
          content: `Call started with ${data?.caller?.name} (${data?.caller?.number})`,
          timestamp: new Date()
        });
        break;
      case 'telephony:ended':
        // Update ticket with call end time and duration
        handleAddCommunication({
          channel: 'phone',
          author: currentUser?.name,
          content: `Call ended. Duration: ${Math.floor(data?.duration / 60)}m ${data?.duration % 60}s`,
          timestamp: new Date()
        });
        break;
      case 'telephony:wrap_up':
        // Add wrap-up information to ticket
        if (data?.wrapUpCode || data?.notes) {
          handleAddCommunication({
            channel: 'note',
            author: currentUser?.name,
            content: `Call Wrap-up:\nCode: ${data?.wrapUpCode || 'None'}\nNotes: ${data?.notes || 'No additional notes'}`,
            timestamp: new Date()
          });
        }
        break;
      default:
        break;
    }
  };

  const breadcrumbs = isCreatingNew ? [
    { label: 'Dashboard', path: '/agent-dashboard', isActive: false },
    { label: 'New Ticket', path: '/ticket/new', isActive: true }
  ] : [
    { label: 'Dashboard', path: '/agent-dashboard', isActive: false },
    { label: 'Ticket Management', path: '/ticket-management', isActive: true }
  ];

  const tabItems = [
  { id: 'details', label: 'Details', icon: 'FileText' },
  { id: 'communication', label: 'Communication', icon: 'MessageSquare' },
  { id: 'workflow', label: 'Workflow', icon: 'GitBranch' },
  { id: 'knowledge', label: 'Knowledge Base', icon: 'BookOpen' }];


  const renderMobileContent = () => {
    const displayTicket = ticket || mockTicket;
    switch (activeTab) {
      case 'details':
        return <TicketDetails ticket={displayTicket} onUpdate={handleTicketUpdate} />;
      case 'communication':
        return <CommunicationPanel ticket={displayTicket} onAddNote={handleAddCommunication} onTranslate={handleTranslate} />;
      case 'workflow':
        return <StatusWorkflow ticket={displayTicket} onStatusUpdate={handleStatusUpdate} onSLAPause={handleSLAPause} />;
      case 'knowledge':
        return <KnowledgeBaseSidebar ticket={displayTicket} onCopyToNote={handleCopyToNote} />;
      default:
        return <TicketDetails ticket={displayTicket} onUpdate={handleTicketUpdate} />;
    }
  };

  // Render new ticket creation form
  if (isCreatingNew) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={currentUser} onMenuToggle={handleMenuToggle} />
        <main className="container mx-auto px-6 py-8 max-w-5xl">
          <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} />
          
          {/* Telephony Bar for new ticket creation */}
          <div className="mb-6">
            <TelephonyBar onCallEvent={handleCallEvent} />
          </div>
          
          <div className="mt-6">
            <TicketCreateForm 
              currentUser={currentUser} 
              onTicketCreate={handleCreateTicket}
            />
          </div>
        </main>
      </div>
    );
  }

  // Show loading state
  if (isLoading && !ticket) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={currentUser} onMenuToggle={handleMenuToggle} />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading ticket...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={currentUser} onMenuToggle={handleMenuToggle} />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Icon name="AlertCircle" className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadTicket}>Retry</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const displayTicket = ticket || mockTicket;

  // Render existing ticket management interface
  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} onMenuToggle={handleMenuToggle} />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} />
        
        {/* Telephony Bar */}
        <div className="mb-6">
          <TelephonyBar onCallEvent={handleCallEvent} />
        </div>
        
        <TicketHeader
          ticket={displayTicket}
          onStatusChange={() => setActiveTab('workflow')}
          onTransfer={() => console.log('Transfer ticket')}
          onClose={() => handleStatusUpdate('Closed', 'Ticket closed by ' + currentUser?.name)} />


        {isMobile ?
        <div className="space-y-6">
            {/* Mobile Tab Navigation */}
            <div className="bg-card border border-border rounded-lg p-2">
              <div className="grid grid-cols-2 gap-1">
                {tabItems?.map((tab) =>
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab?.id ?
                'bg-primary text-primary-foreground' :
                'text-muted-foreground hover:text-foreground hover:bg-muted'}`
                }>

                    <Icon name={tab?.icon} size={16} />
                    <span className="hidden sm:inline">{tab?.label}</span>
                  </button>
              )}
              </div>
            </div>

            {/* Mobile Content */}
            {renderMobileContent()}
          </div> :

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              <TicketDetails ticket={displayTicket} onUpdate={handleTicketUpdate} />
              <CommunicationPanel ticket={displayTicket} onAddNote={handleAddCommunication} onTranslate={handleTranslate} />
              <StatusWorkflow ticket={displayTicket} onStatusUpdate={handleStatusUpdate} onSLAPause={handleSLAPause} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <KnowledgeBaseSidebar ticket={displayTicket} onCopyToNote={handleCopyToNote} />
              </div>
            </div>
          </div>
        }

        {/* Quick Actions Bar */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
          <Button
            variant="default"
            size="icon"
            iconName="MessageSquare"
            onClick={() => setActiveTab('communication')}
            className="rounded-full shadow-lg" />

          <Button
            variant="outline"
            size="icon"
            iconName="BookOpen"
            onClick={() => setActiveTab('knowledge')}
            className="rounded-full shadow-lg bg-card" />

        </div>
      </main>

      {/* Agent Script Assistant - context-aware based on ticket */}
      <AgentScriptAssistant 
        currentTicket={ticket}
        currentChannel={activeTab === 'communication' ? 'ticket' : null}
        onInsertScript={handleInsertScriptToTicket}
      />
    </div>
  );
};

export default TicketManagement;