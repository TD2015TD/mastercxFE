import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import TicketList from './components/TicketList';
import { ticketService } from '../../services/ticketService';
import { authService } from '../../services/authService';

const TicketManagement = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('all');
  const [totalCount, setTotalCount] = useState(0);
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
      const todayEnd = `${today} 23:59:59`;

      const requests = [
        ticketService.getTickets({ per_page: 1, page: 1 }),
        ticketService.getTickets({ per_page: 1, page: 1, unassigned: 1 }),
        ticketService.getTickets({ per_page: 1, page: 1, date_from: today, date_to: todayEnd }),
      ];

      if (currentUser?.agent?.id) {
        requests.push(ticketService.getTickets({ per_page: 1, page: 1, assigned_to: currentUser.agent.id }));
      }

      const [allRes, unassignedRes, todayRes, myRes] = await Promise.all(requests);

      if (allRes.success) setTotalCount(allRes.data.total || 0);
      if (unassignedRes.success) setUnassignedCount(unassignedRes.data.total || 0);
      if (todayRes.success) setTodayCount(todayRes.data.total || 0);
      if (myRes?.success) setMyTicketsCount(myRes.data.total || 0);
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
      label: 'Unassigned',
      value: unassignedCount.toString(),
      subtext: unassignedCount > 0 ? 'Needs attention' : 'All assigned',
      icon: 'AlertCircle',
      color: 'text-red-600'
    },
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

      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
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
                <Button 
                  variant="default" 
                  iconName="Plus" 
                  iconPosition="left"
                  onClick={() => navigate('/ticket-management/create')}
                >
                  Create Ticket
                </Button>
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
    </>
  );
};

export default TicketManagement;
