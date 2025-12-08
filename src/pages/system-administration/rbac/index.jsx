import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import RoleManagement from './components/RoleManagement';
import PermissionMatrix from './components/PermissionMatrix';
import UserRoleAssignment from './components/UserRoleAssignment';

const RBACManagement = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [stats, setStats] = useState({
    totalRoles: 4,
    totalPermissions: 32,
    activeUsers: 247,
    recentChanges: 15
  });

  const tabs = [
    { 
      id: 'roles', 
      label: 'Roles', 
      icon: 'Shield', 
      description: 'Manage system roles and their configurations' 
    },
    { 
      id: 'permissions', 
      label: 'Permission Matrix', 
      icon: 'Grid', 
      description: 'Configure role-based permissions across modules' 
    },
    { 
      id: 'assignments', 
      label: 'User Assignments', 
      icon: 'Users', 
      description: 'Assign roles to users and manage access' 
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles':
        return <RoleManagement />;
      case 'permissions':
        return <PermissionMatrix />;
      case 'assignments':
        return <UserRoleAssignment />;
      default:
        return <RoleManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Role-Based Access Control - JKDM CRM Portal</title>
        <meta name="description" content="Manage roles, permissions, and user access control for JKDM CRM Portal" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Icon name="Shield" size={32} className="mr-3 text-primary" />
                Role-Based Access Control
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Manage user roles, permissions, and access control across the system
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" iconName="Download" iconPosition="left">
                Export Report
              </Button>
              <Button variant="default" iconName="Plus" iconPosition="left">
                Create Role
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalRoles}</p>
                <p className="text-sm text-success mt-2">
                  <Icon name="CheckCircle" size={14} className="inline mr-1" />
                  All Active
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Permissions</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalPermissions}</p>
                <p className="text-sm text-muted-foreground mt-2">Across all modules</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Icon name="Grid" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.activeUsers}</p>
                <p className="text-sm text-success mt-2">
                  <Icon name="TrendingUp" size={14} className="inline mr-1" />
                  +12 this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Icon name="Users" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Changes</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.recentChanges}</p>
                <p className="text-sm text-muted-foreground mt-2">Last 7 days</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Icon name="Activity" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-card rounded-lg border border-border mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="RBAC Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="px-6 py-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

        {/* Quick Access Panel */}
        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Zap" size={20} className="mr-2 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" iconName="Shield" iconPosition="left" fullWidth>
              Create New Role
            </Button>
            <Button variant="outline" iconName="UserPlus" iconPosition="left" fullWidth>
              Assign Role to User
            </Button>
            <Button variant="outline" iconName="Download" iconPosition="left" fullWidth>
              Export RBAC Report
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
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
    </div>
  );
};

export default RBACManagement;
