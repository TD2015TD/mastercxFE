import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import supersetConfigService from '../../../services/supersetConfigService';

const SupersetConfiguration = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    supersetConfigService.clearCache();
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superset-config');

      if (response.data.status === 'success') {
        const fieldOrder = ['SUPERSET_URL', 'SUPERSET_USERNAME', 'SUPERSET_PASSWORD'];
        const data = response.data.data;
        let configArray = [];

        if (Array.isArray(data)) {
          // Admin route format: [{key, value, has_value, description, is_secret}, ...]
          configArray = fieldOrder
            .map(key => data.find(c => c.key === key))
            .filter(Boolean)
            .map(c => ({
              key: c.key,
              value: c.is_secret ? null : c.value,
              hasValue: c.is_secret ? c.has_value : null,
              description: getDescription(c.key),
              isSecret: c.is_secret,
            }));

          data.filter(c => !fieldOrder.includes(c.key)).forEach(c => {
            configArray.push({
              key: c.key,
              value: c.is_secret ? null : c.value,
              hasValue: c.is_secret ? c.has_value : null,
              description: c.description || getDescription(c.key),
              isSecret: c.is_secret,
            });
          });
        } else {
          // Public route format: {SUPERSET_URL: '...', SUPERSET_USERNAME: '...', ...}
          configArray = fieldOrder
            .filter(key => Object.prototype.hasOwnProperty.call(data, key))
            .map(key => ({
              key,
              value: data[key],
              description: getDescription(key),
              isSecret: key === 'SUPERSET_PASSWORD',
            }));

          Object.entries(data).forEach(([key, value]) => {
            if (!fieldOrder.includes(key)) {
              configArray.push({
                key,
                value: typeof value === 'string' ? value : null,
                description: getDescription(key),
                isSecret: false,
              });
            }
          });
        }

        setConfigs(configArray);
      }
    } catch (error) {
      console.error('Error loading Superset configurations:', error);
      toast.error('Failed to load Superset configurations');
    } finally {
      setLoading(false);
    }
  };

  const getDescription = (key) => {
    const descriptions = {
      SUPERSET_URL: 'Apache Superset base URL (e.g., http://superset.example.com or http://localhost:8088)',
      SUPERSET_USERNAME: 'Admin username used by the CRM to authenticate with Superset API',
      SUPERSET_PASSWORD: 'Admin password used by the CRM to authenticate with Superset API',
    };
    return descriptions[key] || 'Configuration value';
  };

  const getIcon = (key) => {
    if (key.includes('URL')) return 'Link';
    if (key.includes('USERNAME')) return 'User';
    if (key.includes('PASSWORD')) return 'Lock';
    return 'Settings';
  };

  const handleEdit = (config) => {
    setEditingKey(config.key);
    // Secret fields: always start empty so user types a new value
    setEditValue(config.isSecret ? '' : (config.value || ''));
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSave = async (key) => {
    try {
      const response = await api.put(`/superset-config/${key}`, { value: editValue });

      if (response.data.status === 'success') {
        toast.success('Configuration updated successfully');
        supersetConfigService.clearCache();
        await loadConfigurations();
        setEditingKey(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error(error.response?.data?.message || 'Failed to update configuration');
    }
  };

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      const url = await supersetConfigService.getUrl();

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        toast.success('Superset server is reachable and healthy.', { autoClose: 5000 });
      } else {
        toast.warning(
          `Superset responded with status ${response.status}. The URL may be correct but the server returned an error.`,
          { autoClose: 7000 }
        );
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error(
        'Cannot reach Superset server. Check the URL and ensure the server is running.',
        { autoClose: 8000 }
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const renderConfigRow = (config) => {
    const isEditing = editingKey === config.key;

    return (
      <div
        key={config.key}
        className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={getIcon(config.key)} size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {config.key.replace(/SUPERSET_/g, '').replace(/_/g, ' ')}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">{config.description}</p>

              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type={config.isSecret ? 'password' : 'text'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={`Enter ${config.key}`}
                  />
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="default" iconName="Check" iconPosition="left" onClick={() => handleSave(config.key)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" iconName="X" iconPosition="left" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <code className="text-sm bg-muted px-3 py-1.5 rounded border border-border font-mono">
                    {config.isSecret
                      ? (config.hasValue ? '••••••••••••••••' : 'Not set')
                      : (config.value || 'Not set')}
                  </code>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <Button size="sm" variant="ghost" iconName="Edit" onClick={() => handleEdit(config)} />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Icon name="Loader" size={40} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Superset configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <Icon name="BarChart3" className="mr-3" size={28} />
            Superset Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure Apache Superset connection settings for embedded reporting dashboards
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={loadConfigurations} disabled={loading}>
          Refresh
        </Button>
        <Button variant="default" iconName="Zap" iconPosition="left" onClick={testConnection} disabled={testingConnection}>
          {testingConnection ? 'Testing...' : 'Test Connection'}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Configuration Management
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              These settings control how the CRM connects to Apache Superset for embedded dashboards and reports.
              Changes take effect immediately without restarting the server.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 gap-4">
        {configs.map(config => renderConfigRow(config))}
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="AlertTriangle" size={20} className="text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
              Security Notice
            </h4>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
              <li>Credentials are stored securely in the database</li>
              <li>The password is never exposed through the API</li>
              <li>Only administrators can view and modify these settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupersetConfiguration;
