import { Helmet } from 'react-helmet-async';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import TelephonyBar from '../../components/TelephonyBar';
import SupersetDashboardList from './components/SupersetDashboardList';

const AnalyticsAndReporting = () => {
  return (
    <>
      <Helmet>
        <title>Analytics & Reporting - JKDM CRM</title>
        <meta name="description" content="Interactive analytics dashboards and reporting" />
      </Helmet>

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
    </>
  );
};

export default AnalyticsAndReporting;
