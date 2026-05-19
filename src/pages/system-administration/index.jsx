import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Can, { usePermission } from '../../components/Can';
import UserManagementPanel from './user-management/UserManagementPanel';
import SystemConfigurationPanel from './components/SystemConfigurationPanel';
import AuditTrailCenter from './components/AuditTrailCenter';
import ComplianceDashboard from './components/ComplianceDashboard';
import SystemHealthMonitor from './components/SystemHealthMonitor';
import SlaConfigurationTable from './sla-configuration/components/SlaConfigurationTable';
import SlaPerformanceMetrics from './sla-configuration/components/SlaPerformanceMetrics';
import SlaRulesEngine from './sla-configuration/components/SlaRulesEngine';
import ReportConfigurationPanel from './report-configuration';
import KnowledgeBaseAdmin from './knowledge-base';
import RoleManagement from './rbac/components/RoleManagement';
import RoleMenuManagement from './rbac/components/RoleMenuManagement';
import MenuPermissionMatrix from './rbac/components/MenuPermissionMatrix';
import PermissionMatrix from './rbac/components/PermissionMatrix';
import UserRoleAssignment from './rbac/components/UserRoleAssignment';
import { getUsers } from '../../services/userService';
import { getSystemHealth } from '../../services/systemService';
import { languageService } from '../../services/languageService';
import { exportToCsv } from '../../utils/exportCsv';

// Access Denied Component
const AccessDenied = ({ feature }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-8 text-center max-w-md">
      <Icon name="Lock" size={48} className="text-amber-600 dark:text-amber-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Access Denied
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        You do not have permission to access {feature || 'this feature'}.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Please contact your system administrator if you believe you should have access.
      </p>
    </div>
  </div>
);

