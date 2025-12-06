import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { authService } from '../../../services/authService';
import { languageService } from '../../../services/languageService';

const LoginForm = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    authMethod: 'ad',
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
      // Use authService to login
      const response = await authService.login({
        email: formData.username,
        password: formData.password
      });
      
      if (response?.user) {
        // Extract role slug from role object if it exists
        const roleSlug = typeof response.user.role === 'string' 
          ? response.user.role 
          : response.user.role?.slug || 'agent';
        
        // Store authentication data using authService
        authService.setCurrentUser({
          username: formData.username,
          role: roleSlug,
          authMethod: formData.authMethod,
          loginTime: new Date().toISOString(),
          ...response.user,
          role: roleSlug // Override the role object with just the slug
        });
        
        if (formData.rememberMe) {
          localStorage.setItem('remember-user', formData.username);
        }
        
        // Navigate based on role
        if (roleSlug === 'supervisor' || roleSlug === 'super_admin') {
          navigate('/supervisor-dashboard');
        } else if (roleSlug === 'admin') {
          navigate('/system-administration');
        } else {
          navigate('/agent-dashboard');
        }
      } else {
        setErrors({ general: t?.invalidCredentials });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: error?.response?.data?.message || t?.invalidCredentials 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const message = currentLanguage === 'ms' 
      ? 'Sila hubungi pentadbir sistem untuk tetapan semula kata laluan.'
      : 'Please contact your system administrator for password reset.';
    alert(message);
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
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error" />
              <span className="text-sm text-error">{errors?.general}</span>
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