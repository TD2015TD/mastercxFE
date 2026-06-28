import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { getChatbotHealthReport } from '../../../services/chatbotHealthService';
import api from '../../../services/api';

const StatusBadge = ({ status }) => {
  const map = {
    queuing:     { label: 'Queuing',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    active:      { label: 'Active',    color: 'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300'  },
    closed:      { label: 'Closed',    color: 'bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400'   },
    abandoned:   { label: 'Abandoned', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    connected:   { label: 'Connected',   color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    unreachable: { label: 'Unreachable', color: 'bg-red-100   text-red-800   dark:bg-red-900/30   dark:text-red-300'   },
    error:       { label: 'Error',       color: 'bg-red-100   text-red-800   dark:bg-red-900/30   dark:text-red-300'   },
  };
  const cfg = map[status] ?? { label: status, color: 'bg-muted text-muted-foreground' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub, color = 'text-primary' }) => (
  <div className="bg-card rounded-lg border border-border p-5 flex items-start justify-between">
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon name={icon} size={20} className={color} />
    </div>
  </div>
);

const IntegrationRow = ({ label, status }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
    <span className="text-sm text-foreground">{label}</span>
    <StatusBadge status={status} />
  </div>
);

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-MY', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const SessionDetailModal = ({ interactionId, onClose }) => {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/admin/chatbot/session/${encodeURIComponent(interactionId)}`)
      .then(r => { if (!cancelled) setDetail(r.data); })
      .catch(() => { if (!cancelled) setError('Failed to load session.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [interactionId]);

  const msgBubble = (msg, i) => {
    const isAgent = msg.sender === 'agent';
    const isBot   = msg.sender === 'bot';
    const isUser  = !isAgent && !isBot;
    const align   = isUser ? 'justify-end' : 'justify-start';
    const bg      = isAgent ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
                  : isBot   ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  :           'bg-primary text-primary-foreground';
    const name    = msg.sender_name || (isAgent ? 'Agent' : isBot ? 'Bot' : 'Customer');
    return (
      <div key={i} className={`flex ${align}`}>
        <div className={`max-w-[75%] rounded-xl px-3 py-2 ${bg}`}>
          <p className="text-[11px] font-semibold opacity-70 mb-0.5">{name}</p>
          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
          {msg.created_at && (
            <p className="text-[10px] opacity-50 mt-0.5 text-right">{formatDate(msg.created_at)}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" />

      {/* Drawer — slides in from the right */}
      <div
        className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Icon name="MessageSquare" size={18} />
            Chat Session Detail
          </h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
            <Icon name="X" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <Icon name="Loader2" size={28} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center text-sm text-destructive px-6 text-center">{error}</div>
        )}

        {detail && !loading && (
          <>
            {/* Info grid */}
            <div className="px-5 py-4 border-b border-border shrink-0 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Customer</span><p className="font-medium mt-0.5">{detail.customer_name || '—'}</p></div>
              <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Status</span><p className="mt-0.5"><StatusBadge status={detail.status} /></p></div>
              <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Phone</span><p className="mt-0.5">{detail.customer_phone || '—'}</p></div>
              <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Email</span><p className="mt-0.5 break-all">{detail.customer_email || '—'}</p></div>
              <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Topic</span><p className="mt-0.5">{detail.topic || '—'}</p></div>
              <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Agent</span><p className="mt-0.5">{detail.agent_name || '—'}</p></div>
              <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Queue</span><p className="mt-0.5">{detail.queue_name || '—'}</p></div>
              <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Started</span><p className="mt-0.5">{formatDate(detail.created_at)}</p></div>
              {detail.faq_path && (
                <div className="col-span-2"><span className="text-muted-foreground text-xs uppercase tracking-wide">FAQ Path</span><p className="mt-0.5 text-xs break-words">{detail.faq_path}</p></div>
              )}
            </div>

            {/* Transcript label */}
            <div className="px-5 pt-3 pb-1 shrink-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Transcript ({(detail.messages || []).length} messages)</p>
            </div>

            {/* Chat transcript */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
              {(!detail.messages || detail.messages.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-10">No messages recorded for this session.</p>
              ) : (
                detail.messages.map((msg, i) => msgBubble(msg, i))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const todayIso = () => new Date().toISOString().split('T')[0];
const daysAgoIso = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const ChatbotLivechatHealth = () => {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [dateFrom, setDateFrom] = useState(daysAgoIso(30));
  const [dateTo, setDateTo]     = useState(todayIso());
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedSession, setSelectedSession] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getChatbotHealthReport({ date_from: dateFrom, date_to: dateTo });
      if (res.success) {
        setReport(res.data);
      } else {
        setError('Failed to load report data.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to fetch report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const sections = [
    { id: 'overview',    label: 'Overview',         icon: 'LayoutDashboard' },
    { id: 'sessions',    label: 'Recent Sessions',   icon: 'MessageSquare'  },
    { id: 'topics',      label: 'Top Topics',        icon: 'Tag'            },
    { id: 'integration', label: 'Integration Status',icon: 'Link'           },
  ];

  const cb  = report?.chatbot;
  const lc  = report?.livechat;
  const int = report?.integration;

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="HeartPulse" size={22} />
              Chatbot / Livechat Health
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Integration reporting for CRM chatbot and livechat channels
            </p>
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-muted-foreground">From</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={e => setDateFrom(e.target.value)}
              className="text-sm border border-border rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <label className="text-sm text-muted-foreground">To</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={todayIso()}
              onChange={e => setDateTo(e.target.value)}
              className="text-sm border border-border rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Icon name="RefreshCw" size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <Icon name="AlertCircle" size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-5 animate-pulse h-24" />
          ))}
        </div>
      )}

      {report && (
        <>
          {/* KPI row — Chatbot */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Chatbot Channel
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="Bot"           label="Total Sessions"      value={cb.total_sessions}   sub={`${cb.today_sessions} today`} color="text-primary" />
              <StatCard icon="Users"         label="Escalated to Agent"  value={cb.escalated}        sub={`${cb.escalation_rate}% escalation rate`} color="text-blue-600" />
              <StatCard
                icon="Timer"
                label="Avg Session Duration"
                value={cb.avg_session_mins != null
                  ? cb.avg_session_mins >= 60
                    ? `${(cb.avg_session_mins / 60).toFixed(1)}h`
                    : `${cb.avg_session_mins}m`
                  : 'N/A'}
                sub="closed sessions · created → updated"
                color="text-orange-600"
              />
              <StatCard icon="MessageCircle" label="Agent Messages Sent" value={cb.total_messages}   sub="by agents only" color="text-purple-600" />
            </div>
          </div>

          {/* KPI row — Livechat */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Livechat / CRM Tickets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="Ticket"      label="Total Tickets"    value={lc.total_tickets}    color="text-primary" />
              <StatCard icon="CheckCircle" label="Resolved"         value={lc.resolved_tickets}  sub={`${lc.resolution_rate}% resolution rate`} color="text-green-600" />
              <StatCard icon="AlertCircle" label="Active Queue"      value={cb.queuing}           sub="sessions waiting for agent" color="text-orange-600" />
              <StatCard
                icon="Timer"
                label="Average Resolution Time"
                value={lc.avg_resolution_mins != null
                  ? lc.avg_resolution_mins >= 60
                    ? `${(lc.avg_resolution_mins / 60).toFixed(1)}h`
                    : `${lc.avg_resolution_mins}m`
                  : 'N/A'}
                sub="escalation → session closed (agent sessions)"
                color="text-cyan-600"
              />
            </div>
          </div>

          {/* Section sub-tabs */}
          <div className="bg-card rounded-lg border border-border">
            <div className="border-b border-border">
              <nav className="flex gap-6 px-6" aria-label="Health sections">
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-2 py-3.5 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeSection === s.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <Icon name={s.icon} size={16} />
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview — daily trend */}
              {activeSection === 'overview' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Daily Session Trend</h4>
                  {cb.daily_trend.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No session data for this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="pb-2 pr-6 font-medium text-muted-foreground">Date</th>
                            <th className="pb-2 pr-6 font-medium text-muted-foreground">Total Sessions</th>
                            <th className="pb-2 font-medium text-muted-foreground">Escalated to Agent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cb.daily_trend.map(row => (
                            <tr key={row.date} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                              <td className="py-2 pr-6 text-foreground font-medium">{row.date}</td>
                              <td className="py-2 pr-6 text-foreground">{row.total}</td>
                              <td className="py-2 text-blue-600">{row.escalated}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Sessions */}
              {activeSection === 'sessions' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Recent 20 Sessions</h4>
                  {cb.recent_sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sessions found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="pb-2 pr-4 font-medium text-muted-foreground">Customer</th>
                            <th className="pb-2 pr-4 font-medium text-muted-foreground">Topic</th>
                            <th className="pb-2 pr-4 font-medium text-muted-foreground">Status</th>
                            <th className="pb-2 pr-4 font-medium text-muted-foreground">Agent</th>
                            <th className="pb-2 font-medium text-muted-foreground">Started</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cb.recent_sessions.map(s => (
                            <tr
                              key={s.interaction_id}
                              className="border-b border-border/50 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => setSelectedSession(s.interaction_id)}
                            >
                              <td className="py-2 pr-4 text-foreground font-medium">{s.customer_name}</td>
                              <td className="py-2 pr-4 text-muted-foreground max-w-[160px] truncate">{s.topic ?? '—'}</td>
                              <td className="py-2 pr-4"><StatusBadge status={s.status} /></td>
                              <td className="py-2 pr-4 text-muted-foreground">{s.agent_name ?? '—'}</td>
                              <td className="py-2 text-muted-foreground whitespace-nowrap">{formatDate(s.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Top Topics */}
              {activeSection === 'topics' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Top FAQ Topics Requested</h4>
                  {cb.top_topics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No topic data for this period.</p>
                  ) : (
                    <div className="space-y-2">
                      {cb.top_topics.map((t, i) => {
                        const max = cb.top_topics[0]?.count || 1;
                        const pct = Math.round((t.count / max) * 100);
                        return (
                          <div key={t.topic} className="flex items-center gap-3">
                            <span className="w-5 text-xs text-muted-foreground text-right">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm text-foreground">{t.topic}</span>
                                <span className="text-sm font-semibold text-foreground">{t.count}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Integration Status */}
              {activeSection === 'integration' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Service Connectivity</h4>
                    <div className="bg-muted/30 rounded-lg border border-border px-4">
                      <IntegrationRow label="Database (CRM)"       status={int.database} />
                      <IntegrationRow label="Chat / WebSocket Service" status={int.chat_service} />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="Info" size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">About this report</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          This dashboard aggregates data from chatbot sessions (citizen portal escalations),
                          chat messages, and CRM livechat tickets. The chat service connectivity check is a
                          lightweight HTTP probe — WebSocket functionality is not fully validated here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>

    {selectedSession && (
      <SessionDetailModal
        interactionId={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    )}
    </>
  );
};

export default ChatbotLivechatHealth;
