import { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import { ticketService } from '../../../services/ticketService';
import { getAgentDashboard } from '../../../services/dashboardService';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ActiveTicketsQueue from './components/ActiveTicketsQueue';
import PerformanceMetrics from './components/PerformanceMetrics';
import KnowledgeBaseWidget from './components/KnowledgeBaseWidget';


const AgentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const currentUser = authService.getCurrentUser();

  const [stats, setStats] = useState({
    myTickets: 0,
    ticketsResolved: 0,
    newToday: 0,
    avgResponseTime: '0 min',
    avgResponseMinutes: 0,
    slaCompliance: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [agentDashboard, setAgentDashboard] = useState(null);

  // Fetch agent statistics
  useEffect(() => {
    const fetchAgentStats = async () => {
      if (!currentUser?.agent?.id) return;

      try {
        setIsLoadingStats(true);
        const response = await ticketService.getAgentStatistics(currentUser.agent.id);

        if (response.success) {
          setStats({
            myTickets: response.data.activeTickets,
            ticketsResolved: response.data.resolvedToday,
            newToday: response.data.newToday,
            avgResponseTime: response.data.avgResponseTime,
            avgResponseMinutes: response.data.avgResponseMinutes ?? 0,
            slaCompliance: response.data.slaCompliance
          });
        }
      } catch (error) {
        console.error('Error fetching agent statistics:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchAgentStats();

    const interval = setInterval(fetchAgentStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser?.agent?.id]);

  // Fetch richer agent dashboard data (daily target, CSAT, etc.)
  useEffect(() => {
    if (!currentUser?.agent?.id) return;
    getAgentDashboard(currentUser.agent.id)
      .then(response => {
        if (response.success) setAgentDashboard(response.data);
      })
      .catch(err => console.error('Failed to fetch agent dashboard data:', err));
  }, [currentUser?.agent?.id]);

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
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ActiveTicketsQueue />;
      case 'tickets':
        return <ActiveTicketsQueue fullView />;
      case 'performance':
        return <PerformanceMetrics metrics={{
          ticketsResolvedToday: agentDashboard?.today?.resolved ?? stats.ticketsResolved,
          avgResponseTime: agentDashboard?.week?.avg_resolution_time ?? stats.avgResponseMinutes,
          slaComplianceRate: agentDashboard?.month?.sla_compliance ?? stats.slaCompliance,
          customerSatisfaction: agentDashboard?.week?.csat ?? 0,
        }} />;
      case 'knowledge':
        return <KnowledgeBaseWidget />;
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
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoadingStats ? '...' : stats.myTickets}
                </p>
                <p className="text-sm text-primary mt-2">
                  <Icon name="TrendingUp" size={14} className="inline mr-1" />
                  {stats.newToday} new today
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
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoadingStats ? '...' : stats.ticketsResolved}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Keep up the good work!</p>
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
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoadingStats ? '...' : stats.avgResponseTime}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Last 7 days</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLA Compliance</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoadingStats ? '...' : `${stats.slaCompliance}%`}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Last 30 days</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Icon name="Target" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div> */}
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
            {/* <Button
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
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
