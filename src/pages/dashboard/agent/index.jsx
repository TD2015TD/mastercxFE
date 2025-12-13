import React, { useState, useEffect } from 'react';
import { agentService } from '../../../services/agentService';
import { authService } from '../../../services/authService';
import mitelService from '../../../services/mitelService';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ActiveTicketsQueue from './components/ActiveTicketsQueue';
import PerformanceMetrics from './components/PerformanceMetrics';
import KnowledgeBaseWidget from './components/KnowledgeBaseWidget';
import RecentInteractions from './components/RecentInteractions';
import DepartmentAnnouncements from './components/DepartmentAnnouncements';
import MySchedule from './components/MySchedule';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStatus, setUserStatus] = useState('Offline');
  const [mitelAgentId, setMitelAgentId] = useState(null);
  const [agentState, setAgentState] = useState(null);
  const [isLoadingMitelState, setIsLoadingMitelState] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Get logged-in user data using authService
  const currentUser = authService.getCurrentUser() || {
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@jkdm.gov.my',
    role: 'agent',
    department: 'Customer Service',
    avatar: null
  };

  // Fetch Mitel agent state when mitelAgentId changes
  useEffect(() => {
    if (currentUser) {
      setIsLoadingMitelState(true);
      mitelService.getMitelEmployeeState(currentUser.agent.employee_id)
        .then((state) => {
          setAgentState(state);
          console.log('Mitel Agent State:', state);
          if (state && state.data.presence.aggregate.state) {
            // Update userStatus based on the fetched Mitel state
            setUserStatus(state.data.presence.aggregate.state);
          }
        })
        .catch((error) => {
          console.error('Error fetching Mitel state:', error);
          setUserStatus('offline');
        })
        .finally(() => {
          setIsLoadingMitelState(false);
        });
    }
  }, [currentUser.id]);

  const [stats, setStats] = useState({
    myTickets: 12,
    ticketsResolved: 8,
    avgResponseTime: '8 min',
    slaCompliance: 94
  });

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: 'LayoutDashboard', 
      description: 'Your workspace overview with active tickets and key metrics' 
    },
    { 
      id: 'tickets', 
      label: 'My Tickets', 
      icon: 'Ticket', 
      description: 'Manage your assigned tickets and queue' 
    },
    { 
      id: 'performance', 
      label: 'Performance', 
      icon: 'TrendingUp', 
      description: 'View your performance metrics and KPIs' 
    },
    { 
      id: 'knowledge', 
      label: 'Knowledge Base', 
      icon: 'BookOpen', 
      description: 'Quick access to articles and documentation' 
    },
    { 
      id: 'schedule', 
      label: 'My Schedule', 
      icon: 'Calendar', 
      description: 'View your work schedule and availability' 
    }
  ];

  const handleStatusChange = async (newStatus) => {
    // Don't proceed if already updating or no current user ID
    if (isUpdatingStatus || !currentUser.id) {
      console.warn('Cannot update status: either already updating or no user ID');
      return;
    }

    const previousStatus = userStatus;
    
    // Optimistically update UI
    setUserStatus(newStatus);
    setIsUpdatingStatus(true);
    
    try {
      // Create the payload using the helper function from mitelService
      const payload = mitelService.createPresenceStatePayload(newStatus);

      // Use currentUser.id (this is the user_id that the backend expects)
      const result = await mitelService.updateMitelEmployeeState(currentUser.agent.employee_id, payload);
      
      if (result && result.status) {
        console.log('Employee state updated successfully:', newStatus);
        // Update agent state
        setAgentState(prevState => ({
          ...prevState,
          state: newStatus
        }));
      } else {
        console.error('Failed to update employee state:', result?.message);
        // Revert the status on error
        setUserStatus(previousStatus);
        alert(`Failed to update status: ${result?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating employee state:', error);
      // Revert the status on error
      setUserStatus(previousStatus);
      alert(`Error updating status: ${error.message || 'Network error'}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'available') return 'text-green-500';
    if (statusLower === 'busy' || statusLower === 'on-call') return 'text-red-500';
    if (statusLower === 'away' || statusLower === 'after-call-work') return 'text-yellow-500';
    return 'text-gray-500';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <ActiveTicketsQueue />
              </div>
              <div className="space-y-6">
                <RecentInteractions />
                <DepartmentAnnouncements />
              </div>
            </div>
          </div>
        );
      case 'tickets':
        return <ActiveTicketsQueue fullView />;
      case 'performance':
        return <PerformanceMetrics />;
      case 'knowledge':
        return <KnowledgeBaseWidget />;
      case 'schedule':
        return <MySchedule />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Agent Dashboard - JKDM CRM Portal</title>
        <meta name="description" content="Agent workspace for managing tickets, customer interactions, and performance metrics" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Active Tickets</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.myTickets}</p>
                <p className="text-sm text-primary mt-2">
                  <Icon name="TrendingUp" size={14} className="inline mr-1" />
                  3 new today
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon name="Ticket" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.ticketsResolved}</p>
                <p className="text-sm text-muted-foreground mt-2">Target: 15</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.avgResponseTime}</p>
                <p className="text-sm text-success mt-2">
                  <Icon name="TrendingDown" size={14} className="inline mr-1" />
                  Improved by 20%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLA Compliance</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.slaCompliance}%</p>
                <p className="text-sm text-success mt-2">
                  <Icon name="Target" size={14} className="inline mr-1" />
                  Above target
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Icon name="Target" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-card rounded-lg border border-border mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Agent Dashboard Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="px-6 py-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Zap" size={20} className="mr-2 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              iconName="Plus" 
              iconPosition="left" 
              fullWidth
              onClick={() => navigate('/ticket-management/new')}
            >
              Create Ticket
            </Button>
            <Button 
              variant="outline" 
              iconName="Search" 
              iconPosition="left" 
              fullWidth
              onClick={() => navigate('/customer-360-profile')}
            >
              Find Customer
            </Button>
            <Button 
              variant="outline" 
              iconName="BookOpen" 
              iconPosition="left" 
              fullWidth
              onClick={() => navigate('/knowledge-base-portal')}
            >
              Browse KB
            </Button>
            <Button 
              variant="outline" 
              iconName="BarChart" 
              iconPosition="left" 
              fullWidth
              onClick={() => navigate('/analytics-and-reporting')}
            >
              View Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;