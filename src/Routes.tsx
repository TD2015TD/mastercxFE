import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import Layout from "components/Layout";
import NotFound from "pages/error/NotFound";
import AgentDashboard from './pages/dashboard/agent';
import AnalyticsAndReporting from './pages/analytics-and-reporting';
import SystemAdministration from './pages/system-administration';
import CitizenSelfServicePortal from './pages/citizen-self-service-portal';
import AgentLogin from './pages/agent-login';
import TicketManagement from './pages/ticket-management';
import TicketDetailPage from './pages/ticket-management/TicketDetailPage';
import TicketCreatePage from './pages/ticket-management/TicketCreatePage';
import KnowledgeBasePortal from './pages/knowledge-base-portal';
import Customer360Profile from './pages/customer-360-profile';
import CustomerDetailPage from './pages/customer-360-profile/CustomerDetailPage';
import SupervisorDashboard from './pages/dashboard/supervisor';
import GlobalNavigationSystem from './pages/global-navigation-system';
import KnowledgeBaseContentCreatorPortal from './pages/system-administration/knowledge-base';
import DirectorySearchAndBrowsing from './pages/directory-search-and-browsing';
import AgentManagement from './pages/agent-management';
import UserForm from './pages/system-administration/user-management/UserForm';
import EmployeeInboxPage from './pages/employee-inbox';

function ChatWidgetController() {
  // Chat widget is disabled
  return null;
}

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes - No Layout */}
        <Route path="/" element={<AgentLogin />} />
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="/citizen-self-service-portal" element={<CitizenSelfServicePortal />} />
        
        {/* Protected Routes - With Layout */}
        <Route path="/agent-dashboard" element={<Layout><AgentDashboard /></Layout>} />
        <Route path="/supervisor-dashboard" element={<Layout><SupervisorDashboard /></Layout>} />
        <Route path="/analytics-and-reporting" element={<Layout><AnalyticsAndReporting /></Layout>} />
        <Route path="/system-administration" element={<Layout><SystemAdministration /></Layout>} />
        <Route path="/system-administration/users/create" element={<Layout><UserForm /></Layout>} />
        <Route path="/system-administration/users/:id/edit" element={<Layout><UserForm /></Layout>} />
        <Route path="/ticket-management" element={<Layout><TicketManagement /></Layout>} />
        <Route path="/ticket-management/create" element={<Layout><TicketCreatePage /></Layout>} />
        <Route path="/ticket-management/:id" element={<Layout><TicketDetailPage /></Layout>} />
        <Route path="/knowledge-base-portal" element={<Layout><KnowledgeBasePortal /></Layout>} />
        <Route path="/customer-360-profile" element={<Layout><Customer360Profile /></Layout>} />
        <Route path="/customer-360-profile/:id" element={<Layout><CustomerDetailPage /></Layout>} />
        <Route path="/global-navigation-system" element={<Layout><GlobalNavigationSystem /></Layout>} />
        <Route path="/knowledge-base-content-creator-portal" element={<Layout><KnowledgeBaseContentCreatorPortal /></Layout>} />
        <Route path="/directory-search-and-browsing" element={<Layout><DirectorySearchAndBrowsing /></Layout>} />
        <Route path="/agent-management" element={<Layout><AgentManagement /></Layout>} />
        <Route path="/employee-inbox" element={<Layout><EmployeeInboxPage /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      <ChatWidgetController />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
