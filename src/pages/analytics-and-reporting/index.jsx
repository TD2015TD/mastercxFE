import { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Can from '../../components/Can';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { getDateRangeBounds } from '../../utils/dateRange';
import { exportToCsv } from '../../utils/exportCsv';
import MetricsOverview from './components/MetricsOverview';
import TicketVolumeChart from './components/TicketVolumeChart';
import SLAPerformanceChart from './components/SLAPerformanceChart';
import AgentPerformanceTable from './components/AgentPerformanceTable';
import AllTicketsTable from './components/AllTicketsTable';
import InteractionsVsTicketTable from './components/InteractionsVsTicketTable';
import ChannelSummaryTable from './components/ChannelSummaryTable';

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year' },
];

const SUPERVISOR_ROLES = ['supervisor', 'admin', 'super_admin'];
const ADMIN_ROLES = ['admin', 'super_admin'];
const CHANNEL_LABELS = { phone: 'Call', email: 'Email', chat: 'Chat', web: 'Web', 'walk-in': 'Walk-in' };

const buildAgentMetricCards = (summary) => [
  { title: 'Total Tickets', value: summary.total_tickets, icon: 'Ticket', color: 'bg-blue-500', description: 'Tickets assigned to you in this period' },
  { title: 'Resolved', value: summary.resolved_tickets, icon: 'CheckCircle', color: 'bg-green-500', description: 'Tickets you resolved or closed' },
  {
    title: 'Total Calls',
    value: summary.calls_data_available ? summary.total_calls : 'N/A',
    icon: 'Phone',
    color: 'bg-cyan-500',
    description: summary.calls_data_available ? `${summary.talk_time_minutes} min talk time` : 'No Mitel call data synced for this agent/period',
  },
  { title: 'SLA Compliance', value: `${summary.sla_compliance_rate}%`, icon: 'Clock', color: summary.sla_compliance_rate >= 95 ? 'bg-green-500' : 'bg-amber-500', description: 'Tickets resolved within SLA' },
  { title: 'Avg Resolution Time', value: `${summary.avg_resolution_time_minutes ?? 0} min`, icon: 'Timer', color: 'bg-amber-500', description: 'Average time to resolve a ticket' },
  { title: 'Avg First Response', value: `${summary.avg_first_response_time_minutes ?? 0} min`, icon: 'Reply', color: 'bg-indigo-500', description: 'Average first response time' },
  { title: 'Customer Satisfaction', value: `${summary.customer_satisfaction ?? 0}/5`, icon: 'Star', color: 'bg-purple-500', description: 'Average rating from customers' },
  {
    title: 'Avg Handle Time (AHT)',
    value: summary.avg_handle_time_min != null ? `${summary.avg_handle_time_min} min` : 'N/A',
    icon: 'Timer',
    color: 'bg-teal-500',
    description: 'Talk time + wrap-up time per call',
  },
  {
    title: 'Avg Speed of Answer (ASA)',
    value: summary.avg_speed_of_answer_sec != null ? `${summary.avg_speed_of_answer_sec}s` : 'N/A',
    icon: 'PhoneIncoming',
    color: 'bg-teal-500',
    description: 'Average time before a call is answered',
  },
  {
    title: 'Occupancy',
    value: summary.occupancy_rate_pct != null ? `${summary.occupancy_rate_pct}%` : 'N/A',
    icon: 'Activity',
    color: 'bg-indigo-500',
    description: '(Talk + wrap-up time) / logged-in time',
  },
  {
    title: 'Abandon Rate',
    value: summary.abandon_data_available ? `${summary.abandon_rate_pct ?? 0}%` : 'N/A',
    icon: 'PhoneMissed',
    color: 'bg-red-500',
    description: summary.abandon_data_available ? 'Share of calls abandoned before answer' : 'No Mitel abandon data synced for this period',
  },
  {
    title: 'First Contact Resolution',
    value: summary.fcr_rate_pct != null ? `${summary.fcr_rate_pct}%` : 'N/A',
    icon: 'CheckCheck',
    color: 'bg-green-600',
    description: 'Resolved tickets never reopened',
  },
];

