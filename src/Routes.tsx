import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AgentDashboard from './pages/agent-dashboard';
import AnalyticsAndReporting from './pages/analytics-and-reporting';
import SystemAdministration from './pages/system-administration';
import CitizenSelfServicePortal from './pages/citizen-self-service-portal';
import AgentLogin from './pages/agent-login';
import TicketManagement from './pages/ticket-management';
import KnowledgeBasePortal from './pages/knowledge-base-portal';
import Customer360Profile from './pages/customer-360-profile';
import SupervisorDashboard from './pages/supervisor-dashboard';
import GlobalNavigationSystem from './pages/global-navigation-system';
import KnowledgeBaseContentCreatorPortal from './pages/knowledge-base-content-creator-portal';
import DirectorySearchAndBrowsing from './pages/directory-search-and-browsing';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<AgentLogin />} />
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="/agent-dashboard" element={<AgentDashboard />} />
        <Route path="/analytics-and-reporting" element={<AnalyticsAndReporting />} />
        <Route path="/system-administration" element={<SystemAdministration />} />
        <Route path="/citizen-self-service-portal" element={<CitizenSelfServicePortal />} />
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="/ticket-management" element={<TicketManagement />} />
        <Route path="/ticket-management/:id" element={<TicketManagement />} />
        <Route path="/ticket/new" element={<TicketManagement />} />
        <Route path="/knowledge-base-portal" element={<KnowledgeBasePortal />} />
        <Route path="/customer-360-profile" element={<Customer360Profile />} />
        <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
        <Route path="/global-navigation-system" element={<GlobalNavigationSystem />} />
        <Route path="/knowledge-base-content-creator-portal" element={<KnowledgeBaseContentCreatorPortal />} />
        <Route path="/directory-search-and-browsing" element={<DirectorySearchAndBrowsing />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
