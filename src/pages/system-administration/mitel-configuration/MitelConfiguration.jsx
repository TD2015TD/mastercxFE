import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import mitelConfigService from '../../../services/mitelConfigService';

const MitelConfiguration = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    // Clear the mitel config cache when component mounts to ensure fresh data
    mitelConfigService.clearCache();
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mitel-config');

      if (response.data.status === 'success') {
        // Define the desired order of configuration fields
        const fieldOrder = [
          'MITEL_BASE_URL',
          'MITEL_API_PATH',
          'MITEL_SIGNALR_URL',
          'MITEL_CLIENT_ID',
          'MITEL_CLIENT_SECRET'
        ];

        // Convert object to array and sort by the defined order
        const configArray = fieldOrder
          .filter(key => response.data.data.hasOwnProperty(key))
          .map(key => ({
            key,
            value: response.data.data[key],
            description: getDescription(key)
          }));

        // Add any additional fields that weren't in the predefined order
        Object.entries(response.data.data).forEach(([key, value]) => {
          if (!fieldOrder.includes(key)) {
            configArray.push({
              key,
              value,
              description: getDescription(key)
            });
          }
        });

        setConfigs(configArray);
      }
    } catch (error) {
      console.error('Error loading Mitel configurations:', error);
      toast.error('Failed to load Mitel configurations');
    } finally {
      setLoading(false);
    }
  };

  const getDescription = (key) => {
    const descriptions = {
      MITEL_BASE_URL: 'Base URL for Mitel MiContact Center API (e.g., https://micc.telediant.com.my)',
      MITEL_API_PATH: 'API path for Mitel SDK endpoints (e.g., /miccsdk or /MiccSdk)',
      MITEL_SIGNALR_URL: 'SignalR URL for real-time notifications from Mitel',
      MITEL_CLIENT_ID: 'OAuth Client ID for Mitel API authentication',
      MITEL_CLIENT_SECRET: 'OAuth Client Secret for Mitel API authentication'
    };
    return descriptions[key] || 'Configuration value';
  };

  const getIcon = (key) => {
    if (key.includes('URL')) return 'Link';
    if (key.includes('PATH')) return 'Folder';
    if (key.includes('CLIENT_ID')) return 'Key';
    if (key.includes('SECRET')) return 'Lock';
    return 'Settings';
  };

  const handleEdit = (config) => {
    setEditingKey(config.key);
    setEditValue(config.value);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSave = async (key) => {
    try {
      const response = await api.put(`/mitel-config/${key}`, {
        value: editValue
      });

      if (response.data.status === 'success') {
        toast.success('Configuration updated successfully');

        // Clear the mitel config service cache so it fetches fresh data
        mitelConfigService.clearCache();

        // Reload configurations
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

      // Fetch the latest configuration
      const config = await mitelConfigService.getConfig();

      // Build the status endpoint URL
      const apiPath = config.MITEL_API_PATH || '/miccsdk';
      const statusUrl = `${config.MITEL_BASE_URL}${apiPath}/api/v1/status`;

      console.log('Testing Mitel connection to:', statusUrl);

      // Try to call the Status API endpoint
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Mitel Status Response:', data);

        toast.success(
          `✓ Connection successful! Mitel API is reachable and responding.`,
          { autoClose: 5000 }
        );
      } else {
        const errorText = await response.text();
        console.error('Status endpoint returned error:', response.status, errorText);

        toast.warning(
          `Connection reached but returned status ${response.status}. The URL may be correct but authentication might be required.`,
          { autoClose: 7000 }
        );
      }
    } catch (error) {
      console.error('Connection test failed:', error);

      if (error.message.includes('Failed to fetch')) {
        toast.error(
          'Connection failed - Unable to reach the Mitel server. Please verify:\n' +
          '1. The Base URL is correct\n' +
          '2. The API Path is correct\n' +
          '3. The server is accessible from this network\n' +
          '4. CORS is configured on the Mitel server',
          { autoClose: 10000 }
        );
      } else {
        toast.error(`Connection test failed: ${error.message}`);
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const renderConfigRow = (config) => {
    const isEditing = editingKey === config.key;
    const isSecret = config.key.includes('SECRET');

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
                {config.key.replace(/MITEL_/g, '').replace(/_/g, ' ')}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {config.description}
              </p>

              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type={isSecret ? 'password' : 'text'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={`Enter ${config.key}`}
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="default"
                      iconName="Check"
                      iconPosition="left"
                      onClick={() => handleSave(config.key)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      iconName="X"
                      iconPosition="left"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <code className="text-sm bg-muted px-3 py-1.5 rounded border border-border font-mono">
                    {isSecret && config.value ? '••••••••••••••••' : config.value || 'Not set'}
                  </code>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <Button
              size="sm"
              variant="ghost"
              iconName="Edit"
              onClick={() => handleEdit(config)}
            />
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
          <p className="text-muted-foreground">Loading Mitel configurations...</p>
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
            <Icon name="Phone" className="mr-3" size={28} />
            Mitel Integration Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure Mitel MiContact Center connection settings and credentials
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={loadConfigurations}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="default"
            iconName="Zap"
            iconPosition="left"
            onClick={testConnection}
            disabled={testingConnection}
          >
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
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
              These settings control how the CRM system connects to your Mitel MiContact Center.
              Changes are applied immediately to all connected agents. The frontend will automatically
              fetch the latest configuration without requiring a rebuild or refresh.
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
              <li>Client credentials are stored securely in the database</li>
              <li>Only administrators can view and modify these settings</li>
              <li>All changes are logged in the system audit trail</li>
              <li>Ensure HTTPS is used for the Mitel base URL in production</li>
              <li>Never share client secrets publicly or in unsecured communications</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration Guide */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="BookOpen" className="mr-2" size={20} />
          Configuration Guide
        </h3>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">MITEL_BASE_URL:</strong>
            <p className="mt-1">
              The base URL of your Mitel MiContact Center server. This should include the protocol (https://)
              and domain name. Example: <code className="bg-muted px-2 py-0.5 rounded">https://micc.telediant.com.my</code>
            </p>
          </div>
          <div>
            <strong className="text-foreground">MITEL_API_PATH:</strong>
            <p className="mt-1">
              The API path for Mitel SDK endpoints. This is typically <code className="bg-muted px-2 py-0.5 rounded">/miccsdk</code> or
              <code className="bg-muted px-2 py-0.5 rounded">/MiccSdk</code> (case-sensitive). The full API URL will be:
              BASE_URL + API_PATH + /api/v1/...
            </p>
            <p className="mt-1 text-xs">
              Example: <code className="bg-muted px-2 py-0.5 rounded">https://micc.telediant.com.my/miccsdk/api/v1/status</code>
            </p>
          </div>
          <div>
            <strong className="text-foreground">MITEL_SIGNALR_URL:</strong>
            <p className="mt-1">
              The SignalR endpoint for real-time notifications. This is typically the base URL followed by the
              API path and <code className="bg-muted px-2 py-0.5 rounded">/signalr</code>
            </p>
            <p className="mt-1 text-xs">
              Example: <code className="bg-muted px-2 py-0.5 rounded">https://micc.telediant.com.my/miccsdk/signalr</code>
            </p>
          </div>
          <div>
            <strong className="text-foreground">MITEL_CLIENT_ID:</strong>
            <p className="mt-1">
              The OAuth 2.0 client identifier provided by your Mitel administrator. This identifies your CRM
              application to the Mitel system.
            </p>
          </div>
          <div>
            <strong className="text-foreground">MITEL_CLIENT_SECRET:</strong>
            <p className="mt-1">
              The OAuth 2.0 client secret that authenticates your application. Keep this value confidential
              and never expose it in client-side code or public repositories.
            </p>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">Connection Test:</p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              The "Test Connection" button will verify connectivity by calling the Status API endpoint:
              <code className="bg-muted px-1.5 py-0.5 rounded ml-1">BASE_URL + API_PATH + /api/v1/status</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitelConfiguration;
