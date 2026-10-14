import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CHANNEL_LABELS = { phone: 'Call', email: 'Email', chat: 'Chat', web: 'Web', 'walk-in': 'Walk-in' };

const AllTicketsTable = ({ page, lastPage, total, tickets, loading, onPageChange, onExport, exporting }) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">All Tickets</h3>
          <p className="text-sm text-muted-foreground">Complete ticket listing for the selected period</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">{total} ticket{total === 1 ? '' : 's'}</span>
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left" onClick={onExport} loading={exporting} disabled={!total}>
            Export All
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse" />
      ) : !tickets || tickets.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">No tickets in this period.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Closed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Impact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {tickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-muted/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{t.ticket_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{CHANNEL_LABELS[t.channel] || t.channel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{t.closed_at ? new Date(t.closed_at).toLocaleString() : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{t.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{t.agent_name || 'Unassigned'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{t.category || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{t.urgency || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{t.impact || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{t.priority || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {page} of {lastPage}</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="ChevronLeft" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                Prev
              </Button>
              <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllTicketsTable;
