import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import api from '../../../../services/api';
import { ticketService } from '../../../../services/ticketService';
import languageService from '../../../../services/languageService';

const WorkloadManagement = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [workloadData, setWorkloadData] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [translations, setTranslations] = useState({});

  // Get department from session storage
  const userSession = JSON.parse(localStorage.getItem('user-session') || '{}');
  const department = userSession?.user?.agent?.department || 'General';

  useEffect(() => {
    const loadTranslations = async () => {
      const preferredLanguage = localStorage.getItem('preferred_language') || 'en';
      const data = await languageService.getTranslations(preferredLanguage);
      setTranslations(data);
    };
    loadTranslations();
  }, []);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  useEffect(() => {
    fetchWorkloadData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWorkloadData, 30000);
    return () => clearInterval(interval);
  }, [department]);

  const fetchWorkloadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/workload', {
        params: { department }
      });
      
      if (response.data.success) {
        setWorkloadData(response.data.data.agents || []);
        setPendingTickets(response.data.data.pending_tickets || []);
      }
    } catch (error) {
      console.error('Error fetching workload data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLoadPercentage = (current, max) => {
    return Math.round(current / max * 100);
  };

  const getLoadColor = (current, max) => {
    const percentage = getLoadPercentage(current, max);
    if (percentage >= 100) return 'bg-error';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'available': 'text-success bg-success/10',
      'busy': 'text-warning bg-warning/10',
      'overloaded': 'text-error bg-error/10',
      'break': 'text-muted-foreground bg-muted',
      'away': 'text-muted-foreground bg-muted',
      'offline': 'text-muted-foreground bg-muted'
    };
    return colorMap?.[status] || 'text-muted-foreground bg-muted';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      'P1': 'text-error bg-error/10',
      'P2': 'text-warning bg-warning/10',
      'P3': 'text-accent bg-accent/10',
      'P4': 'text-muted-foreground bg-muted'
    };
    return colorMap?.[priority] || 'text-muted-foreground bg-muted';
  };

  const handleAssignTicket = async (ticketId, agentId) => {
    try {
      setAssigningTicket(ticketId);
      await ticketService.assignTicket(ticketId, agentId);
      
      // Show success message (you can add a toast notification here)
      console.log(t('supervisor.dashboard.workload.assignmentSuccess'));
      
      // Refresh data
      await fetchWorkloadData();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      // Show error message (you can add a toast notification here)
      console.error(t('supervisor.dashboard.workload.assignmentError'));
    } finally {
      setAssigningTicket(null);
    }
  };

  const handleAutoBalance = () => {
    console.log(t('supervisor.dashboard.workload.autoBalancing'));
    // TODO: Implement auto-balance logic
  };

  const findBestAgent = (ticket) => {
    // Find available agent with lowest workload
    const availableAgents = workloadData
      .filter(agent => agent.status === 'available' && agent.current_load < agent.max_capacity)
      .sort((a, b) => {
        const loadA = getLoadPercentage(a.current_load, a.max_capacity);
        const loadB = getLoadPercentage(b.current_load, b.max_capacity);
        return loadA - loadB;
      });

    return availableAgents[0] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workload Overview */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {t('supervisor.dashboard.workload.title')}
            </h2>
            <Button
              variant="outline"
              iconName="Shuffle"
              iconPosition="left"
              onClick={handleAutoBalance}>
              {t('supervisor.dashboard.workload.autoBalance')}
            </Button>
          </div>
        </div>

        <div className="p-6">
          {workloadData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('supervisor.dashboard.workload.noAgents')}
            </div>
          ) : (
            <div className="space-y-4">
              {workloadData.map((agent) =>
                <div key={agent.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{agent.name}</h3>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                            {t(`supervisor.dashboard.workload.status.${agent.status}`) || agent.status}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{agent.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">
                          {agent.current_load}/{agent.max_capacity}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('supervisor.dashboard.workload.tickets')}
                        </div>
                      </div>

                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{t('supervisor.dashboard.workload.load')}</span>
                          <span>{getLoadPercentage(agent.current_load, agent.max_capacity)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getLoadColor(agent.current_load, agent.max_capacity)}`}
                            style={{ width: `${Math.min(getLoadPercentage(agent.current_load, agent.max_capacity), 100)}%` }}>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">{agent.avg_handle_time}</div>
                        <div className="text-xs text-muted-foreground">
                          {t('supervisor.dashboard.workload.avgTime')}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">{agent.efficiency}%</div>
                        <div className="text-xs text-muted-foreground">
                          {t('supervisor.dashboard.workload.efficiency')}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                        className="p-2 hover:bg-muted rounded-md transition-colors duration-200">
                        <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {selectedAgent === agent.id &&
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          {t('supervisor.dashboard.workload.viewDetails')}
                        </Button>
                        <Button variant="outline" size="sm">
                          {t('supervisor.dashboard.workload.reassignTickets')}
                        </Button>
                        <Button variant="outline" size="sm">
                          {t('supervisor.dashboard.workload.adjustCapacity')}
                        </Button>
                      </div>
                    </div>
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending Assignments */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {t('supervisor.dashboard.workload.pendingAssignments')}
          </h3>
        </div>

        <div className="p-6">
          {pendingTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('supervisor.dashboard.workload.noPendingTickets')}
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTickets.map((ticket) => {
                const bestAgent = findBestAgent(ticket);
                
                return (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-foreground">{ticket.ticket_number}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-sm text-muted-foreground">{ticket.category}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="text-foreground">{ticket.customer}</div>
                        <div className="text-muted-foreground">
                          {t('supervisor.dashboard.workload.estimatedTime').replace('{time}', ticket.estimated_time)}
                        </div>
                      </div>
                      
                      {bestAgent && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          disabled={assigningTicket === ticket.id}
                          onClick={() => handleAssignTicket(ticket.id, bestAgent.id)}>
                          {assigningTicket === ticket.id 
                            ? t('common.loading')
                            : `${t('supervisor.dashboard.workload.assign')} → ${bestAgent.name}`
                          }
                        </Button>
                      )}
                      
                      {!bestAgent && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled>
                          {t('supervisor.dashboard.workload.noAgents')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkloadManagement;