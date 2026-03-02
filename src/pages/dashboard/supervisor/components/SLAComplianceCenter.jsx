import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { slaService } from '../../../../services/slaService';
import { languageService } from '../../../../services/languageService';

const SLAComplianceCenter = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [slaDetails, setSlaDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState({});
  const [userDepartment, setUserDepartment] = useState(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const locale = localStorage.getItem('preferred-language') || 'en';
        const translations = await languageService.getTranslations(locale);
        setTranslations(translations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };
    loadTranslations();

    // Get user department
    const userSession = localStorage.getItem('user-session');
    if (userSession) {
      try {
        const userData = JSON.parse(userSession);
        setUserDepartment(userData.agent?.department || 'General');
      } catch (err) {
        console.error('Error parsing user session:', err);
      }
    }
  }, []);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value || key;
  };

  // Fetch SLA details when tab changes or department changes
  useEffect(() => {
    if (userDepartment && (activeTab === 'breaches' || activeTab === 'warnings')) {
      fetchSlaDetails();
    }
  }, [activeTab, userDepartment]);

  const fetchSlaDetails = async () => {
    if (!userDepartment) return;
    
    try {
      setLoading(true);
      const response = await slaService.getSlaDetails(userDepartment);
      if (response.success) {
        setSlaDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch SLA details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const slaMetrics = {
    overall: {
      compliance: data?.compliance_rate || 0,
      target: 95.0,
      breaches: data?.sla_breaches_today || 0,
      warnings: data?.warnings_count || 0,
      onTrack: data?.on_track || 0,
    },
    byPriority: data?.by_priority ? [
      {
        priority: 'P1',
        compliance: data.by_priority.P1?.compliance || 0,
        target: data.by_priority.P1?.target || 99.0,
        count: data.by_priority.P1?.count || 0,
        breaches: data.by_priority.P1?.breaches || 0,
      },
      {
        priority: 'P2',
        compliance: data.by_priority.P2?.compliance || 0,
        target: data.by_priority.P2?.target || 97.0,
        count: data.by_priority.P2?.count || 0,
        breaches: data.by_priority.P2?.breaches || 0,
      },
      {
        priority: 'P3',
        compliance: data.by_priority.P3?.compliance || 0,
        target: data.by_priority.P3?.target || 95.0,
        count: data.by_priority.P3?.count || 0,
        breaches: data.by_priority.P3?.breaches || 0,
      },
      {
        priority: 'P4',
        compliance: data.by_priority.P4?.compliance || 0,
        target: data.by_priority.P4?.target || 90.0,
        count: data.by_priority.P4?.count || 0,
        breaches: data.by_priority.P4?.breaches || 0,
      },
    ] : []
  };

  const recentBreaches = slaDetails?.recent_breaches || [];
  const upcomingWarnings = slaDetails?.upcoming_warnings || [];

  const getPriorityColor = (priority) => {
    const colorMap = {
      'P1': 'text-error bg-error/10',
      'P2': 'text-warning bg-warning/10',
      'P3': 'text-accent bg-accent/10',
      'P4': 'text-primary bg-primary/10',
      'P5': 'text-muted-foreground bg-muted'
    };
    return colorMap?.[priority] || 'text-muted-foreground bg-muted';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'escalated': 'text-error bg-error/10',
      'resolved': 'text-success bg-success/10',
      'in_progress': 'text-warning bg-warning/10'
    };
    return colorMap?.[status] || 'text-muted-foreground bg-muted';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'escalated': 'Escalated',
      'resolved': 'Resolved',
      'in_progress': 'In Progress'
    };
    return labelMap?.[status] || 'Unknown';
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">SLA Compliance Center</h2>
          <button className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200">
            <Icon name="Settings" size={16} />
            <span className="text-sm">Configure SLA</span>
          </button>
        </div>

        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'overview' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('breaches')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'breaches' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recent Breaches
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'warnings' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Warnings
          </button>
        </div>
      </div>
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{slaMetrics?.overall?.compliance}%</div>
                <div className="text-sm text-muted-foreground">Overall Compliance</div>
                <div className="text-xs text-muted-foreground mt-1">Target: {slaMetrics?.overall?.target}%</div>
              </div>
              <div className="text-center p-4 bg-error/10 rounded-lg">
                <div className="text-2xl font-bold text-error">{slaMetrics?.overall?.breaches}</div>
                <div className="text-sm text-muted-foreground">Active Breaches</div>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">{slaMetrics?.overall?.warnings}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{slaMetrics?.overall?.onTrack}</div>
                <div className="text-sm text-muted-foreground">On Track</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">Compliance by Priority</h3>
              <div className="space-y-3">
                {slaMetrics?.byPriority?.map((item) => (
                  <div key={item?.priority} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item?.priority)}`}>
                        {item?.priority}
                      </span>
                      <span className="text-sm text-muted-foreground">{item?.count} tickets</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">{item?.compliance}%</div>
                        <div className="text-xs text-muted-foreground">Target: {item?.target}%</div>
                      </div>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item?.compliance >= item?.target ? 'bg-success' : 'bg-warning'
                          }`}
                          style={{ width: `${Math.min(item?.compliance, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breaches' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Icon name="Loader" size={32} className="text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : recentBreaches?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent SLA breaches</p>
              </div>
            ) : (
              recentBreaches?.map((breach) => (
                <div key={breach?.id} className="p-4 bg-error/5 border border-error/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground">{breach?.ticket_number}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(breach?.priority)}`}>
                        {breach?.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(breach?.status)}`}>
                        {getStatusLabel(breach?.status)}
                      </span>
                    </div>
                    <span className="text-sm text-error">{breach?.breach_time}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer: </span>
                      <span className="text-foreground">{breach?.customer}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Agent: </span>
                      <span className="text-foreground">{breach?.assigned_agent}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department: </span>
                      <span className="text-foreground">{breach?.department}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'warnings' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Icon name="Loader" size={32} className="text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : upcomingWarnings?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No SLA warnings at this time</p>
              </div>
            ) : (
              upcomingWarnings?.map((warning) => (
                <div key={warning?.id} className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground">{warning?.ticket_number}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(warning?.priority)}`}>
                        {warning?.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-warning">
                      <Icon name="Clock" size={16} />
                      <span className="text-sm font-medium">{warning?.time_remaining} remaining</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer: </span>
                      <span className="text-foreground">{warning?.customer}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Agent: </span>
                      <span className="text-foreground">{warning?.assigned_agent}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department: </span>
                      <span className="text-foreground">{warning?.department}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SLAComplianceCenter;