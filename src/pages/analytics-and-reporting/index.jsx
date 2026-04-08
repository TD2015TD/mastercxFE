import { Helmet } from 'react-helmet-async';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import TelephonyBar from '../../components/TelephonyBar';
import SupersetDashboardList from './components/SupersetDashboardList';
import Can from '../../components/Can';

const AnalyticsAndReporting = () => {
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="BarChart3" size={32} className="mr-3 text-primary" />
                  Analytics & Reporting
                </h1>
                <p className="text-muted-foreground mt-2">
                  Interactive Superset dashboards with advanced analytics and visualizations based on your role permissions
                </p>
              </div>
            </div>
          </div>

          {/* Superset Dashboard List */}
          <SupersetDashboardList />
        </main>
      </div>
      </Can>
    </>
  );
};

export default AnalyticsAndReporting;
