import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { 
  getSlaEngineSettings, 
  updateSlaEngineSettings, 
  resetSlaEngineSettings 
} from '../../../../services/slaEngineService';
import languageService from '../../../../services/languageService';

const SlaRulesEngine = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [translations, setTranslations] = useState({});
  
  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const data = await languageService.getTranslations();
        setTranslations(data);
      } catch (err) {
        console.error('Error loading translations:', err);
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
  
  const [businessHours, setBusinessHours] = useState({
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'Asia/Kuala_Lumpur',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  const [escalationRules, setEscalationRules] = useState({
    enabled: true,
    defaultThreshold: 80,
    notifyAgent: true,
    notifySupervisor: true,
    notifyManager: false,
    autoEscalateOnBreach: true,
    escalationDelayMinutes: 0
  });

  const [pauseConditions, setPauseConditions] = useState({
    pauseOnHold: true,
    pauseOnPending: true,
    pauseOnAwaitingCustomer: true
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getSlaEngineSettings();
      
      if (response.success && response.data) {
        const settings = response.data;
        
        // Map API response to component state
        setBusinessHours({
          enabled: settings.business_hours_enabled,
          startTime: settings.business_hours_start.substring(0, 5), // Remove seconds
          endTime: settings.business_hours_end.substring(0, 5),
          timezone: settings.timezone,
          workingDays: settings.working_days || []
        });
        
        setEscalationRules({
          enabled: settings.escalation_enabled,
          defaultThreshold: settings.default_escalation_threshold,
          notifyAgent: settings.notify_agent,
          notifySupervisor: settings.notify_supervisor,
          notifyManager: settings.notify_manager,
          autoEscalateOnBreach: settings.auto_escalate_on_breach,
          escalationDelayMinutes: settings.escalation_delay_minutes
        });
        
        setPauseConditions({
          pauseOnHold: settings.pause_on_hold,
          pauseOnPending: settings.pause_on_pending,
          pauseOnAwaitingCustomer: settings.pause_on_awaiting_customer
        });
      } else {
        setError(response.message || 'Failed to load settings');
      }
    } catch (err) {
      setError('An error occurred while loading settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Map component state to API format
      const payload = {
        business_hours_enabled: businessHours.enabled,
        business_hours_start: businessHours.startTime,
        business_hours_end: businessHours.endTime,
        timezone: businessHours.timezone,
        working_days: businessHours.workingDays,
        escalation_enabled: escalationRules.enabled,
        default_escalation_threshold: escalationRules.defaultThreshold,
        notify_agent: escalationRules.notifyAgent,
        notify_supervisor: escalationRules.notifySupervisor,
        notify_manager: escalationRules.notifyManager,
        auto_escalate_on_breach: escalationRules.autoEscalateOnBreach,
        escalation_delay_minutes: escalationRules.escalationDelayMinutes,
        pause_on_hold: pauseConditions.pauseOnHold,
        pause_on_pending: pauseConditions.pauseOnPending,
        pause_on_awaiting_customer: pauseConditions.pauseOnAwaitingCustomer
      };
      
      const response = await updateSlaEngineSettings(payload);
      
      if (response.success) {
        setSuccess(t('sla.engine.saveSuccess') || 'SLA engine configuration saved successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || (t('sla.engine.errorSaving') || 'Failed to save configuration'));
      }
    } catch (err) {
      setError(t('sla.engine.errorSaving') || 'An error occurred while saving configuration');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(t('sla.engine.resetConfirm') || 'Are you sure you want to reset to default settings? This will discard all custom configurations.')) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await resetSlaEngineSettings();
      
      if (response.success) {
        setSuccess(t('sla.engine.resetSuccess') || 'Settings reset to defaults successfully');
        fetchSettings(); // Reload settings
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || (t('sla.engine.errorResetting') || 'Failed to reset settings'));
      }
    } catch (err) {
      setError(t('sla.engine.errorResetting') || 'An error occurred while resetting settings');
      console.error('Error resetting settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">{t('sla.engine.loading') || 'Loading SLA engine settings...'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="CheckCircle" size={20} className="text-green-600 dark:text-green-400 mr-3 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400 mr-3 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}
      {/* Business Hours Configuration */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Clock" size={20} className="mr-2 text-primary" />
          {t('sla.engine.businessHours.title') || 'Business Hours Configuration'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="businessHoursEnabled"
              checked={businessHours.enabled}
              onChange={(e) => setBusinessHours({ ...businessHours, enabled: e.target.checked })}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="businessHoursEnabled" className="text-sm font-medium text-foreground">
              {t('sla.engine.businessHours.enabled') || 'Enable business hours calculation'}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('sla.engine.businessHours.startTime') || 'Start Time'}</label>
              <input
                type="time"
                value={businessHours.startTime}
                onChange={(e) => setBusinessHours({ ...businessHours, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('sla.engine.businessHours.endTime') || 'End Time'}</label>
              <input
                type="time"
                value={businessHours.endTime}
                onChange={(e) => setBusinessHours({ ...businessHours, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('sla.engine.businessHours.timezone') || 'Timezone'}</label>
              <select
                value={businessHours.timezone}
                onChange={(e) => setBusinessHours({ ...businessHours, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur (GMT+8)</option>
                <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('sla.engine.businessHours.workingDays') || 'Working Days'}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {days.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={day}
                    checked={businessHours.workingDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBusinessHours({
                          ...businessHours,
                          workingDays: [...businessHours.workingDays, day]
                        });
                      } else {
                        setBusinessHours({
                          ...businessHours,
                          workingDays: businessHours.workingDays.filter(d => d !== day)
                        });
                      }
                    }}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor={day} className="text-sm text-foreground">{day}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Rules */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="AlertTriangle" size={20} className="mr-2 text-primary" />
          {t('sla.engine.escalation.title') || 'Escalation Rules'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="escalationEnabled"
              checked={escalationRules.enabled}
              onChange={(e) => setEscalationRules({ ...escalationRules, enabled: e.target.checked })}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="escalationEnabled" className="text-sm font-medium text-foreground">
              {t('sla.engine.escalation.enabled') || 'Enable automatic escalation alerts'}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('sla.engine.escalation.threshold') || 'Default Escalation Threshold (%)'}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={escalationRules.defaultThreshold}
              onChange={(e) => setEscalationRules({ ...escalationRules, defaultThreshold: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('sla.engine.escalation.thresholdDesc') || 'Alert will be sent when SLA time reaches this percentage'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t('sla.engine.escalation.recipients') || 'Notification Recipients'}</p>
            {[
              { key: 'notifyAgent', label: t('sla.engine.escalation.notifyAgent') || 'Assigned Agent' },
              { key: 'notifySupervisor', label: t('sla.engine.escalation.notifySupervisor') || 'Supervisor' },
              { key: 'notifyManager', label: t('sla.engine.escalation.notifyManager') || 'Department Manager' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={key}
                  checked={escalationRules[key]}
                  onChange={(e) => setEscalationRules({ ...escalationRules, [key]: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor={key} className="text-sm text-foreground">{label}</label>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="autoEscalateOnBreach"
              checked={escalationRules.autoEscalateOnBreach}
              onChange={(e) => setEscalationRules({ ...escalationRules, autoEscalateOnBreach: e.target.checked })}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="autoEscalateOnBreach" className="text-sm font-medium text-foreground">
              {t('sla.engine.escalation.autoEscalate') || 'Auto-escalate on SLA breach'}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('sla.engine.escalation.escalationDelay') || 'Escalation Delay (minutes)'}
            </label>
            <input
              type="number"
              min="0"
              value={escalationRules.escalationDelayMinutes}
              onChange={(e) => setEscalationRules({ ...escalationRules, escalationDelayMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('sla.engine.escalation.escalationDelayDesc') || 'Delay in minutes before auto-escalating after threshold is reached (0 for immediate)'}
            </p>
          </div>
        </div>
      </div>

      {/* Pause Conditions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Pause" size={20} className="mr-2 text-primary" />
          {t('sla.engine.pause.title') || 'SLA Pause Conditions'}
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('sla.engine.pause.subtitle') || 'SLA timer will automatically pause when tickets are in the following statuses:'}
          </p>
          <div className="space-y-2">
            {[
              { key: 'pauseOnHold', label: t('sla.engine.pause.onHold') || 'On Hold', description: t('sla.engine.pause.onHoldDesc') || 'Waiting for external dependency or customer response' },
              { key: 'pauseOnPending', label: t('sla.engine.pause.pending') || 'Pending', description: t('sla.engine.pause.pendingDesc') || 'Awaiting additional information or approval' },
              { key: 'pauseOnAwaitingCustomer', label: t('sla.engine.pause.awaitingCustomer') || 'Awaiting Customer', description: t('sla.engine.pause.awaitingCustomerDesc') || 'Waiting for customer action or response' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-start p-3 bg-muted/30 rounded-lg">
                <input
                  type="checkbox"
                  id={key}
                  checked={pauseConditions[key]}
                  onChange={(e) => setPauseConditions({ ...pauseConditions, [key]: e.target.checked })}
                  className="w-4 h-4 text-primary rounded mt-0.5 mr-2"
                />
                <label htmlFor={key} className="flex-1 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save and Reset Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={saving}
          leftIcon={<Icon name="RotateCcw" size={16} />}
        >
          {t('sla.engine.reset') || 'Reset to Defaults'}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          leftIcon={saving ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Save" size={16} />}
        >
          {saving ? (t('sla.engine.saving') || 'Saving...') : (t('sla.engine.save') || 'Save SLA Engine Configuration')}
        </Button>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">{t('sla.engine.info.title') || 'Important Information'}</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('sla.engine.info.description') || 'Changes to the SLA engine configuration will affect all new SLA calculations. Existing tickets will continue using their current SLA settings until they are updated or resolved.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlaRulesEngine;
