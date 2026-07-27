import React from 'react';
import Button from '../../../components/ui/Button';
import { exportToCsv } from '../../../utils/exportCsv';

const fmt = (value, available, suffix = '') => {
  if (!available || value == null) return <span className="text-muted-foreground">N/A</span>;
  return `${value.toLocaleString()}${suffix}`;
};

const rawFmt = (value, available) => (available && value != null ? value : 'N/A');

const ChannelSummaryTable = ({ channels, loading }) => {
  const handleExport = () => {
    const rows = [
      ['Channel', 'Offered', 'Handled', 'Abandoned', 'Tickets', 'SLA %'],
      ...(channels || []).map((c) => [
        c.channel,
        rawFmt(c.offered, c.offered_available),
        rawFmt(c.handled, c.handled_available),
        rawFmt(c.abandoned, c.handled_available),
        c.tickets,
        c.sla_pct != null ? c.sla_pct : 'N/A',
      ]),
    ];
    exportToCsv(rows, 'summary-by-channel');
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Summary by Channel</h3>
          <p className="text-sm text-muted-foreground">High-level performance summary across Call, Email and Chat</p>
        </div>
        <Button variant="outline" size="sm" iconName="Download" iconPosition="left" onClick={handleExport} disabled={!channels?.length}>
          Export
        </Button>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Offered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Handled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Abandoned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SLA %</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {(channels || []).map((c) => (
                <tr key={c.channel}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{c.channel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{fmt(c.offered, c.offered_available)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{fmt(c.handled, c.handled_available)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{fmt(c.abandoned, c.handled_available)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{c.tickets.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{fmt(c.sla_pct, c.sla_pct != null, '%')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-6 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        Call: Offered = calls presented to the voice queue (Mitel) — Handled/Abandoned unavailable, not tracked at the Mitel source for this queue.
        Email/Chat: Offered/Handled/Abandoned from Mitel queue data; Tickets/SLA from the CRM.
      </div>
    </div>
  );
};

export default ChannelSummaryTable;
