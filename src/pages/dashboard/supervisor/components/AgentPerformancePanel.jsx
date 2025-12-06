import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { languageService } from '../../../../services/languageService';

const AgentPerformancePanel = ({ data = [] }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [translations, setTranslations] = useState({});

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

  // Map API data to component format
  const agentPerformance = data.map(agent => ({
    id: agent.agent_id,
    name: agent.name,
    avatar: null, // API doesn't provide avatar, will use initials
    status: agent.availability || 'offline',
    ticketsHandled: agent.tickets_today || 0,
    avgResponseTime: agent.avg_resolution_time 
      ? `${Math.round(agent.avg_resolution_time)} min` 
      : 'N/A',
    resolutionRate: agent.tickets_today > 0 
      ? `${Math.round((agent.resolved_today / agent.tickets_today) * 100)}%` 
      : '0%',
    qualityScore: agent.csat || 0,
    department: 'Various' // API doesn't provide agent department in response
  }));


  const getStatusColor = (status) => {
    const statusMap = {
      'available': 'text-success bg-success/10',
      'busy': 'text-warning bg-warning/10',
      'break': 'text-muted-foreground bg-muted',
      'offline': 'text-error bg-error/10'
    };
    return statusMap?.[status] || 'text-muted-foreground bg-muted';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'available': t('supervisor.dashboard.agentPerformance.status.available'),
      'busy': t('supervisor.dashboard.agentPerformance.status.busy'),
      'break': t('supervisor.dashboard.agentPerformance.status.break'),
      'offline': t('supervisor.dashboard.agentPerformance.status.offline')
    };
    return labelMap?.[status] || 'Unknown';
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t('supervisor.dashboard.agentPerformance.title')}</h2>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e?.target?.value)}
              className="text-sm border border-border rounded-md px-3 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">

              <option value="today">{t('supervisor.dashboard.agentPerformance.today')}</option>
              <option value="week">{t('supervisor.dashboard.agentPerformance.thisWeek')}</option>
              <option value="month">{t('supervisor.dashboard.agentPerformance.thisMonth')}</option>
            </select>
            <button className="p-2 hover:bg-muted rounded-md transition-colors duration-200">
              <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {agentPerformance.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('supervisor.dashboard.agentPerformance.noData')}</p>
          </div>
        ) : (
        <div className="space-y-4">
          {agentPerformance?.map((agent) =>
          <div key={agent?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {agent?.avatar ? (
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {agent?.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(agent?.status)?.split(' ')?.[1]}`}></div>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground">{agent?.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(agent?.status)}`}>
                      {getStatusLabel(agent?.status)}
                    </span>
                    <span>•</span>
                    <span>{agent?.department}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-foreground">{agent?.ticketsHandled}</div>
                  <div className="text-muted-foreground">{t('supervisor.dashboard.agentPerformance.tickets')}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{agent?.avgResponseTime}</div>
                  <div className="text-muted-foreground">{t('supervisor.dashboard.agentPerformance.avgResponse')}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{agent?.resolutionRate}</div>
                  <div className="text-muted-foreground">{t('supervisor.dashboard.agentPerformance.resolution')}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-warning fill-current" />
                    <span className="font-medium text-foreground">{agent?.qualityScore}</span>
                  </div>
                  <div className="text-muted-foreground">{t('supervisor.dashboard.agentPerformance.quality')}</div>
                </div>
                <button className="p-2 hover:bg-muted rounded-md transition-colors duration-200">
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>);

};

export default AgentPerformancePanel;