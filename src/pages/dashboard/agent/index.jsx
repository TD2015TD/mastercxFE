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
    const loadUserData = async () => {
      setUserName(currentUser?.name || 'Agent');
      
      // If currentUser doesn't have agent data, try to fetch it
      if (currentUser && !currentUser.agent) {
        console.log('[AgentDashboard] Current user missing agent data, fetching from API...');
        try {
          const { user, agent } = await authService.me();
          if (agent && agent.id) {
            console.log('[AgentDashboard] Fetched agent ID from API:', agent.id);
            setAgentId(agent.id);
            setUserDepartment(agent.department || 'all');
            return;
          }
        } catch (error) {
          console.error('[AgentDashboard] Failed to fetch user data:', error);
        }
      }
      
      setAgentId(currentUser?.agent?.id || null);
      
      console.log('[AgentDashboard] Current user:', currentUser);
      console.log('[AgentDashboard] Has agent:', !!currentUser?.agent);
      console.log('[AgentDashboard] Agent ID:', currentUser?.agent?.id);
      console.log('[AgentDashboard] Set agentId to:', currentUser?.agent?.id || null);
      
      const userSession = localStorage.getItem('user-session');
      if (userSession) {
        try {
          const userData = JSON.parse(userSession);
          const dept = userData.agent?.department || userData.department || 'all';
          setUserDepartment(dept);
          console.log('[AgentDashboard] Parsed user session:', userData);
          console.log('[AgentDashboard] Has agent in session:', !!userData.agent);
          console.log('[AgentDashboard] Agent ID in session:', userData.agent?.id);
        } catch (err) {
          console.error('Error parsing user session:', err);
        }
      }
    };
    
    loadUserData();
  }, [currentUser]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    console.log('[AgentDashboard] fetchDashboardData called with agentId:', agentId, 'userDepartment:', userDepartment);
    
    if (!agentId) {
      console.log('[AgentDashboard] Skipping data fetch because agentId is:', agentId);
      return;
    }
    
    try {
      setLoading(true);
      const dept = userDepartment === 'all' ? null : userDepartment;
      
      // TEMPORARY FIX: Try without department filter
      const deptParam = null; // Force null to test if department is the issue
      
      console.log('[AgentDashboard] Fetching dashboard data with params:', { dept, deptParam, agentId });
      console.log('[AgentDashboard] Using deptParam (null for testing):', deptParam);

      const [metricsRes, closedRes, deptPerfRes, liveChatRes, channelRes] = await Promise.allSettled([
        getTicketMetrics(deptParam, agentId),
        getTicketsClosedByDay(deptParam, agentId),
        getDepartmentPerformance(),
        getLiveChatStatus(deptParam, agentId),
        getTicketsByChannel(deptParam, agentId),
      ]);

      console.log('[AgentDashboard] API Responses:', {
        metricsRes: metricsRes.status === 'fulfilled' ? metricsRes.value.data : metricsRes.reason,
        closedRes: closedRes.status === 'fulfilled' ? closedRes.value.data : closedRes.reason,
      });

      if (metricsRes.status === 'fulfilled') {
        console.log('[AgentDashboard] Setting ticket metrics:', metricsRes.value.data);
        setTicketMetrics(metricsRes.value.data);
      } else {
        console.error('[AgentDashboard] Metrics API failed:', metricsRes.reason);
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

      <div className="w-full max-w-none">
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
