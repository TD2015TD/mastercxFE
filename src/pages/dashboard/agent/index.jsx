import { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import {
  getTicketMetrics,
  getTicketsClosedByDay,
  getDepartmentPerformance,
  getLiveChatStatus,
  getTicketsByChannel,
} from '../../../services/dashboardService';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import TicketMetricCard from './components/TicketMetricCard';
import TicketsClosedChart from './components/TicketsClosedChart';
import DepartmentPerformanceChart from './components/DepartmentPerformanceChart';
import LiveChatStatusChart from './components/LiveChatStatusChart';


const AgentDashboard = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [userName, setUserName] = useState('');
  const [userDepartment, setUserDepartment] = useState('all');
  const [agentId, setAgentId] = useState(null);
  
  // Dashboard data
  const [ticketMetrics, setTicketMetrics] = useState(null);
  const [ticketsClosedData, setTicketsClosedData] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [liveChatStatus, setLiveChatStatus] = useState(null);
  const [ticketsByChannel, setTicketsByChannel] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user info
  useEffect(() => {
    setUserName(currentUser?.name || 'Agent');
    setAgentId(currentUser?.agent?.id || null);
    
    const userSession = localStorage.getItem('user-session');
    if (userSession) {
      try {
        const userData = JSON.parse(userSession);
        const dept = userData.agent?.department || userData.department || 'all';
        setUserDepartment(dept);
      } catch (err) {
        console.error('Error parsing user session:', err);
      }
    }
  }, [currentUser]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!agentId) return;
    
    try {
      setLoading(true);
      const dept = userDepartment === 'all' ? null : userDepartment;

      const [metricsRes, closedRes, deptPerfRes, liveChatRes, channelRes] = await Promise.allSettled([
        getTicketMetrics(dept, agentId),
        getTicketsClosedByDay(dept, agentId),
        getDepartmentPerformance(),
        getLiveChatStatus(dept, agentId),
        getTicketsByChannel(dept, agentId),
      ]);

      if (metricsRes.status === 'fulfilled') {
        setTicketMetrics(metricsRes.value.data);
      }
      if (closedRes.status === 'fulfilled') {
        setTicketsClosedData(closedRes.value.data);
      }
      if (deptPerfRes.status === 'fulfilled') {
        setDepartmentPerformance(deptPerfRes.value.data);
      }
      if (liveChatRes.status === 'fulfilled') {
        setLiveChatStatus(liveChatRes.value.data);
      }
      if (channelRes.status === 'fulfilled') {
        setTicketsByChannel(channelRes.value.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId && userDepartment) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [agentId, userDepartment]);

  const handleNewManualTicket = () => {
    navigate('/ticket-management/create');
  };

  // "View Tickets" navigation helpers
  const handleViewInProgress = () => {
    navigate('/ticket-management?status=In+Progress');
  };
  const handleViewInProgressToday = () => {
    const today = new Date().toISOString().split('T')[0];
    navigate(`/ticket-management?status=In+Progress&date_from=${today}&date_to=${today}`);
  };
  const handleViewClosedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    navigate(`/ticket-management?status=Closed&date_from=${today}&date_to=${today}`);
  };
  const handleViewTotalToday = () => {
    const today = new Date().toISOString().split('T')[0];
    navigate(`/ticket-management?date_from=${today}&date_to=${today}`);
  };

  return (
    <div className="w-full max-w-none">
      <Helmet>
        <title>Agent Dashboard - JKDM CRM Portal</title>
        <meta name="description" content="Agent workspace for managing tickets, customer interactions, and performance metrics" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hello {userName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Let's dive into today's task
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="primary"
                iconName="Plus" 
                iconPosition="left"
                onClick={handleNewManualTicket}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                New Manual Ticket
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <Icon name="AlertTriangle" size={24} className="text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-600">Error Loading Dashboard</h3>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - 4 Metric Cards in 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            <TicketMetricCard
              title="Total in Progress"
              value={ticketMetrics?.total_in_progress || 0}
              bgColor="bg-pink-50"
              textColor="text-pink-600"
              loading={loading}
              onClick={handleViewInProgress}
            />
            <TicketMetricCard
              title="In Progress (of the Day)"
              value={ticketMetrics?.in_progress_today || 0}
              bgColor="bg-blue-50"
              textColor="text-blue-600"
              loading={loading}
              onClick={handleViewInProgressToday}
            />
            <TicketMetricCard
              title="Closed (for the Day)"
              value={ticketMetrics?.closed_today || 0}
              bgColor="bg-blue-50"
              textColor="text-blue-600"
              loading={loading}
              onClick={handleViewClosedToday}
            />
            <TicketMetricCard
              title="Total (of the Day)"
              value={ticketMetrics?.total_today || 0}
              bgColor="bg-pink-50"
              textColor="text-pink-600"
              loading={loading}
              onClick={handleViewTotalToday}
            />
          </div>

          {/* Right Column - Tickets Closed Chart */}
          <div>
            <TicketsClosedChart data={ticketsClosedData} loading={loading} />
          </div>
        </div>

        {/* Bottom Section - Two Equal Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Department Performance Chart */}
          <div>
            <DepartmentPerformanceChart data={departmentPerformance} loading={loading} />
          </div>

          {/* Tickets by Channel Chart */}
          <div>
            <LiveChatStatusChart data={ticketsByChannel} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
