import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import type { SupersetDashboard } from '../../../types/superset';
import api from '../../../services/api';
import { usePermission } from '../../../components/Can';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ReportGeneratorProps {
  dashboards: SupersetDashboard[];
  loading: boolean;
  onViewReport: (dashboard: SupersetDashboard, filters: ReportFilters) => void;
}

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  department: string;
  preset: string;
}

// ─── Date preset helpers ──────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};
const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
};
const startOfYear = () => {
  const d = new Date();
  d.setMonth(0, 1);
  return d.toISOString().split('T')[0];
};

const DATE_PRESETS = [
  { label: 'Hari ini',       value: 'today',        from: () => today(),        to: () => today() },
  { label: '7 hari lepas',   value: 'last7',        from: () => daysAgo(6),     to: () => today() },
  { label: '30 hari lepas',  value: 'last30',       from: () => daysAgo(29),    to: () => today() },
  { label: 'Bulan ini',      value: 'thisMonth',    from: () => startOfMonth(), to: () => today() },
  { label: 'Tahun ini',      value: 'thisYear',     from: () => startOfYear(),  to: () => today() },
  { label: 'Pilihan sendiri',value: 'custom',       from: () => '',             to: () => '' },
];

const DEPARTMENTS = ['Semua Jabatan', 'BMC', 'TOC'];

// ─── Component ────────────────────────────────────────────────────────────────
const ReportGenerator: React.FC<ReportGeneratorProps> = ({ dashboards, loading, onViewReport }) => {
  const { can } = usePermission();
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | ''>('');
  const [preset, setPreset]         = useState('last7');
  const [dateFrom, setDateFrom]     = useState(daysAgo(6));
  const [dateTo, setDateTo]         = useState(today());
  const [department, setDepartment] = useState('Semua Jabatan');
  const [exporting, setExporting]   = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const selectedDashboard = dashboards.find(d => d.id === selectedDashboardId) ?? null;

  // ── Apply date preset ──────────────────────────────────────────────────────
  const applyPreset = (value: string) => {
    setPreset(value);
    const p = DATE_PRESETS.find(p => p.value === value);
    if (p && value !== 'custom') {
      setDateFrom(p.from());
      setDateTo(p.to());
    }
  };

  // ── Build filters object ───────────────────────────────────────────────────
  const buildFilters = (): ReportFilters => ({
    dateFrom,
    dateTo,
    department: department === 'Semua Jabatan' ? '' : department,
    preset,
  });

  // ── View report ────────────────────────────────────────────────────────────
  const handleView = () => {
    if (!selectedDashboard) return;
    onViewReport(selectedDashboard, buildFilters());
  };

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!selectedDashboard) return;
    setExporting(true);
    setExportError(null);

    try {
      const response = await api.post(
        '/superset/export-pdf',
        { dashboard_id: selectedDashboard.superset_id },
        { responseType: 'blob', timeout: 60_000 }
      );

      // If the server returned a real PDF blob
      const contentType: string = response.headers?.['content-type'] ?? '';
      if (contentType.includes('pdf')) {
        const url  = URL.createObjectURL(response.data as Blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `${selectedDashboard.title}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }

      // Otherwise server returned JSON with a redirect URL
      const text = await (response.data as Blob).text();
      const json = JSON.parse(text);
      if (json.print_url) {
        window.open(json.print_url, '_blank', 'noopener');
      } else {
        setExportError('Gagal menjana PDF. Sila cuba semula.');
      }
    } catch {
      setExportError('Gagal menjana PDF. Sila cuba semula.');
    } finally {
      setExporting(false);
    }
  };

  const canGenerate = !!selectedDashboard && !!dateFrom && !!dateTo;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm mb-8">
      {/* Panel header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="FileBarChart" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Jana Laporan</h2>
          <p className="text-xs text-muted-foreground">Pilih laporan, tetapkan tarikh, dan jana terus dari Superset</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Row 1 — Report type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Jenis Laporan <span className="text-destructive">*</span>
            </label>
            {loading ? (
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            ) : (
              <select
                value={selectedDashboardId}
                onChange={e => setSelectedDashboardId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Pilih laporan --</option>
                {dashboards.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Jabatan</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Date preset */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tempoh</label>
            <select
              value={preset}
              onChange={e => applyPreset(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {DATE_PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 — Date range (always shown; editable when preset=custom) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tarikh Mula</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setPreset('custom'); setDateFrom(e.target.value); }}
              max={dateTo || today()}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tarikh Akhir</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setPreset('custom'); setDateTo(e.target.value); }}
              min={dateFrom}
              max={today()}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleView}
              disabled={!canGenerate}
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="Eye" size={16} />
              Lihat Laporan
            </button>
            {can('report.export') && (
              <button
                onClick={handleExport}
                disabled={!canGenerate || exporting}
                className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name={exporting ? 'Loader' : 'Download'} size={16} className={exporting ? 'animate-spin' : ''} />
                {exporting ? 'Menjana...' : 'Export PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Export error */}
        {exportError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-2">
            <Icon name="AlertCircle" size={16} />
            {exportError}
          </div>
        )}

        {/* Selected dashboard preview strip */}
        {selectedDashboard && (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            {selectedDashboard.icon && (
              <div className="w-8 h-8 rounded bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon name={selectedDashboard.icon} size={16} className="text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{selectedDashboard.title}</p>
              {selectedDashboard.description && (
                <p className="text-xs text-muted-foreground truncate">{selectedDashboard.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
              <Icon name="Calendar" size={12} />
              <span>{dateFrom} → {dateTo}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
