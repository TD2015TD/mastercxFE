import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
  getConfigurationsByCategory,
  bulkUpdateConfigurations,
  testMailConfiguration,
  clearConfigurationCache,
} from '../../../services/systemConfigurationService';

const EmailConfiguration = () => {
  const [configurations, setConfigurations] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadEmailConfigurations();
  }, []);

  const loadEmailConfigurations = async () => {
    try {
      setLoading(true);
      const response = await getConfigurationsByCategory('mail');

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
      console.error('Error loading email configurations:', error);
      showMessage('error', 'Failed to load email configurations');
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
          value,
        }));

      const response = await bulkUpdateConfigurations({
        configurations: configurationsToUpdate,
      });

      if (response.success) {
        showMessage('success', 'Email configuration saved successfully');
        await clearConfigurationCache();
        await loadEmailConfigurations();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      showMessage('error', error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showMessage('error', 'Please enter a test email address');
      return;
    }

    try {
      setTesting(true);
      setMessage({ type: '', text: '' });

      const response = await testMailConfiguration(testEmail);

      if (response.success) {
        showMessage('success', 'Test email sent successfully! Please check your inbox.');
        setShowTestModal(false);
        setTestEmail('');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showMessage('error', error.response?.data?.message || 'Failed to send test email');
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
      'mail.driver': 'Mail Driver',
      'mail.host': 'SMTP Host',
      'mail.port': 'SMTP Port',
      'mail.encryption': 'Encryption',
      'mail.username': 'SMTP Username',
      'mail.password': 'SMTP Password',
      'mail.from.address': 'From Email Address',
      'mail.from.name': 'From Name',
    };
    return labels[key] || key;
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
    if (config.is_encrypted) {
      return '••••••••';
    }
    return `Enter ${getFieldLabel(config.key).toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading email configurations...</p>
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
              <Icon name="Mail" className="mr-2" size={24} />
              Email Configuration
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure SMTP settings for sending emails and OTP notifications
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              iconName="Send"
              iconPosition="left"
              onClick={() => setShowTestModal(true)}
            >
              Test Email
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
        <h4 className="text-lg font-medium text-foreground mb-6">SMTP Settings</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configurations.map((config) => (
            <div key={config.id}>
              <label className="block text-sm font-medium text-foreground mb-2">
                {getFieldLabel(config.key)}
                {config.is_encrypted && (
                  <span className="ml-2 text-xs text-muted-foreground">(Encrypted)</span>
                )}
              </label>

              {config.key === 'mail.encryption' ? (
                <select
                  value={formData[config.key] || ''}
                  onChange={(e) => handleInputChange(config.key, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select encryption</option>
                  <option value="ssl">SSL</option>
                  <option value="tls">TLS</option>
                  <option value="null">None</option>
                </select>
              ) : config.key === 'mail.driver' ? (
                <select
                  value={formData[config.key] || ''}
                  onChange={(e) => handleInputChange(config.key, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select driver</option>
                  <option value="smtp">SMTP</option>
                  <option value="sendmail">Sendmail</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="ses">Amazon SES</option>
                </select>
              ) : (
                <input
                  type={getFieldType(config)}
                  value={formData[config.key] || ''}
                  onChange={(e) => handleInputChange(config.key, e.target.value)}
                  placeholder={getFieldPlaceholder(config)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}

              {config.description && (
                <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Gmail App Password Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="flex items-start">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Using Gmail SMTP
              </h5>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                For Gmail, you need to use an App Password instead of your regular password.
                Go to Google Account → Security → 2-Step Verification → App passwords to generate one.
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                <strong>Current Settings:</strong> Host: smtp.gmail.com, Port: 465, Encryption: SSL
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold text-foreground mb-4">Test Email Configuration</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A test email will be sent to this address
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowTestModal(false);
                    setTestEmail('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  iconName="Send"
                  iconPosition="left"
                  fullWidth
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail}
                >
                  {testing ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailConfiguration;
