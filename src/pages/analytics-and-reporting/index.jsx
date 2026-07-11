import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';
import Can, { usePermission } from '../../components/Can';
import SupersetDashboardList from './components/SupersetDashboardList';
import ReportGenerator from './components/ReportGenerator';
import SupersetDashboardModal from '../../components/SupersetDashboardModal';
import { useSupersetDashboards } from '../../hooks/useSupersetDashboards';

const AnalyticsAndReporting = () => {
  const { can } = usePermission();
  // Shared dashboard list (used by both ReportGenerator and the card grid)
  const { dashboards, loading } = useSupersetDashboards({ is_active: true });

  // Modal state
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [reportFilters,      setReportFilters]     = useState(null);
  const [isModalOpen,        setIsModalOpen]        = useState(false);

  const handleViewReport = (dashboard, filters) => {
    setSelectedDashboard(dashboard);
    setReportFilters(filters);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDashboard(null);
    setReportFilters(null);
  };

  return (
    <>
      <Helmet>
        <title>Analytics & Reporting - JKDM CRM</title>
        <meta name="description" content="Interactive analytics dashboards and reporting" />
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
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Please contact your system administrator if you believe you should have access.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-background">
          <main className="container mx-auto px-6 py-8 max-w-7xl">

            {/* ── Page header ───────────────────────────────────────────── */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Icon name="BarChart3" size={32} className="mr-3 text-primary" />
                Analytics & Reporting
              </h1>
              <p className="text-muted-foreground mt-2">
                Jana laporan interaktif dari Superset dan lihat prestasi pasukan berdasarkan peranan anda
              </p>
            </div>

            {/* ── Report Generator — requires report.create ──────────────── */}
            {can('report.create') && (
              <ReportGenerator
                dashboards={dashboards}
                loading={loading}
                onViewReport={handleViewReport}
              />
            )}

            {/* ── Divider ───────────────────────────────────────────────── */}
            {can('analytics.view') && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-border" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    <Icon name="LayoutGrid" size={12} />
                    Semua Laporan Tersedia
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* ── Dashboard card grid — requires analytics.view ──────── */}
                <SupersetDashboardList onViewDashboard={handleViewReport} />
              </>
            )}

          </main>
        </div>

        {/* ── Modal (shared by both ReportGenerator and card grid) ────────── */}
        {selectedDashboard && (
          <SupersetDashboardModal
            dashboard={selectedDashboard}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            reportFilters={reportFilters}
          />
        )}
      </Can>
    </>
  );
};

export default AnalyticsAndReporting;