const buildSupervisorMetricCards = (data) => [
  { title: 'Total Tickets', value: data.summary.total_tickets, icon: 'Ticket', color: 'bg-blue-500', description: `Tickets in ${data.department}` },
  { title: 'Resolved', value: data.summary.resolved_tickets, icon: 'CheckCircle', color: 'bg-green-500', description: 'Tickets resolved or closed' },
  {
    title: 'Total Calls',
    value: data.summary.calls_data_available ? data.summary.total_calls : 'N/A',
    icon: 'Phone',
    color: 'bg-cyan-500',
    description: data.summary.calls_data_available ? `${data.summary.talk_time_minutes} min talk time` : 'No Mitel call data synced for this team/period',
  },
  { title: 'SLA Compliance', value: `${data.summary.sla_compliance_rate}%`, icon: 'Clock', color: data.summary.sla_compliance_rate >= 95 ? 'bg-green-500' : 'bg-amber-500', description: 'Team-wide SLA compliance' },
  { title: 'Avg Resolution Time', value: `${data.summary.avg_resolution_time_minutes ?? 0} min`, icon: 'Timer', color: 'bg-amber-500', description: 'Average time to resolve a ticket' },
  { title: 'Customer Satisfaction', value: `${data.summary.customer_satisfaction ?? 0}/5`, icon: 'Star', color: 'bg-purple-500', description: 'Average rating from customers' },
  { title: 'Active Agents', value: data.agent_performance?.length ?? 0, icon: 'Users', color: 'bg-indigo-500', description: `Agents in ${data.department}` },
  {
    title: 'Avg Handle Time (AHT)',
    value: data.summary.avg_handle_time_min != null ? `${data.summary.avg_handle_time_min} min` : 'N/A',
    icon: 'Timer',
    color: 'bg-teal-500',
    description: 'Talk time + wrap-up time per call',
  },
  {
    title: 'Avg Speed of Answer (ASA)',
    value: data.summary.avg_speed_of_answer_sec != null ? `${data.summary.avg_speed_of_answer_sec}s` : 'N/A',
    icon: 'PhoneIncoming',
    color: 'bg-teal-500',
    description: 'Average time before a call is answered',
  },
  {
    title: 'Occupancy',
    value: data.summary.occupancy_rate_pct != null ? `${data.summary.occupancy_rate_pct}%` : 'N/A',
    icon: 'Activity',
    color: 'bg-indigo-500',
    description: '(Talk + wrap-up time) / logged-in time',
  },
  {
    title: 'Abandon Rate',
    value: data.summary.abandon_data_available ? `${data.summary.abandon_rate_pct ?? 0}%` : 'N/A',
    icon: 'PhoneMissed',
    color: 'bg-red-500',
    description: data.summary.abandon_data_available ? 'Share of calls abandoned before answer' : 'No Mitel abandon data synced for this period',
  },
  {
    title: 'First Contact Resolution',
    value: data.summary.fcr_rate_pct != null ? `${data.summary.fcr_rate_pct}%` : 'N/A',
    icon: 'CheckCheck',
    color: 'bg-green-600',
    description: 'Resolved tickets never reopened',
  },
];

