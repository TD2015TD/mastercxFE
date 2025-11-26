import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import TelephonyBar from '../../components/TelephonyBar';
import ActiveTicketsQueue from './components/ActiveTicketsQueue';
import PerformanceMetrics from './components/PerformanceMetrics';
import KnowledgeBaseWidget from './components/KnowledgeBaseWidget';
import RecentInteractions from './components/RecentInteractions';
import DepartmentAnnouncements from './components/DepartmentAnnouncements';
import QuickActions from './components/QuickActions';
import AgentScriptAssistant from '../../components/AgentScriptAssistant';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [userStatus, setUserStatus] = useState('available');
  const [selectedPriority, setSelectedPriority] = useState('all');

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
          avatar: userData.avatar || null
        };
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
    }
    // Fallback to default
    return {
      name: 'Ahmad Rahman',
      email: 'ahmad.rahman@jkdm.gov.my',
      role: 'agent',
      department: 'Customer Service',
      avatar: null
    };
  };

  const currentUser = getUserData();

  // Mock active tickets data
  const mockTickets = [
    {
      id: 'TK-2024-1028',
      ticketNumber: 'TK-2024-1028',
      priority: 'P1',
      customerName: 'Siti Nurhaliza',
      customerEmail: 'siti.nurhaliza@email.com',
      subject: 'Urgent: GST calculation discrepancy for imported electronics',
      status: 'Open',
      slaRemaining: 15,
      createdAt: '2024-10-28T09:30:00Z',
      assignedTo: 'Ahmad Rahman'
    },
    {
      id: 'TK-2024-1029',
      ticketNumber: 'TK-2024-1029',
      priority: 'P2',
      customerName: 'Muhammad Ali',
      customerEmail: 'muhammad.ali@company.com',
      subject: 'Customs declaration form submission error',
      status: 'In Progress',
      slaRemaining: 120,
      createdAt: '2024-10-28T08:45:00Z',
      assignedTo: 'Ahmad Rahman'
    },
    {
      id: 'TK-2024-1030',
      ticketNumber: 'TK-2024-1030',
      priority: 'P3',
      customerName: 'Fatimah Zahra',
      customerEmail: 'fatimah.zahra@business.my',
      subject: 'Request for duty exemption certificate',
      status: 'Pending',
      slaRemaining: 240,
      createdAt: '2024-10-28T07:15:00Z',
      assignedTo: 'Ahmad Rahman'
    },
    {
      id: 'TK-2024-1031',
      ticketNumber: 'TK-2024-1031',
      priority: 'P2',
      customerName: 'Rajesh Kumar',
      customerEmail: 'rajesh.kumar@trading.com',
      subject: 'Temporary import permit application status',
      status: 'On Hold',
      slaRemaining: 180,
      createdAt: '2024-10-28T06:30:00Z',
      assignedTo: 'Ahmad Rahman'
    },
    {
      id: 'TK-2024-1032',
      ticketNumber: 'TK-2024-1032',
      priority: 'P4',
      customerName: 'Lim Wei Ming',
      customerEmail: 'lim.weiming@logistics.my',
      subject: 'General inquiry about prohibited items list',
      status: 'Open',
      slaRemaining: 360,
      createdAt: '2024-10-28T05:45:00Z',
      assignedTo: 'Ahmad Rahman'
    }
  ];

  // Mock performance metrics
  const mockMetrics = {
    ticketsResolvedToday: 12,
    dailyTarget: 15,
    avgResponseTime: 8,
    slaComplianceRate: 94,
    customerSatisfaction: 4.3
  };

  // Mock recent interactions
  const mockInteractions = [
    {
      id: 1,
      type: 'call',
      customerName: 'Ahmad Zulkifli',
      customerEmail: 'ahmad.zulkifli@email.com',
      subject: 'Follow-up on customs clearance delay',
      status: 'resolved',
      timestamp: '2024-10-28T10:15:00Z',
      ticketNumber: 'TK-2024-1025',
      priority: 'P2'
    },
    {
      id: 2,
      type: 'chat',
      customerName: 'Sarah Abdullah',
      customerEmail: 'sarah.abdullah@company.my',
      subject: 'Live chat: GST payment portal assistance',
      status: 'in_progress',
      timestamp: '2024-10-28T09:45:00Z',
      ticketNumber: 'TK-2024-1026',
      priority: 'P3'
    },
    {
      id: 3,
      type: 'email',
      customerName: 'David Tan',
      customerEmail: 'david.tan@business.com',
      subject: 'Email: Request for duty calculation clarification',
      status: 'pending',
      timestamp: '2024-10-28T09:20:00Z',
      ticketNumber: 'TK-2024-1027',
      priority: 'P2'
    },
    {
      id: 4,
      type: 'ticket',
      customerName: 'Nurul Aina',
      customerEmail: 'nurul.aina@trading.my',
      subject: 'Ticket update: Export permit application approved',
      status: 'resolved',
      timestamp: '2024-10-28T08:30:00Z',
      ticketNumber: 'TK-2024-1024',
      priority: 'P1'
    }
  ];

  // Mock department announcements
  const mockAnnouncements = [
    {
      id: 1,
      title: 'System Maintenance Scheduled',
      content: `The JKDM CRM system will undergo scheduled maintenance tonight from 11:00 PM to 2:00 AM (GMT+8).\n\nDuring this period, the following services will be temporarily unavailable:\n• Online payment portal\n• Document upload functionality\n• Real-time chat support\n\nAll other services will remain operational. We apologize for any inconvenience caused.`,
      preview: 'The JKDM CRM system will undergo scheduled maintenance tonight from 11:00 PM to 2:00 AM...',
      priority: 'high',
      department: 'IT Operations',
      publishedAt: '2024-10-28T08:00:00Z',
      isRead: false,
      isPinned: true,
      views: 156,
      attachments: [
        { name: 'maintenance-schedule.pdf', size: '245 KB' }
      ]
    },
    {
      id: 2,
      title: 'New GST Rates Effective November 1st',
      content: `Please be informed that new GST rates will be effective starting November 1st, 2024.\n\nKey changes include:\n• Standard rate remains at 6%\n• New zero-rated categories for essential medical equipment\n• Updated exemption list for educational materials\n\nAll agents must complete the mandatory training module by October 30th to ensure compliance with the new regulations.`,
      preview: 'Please be informed that new GST rates will be effective starting November 1st, 2024...',
      priority: 'medium',
      department: 'Tax Policy',
      publishedAt: '2024-10-27T14:30:00Z',
      isRead: true,
      isPinned: true,
      views: 289,
      actionRequired: 'Complete GST training module by October 30th',
      attachments: [
        { name: 'gst-rates-update.pdf', size: '1.2 MB' },
        { name: 'training-module-link.txt', size: '1 KB' }
      ]
    },
    {
      id: 3,
      title: 'Customer Service Excellence Award',
      content: `Congratulations to our Customer Service team for achieving 98% customer satisfaction rating this quarter!\n\nSpecial recognition goes to:\n• Ahmad Rahman - Highest resolution rate\n• Siti Aminah - Best customer feedback scores\n• Muhammad Hafiz - Most improved performance\n\nKeep up the excellent work!`,
      preview: 'Congratulations to our Customer Service team for achieving 98% customer satisfaction rating...',
      priority: 'info',
      department: 'Human Resources',
      publishedAt: '2024-10-26T16:45:00Z',
      isRead: true,
      isPinned: false,
      views: 234
    }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleTicketClick = (ticketId) => {
    navigate(`/ticket-management?id=${ticketId}`);
  };

  const handleStatusUpdate = (ticketId, newStatus) => {
    console.log('Updating ticket status:', ticketId, newStatus);
    // In real implementation, this would update the backend
  };

  const handlePriorityFilter = (priority) => {
    setSelectedPriority(priority);
  };

  const handleInteractionClick = (interaction) => {
    if (interaction?.ticketNumber) {
      navigate(`/ticket-management?id=${interaction?.ticketNumber}`);
    }
  };

  const handleArticleSelect = (article) => {
    navigate(`/knowledge-base-portal?article=${article?.id}`);
  };

  const handleNewTicket = () => {
    navigate('/ticket/new');
  };

  const handleTakeBreak = () => {
    setUserStatus('away');
    // In real implementation, this would update the backend
  };

  const handleViewReports = () => {
    navigate('/analytics-and-reporting');
  };

  const handleMenuToggle = () => {
    // Handle menu toggle functionality
    console.log('Menu toggled');
  };

  const handleInsertScriptToDashboard = (scriptContent) => {
    // For dashboard, we could show a toast or copy to clipboard
    navigator.clipboard?.writeText(scriptContent)?.then(() => {
      console.log('Script copied to clipboard for dashboard use');
    });
  };

  const handleCallEvent = (eventType, data) => {
    console.log('Telephony Event:', eventType, data);
    
    // Handle different telephony events
    switch (eventType) {
      case 'telephony:incoming':
        // Could show notification or update UI
        break;
      case 'telephony:connected':
        // Update agent status, start call logging
        break;
      case 'telephony:ended':
        // Log call interaction, update metrics
        break;
      case 'telephony:wrap_up':
        // Create interaction log in CRM
        handleCreateInteractionLog(data);
        break;
      default:
        break;
    }
  };

  const handleCreateInteractionLog = (callData) => {
    // In real implementation, this would create a CRM interaction record
    const interactionLog = {
      type: 'voice',
      customerName: callData?.caller?.name,
      customerPhone: callData?.caller?.number,
      duration: callData?.duration,
      wrapUpCode: callData?.wrapUpCode,
      notes: callData?.notes,
      timestamp: new Date()
    };
    
    console.log('Creating interaction log:', interactionLog);
    // This would typically call an API to save the interaction
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-6 py-8">
        <BreadcrumbNavigation />
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {currentLanguage === 'ms' ? 'Papan Pemuka Ejen' : 'Agent Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {currentLanguage === 'ms' ? 'Selamat datang kembali, Ahmad. Anda mempunyai 5 tiket aktif menunggu tindakan.' : 'Welcome back, Ahmad. You have 5 active tickets awaiting action.'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-lg">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">
                {new Date()?.toLocaleTimeString('en-MY', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'Asia/Kuala_Lumpur'
                })}
              </span>
              <span className="text-xs text-muted-foreground">GMT+8</span>
            </div>
            
            <Button variant="default" iconName="Plus" onClick={handleNewTicket}>
              {currentLanguage === 'ms' ? 'Tiket Baharu' : 'New Ticket'}
            </Button>
          </div>
        </div>

        {/* Telephony Bar */}
        <div className="mb-6">
          <TelephonyBar onCallEvent={handleCallEvent} />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Performance Metrics */}
            <PerformanceMetrics metrics={mockMetrics} />
            
            {/* Active Tickets Queue */}
            <ActiveTicketsQueue 
              tickets={mockTickets}
              onTicketClick={handleTicketClick}
              onStatusUpdate={handleStatusUpdate}
              onPriorityFilter={handlePriorityFilter}
            />
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Actions */}
            <QuickActions 
              onNewTicket={handleNewTicket}
              onTakeBreak={handleTakeBreak}
              onViewReports={handleViewReports}
              userStatus={userStatus}
            />
            
            {/* Knowledge Base Widget */}
            <KnowledgeBaseWidget onArticleSelect={handleArticleSelect} />
            
            {/* Recent Interactions */}
            <RecentInteractions 
              interactions={mockInteractions}
              onInteractionClick={handleInteractionClick}
            />
            
            {/* Department Announcements */}
            <DepartmentAnnouncements announcements={mockAnnouncements} />
          </div>
        </div>

        {/* Mobile Bottom Navigation Spacer */}
        <div className="h-20 md:h-0"></div>
      </main>

      {/* Agent Script Assistant */}
      <AgentScriptAssistant 
        currentChannel="dashboard"
        onInsertScript={handleInsertScriptToDashboard}
      />
    </div>
  );
};

export default AgentDashboard;