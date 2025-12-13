import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
  getConfigurationsByCategory,
  bulkUpdateConfigurations,
  testLdapConnection,
  clearConfigurationCache,
} from '../../../services/systemConfigurationService';

const LdapConfiguration = () => {
  const [configurations, setConfigurations] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadLdapConfigurations();
  }, []);

  const loadLdapConfigurations = async () => {
    try {
      setLoading(true);
      const response = await getConfigurationsByCategory('ldap');

      if (response.success) {
        setConfigurations(response.data);

        // Initialize form data
        const initialData = {};
        response.data.forEach(config => {
          initialData[config.key] = config.is_encrypted ? '' : config.value;
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error('Error loading LDAP configurations:', error);
      showMessage('error', 'Failed to load LDAP configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      // Prepare configurations for bulk update
      const configurationsToUpdate = Object.entries(formData)
        .filter(([key, value]) => value !== '') // Only update non-empty values
        .map(([key, value]) => ({
          key,
          value: typeof value === 'boolean' ? value.toString() : value,
        }));

      const response = await bulkUpdateConfigurations({
        configurations: configurationsToUpdate,
      });

      if (response.success) {
        showMessage('success', 'LDAP configuration saved successfully');
        await clearConfigurationCache();
        await loadLdapConfigurations();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      showMessage('error', error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setMessage({ type: '', text: '' });

      const response = await testLdapConnection();

      if (response.success) {
        showMessage('success', 'LDAP connection successful! Your LDAP server is properly configured.');
      } else {
        showMessage('error', response.message || 'LDAP connection failed');
      }
    } catch (error) {
      console.error('Error testing LDAP connection:', error);
      showMessage('error', error.response?.data?.message || 'Failed to test LDAP connection');
    } finally {
      setTesting(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getFieldLabel = (key) => {
    const labels = {
      'ldap.host': 'LDAP Server Host',
      'ldap.port': 'LDAP Port',
      'ldap.base_dn': 'Base DN',
      'ldap.username': 'Bind Username (DN)',
      'ldap.password': 'Bind Password',
      'ldap.use_ssl': 'Use SSL/TLS',
      'ldap.user_search_attribute': 'User Search Attribute',
    };
    return labels[key] || key;
  };

  const getFieldDescription = (key) => {
    const descriptions = {
      'ldap.host': 'LDAP server hostname or IP address (e.g., ldap.example.com)',
      'ldap.port': 'LDAP server port (389 for LDAP, 636 for LDAPS)',
      'ldap.base_dn': 'Base Distinguished Name for LDAP searches (e.g., dc=example,dc=com)',
      'ldap.username': 'Bind DN for LDAP authentication (e.g., cn=admin,dc=example,dc=com)',
      'ldap.password': 'Password for the bind DN',
      'ldap.use_ssl': 'Enable SSL/TLS encryption for LDAP connection',
      'ldap.user_search_attribute': 'Attribute used to search for users (e.g., uid, cn, sAMAccountName)',
    };
    return descriptions[key] || '';
  };

  const getFieldType = (config) => {
    if (config.is_encrypted || config.key.includes('password')) {
      return 'password';
    }
    if (config.key.includes('port')) {
      return 'number';
    }
    return 'text';
  };

  const getFieldPlaceholder = (config) => {
    const placeholders = {
      'ldap.host': 'ldap.yourcompany.com',
      'ldap.port': '389',
      'ldap.base_dn': 'dc=yourcompany,dc=com',
      'ldap.username': 'cn=admin,dc=yourcompany,dc=com',
      'ldap.password': '••••••••',
      'ldap.user_search_attribute': 'uid',
    };
    return placeholders[config.key] || `Enter ${getFieldLabel(config.key).toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading LDAP configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Icon name="Server" className="mr-2" size={24} />
              LDAP Configuration
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure LDAP/Active Directory settings for user authentication
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              iconName="Zap"
              iconPosition="left"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              variant="default"
              iconName="Save"
              iconPosition="left"
              onClick={handleSaveConfiguration}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-success/10 text-success border border-success/20' :
            message.type === 'error' ? 'bg-error/10 text-error border border-error/20' :
            'bg-primary/10 text-primary border border-primary/20'
          }`}>
            <div className="flex items-center">
              <Icon
                name={message.type === 'success' ? 'CheckCircle' : message.type === 'error' ? 'AlertCircle' : 'Info'}
                size={20}
                className="mr-2"
              />
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h4 className="text-lg font-medium text-foreground mb-6">LDAP Server Settings</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configurations.map((config) => (
            <div key={config.id} className={config.key === 'ldap.base_dn' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-foreground mb-2">
                {getFieldLabel(config.key)}
                {config.is_encrypted && (
                  <span className="ml-2 text-xs text-muted-foreground">(Encrypted)</span>
                )}
              </label>

              {config.key === 'ldap.use_ssl' ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={config.key}
                    checked={formData[config.key] === 'true' || formData[config.key] === true}
                    onChange={(e) => handleInputChange(config.key, e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor={config.key} className="text-sm text-muted-foreground">
                    Enable SSL/TLS encryption (Use port 636 for LDAPS)
                  </label>
                </div>
              ) : (
                <input
                  type={getFieldType(config)}
                  value={formData[config.key] || ''}
                  onChange={(e) => handleInputChange(config.key, e.target.value)}
                  placeholder={getFieldPlaceholder(config)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}

              {getFieldDescription(config.key) && (
                <p className="text-xs text-muted-foreground mt-1">{getFieldDescription(config.key)}</p>
              )}
            </div>
          ))}
        </div>

        {/* LDAP Configuration Guide */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="flex items-start">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                LDAP Configuration Guide
              </h5>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Active Directory:</strong> Use port 389 (LDAP) or 636 (LDAPS). Search attribute is typically <code>sAMAccountName</code></li>
                <li>• <strong>OpenLDAP:</strong> Use port 389 (LDAP) or 636 (LDAPS). Search attribute is typically <code>uid</code> or <code>cn</code></li>
                <li>• <strong>Base DN:</strong> The root of your LDAP directory (e.g., <code>dc=company,dc=com</code>)</li>
                <li>• <strong>Bind DN:</strong> Admin account with read permissions (e.g., <code>cn=admin,dc=company,dc=com</code>)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example Configurations */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Directory Example */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <h6 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Icon name="Folder" size={16} className="mr-2" />
              Active Directory Example
            </h6>
            <div className="text-xs text-muted-foreground space-y-1 font-mono">
              <div><strong>Host:</strong> ad.company.com</div>
              <div><strong>Port:</strong> 389</div>
              <div><strong>Base DN:</strong> dc=company,dc=com</div>
              <div><strong>Bind DN:</strong> cn=ldapread,cn=Users,dc=company,dc=com</div>
              <div><strong>Search Attr:</strong> sAMAccountName</div>
            </div>
          </div>

          {/* OpenLDAP Example */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <h6 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Icon name="Folder" size={16} className="mr-2" />
              OpenLDAP Example
            </h6>
            <div className="text-xs text-muted-foreground space-y-1 font-mono">
              <div><strong>Host:</strong> ldap.company.com</div>
              <div><strong>Port:</strong> 389</div>
              <div><strong>Base DN:</strong> ou=people,dc=company,dc=com</div>
              <div><strong>Bind DN:</strong> cn=admin,dc=company,dc=com</div>
              <div><strong>Search Attr:</strong> uid</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
          <div className="flex items-start">
            <Icon name="AlertTriangle" size={20} className="text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Important Security Notes
              </h5>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Always test the LDAP connection before enabling LDAP authentication</li>
                <li>• Use SSL/TLS encryption when connecting to production LDAP servers</li>
                <li>• Ensure the bind DN account has read-only permissions</li>
                <li>• Configure firewall rules to allow LDAP traffic from your application server</li>
                <li>• Keep LDAP credentials secure and rotate them regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LdapConfiguration;