const SystemAdministration = () => {
  const navigate = useNavigate();
  const { can } = usePermission();

  // Get current user role to restrict tab access
  const currentUserRole = (() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user-session') || '{}');
      if (typeof userData.role === 'string') return userData.role;
      return userData.role?.slug || userData.role?.name || 'agent';
    } catch { return 'agent'; }
  })();
  const isSupervisor = currentUserRole === 'supervisor';

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [activeTab, setActiveTab] = useState('users');
  const [slaTab, setSlaTab] = useState('configurations');
  const [rbacTab, setRbacTab] = useState('roles');
  const [systemStats, setSystemStats] = useState({
    activeUsers: 0,
    systemUptime: '0%',
    securityScore: '0/100',
    complianceRate: '0%',
  });
  const [loading, setLoading] = useState(true);

  // Load translations
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
    loadTranslations(savedLanguage);
  }, []);

  const loadTranslations = async (locale) => {
    try {
      const translations = await languageService.getTranslations(locale);
      setTranslations(translations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      setTranslations({});
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value || key;
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      
      // Fetch active users count (status = 'active')
      const usersRes = await getUsers({ status: 'active', per_page: 1 });
      const activeUsersCount = usersRes.success && usersRes.data ? usersRes.data.total : 0;

      // Fetch system health
      const healthRes = await getSystemHealth();
      const uptime = healthRes.success ? '99.8%' : '0%'; // Mock calculation

      setSystemStats({
        activeUsers: activeUsersCount,
        systemUptime: uptime,
        securityScore: '94/100', // Mock data
        complianceRate: '98.5%', // Mock data
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const allTabs = [
    { id: 'users', label: t('systemAdmin.tabs.users'), icon: 'Users', description: t('systemAdmin.tabs.usersDesc'), permission: 'user.manage' },
    { id: 'rbac', label: 'RBAC Management', icon: 'Shield', description: 'Manage roles, permissions, and menu assignments', permission: 'role.manage' },
    { id: 'sla', label: 'SLA Management', icon: 'Clock', description: 'Configure and monitor Service Level Agreements', permission: 'sla.manage' },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: 'BookOpen', description: 'Manage knowledge base articles and categories', permission: null },
    { id: 'reports', label: 'Report Configuration', icon: 'BarChart', description: 'Configure dashboards and assign role-based access to reports', permission: 'system.config' },
    { id: 'system', label: t('systemAdmin.tabs.system'), icon: 'Settings', description: t('systemAdmin.tabs.systemDesc'), permission: 'system.config' },
    { id: 'health', label: t('systemAdmin.tabs.health'), icon: 'Activity', description: t('systemAdmin.tabs.healthDesc'), permission: null } // null means everyone can access
  ];
  
  // Filter tabs based on permissions
  const tabs = allTabs.filter(tab => {
    // If no permission required, allow access
    if (!tab.permission) return true;
    // Check if user has the required permission
    return can(tab.permission);
  });

  const statsData = [
    {
      title: t('systemAdmin.stats.activeUsers'),
      value: loading ? "..." : systemStats.activeUsers.toString(),
      change: "+12",
      changeType: "increase",
      icon: "Users",
      color: "text-blue-600"
    },
    {
      title: t('systemAdmin.stats.systemUptime'),
      value: loading ? "..." : systemStats.systemUptime,
      change: "+0.2%",
      changeType: "increase",
      icon: "Activity",
      color: "text-success"
    }
  ];

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value', 'Change'],
      ...statsData.map(stat => [stat.title, stat.value, stat.change])
    ];
    exportToCsv(rows, 'system-administration-report');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <Can permission="user.manage" fallback={<AccessDenied feature="User Management" />}>
            <UserManagementPanel />
          </Can>
        );
      case 'rbac':
        return (
          <Can permission="role.manage" fallback={<AccessDenied feature="RBAC Management" />}>
            {renderRbacManagement()}
          </Can>
        );
      case 'sla':
        return (
          <Can permission="sla.manage" fallback={<AccessDenied feature="SLA Management" />}>
            {renderSlaManagement()}
          </Can>
        );
      case 'reports':
        return (
          <Can permission="system.config" fallback={<AccessDenied feature="Report Configuration" />}>
            <ReportConfigurationPanel />
          </Can>
        );
      case 'system':
        return <SystemConfigurationPanel />;
      case 'audit':
        return (
          <Can permission="audit.view" fallback={<AccessDenied feature="Audit Trail" />}>
            <AuditTrailCenter />
          </Can>
        );
      case 'compliance':
        return (
          <Can permission="audit.view" fallback={<AccessDenied feature="Compliance Dashboard" />}>
            <ComplianceDashboard />
          </Can>
        );
      case 'knowledge-base':
        return <KnowledgeBaseAdmin />;
      case 'health':
        return <SystemHealthMonitor />;
      default:
        return <UserManagementPanel />;
    }
  };

  const slaTabs = [
    { id: 'configurations', label: 'SLA Configurations', icon: 'Settings', description: 'Manage SLA rules and thresholds' },
    { id: 'performance', label: 'Performance Metrics', icon: 'BarChart', description: 'Monitor SLA compliance' },
    { id: 'engine', label: 'SLA Engine', icon: 'Cpu', description: 'Configure calculation rules' }
  ];

  const renderSlaSubTab = () => {
    switch (slaTab) {
      case 'configurations':
        return <SlaConfigurationTable />;
      case 'performance':
        return <SlaPerformanceMetrics />;
      case 'engine':
        return <SlaRulesEngine />;
      default:
        return <SlaConfigurationTable />;
    }
  };

  const renderSlaManagement = () => (
    <div className="space-y-6">
      {/* SLA Header with Create Button */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <Icon name="Clock" className="mr-2" size={24} />
              SLA Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure and monitor Service Level Agreement rules and performance
            </p>
          </div>
        </div>

        {/* SLA Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold text-foreground mt-1">28</p>
              </div>
              <Icon name="CheckCircle" size={32} className="text-primary" />
            </div>
          </div>
          <div className="bg-success/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold text-success mt-1">94.2%</p>
              </div>
              <Icon name="TrendingUp" size={32} className="text-success" />
            </div>
          </div>
          <div className="bg-warning/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-warning mt-1">12</p>
              </div>
              <Icon name="AlertTriangle" size={32} className="text-warning" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground mt-1">2.5h</p>
              </div>
              <Icon name="Clock" size={32} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* SLA Sub-tabs */}
      <div className="bg-card rounded-lg border border-border">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="SLA Tabs">
            {slaTabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setSlaTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  slaTab === tab?.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={18} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderSlaSubTab()}
        </div>
      </div>
    </div>
  );

  const rbacTabs = [
    { id: 'roles', label: 'Roles', icon: 'Shield', description: 'Manage system roles and their configurations' },
    { id: 'role-menus', label: 'Role & Menu', icon: 'Menu', description: 'Assign menu items and permissions to roles' },
    { id: 'menu-matrix', label: 'Menu Permission Matrix', icon: 'Grid', description: 'Configure all role-menu permissions in one view' },
    { id: 'permissions', label: 'Permission Matrix', icon: 'Lock', description: 'Configure role-based permissions across modules' },
    { id: 'assignments', label: 'User Assignments', icon: 'Users', description: 'Assign roles to users and manage access' }
  ];

  const renderRbacSubTab = () => {
    switch (rbacTab) {
      case 'roles':
        return <RoleManagement />;
      case 'role-menus':
        return <RoleMenuManagement />;
      case 'menu-matrix':
        return <MenuPermissionMatrix />;
      case 'permissions':
        return <PermissionMatrix />;
      case 'assignments':
        return <UserRoleAssignment />;
      default:
        return <RoleManagement />;
    }
  };

  const renderRbacManagement = () => (
    <div className="space-y-6">
      {/* RBAC Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <Icon name="Shield" className="mr-2" size={24} />
              Role-Based Access Control
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user roles, permissions, and menu access across the system
            </p>
          </div>
        </div>

        {/* RBAC Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold text-foreground mt-1">4</p>
              </div>
              <Icon name="Shield" size={32} className="text-primary" />
            </div>
          </div>
          <div className="bg-success/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Permissions</p>
                <p className="text-2xl font-bold text-success mt-1">32</p>
              </div>
              <Icon name="Lock" size={32} className="text-success" />
            </div>
          </div>
          <div className="bg-blue-500/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">247</p>
              </div>
              <Icon name="Users" size={32} className="text-blue-600" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menu Items</p>
                <p className="text-2xl font-bold text-foreground mt-1">9</p>
              </div>
              <Icon name="Menu" size={32} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Sub-tabs */}
      <div className="bg-card rounded-lg border border-border">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="RBAC Tabs">
            {rbacTabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setRbacTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  rbacTab === tab?.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={18} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderRbacSubTab()}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="AlertTriangle" size={20} className="text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Security Notice</h4>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Changes to roles and permissions will take effect immediately. Ensure you review all changes before saving.
              All modifications are logged in the audit trail for compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>System Administration - JKDM CRM Portal</title>
        <meta name="description" content="Comprehensive system administration interface for JKDM CRM Portal with user management, system configuration, and compliance monitoring." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('systemAdmin.title')}</h1>
              <p className="text-lg text-muted-foreground mt-2">
                {t('systemAdmin.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" iconName="Download" iconPosition="left" onClick={handleExportReport}>
                {t('systemAdmin.actions.exportReport')}
              </Button>
              <Button variant="default" iconName="Settings" iconPosition="left">
                {t('systemAdmin.actions.systemSettings')}
              </Button>
            </div>
          </div>
        </div>

        {/* System Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData?.map((stat, index) => (
            <div key={index} className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat?.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat?.value}</p>
                  <div className="flex items-center mt-2">
                    <Icon 
                      name={stat?.changeType === 'increase' ? 'TrendingUp' : 
                            stat?.changeType === 'decrease' ? 'TrendingDown' : 'Minus'} 
                      size={16} 
                      className={`mr-1 ${
                        stat?.changeType === 'increase' ? 'text-success' :
                        stat?.changeType === 'decrease' ? 'text-error' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={`text-sm font-medium ${
                      stat?.changeType === 'increase' ? 'text-success' :
                      stat?.changeType === 'decrease' ? 'text-error' : 'text-muted-foreground'
                    }`}>
                      {stat?.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">{t('systemAdmin.stats.vsLastMonth')}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
                  <Icon name={stat?.icon} size={24} className={stat?.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-card rounded-lg border border-border mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Administration Tabs">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={20} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="px-6 py-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {tabs?.find(tab => tab?.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>JKDM CRM Portal System Administration</p>
          <p className="mt-1">
            © {new Date()?.getFullYear()} Jabatan Kastam Diraja Malaysia. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemAdministration;