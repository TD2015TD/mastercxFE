import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import TicketList from './components/TicketList';
import { ticketService } from '../../services/ticketService';
import { authService } from '../../services/authService';
import Can, { usePermission } from '../../components/Can';

const TicketManagement = () => {
  const navigate = useNavigate();
  const { can } = usePermission();
  const currentUser = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('all');
  const [totalCount, setTotalCount] = useState(0);
  const [totalCall, setTotalCall] = useState(0);
  const [totalEmail, setTotalEmail] = useState(0);
  const [totalChat, setTotalChat] = useState(0);
  const [todayCallCount, setTodayCallCount] = useState(0);
  const [todayEmailCount, setTodayEmailCount] = useState(0);
  const [todayChatCount, setTodayChatCount] = useState(0);
  const [myTicketsCount, setMyTicketsCount] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load real counts from API on mount
  useEffect(() => {
    loadCounts();
  }, []);

 const loadCounts = async () => {
  try {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const requests = [
      ticketService.getTickets({ per_page: 1, page: 1 }),
      ticketService.getTickets({ per_page: 1, page: 1, unassigned: 1 }),
      ticketService.getTickets({ per_page: 1, page: 1, date_from: today, date_to: today }),

      ticketService.getTickets({ per_page: 1, page: 1, date_from: today, date_to: today, channel: 'phone' }),
      ticketService.getTickets({ per_page: 1, page: 1, date_from: today, date_to: today, channel: 'email' }),
      ticketService.getTickets({ per_page: 1, page: 1, date_from: today, date_to: today, channel: 'chat' }),

      ticketService.getTickets({ per_page: 1, page: 1, channel: 'phone' }),
      ticketService.getTickets({ per_page: 1, page: 1, channel: 'email' }),
      ticketService.getTickets({ per_page: 1, page: 1, channel: 'chat' }),
    ];

    if (currentUser?.agent?.id) {
      requests.push(
        ticketService.getTickets({
          per_page: 1,
          page: 1,
          assigned_to: currentUser.agent.id
        })
      );
    }

    const [
      allRes,
      unassignedRes,
      todayRes,
      todayCallRes,
      todayEmailRes,
      todayChatRes,
      phoneRes,
      emailRes,
      chatRes,
      myRes
    ] = await Promise.all(requests);

    if (allRes?.success) setTotalCount(allRes.data.total || 0);
    if (unassignedRes?.success) setUnassignedCount(unassignedRes.data.total || 0);
    if (todayRes?.success) setTodayCount(todayRes.data.total || 0);

    if (todayCallRes?.success) setTodayCallCount(todayCallRes.data.total || 0);
    if (todayEmailRes?.success) setTodayEmailCount(todayEmailRes.data.total || 0);
    if (todayChatRes?.success) setTodayChatCount(todayChatRes.data.total || 0);

    if (phoneRes?.success) setTotalCall(phoneRes.data.total || 0);
    if (emailRes?.success) setTotalEmail(emailRes.data.total || 0);
    if (chatRes?.success) setTotalChat(chatRes.data.total || 0);

    if (myRes?.success) setMyTicketsCount(myRes.data.total || 0);

    console.log('Counts loaded:', {
      total: allRes?.data?.total,
      unassigned: unassignedRes?.data?.total,
      today: todayRes?.data?.total,
      todayPhone: todayCallRes?.data?.total,
      todayEmail: todayEmailRes?.data?.total,
      todayChat: todayChatRes?.data?.total,
      phone: phoneRes?.data?.total,
      email: emailRes?.data?.total,
      chat: chatRes?.data?.total,
      myTickets: myRes?.data?.total
    });
  } catch (error) {
    console.error('Error loading ticket counts:', error);
  } finally {
    setIsLoading(false);
  }
};

  // Calculate statistics
  const stats = [
  {
    label: 'Total Tickets',
    value: totalCount.toString(),
    subtext: `+${todayCount} today`,
    icon: 'Ticket',
    color: 'text-blue-600'
  },
  {
    label: 'Call Tickets',
    value: totalCall.toString(),
    subtext: `+${todayCallCount} today`,
    icon: 'Phone',
    color: 'text-green-600'
  },
  {
    label: 'Email Tickets',
    value: totalEmail.toString(),
    subtext: `+${todayEmailCount} today`,
    icon: 'Mail',
    color: 'text-yellow-600'
  },
  {
    label: 'Chat Tickets',
    value: totalChat.toString(),
    subtext: `+${todayChatCount} today`,
    icon: 'MessageSquare',
    color: 'text-purple-600'
  }
];

  const tabs = [
    { id: 'all', label: 'All Tickets', icon: 'List', count: totalCount },
    { id: 'my-tickets', label: 'My Tickets', icon: 'User', count: myTicketsCount },
    { id: 'unassigned', label: 'Unassigned', icon: 'AlertCircle', count: unassignedCount },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return <TicketList filter="all" />;
      case 'my-tickets':
        return <TicketList filter="my-tickets" />;
      case 'unassigned':
        return <TicketList filter="unassigned" />;
      case 'escalated':
        return <TicketList filter="escalated" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Ticket Management - JKDM CRM</title>
        <meta name="description" content="Manage customer support tickets, assignments, and resolutions" />
      </Helmet>

      <Can 
        permission="ticket.view"
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-8 text-center max-w-md">
              <Icon name="Lock" size={48} className="text-amber-600 dark:text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You do not have permission to view tickets.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Please contact your system administrator if you believe you should have access.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-background">
        <main className="w-full max-w-none">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="Ticket" size={32} className="mr-3 text-primary" />
                  Ticket Management
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage customer support tickets, assignments, and resolutions
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  iconName="RefreshCw" 
                  iconPosition="left"
                  onClick={loadCounts}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
                <Can permission="ticket.create">
                  <Button 
                    variant="default" 
                    iconName="Plus" 
                    iconPosition="left"
                    onClick={() => navigate('/ticket-management/create')}
                  >
                    Create Ticket
                  </Button>
                </Can>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    {isLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    <Icon name={stat.icon} size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Description */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'all' && 'View and manage all tickets in the system across all departments and priorities.'}
              {activeTab === 'my-tickets' && 'View tickets assigned to you for tracking and resolution.'}
              {activeTab === 'unassigned' && 'View unassigned tickets that need to be assigned to agents.'}
              {activeTab === 'escalated' && 'View escalated tickets that require immediate attention.'}
            </p>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {renderTabContent()}
          </div>

        </main>
      </div>
      </Can>
    </>
  );
};

export default TicketManagement;
