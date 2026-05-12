import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { languageService } from '../../../services/languageService';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
    loadTranslations(savedLanguage);
  }, []);

  const loadTranslations = async (locale) => {
    try {
      const translations = await languageService.getTranslations(locale);
      setTranslations(translations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to empty object, UI will use keys as fallback
      setTranslations({});
    }
  };

  const changeLanguage = (newLocale) => {
    setCurrentLanguage(newLocale);
    localStorage.setItem('preferred-language', newLocale);
    loadTranslations(newLocale);
  };

  const authMethodOptions = [
    { value: 'ad', label: 'Active Directory' },
    { value: 'ldap', label: 'LDAP' },
    { value: 'okta', label: 'OKTA SSO' }
  ];

  const t = translations?.login || {};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.username?.trim()) {
      newErrors.username = t?.requiredField;
    }
    
    if (!formData?.password?.trim()) {
      newErrors.password = t?.requiredField;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      console.log('Login attempt starting:', { username: formData.username });
      
      // Use AuthContext login to update React state immediately
      const response = await authLogin({
        username: formData.username,
        password: formData.password
      });
      
      console.log('Login response received:', { 
        success: response?.success !== false, 
        hasUser: !!response?.user,
        statusCode: response?.status 
      });
      
      if (response?.user) {
        // Extract role slug from role object if it exists
        const roleSlug = typeof response.user.role === 'string' 
          ? response.user.role 
          : response.user.role?.slug || 'agent';

        if (formData.rememberMe) {
          localStorage.setItem('remember-user', formData.username);
        }

        console.log('Login successful, navigating to dashboard:', { roleSlug });

        // Navigate based on role
        if (roleSlug === 'supervisor' || roleSlug === 'super_admin') {
          navigate('/supervisor-dashboard');
        } else if (roleSlug === 'admin') {
          navigate('/system-administration');
        } else {
          navigate('/agent-dashboard');
        }
      } else {
        // Handle case where response is successful but no user data
        console.error('Login response missing user data:', response);
        const errorMessage = response?.message || t?.invalidCredentials || 'Login failed. Please try again.';
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Login error caught:', error);

      let errorMessage;

      // Network error or can't connect to backend
      if (!error?.response) {
        console.error('Network error - no response from server');
        errorMessage = currentLanguage === 'ms'
          ? 'Tidak dapat menyambung ke pelayan. Sila semak sambungan internet anda dan cuba lagi.'
          : 'Unable to connect to server. Please check your internet connection and try again.';
      }
      // Server returned an error response
      else {
        console.error('Server error response:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.message
        });

        // Get error message from response
        errorMessage = error?.response?.data?.message
          || error?.response?.data?.error
          || t?.invalidCredentials
          || 'Invalid username or password. Please try again.';

        // Check for specific error codes
        if (error.response?.status === 401) {
          errorMessage = error.response.data?.message || (currentLanguage === 'ms'
            ? 'Nama pengguna atau kata laluan tidak sah.'
            : 'Invalid username or password.');
        } else if (error.response?.status === 422) {
          errorMessage = currentLanguage === 'ms'
            ? 'Data yang dimasukkan tidak sah. Sila semak dan cuba lagi.'
            : 'Invalid input. Please check your credentials and try again.';
        } else if (error.response?.status === 500) {
          errorMessage = currentLanguage === 'ms'
            ? 'Ralat pelayan dalaman. Sila hubungi pentadbir sistem.'
            : 'Internal server error. Please contact system administrator.';
        }
      }

      console.error('Displaying error to user:', errorMessage);

      setErrors({
        general: errorMessage
      });

      // Show toast notification for better visibility
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Also show browser alert as a failsafe
      console.log('Setting error state and showing toast');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const message = currentLanguage === 'ms'
      ? 'Sila hubungi pentadbir sistem untuk tetapan semula kata laluan.'
      : 'Please contact your system administrator for password reset.';
    toast.info(message);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Field */}
        <Input
          label={t?.username || 'Username'}
          type="text"
          placeholder={t?.enterUsername || 'Enter your username'}
          value={formData?.username}
          onChange={(e) => handleInputChange('username', e?.target?.value)}
          error={errors?.username}
          required
          disabled={isLoading}
          className="w-full"
        />

        {/* Password Field */}
        <div className="relative">
          <Input
            label={t?.password || 'Password'}
            type={showPassword ? 'text' : 'password'}
            placeholder={t?.enterPassword || 'Enter your password'}
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
            disabled={isLoading}
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors duration-200"
            disabled={isLoading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>

        {/* Authentication Method */}
       {/*  <Select
          label={t?.authMethod || 'Authentication Method'}
          placeholder={t?.selectAuth || 'Select authentication method'}
          options={authMethodOptions}
          value={formData?.authMethod}
          onChange={(value) => handleInputChange('authMethod', value)}
          disabled={isLoading}
          className="w-full"
        />
 */}
        {/* Remember Me */}
        <Checkbox
          label={t?.rememberMe || 'Remember me on this device'}
          checked={formData?.rememberMe}
          onChange={(e) => handleInputChange('rememberMe', e?.target?.checked)}
          disabled={isLoading}
        />

        {/* General Error */}
        {errors?.general && (
          <div 
            className="p-4 bg-red-50 border-2 border-red-500 rounded-lg shadow-md"
            style={{ 
              backgroundColor: '#fee2e2', 
              borderColor: '#ef4444',
              marginTop: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div className="flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-1">Login Failed</p>
                <p className="text-sm text-red-700">{errors?.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          iconName="LogIn"
          iconPosition="right"
          disabled={isLoading}
        >
          {t?.signIn || 'Sign In'}
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:underline"
            disabled={isLoading}
          >
            {t?.forgotPassword || 'Forgot Password?'}
          </button>
        </div>

        {/* Security Information */}
        <div className="space-y-2 text-xs text-muted-foreground text-center">
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Shield" size={14} className="text-success" />
            <span>{t?.secureConnection || 'Secure connection established'}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Clock" size={14} />
            <span>{t?.sessionTimeout || 'Session will timeout after 8 hours of inactivity'}</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;