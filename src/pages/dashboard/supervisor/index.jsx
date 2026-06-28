import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import TicketMetricCard from './components/TicketMetricCard';
import TicketsClosedChart from './components/TicketsClosedChart';
import DepartmentPerformanceChart from './components/DepartmentPerformanceChart';
import LiveChatStatusChart from './components/LiveChatStatusChart';
import {
  getTicketMetrics,
  getTicketsClosedByDay,
  getDepartmentPerformance,
  getLiveChatStatus,
  getTicketsByChannel,
  getDepartments,
} from '../../../services/dashboardService';
import { authService } from '../../../services/authService';
import { agentService } from '../../../services/agentService';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userDepartment, setUserDepartment] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Dashboard data
  const [ticketMetrics, setTicketMetrics] = useState(null);
  const [ticketsClosedData, setTicketsClosedData] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [liveChatStatus, setLiveChatStatus] = useState(null);
  const [ticketsByChannel, setTicketsByChannel] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Get current user info
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setUserName(user?.name || 'User');
    
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
  }, []);

  // Fetch agents + departments for filter dropdowns
  useEffect(() => {
    agentService.getAgents({ status: 'active', per_page: 200 })
      .then(res => {
        const list = res?.data?.data ?? res?.data ?? res ?? [];
        setAgents(Array.isArray(list) ? list : []);
      })
      .catch(() => setAgents([]));

    getDepartments()
      .then(list => setDepartments(Array.isArray(list) ? list : []))
      .catch(() => setDepartments([]));
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dept = userDepartment === 'all' ? null : userDepartment;
      const agentId = selectedAgent === 'all' ? null : selectedAgent;

      const [metricsRes, closedRes, deptPerfRes, liveChatRes, channelRes] = await Promise.allSettled([
        getTicketMetrics(dept, agentId, dateFrom, dateTo),
        getTicketsClosedByDay(dept, agentId),
        getDepartmentPerformance(dateFrom, dateTo),
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
    if (userDepartment) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [userDepartment]);

  const handleApplyFilters = () => {
    fetchDashboardData();
  };

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
    <>
      <Helmet>
        <title>Supervisor Dashboard - JKDM CRM</title>
        <meta name="description" content="Supervisor dashboard for monitoring team performance and ticket metrics" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <main className="w-full max-w-none">
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

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
            <div className="flex flex-wrap justify-end items-end gap-4">
              {/* Date From */}
              <div className="w-44">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Date To */}
              <div className="w-44">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Agent */}
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.user?.name || agent.agent_code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="w-44">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={userDepartment}
                  onChange={(e) => setUserDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Apply + Clear */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); setSelectedAgent('all'); setUserDepartment('all'); }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-6"
                >
                  Apply Filter
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
        </main>
      </div>
    </>
  );
};

export default SupervisorDashboard;
