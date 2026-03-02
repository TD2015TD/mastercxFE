import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { languageService } from '../../../../services/languageService';

const DepartmentMetrics = ({ data }) => {
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
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
            <div className="h-12 w-12 bg-muted rounded-lg mb-4"></div>
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const activeTickets = data.queue.waiting + data.queue.in_progress + data.queue.on_hold;
  
  const departmentStats = [
    {
      id: 1,
      title: t('supervisor.dashboard.metrics.activeTickets'),
      value: activeTickets,
      change: `+${data.queue.waiting}`,
      changeType: "increase",
      icon: "Ticket",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: 2,
      title: t('supervisor.dashboard.metrics.slaCompliance'),
      value: `${data.sla.compliance_rate}%`,
      change: null,
      changeType: null,
      icon: "Clock",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      id: 3,
      title: t('supervisor.dashboard.metrics.agentsAvailable'),
      value: data.team.agents_available,
      change: `${data.team.agents_online}/${data.team.total_agents}`,
      changeType: data.team.agents_available >= data.team.total_agents * 0.7 ? "increase" : "decrease",
      icon: "Users",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: 4,
      title: t('supervisor.dashboard.metrics.slaBreaches'),
      value: data.sla.sla_breaches_today,
      change: null,
      changeType: data.sla.sla_breaches_today > 0 ? "increase" : "decrease",
      icon: "AlertTriangle",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {departmentStats?.map((stat) => (
        <div key={stat?.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
            {stat?.change !== null && stat?.changeType && (
              <div className={`flex items-center space-x-1 text-sm ${
                stat?.changeType === 'increase' ? 'text-success' : 'text-error'
              }`}>
                <Icon
                  name={stat?.changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'}
                  size={16}
                />
                <span>{stat?.change}</span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat?.value}</h3>
            <p className="text-sm text-muted-foreground">{stat?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DepartmentMetrics;