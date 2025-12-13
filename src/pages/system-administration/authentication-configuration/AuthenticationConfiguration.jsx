import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
  getConfigurationsByCategory,
  bulkUpdateConfigurations,
  clearConfigurationCache,
} from '../../../services/systemConfigurationService';

const AuthenticationConfiguration = () => {
  const [configurations, setConfigurations] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAuthConfigurations();
  }, []);

  const loadAuthConfigurations = async () => {
    try {
      setLoading(true);
      const response = await getConfigurationsByCategory('auth');

      if (response.success) {
        setConfigurations(response.data);

        // Initialize form data
        const initialData = {};
        response.data.forEach(config => {
          initialData[config.key] = config.value;
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error('Error loading authentication configurations:', error);
      showMessage('error', 'Failed to load authentication configurations');
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
      const configurationsToUpdate = Object.entries(formData).map(([key, value]) => ({
        key,
        value: value.toString(),
      }));

      const response = await bulkUpdateConfigurations({
        configurations: configurationsToUpdate,
      });

      if (response.success) {
        showMessage('success', 'Authentication configuration saved successfully');
        await clearConfigurationCache();
        await loadAuthConfigurations();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      showMessage('error', error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getFieldLabel = (key) => {
    const labels = {
      'auth.method': 'Authentication Method',
      'auth.allow_registration': 'Allow User Registration',
      'auth.require_email_verification': 'Require Email Verification',
    };
    return labels[key] || key;
  };

  const getFieldDescription = (key) => {
    const descriptions = {
      'auth.method': 'Choose between database-based authentication or LDAP/Active Directory',
      'auth.allow_registration': 'Allow users to self-register for accounts',
      'auth.require_email_verification': 'Require users to verify their email address before accessing the system',
    };
    return descriptions[key] || '';
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication configurations...</p>
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
              <Icon name="Shield" className="mr-2" size={24} />
              Authentication Configuration
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure authentication methods and user registration settings
            </p>
          </div>
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
        <h4 className="text-lg font-medium text-foreground mb-6">Authentication Settings</h4>

        <div className="space-y-6">
          {/* Authentication Method */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {getFieldLabel('auth.method')}
              </label>
              <select
                value={formData['auth.method'] || 'database'}
                onChange={(e) => handleInputChange('auth.method', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="database">Database Authentication</option>
                <option value="ldap">LDAP / Active Directory</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {getFieldDescription('auth.method')}
              </p>
            </div>

            {/* Info box for authentication method */}
            <div className={`p-4 rounded-lg border ${
              formData['auth.method'] === 'ldap'
                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
            }`}>
              <div className="flex items-start">
                <Icon
                  name={formData['auth.method'] === 'ldap' ? 'Server' : 'Database'}
                  size={20}
                  className={formData['auth.method'] === 'ldap'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-green-600 dark:text-green-400'
                  }
                />
                <div className="ml-3">
                  <h5 className={`text-sm font-medium mb-1 ${
                    formData['auth.method'] === 'ldap'
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-green-900 dark:text-green-100'
                  }`}>
                    {formData['auth.method'] === 'ldap' ? 'LDAP Authentication' : 'Database Authentication'}
                  </h5>
                  <p className={`text-xs ${
                    formData['auth.method'] === 'ldap'
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {formData['auth.method'] === 'ldap'
                      ? 'Users will authenticate against your LDAP/Active Directory server. Make sure to configure LDAP settings in the LDAP Configuration tab.'
                      : 'Users will authenticate using credentials stored in the database. This is the default authentication method.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-border" />

          {/* User Registration Settings */}
          <div className="space-y-4">
            <h5 className="text-md font-medium text-foreground">User Registration Settings</h5>

            {/* Allow Registration */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="allow_registration"
                checked={formData['auth.allow_registration'] === 'true' || formData['auth.allow_registration'] === true}
                onChange={(e) => handleInputChange('auth.allow_registration', e.target.checked)}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <div className="flex-1">
                <label htmlFor="allow_registration" className="text-sm font-medium text-foreground cursor-pointer">
                  {getFieldLabel('auth.allow_registration')}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {getFieldDescription('auth.allow_registration')}
                </p>
              </div>
            </div>

            {/* Require Email Verification */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="require_verification"
                checked={formData['auth.require_email_verification'] === 'true' || formData['auth.require_email_verification'] === true}
                onChange={(e) => handleInputChange('auth.require_email_verification', e.target.checked)}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <div className="flex-1">
                <label htmlFor="require_verification" className="text-sm font-medium text-foreground cursor-pointer">
                  {getFieldLabel('auth.require_email_verification')}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {getFieldDescription('auth.require_email_verification')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
          <div className="flex items-start">
            <Icon name="AlertTriangle" size={20} className="text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Security Notice
              </h5>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Changing authentication method will affect how all users login to the system.
                Make sure to configure and test the authentication method before switching.
                For LDAP authentication, ensure your LDAP server is properly configured and accessible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationConfiguration;