const AnalyticsAndReporting = () => {
  const { user } = useAuth();
  const roleSlug = user?.role?.slug;
  const isSupervisorOrAbove = SUPERVISOR_ROLES.includes(roleSlug);
  const isAdminOrAbove = ADMIN_ROLES.includes(roleSlug);
  const agentId = user?.agent?.id;
  const ownDepartment = user?.agent?.department;

  const [dateRange, setDateRange] = useState('last_7_days');
  const [department, setDepartment] = useState(ownDepartment || '');
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricCards, setMetricCards] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [slaSummary, setSlaSummary] = useState(null);
  const [slaByPriority, setSlaByPriority] = useState(null);

  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsData, setTicketsData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [ticketsExporting, setTicketsExporting] = useState(false);

  const [channelReportsLoading, setChannelReportsLoading] = useState(true);
  const [interactionsData, setInteractionsData] = useState([]);
  const [channelSummaryData, setChannelSummaryData] = useState([]);

  // Supervisors/admins can pick a department; agents are scoped to their own.
  useEffect(() => {
    if (!isSupervisorOrAbove) return;
    api.get('/dashboard/departments')
      .then((res) => {
        const depts = res?.data?.data || [];
        setDepartmentOptions(depts.map((d) => ({ value: d, label: d })));
        // Admins/super_admins default to "All Departments" (empty). Supervisors default to
        // their own department, falling back to the first available one.
        if (!isAdminOrAbove && !department && depts.length > 0) {
          setDepartment(ownDepartment && depts.includes(ownDepartment) ? ownDepartment : depts[0]);
        }
      })
      .catch(() => setDepartmentOptions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupervisorOrAbove]);

  const fetchReports = useCallback(async () => {
    if (isSupervisorOrAbove && !isAdminOrAbove && !department) return;
    if (!isSupervisorOrAbove && !agentId) return;

    setLoading(true);
    setError(null);

    const { start_date, end_date } = getDateRangeBounds(dateRange);
    const scopeParams = isSupervisorOrAbove ? { department } : { agent_id: agentId };

    try {
      const [summaryRes, volumeRes, slaRes] = await Promise.all([
        isSupervisorOrAbove
          ? api.get('/reports/supervisor-metrics', { params: { department, start_date, end_date } })
          : api.get('/reports/agent-metrics', { params: { agent_id: agentId, start_date, end_date } }),
        api.get('/reports/ticket-volume', { params: { ...scopeParams, start_date, end_date, group_by: 'day' } }),
        api.get('/reports/sla-compliance', { params: { ...scopeParams, start_date, end_date } }),
      ]);

      const summaryData = summaryRes.data.data;
      setMetricCards(isSupervisorOrAbove ? buildSupervisorMetricCards(summaryData) : buildAgentMetricCards(summaryData.summary));
      setAgentPerformance(isSupervisorOrAbove ? summaryData.agent_performance : []);
      setVolumeData(volumeRes.data.data.volume || []);
      setSlaSummary(slaRes.data.data.summary);
      setSlaByPriority(slaRes.data.data.by_priority);
    } catch (err) {
      console.error('Failed to load analytics & reporting data', err);
      setError(err?.response?.data?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, [isSupervisorOrAbove, department, agentId, dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset to page 1 whenever the scope (date range / department / agent) changes.
  useEffect(() => {
    setTicketsPage(1);
  }, [isSupervisorOrAbove, department, agentId, dateRange]);

  useEffect(() => {
    if (isSupervisorOrAbove && !isAdminOrAbove && !department) return;
    if (!isSupervisorOrAbove && !agentId) return;

    const { start_date, end_date } = getDateRangeBounds(dateRange);
    const scopeParams = isSupervisorOrAbove ? { department } : { agent_id: agentId };

    setTicketsLoading(true);
    api.get('/reports/all-tickets', { params: { ...scopeParams, start_date, end_date, page: ticketsPage, per_page: 10 } })
      .then((res) => setTicketsData(res.data.data))
      .catch((err) => console.error('Failed to load ticket listing', err))
      .finally(() => setTicketsLoading(false));
  }, [isSupervisorOrAbove, department, agentId, dateRange, ticketsPage]);

  const handleExportAllTickets = async () => {
    if (isSupervisorOrAbove && !isAdminOrAbove && !department) return;
    if (!isSupervisorOrAbove && !agentId) return;

    const { start_date, end_date } = getDateRangeBounds(dateRange);
    const scopeParams = isSupervisorOrAbove ? { department } : { agent_id: agentId };

    setTicketsExporting(true);
    try {
      const res = await api.get('/reports/all-tickets', { params: { ...scopeParams, start_date, end_date, page: 1, per_page: 5000 } });
      const allTickets = res.data.data.data || [];
      const rows = [
        ['Ticket ID', 'Channel', 'Created', 'Closed', 'Status', 'Agent', 'Category', 'Priority'],
        ...allTickets.map((t) => [
          t.ticket_id,
          CHANNEL_LABELS[t.channel] || t.channel,
          t.created_at ? new Date(t.created_at).toLocaleString() : '',
          t.closed_at ? new Date(t.closed_at).toLocaleString() : '',
          t.status,
          t.agent_name || 'Unassigned',
          t.category || '',
          t.priority || '',
        ]),
      ];
      exportToCsv(rows, 'all-tickets');
    } catch (err) {
      console.error('Failed to export tickets', err);
    } finally {
      setTicketsExporting(false);
    }
  };

  // Interactions-vs-Ticket and Summary-by-Channel are org-wide management reports (not scoped
  // by department/agent) — supervisor/admin only.
  useEffect(() => {
    if (!isSupervisorOrAbove) return;

    const { start_date, end_date } = getDateRangeBounds(dateRange);
    setChannelReportsLoading(true);

    Promise.all([
      api.get('/reports/interactions-vs-ticket', { params: { start_date, end_date } }),
      api.get('/reports/channel-summary', { params: { start_date, end_date } }),
    ])
      .then(([interactionsRes, summaryRes]) => {
        setInteractionsData(interactionsRes.data.data.channels || []);
        setChannelSummaryData(summaryRes.data.data.channels || []);
      })
      .catch((err) => console.error('Failed to load channel reports', err))
      .finally(() => setChannelReportsLoading(false));
  }, [isSupervisorOrAbove, dateRange]);

  const periodLabel = useMemo(() => DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label, [dateRange]);

  return (
    <>
      <Helmet>
        <title>Analytics & Reporting - JKDM CRM</title>
        <meta name="description" content="Agent self-report and supervisor team reporting" />
      </Helmet>

      <Can
        permission="report.view"
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-8 text-center max-w-md">
              <Icon name="Lock" size={48} className="text-amber-600 dark:text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You do not have permission to view reports and analytics.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-background">
          <div className="bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-6">
                <BreadcrumbNavigation
                  customBreadcrumbs={[
                    { label: 'Dashboard', path: isSupervisorOrAbove ? '/supervisor-dashboard' : '/agent-dashboard' },
                    { label: 'Analytics & Reporting', path: '/analytics-and-reporting', isActive: true },
                  ]}
                />

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">
                      {isSupervisorOrAbove ? 'Team Analytics & Reporting' : 'My Performance Report'}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                      {isSupervisorOrAbove
                        ? (isAdminOrAbove && !department ? 'Organization-wide ticket, SLA and agent performance insights' : 'Team-wide ticket, SLA and agent performance insights')
                        : 'Your own ticket, SLA and resolution performance'}
                    </p>
                  </div>

                  <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-3">
                      <Select options={DATE_RANGE_OPTIONS} value={dateRange} onChange={setDateRange} className="w-40" />
                      {isSupervisorOrAbove && departmentOptions.length > 0 && (
                        <Select
                          options={isAdminOrAbove ? [{ value: '', label: 'All Departments' }, ...departmentOptions] : departmentOptions}
                          value={department}
                          onChange={setDepartment}
                          className="w-48"
                        />
                      )}
                    </div>

                    <Button variant="outline" iconName="RefreshCw" iconPosition="left" loading={loading} onClick={fetchReports} size="sm">
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{error}</div>
            )}

            <MetricsOverview metrics={metricCards} loading={loading} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <TicketVolumeChart data={volumeData} loading={loading} timeframe={dateRange} onTimeframeChange={setDateRange} />
              <SLAPerformanceChart summary={slaSummary} byPriority={slaByPriority} loading={loading} />
            </div>

            {isSupervisorOrAbove && (
              <AgentPerformanceTable agents={agentPerformance} loading={loading} periodLabel={periodLabel} />
            )}

            <AllTicketsTable
              page={ticketsData.current_page}
              lastPage={ticketsData.last_page}
              total={ticketsData.total}
              tickets={ticketsData.data}
              loading={ticketsLoading}
              onPageChange={setTicketsPage}
              onExport={handleExportAllTickets}
              exporting={ticketsExporting}
            />

            {isSupervisorOrAbove && (
              <>
                <InteractionsVsTicketTable channels={interactionsData} loading={channelReportsLoading} />
                <ChannelSummaryTable channels={channelSummaryData} loading={channelReportsLoading} />
              </>
            )}
          </div>
        </div>
      </Can>
    </>
  );
};

export default AnalyticsAndReporting;
