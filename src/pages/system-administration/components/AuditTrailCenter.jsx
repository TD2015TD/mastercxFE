import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { getAuditLogs, exportAuditLogs } from '../../../services/systemService';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Authentication', label: 'Authentication' },
  { value: 'Knowledge Base', label: 'Knowledge Base' },
  { value: 'User Management', label: 'User Management' },
  { value: 'Ticket Management', label: 'Ticket Management' },
];

const SEVERITIES = [
  { value: '', label: 'All Severities' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
];

const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

function presetToDates(preset) {
  const now = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  switch (preset) {
    case 'today':     return { date_from: fmt(now), date_to: fmt(now) };
    case 'yesterday': { const y = new Date(now); y.setDate(y.getDate() - 1); return { date_from: fmt(y), date_to: fmt(y) }; }
    case 'last7':     { const s = new Date(now); s.setDate(s.getDate() - 6); return { date_from: fmt(s), date_to: fmt(now) }; }
    case 'last30':    { const s = new Date(now); s.setDate(s.getDate() - 29); return { date_from: fmt(s), date_to: fmt(now) }; }
    default:          return {};
  }
}

const SEVERITY_STYLES = {
  info:     'bg-blue-100 text-blue-800',
  warning:  'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
};

const SEVERITY_ICONS = {
  info:     'Info',
  warning:  'AlertTriangle',
  critical: 'AlertCircle',
};

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString('en-MY', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const AuditTrailCenter = () => {
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [severity, setSeverity]     = useState('');
  const [datePreset, setDatePreset] = useState('today');

  const [logs, setLogs]         = useState([]);
  const [meta, setMeta]         = useState({ current_page: 1, last_page: 1, total: 0 });
  const [summary, setSummary]   = useState({ info: 0, warning: 0, critical: 0 });
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage]         = useState(1);

  const buildFilters = useCallback(() => {
    const dates = presetToDates(datePreset);
    return { search: search || undefined, category: category || undefined, severity: severity || undefined, page, per_page: 20, ...dates };
  }, [search, category, severity, datePreset, page]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs(buildFilters());
      if (res.success) {
        setLogs(res.data || []);
        setMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
        setSummary(res.summary || { info: 0, warning: 0, critical: 0 });
      }
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, category, severity, datePreset]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAuditLogs(buildFilters(), 'csv');
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Audit Trail Center</h3>
            <p className="text-sm text-muted-foreground">Comprehensive activity logging and compliance monitoring</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" iconName="Download" iconPosition="left" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting…' : 'Export CSV'}
            </Button>
            <Button variant="default" iconName="RefreshCw" iconPosition="left" onClick={fetchLogs} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="search"
            placeholder="Search action, details, user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            placeholder="Filter by category"
            options={CATEGORIES}
            value={category}
            onChange={setCategory}
          />
          <Select
            placeholder="Filter by severity"
            options={SEVERITIES}
            value={severity}
            onChange={setSeverity}
          />
          <Select
            placeholder="Date range"
            options={DATE_PRESETS}
            value={datePreset}
            onChange={setDatePreset}
          />
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="Info" size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-blue-900">{summary.info.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Info Events</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-yellow-900">{summary.warning.toLocaleString()}</p>
                <p className="text-sm text-yellow-600">Warnings</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon name="AlertCircle" size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-red-900">{summary.critical.toLocaleString()}</p>
                <p className="text-sm text-red-600">Critical</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Icon name="FileSearch" size={40} className="mx-auto mb-3 opacity-40" />
              <p>No audit events found for the selected filters.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Details</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Severity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm text-foreground font-mono whitespace-nowrap">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-foreground">{log.user_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{log.user_role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Icon name={SEVERITY_ICONS[log.severity] || 'Info'} size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground">{log.action}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{log.category}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-sm text-foreground truncate" title={log.details}>{log.details}</p>
                      <p className="text-xs text-muted-foreground">{log.module}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${SEVERITY_STYLES[log.severity] || SEVERITY_STYLES.info}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{log.ip_address ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && meta.total > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing page {meta.current_page} of {meta.last_page} — {meta.total.toLocaleString()} total entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronLeft"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm px-2">{meta.current_page} / {meta.last_page}</span>
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronRight"
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrailCenter;
