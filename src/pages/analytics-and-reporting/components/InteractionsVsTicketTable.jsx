import React from 'react';
import Button from '../../../components/ui/Button';
import { exportToCsv } from '../../../utils/exportCsv';

const InteractionsVsTicketTable = ({ channels, loading }) => {
  const handleExport = () => {
    const rows = [
      ['Channel', 'Interactions', 'Tickets', 'Conversion Rate (%)'],
      ...(channels || []).map((c) => [
        c.channel,
        c.interactions_available ? c.interactions : 'N/A',
        c.tickets,
        c.conversion_rate_pct != null ? c.conversion_rate_pct : 'N/A',
      ]),
    ];
    exportToCsv(rows, 'interactions-vs-ticket');
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Interactions vs Ticket</h3>
          <p className="text-sm text-muted-foreground">Total interactions per channel compared to tickets created</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Interactions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {(channels || []).map((c) => (
                <tr key={c.channel}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{c.channel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {c.interactions_available ? c.interactions.toLocaleString() : <span className="text-muted-foreground">N/A</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{c.tickets.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {c.conversion_rate_pct != null ? `${c.conversion_rate_pct}%` : <span className="text-muted-foreground">N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-6 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        Call interactions = calls presented to the voice queue (Mitel). Email/Chat interactions = inbound emails received / chat sessions started (CRM).
      </div>
    </div>
  );
};

export default InteractionsVsTicketTable;
