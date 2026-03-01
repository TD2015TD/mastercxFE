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
  const [telephonyEnabled, setTelephonyEnabled] = useState(false);
  const [togglingTelephony, setTogglingTelephony] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Database Connection Management State
  const [activeTab, setActiveTab] = useState('api-config'); // 'api-config' or 'db-connections'
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [connectionForm, setConnectionForm] = useState({
    name: '',
    host: '',
    port: '1433',
    database: '',
    username: '',
    password: '',
    is_active: true,
    sync_schedule: '0 * * * *'
  });
  const [testingDbConnection, setTestingDbConnection] = useState(null);
  const [syncingConnection, setSyncingConnection] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedConnectionLogs, setSelectedConnectionLogs] = useState(null);
  const [connectionLogs, setConnectionLogs] = useState([]);

  useEffect(() => {
    // Clear the mitel config cache when component mounts to ensure fresh data
    mitelConfigService.clearCache();
    loadConfigurations();
    loadConnections();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mitel-config');

      if (response.data.status === 'success') {
        const data = response.data.data;

        // Extract telephony toggle separately
        if (data.hasOwnProperty('TELEPHONY_ENABLED')) {
          setTelephonyEnabled(data['TELEPHONY_ENABLED'] === 'true');
        }

        // Define the desired order of configuration fields (exclude TELEPHONY_ENABLED)
        const fieldOrder = [
          'MITEL_BASE_URL',
          'MITEL_API_PATH',
          'MITEL_SIGNALR_URL',
          'MITEL_CLIENT_ID',
          'MITEL_CLIENT_SECRET'
        ];

        // Convert object to array and sort by the defined order
        const configArray = fieldOrder
          .filter(key => data.hasOwnProperty(key))
          .map(key => ({
            key,
            value: data[key],
            description: getDescription(key)
          }));

        // Add any additional fields not in the predefined order (except TELEPHONY_ENABLED)
        Object.entries(data).forEach(([key, value]) => {
          if (!fieldOrder.includes(key) && key !== 'TELEPHONY_ENABLED') {
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

  const handleTelephonyToggle = async () => {
    try {
      setTogglingTelephony(true);
      const newValue = !telephonyEnabled;
      const response = await api.put('/mitel-config/TELEPHONY_ENABLED', {
        value: newValue.toString()
      });

      if (response.data.status === 'success') {
        setTelephonyEnabled(newValue);
        mitelConfigService.clearCache();
        window.dispatchEvent(new CustomEvent('telephony_enabled_changed', { detail: newValue }));
        toast.success(`Telephony ${newValue ? 'enabled' : 'disabled'} for all agents`);
      }
    } catch (error) {
      console.error('Error toggling telephony:', error);
      toast.error('Failed to update telephony setting');
    } finally {
      setTogglingTelephony(false);
    }
  };

  // Database Connection Management Functions
  const loadConnections = async () => {
    try {
      setLoadingConnections(true);
      const response = await api.get('/mitel-connections');
      if (response.data.status === 'success') {
        setConnections(response.data.data);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error('Failed to load database connections');
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleConnectionFormChange = (field, value) => {
    setConnectionForm(prev => ({ ...prev, [field]: value }));
  };

  const openConnectionModal = (connection = null) => {
    if (connection) {
      setEditingConnection(connection);
      setConnectionForm({
        name: connection.name,
        host: connection.host,
        port: connection.port.toString(),
        database: connection.database,
        username: connection.username,
        password: '', // Don't show existing password
        is_active: connection.is_active,
        sync_schedule: connection.sync_schedule || '0 * * * *'
      });
    } else {
      setEditingConnection(null);
      setConnectionForm({
        name: '',
        host: '',
        port: '1433',
        database: '',
        username: '',
        password: '',
        is_active: true,
        sync_schedule: '0 * * * *'
      });
    }
    setShowConnectionModal(true);
  };

  const closeConnectionModal = () => {
    setShowConnectionModal(false);
    setEditingConnection(null);
    setConnectionForm({
      name: '',
      host: '',
      port: '1433',
      database: '',
      username: '',
      password: '',
      is_active: true,
      sync_schedule: '0 * * * *'
    });
  };

  const saveConnection = async () => {
    try {
      // Validation
      if (!connectionForm.name || !connectionForm.host || !connectionForm.database || !connectionForm.username) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingConnection) {
        // Update existing connection
        const payload = { ...connectionForm };
        if (!payload.password) {
          delete payload.password; // Don't update password if not provided
        }
        
        const response = await api.put(`/mitel-connections/${editingConnection.id}`, payload);
        if (response.data.status === 'success') {
          toast.success('Connection updated successfully');
          loadConnections();
          closeConnectionModal();
        }
      } else {
        // Create new connection
        if (!connectionForm.password) {
          toast.error('Password is required for new connections');
          return;
        }
        
        const response = await api.post('/mitel-connections', connectionForm);
        if (response.data.status === 'success') {
          toast.success('Connection created successfully');
          loadConnections();
          closeConnectionModal();
        }
      }
    } catch (error) {
      console.error('Error saving connection:', error);
      toast.error(error.response?.data?.message || 'Failed to save connection');
    }
  };

  const deleteConnection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this connection? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/mitel-connections/${id}`);
      if (response.data.status === 'success') {
        toast.success('Connection deleted successfully');
        loadConnections();
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error(error.response?.data?.message || 'Failed to delete connection');
    }
  };

  const testDbConnection = async (id) => {
    try {
      setTestingDbConnection(id);
      const response = await api.post(`/mitel-connections/${id}/test`);
      
      if (response.data.status === 'success') {
        toast.success('✓ Database connection successful!', { autoClose: 5000 });
      } else {
        toast.error(response.data.message || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(error.response?.data?.message || 'Failed to test connection');
    } finally {
      setTestingDbConnection(null);
    }
  };

  const syncConnection = async (id) => {
    try {
      setSyncingConnection(id);
      const response = await api.post(`/mitel-connections/${id}/sync`, {
        type: 'full'
      });
      
      if (response.data.status === 'success') {
        toast.success('Sync started successfully! This may take a few minutes.', { autoClose: 5000 });
        // Refresh connections to update sync status
        setTimeout(() => loadConnections(), 2000);
      }
    } catch (error) {
      console.error('Error syncing connection:', error);
      toast.error(error.response?.data?.message || 'Failed to start sync');
    } finally {
      setSyncingConnection(null);
    }
  };

  const viewConnectionLogs = async (connection) => {
    try {
      setSelectedConnectionLogs(connection);
      const response = await api.get(`/mitel-connections/${connection.id}/logs`);
      
      if (response.data.status === 'success') {
        setConnectionLogs(response.data.data);
        setShowLogsModal(true);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Failed to load connection logs');
    }
  };

  const closeLogsModal = () => {
    setShowLogsModal(false);
    setSelectedConnectionLogs(null);
    setConnectionLogs([]);
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
            Configure Mitel MiContact Center connection settings and data synchronization
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('api-config')}
            className={`pb-3 px-2 font-medium text-sm transition-colors ${
              activeTab === 'api-config'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Link" size={16} className="inline mr-2" />
            API Configuration
          </button>
          <button
            onClick={() => setActiveTab('db-connections')}
            className={`pb-3 px-2 font-medium text-sm transition-colors ${
              activeTab === 'db-connections'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Database" size={16} className="inline mr-2" />
            Database Connections
          </button>
        </div>
      </div>

      {/* API Configuration Tab */}
      {activeTab === 'api-config' && (
        <div className="space-y-6">
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

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Configuration Management
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  These settings control how the CRM system connects to your Mitel MiContact Center API.
                  Changes are applied immediately to all connected agents.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon name="Loader" size={40} className="text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading configurations...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Telephony Enable/Disable Toggle */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${telephonyEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Icon name="Phone" size={20} className={telephonyEnabled ? 'text-green-600' : 'text-gray-400'} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Telephony Features</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enable or disable the telephony bar and call features for all agents. When disabled, agents cannot make or receive calls through the CRM.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleTelephonyToggle}
                    disabled={togglingTelephony}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      telephonyEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                    } ${togglingTelephony ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={telephonyEnabled ? 'Disable telephony for all agents' : 'Enable telephony for all agents'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        telephonyEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-3 flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    telephonyEnabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    <Icon name={telephonyEnabled ? 'CheckCircle2' : 'XCircle'} size={12} className="mr-1" />
                    {telephonyEnabled ? 'Enabled' : 'Disabled'}
                  </span>
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
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Database Connections Tab */}
      {activeTab === 'db-connections' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={() => openConnectionModal()}
            >
              Add Connection
            </Button>
            <Button
              variant="outline"
              iconName="RefreshCw"
              iconPosition="left"
              onClick={loadConnections}
              disabled={loadingConnections}
            >
              Refresh
            </Button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Database Connection Management
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Configure SQL Server connections to sync Mitel CCMData tables. Each connection can be scheduled
                  to sync automatically using cron expressions.
                </p>
              </div>
            </div>
          </div>

          {loadingConnections ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon name="Loader" size={40} className="text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading connections...</p>
              </div>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Icon name="Database" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Connections Configured</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a database connection to start syncing Mitel data
              </p>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => openConnectionModal()}
              >
                Add Connection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {connections.map(connection => (
                <div
                  key={connection.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="Database" size={24} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {connection.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            connection.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {connection.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Host:</span>
                            <code className="ml-2 text-foreground">{connection.host}:{connection.port}</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Database:</span>
                            <code className="ml-2 text-foreground">{connection.database}</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Username:</span>
                            <code className="ml-2 text-foreground">{connection.username}</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Schedule:</span>
                            <code className="ml-2 text-foreground">{connection.sync_schedule || 'Hourly'}</code>
                          </div>
                        </div>

                        {connection.last_sync_at && (
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Icon name="Clock" size={14} />
                              <span>Last sync: {new Date(connection.last_sync_at).toLocaleString()}</span>
                            </div>
                            {connection.sync_status && (
                              <span className={`px-2 py-0.5 rounded font-medium ${
                                connection.sync_status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : connection.sync_status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {connection.sync_status}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="Play"
                        onClick={() => syncConnection(connection.id)}
                        disabled={syncingConnection === connection.id || connection.sync_status === 'in_progress'}
                        title="Start sync"
                      >
                        {syncingConnection === connection.id ? 'Syncing...' : ''}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="Edit"
                        onClick={() => openConnectionModal(connection)}
                        title="Edit connection"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        iconName="Trash2"
                        onClick={() => deleteConnection(connection.id)}
                        title="Delete connection"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                {editingConnection ? 'Edit Connection' : 'Add Connection'}
              </h3>
              <button onClick={closeConnectionModal} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Connection Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={connectionForm.name}
                  onChange={(e) => handleConnectionFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Production CCMData"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Host <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={connectionForm.host}
                    onChange={(e) => handleConnectionFormChange('host', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 10.0.0.84"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Port <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={connectionForm.port}
                    onChange={(e) => handleConnectionFormChange('port', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="1433"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Database <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={connectionForm.database}
                  onChange={(e) => handleConnectionFormChange('database', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., CCMData"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={connectionForm.username}
                  onChange={(e) => handleConnectionFormChange('username', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Database username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password {!editingConnection && <span className="text-red-500">*</span>}
                  {editingConnection && <span className="text-xs text-muted-foreground ml-2">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={connectionForm.password}
                  onChange={(e) => handleConnectionFormChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Database password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sync Schedule (Cron Expression)
                </label>
                <input
                  type="text"
                  value={connectionForm.sync_schedule}
                  onChange={(e) => handleConnectionFormChange('sync_schedule', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 0 * * * * (hourly)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Examples: <code>0 * * * *</code> (hourly), <code>0 0 * * *</code> (daily), <code>*/15 * * * *</code> (every 15 min)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={connectionForm.is_active}
                  onChange={(e) => handleConnectionFormChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-foreground">
                  Active (enable automatic syncing)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-border">
              <Button
                variant="outline"
                iconName="X"
                iconPosition="left"
                onClick={closeConnectionModal}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName="Check"
                iconPosition="left"
                onClick={saveConnection}
              >
                {editingConnection ? 'Update' : 'Create'} Connection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedConnectionLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Sync Logs: {selectedConnectionLogs.name}
              </h3>
              <button onClick={closeLogsModal} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={24} />
              </button>
            </div>

            {connectionLogs.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sync logs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-background border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : log.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.started_at).toLocaleString()}
                        </span>
                      </div>
                      {log.duration && (
                        <span className="text-sm text-muted-foreground">
                          {log.duration}
                        </span>
                      )}
                    </div>

                    {log.tables_synced && log.tables_synced.length > 0 && (
                      <div className="text-sm mb-2">
                        <span className="text-muted-foreground">Tables: </span>
                        <span className="text-foreground">{log.tables_synced.join(', ')}</span>
                      </div>
                    )}

                    {log.records_synced !== null && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Records synced: </span>
                        <span className="text-foreground font-medium">{log.records_synced.toLocaleString()}</span>
                      </div>
                    )}

                    {log.error_message && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                        {log.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6 pt-6 border-t border-border">
              <Button
                variant="outline"
                iconName="X"
                iconPosition="left"
                onClick={closeLogsModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MitelConfiguration;
