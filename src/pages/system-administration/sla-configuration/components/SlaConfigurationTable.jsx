import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { 
  getSlaConfigurations, 
  createSlaConfiguration, 
  updateSlaConfiguration, 
  deleteSlaConfiguration 
} from '../../../../services/slaConfigurationService';
import { getDepartments, getPriorities } from '../../../../services/lookupService';
import languageService from '../../../../services/languageService';

const SlaConfigurationTable = forwardRef((props, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  const [translations, setTranslations] = useState({});
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      handleCreate();
    }
  }));

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

  // Load lookups (departments and priorities) on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [deptData, prioData] = await Promise.all([
          getDepartments(),
          getPriorities()
        ]);
        
        console.log('Departments from API:', deptData);
        console.log('Priorities from API:', prioData);
        
        // Map departments to simple strings for compatibility
        const mappedDepts = deptData.map(d => d.name);
        setDepartments(mappedDepts);
        
        // Map priorities to the expected format with metadata
        const mappedPrios = prioData.map(p => {
          return {
            value: p.code,
            label: p.name,
            color: p.color || 'blue',
            hours: p.metadata?.hours || 24
          };
        });
        setPriorities(mappedPrios);
        
        console.log('Mapped departments:', mappedDepts);
        console.log('Mapped priorities:', mappedPrios);
        console.log('Departments state length:', mappedDepts.length);
        console.log('Priorities state length:', mappedPrios.length);
      } catch (err) {
        console.error('Error loading lookups:', err);
        console.error('Error details:', err.response?.data || err.message);
        // Set defaults on error
        setDepartments([]);
        setPriorities([
          { value: 'P1', label: 'P1 - Critical', color: 'red', hours: 4 },
          { value: 'P2', label: 'P2 - High', color: 'orange', hours: 8 },
          { value: 'P3', label: 'P3 - Medium', color: 'yellow', hours: 24 },
          { value: 'P4', label: 'P4 - Low', color: 'blue', hours: 72 }
        ]);
      }
    };
    loadLookups();
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

  const [formData, setFormData] = useState({
    department: '',
    priority: 'P3',
    duration_minutes: 1440,
    compliance_target: null,
    business_hours_only: true,
    pause_on_hold: true,
    pause_on_pending: true,
    escalation_threshold_percent: 80,
    description: '',
    is_active: true
  });

  // Load configurations on mount and when filters change
  useEffect(() => {
    fetchConfigurations();
  }, [filterDepartment, filterPriority]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filterDepartment !== 'all') params.department = filterDepartment;
      if (filterPriority !== 'all') params.priority = filterPriority;
      
      const response = await getSlaConfigurations(params);
      
      // Check if response has success property or if it's a paginated response
      if (response.success === false) {
        // Error from the service
        const errorMsg = response.message || 'Failed to load SLA configurations';
        setError(errorMsg);
        console.error('API Error:', errorMsg);
      } else if (response.data !== undefined) {
        // Paginated response from Laravel
        setConfigurations(response.data);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      // Handle authentication errors
      if (err.response?.status === 401) {
        setError('You need to be logged in to view SLA configurations');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'An error occurred while fetching configurations';
        setError(errorMsg);
      }
      console.error('Error fetching configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedConfig(null);
    setFormData({
      department: '',
      priority: 'P3',
      duration_minutes: 1440,
      compliance_target: null,
      business_hours_only: true,
      pause_on_hold: true,
      pause_on_pending: true,
      escalation_threshold_percent: 80,
      description: '',
      is_active: true
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setFormData({
      department: config.department,
      priority: config.priority,
      duration_minutes: config.duration_minutes,
      compliance_target: config.compliance_target ?? null,
      business_hours_only: config.business_hours_only,
      pause_on_hold: config.pause_on_hold,
      pause_on_pending: config.pause_on_pending,
      escalation_threshold_percent: config.escalation_threshold_percent,
      description: config.description || '',
      is_active: config.is_active
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validation
      if (!formData.department) {
        setError(t('sla.configuration.departmentRequired'));
        return;
      }
      
      if (!formData.priority) {
        setError(t('sla.configuration.priorityRequired'));
        return;
      }
      
      if (!formData.duration_minutes || formData.duration_minutes < 1) {
        setError(t('sla.configuration.durationRequired'));
        return;
      }
      
      let response;
      if (selectedConfig) {
        // Update existing
        response = await updateSlaConfiguration(selectedConfig.id, formData);
      } else {
        // Create new
        response = await createSlaConfiguration(formData);
      }
      
      if (response.success) {
        setSuccess(selectedConfig ? (t('sla.configuration.updateSuccess') || 'SLA configuration updated successfully') : (t('sla.configuration.createSuccess') || 'SLA configuration created successfully'));
        setIsModalOpen(false);
        fetchConfigurations();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || (t('sla.configuration.errorSaving') || 'Failed to save configuration'));
      }
    } catch (err) {
      setError(t('sla.configuration.errorSaving') || 'An error occurred while saving the configuration');
      console.error('Error saving configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('sla.configuration.deleteConfirm'))) {
      try {
        setLoading(true);
        const response = await deleteSlaConfiguration(id);
        
        if (response.success) {
          setSuccess(t('sla.configuration.deleteSuccess'));
          fetchConfigurations();
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(response.message || t('sla.configuration.errorDeleting'));
        }
      } catch (err) {
        setError(t('sla.configuration.errorDeleting'));
        console.error('Error deleting configuration:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getPriorityColor = (priority) => {
    const p = priorities.find(pr => pr.value === priority);
    return p?.color || 'gray';
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = 
      config.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (config.description && config.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDepartment = filterDepartment === 'all' || config.department === filterDepartment;
    const matchesPriority = filterPriority === 'all' || config.priority === filterPriority;

    return matchesSearch && matchesDepartment && matchesPriority;
  });

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
      {/* Filters and Search */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t('sla.configuration.title') || 'SLA Configurations'}</h3>
          <Button
            variant="primary"
            onClick={handleCreate}
            iconName="Plus"
            iconPosition="left"
          >
            {t('sla.configuration.addNew') || 'Add New SLA Configuration'}
          </Button>
        </div>
        
        {/* Debug Info */}
        {departments.length === 0 && priorities.length === 0 && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Loading departments and priorities... If this persists, check browser console for errors.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              icon="Search"
              placeholder={t('sla.configuration.search') || 'Search configurations...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={filterDepartment}
            onChange={(value) => setFilterDepartment(value)}
            options={[
              { value: 'all', label: t('sla.configuration.allDepartments') || 'All Departments' },
              ...departments.map(dept => ({ value: dept, label: dept }))
            ]}
            placeholder={t('sla.configuration.filterByDepartment') || 'Filter by department'}
          />
          <Select
            value={filterPriority}
            onChange={(value) => setFilterPriority(value)}
            options={[
              { value: 'all', label: t('sla.configuration.allPriorities') || 'All Priorities' },
              ...priorities.map(p => ({ value: p.value, label: p.label }))
            ]}
            placeholder={t('sla.configuration.filterByPriority') || 'Filter by priority'}
          />
        </div>
      </div>

      {/* SLA Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader" size={32} className="text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground">{t('sla.configuration.loading') || 'Loading configurations...'}</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('sla.configuration.department') || 'Department'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('sla.configuration.priority') || 'Priority'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('sla.configuration.duration')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('sla.configuration.settings')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('sla.configuration.escalationThreshold') || 'Escalation'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {'Compliance Target'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('sla.configuration.status') || 'Status'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('sla.configuration.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredConfigurations.map((config) => (
                <tr key={config.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Icon name="Building" size={16} className="text-muted-foreground mr-2" />
                      <span className="font-medium text-foreground">{config.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(config.priority)}-100 text-${getPriorityColor(config.priority)}-800 dark:bg-${getPriorityColor(config.priority)}-900/30 dark:text-${getPriorityColor(config.priority)}-400`}>
                      <Icon name="Flag" size={12} className="mr-1" />
                      {config.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{formatDuration(config.duration_minutes)}</p>
                      <p className="text-xs text-muted-foreground">{config.duration_minutes} {t('sla.configuration.minutes')}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {config.business_hours_only && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          <Icon name="Clock" size={10} className="mr-1" />
                          {t('sla.configuration.businessHours')}
                        </span>
                      )}
                      {config.pause_on_hold && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          <Icon name="Pause" size={10} className="mr-1" />
                          {t('sla.configuration.pauseOnHold')}
                        </span>
                      )}
                      {config.pause_on_pending && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                          <Icon name="Clock" size={10} className="mr-1" />
                          {t('sla.configuration.pauseOnPending')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 mr-2">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${config.escalation_threshold_percent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-foreground">{config.escalation_threshold_percent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {config.compliance_target != null ? (
                      <span className="text-sm font-semibold text-foreground">{config.compliance_target}%</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {config.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <Icon name="CheckCircle" size={12} className="mr-1" />
                        {t('sla.configuration.active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                        <Icon name="XCircle" size={12} className="mr-1" />
                        {t('sla.configuration.inactive')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Edit"
                        onClick={() => handleEdit(config)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Copy"
                        onClick={() => console.log('Duplicate')}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Trash2"
                        onClick={() => handleDelete(config.id)}
                        className="text-error hover:text-error hover:border-error"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-muted/30 px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t('sla.configuration.showing').replace('{count}', filteredConfigurations.length).replace('{total}', configurations.length)}
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="ChevronLeft">
                {t('sla.configuration.previous')}
              </Button>
              <Button variant="outline" size="sm" iconName="ChevronRight">
                {t('sla.configuration.next')}
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedConfig ? t('sla.configuration.editConfig') : t('sla.configuration.createConfig')}
        maxWidth="3xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('sla.configuration.department')}
              required
              value={formData.department}
              onChange={(value) => setFormData({ ...formData, department: value })}
              options={[
                { value: '', label: t('sla.configuration.selectDepartment') || 'Select Department' },
                ...departments.map(dept => ({ value: dept, label: dept }))
              ]}
              placeholder={t('sla.configuration.selectDepartment') || 'Select Department'}
            />

            <Select
              label={t('sla.configuration.priorityLevel')}
              required
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value })}
              options={priorities.map(p => ({ value: p.value, label: p.label }))}
              placeholder="Select Priority"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('sla.configuration.durationMinutes')}
              type="number"
              required
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              placeholder={t('sla.configuration.durationPlaceholder')}
            />

            <Input
              label={t('sla.configuration.escalationThresholdPercent')}
              type="number"
              min="0"
              max="100"
              value={formData.escalation_threshold_percent}
              onChange={(e) => setFormData({ ...formData, escalation_threshold_percent: parseInt(e.target.value) })}
              placeholder={t('sla.configuration.escalationPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Compliance Target (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.compliance_target ?? ''}
              onChange={(e) => setFormData({ ...formData, compliance_target: e.target.value !== '' ? parseFloat(e.target.value) : null })}
              placeholder="e.g. 95.00 — leave blank if no target"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('sla.configuration.description')}
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-[80px] p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
              placeholder={t('sla.configuration.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="businessHoursOnly"
                checked={formData.business_hours_only}
                onChange={(e) => setFormData({ ...formData, business_hours_only: e.target.checked })}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="businessHoursOnly" className="text-sm font-medium text-foreground">
                {t('sla.configuration.businessHoursDesc')}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pauseOnHold"
                checked={formData.pause_on_hold}
                onChange={(e) => setFormData({ ...formData, pause_on_hold: e.target.checked })}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="pauseOnHold" className="text-sm font-medium text-foreground">
                {t('sla.configuration.pauseOnHoldDesc')}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pauseOnPending"
                checked={formData.pause_on_pending}
                onChange={(e) => setFormData({ ...formData, pause_on_pending: e.target.checked })}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="pauseOnPending" className="text-sm font-medium text-foreground">
                {t('sla.configuration.pauseOnPendingDesc')}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                {t('sla.configuration.isActive')}
              </label>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start">
              <Icon name="AlertTriangle" size={16} className="text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {t('sla.configuration.warningMessage')}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              {t('sla.configuration.cancel')}
            </Button>
            <Button 
              variant="default" 
              onClick={handleSave}
              disabled={saving}
              iconName={saving ? "Loader" : "Save"}
              iconPosition="left"
            >
              {saving ? t('sla.configuration.saving') : t('sla.configuration.save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Empty State */}
      {filteredConfigurations.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Icon name="Settings" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('sla.configuration.noResults')}</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterDepartment !== 'all' || filterPriority !== 'all' 
              ? t('sla.configuration.noResultsDesc')
              : t('sla.configuration.noResultsEmpty')}
          </p>
          {!searchQuery && filterDepartment === 'all' && filterPriority === 'all' && (
            <Button variant="default" iconName="Plus" iconPosition="left" onClick={handleCreate}>
              {t('sla.configuration.createConfig')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

SlaConfigurationTable.displayName = 'SlaConfigurationTable';

export default SlaConfigurationTable;
