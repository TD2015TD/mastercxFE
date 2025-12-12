import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import MitelAgentSelector from '../../../components/MitelAgentSelector';
import { createUser, getUser, updateUser } from '../../../services/userService';
import { getRoles } from '../../../services/roleService';
import { languageService } from '../../../services/languageService';

const CreateUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    status: 'active',
    ignite_id: '',
  });

  // Agent profile state
  const [createAgentProfile, setCreateAgentProfile] = useState(false);
  const [agentData, setAgentData] = useState({
    agent_code: '',
    employee_id: '',
    agent_username: '',
    department: '',
    designation: '',
    mitel_extension: '',
    mitel_agent_name: '',
    skills: [],
    languages: ['en', 'ms'],
    max_concurrent_tickets: 5,
  });

  // Mitel agent selector modal state
  const [mitelModalOpen, setMitelModalOpen] = useState(false);

  // Skill input
  const [skillInput, setSkillInput] = useState('');

  // Load translations
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
      setTranslations({});
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value || key;
  };

  // Load roles
  useEffect(() => {
    fetchRoles();
  }, []);

  // Load user data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchUserData();
    }
  }, [id, isEditMode]);

  const fetchUserData = async () => {
    try {
      setInitialLoading(true);
      const response = await getUser(parseInt(id));
      if (response.success) {
        const user = response.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          password_confirmation: '',
          role_id: user.role_id?.toString() || '',
          status: user.status || 'active',
          ignite_id: user.ignite_id || '',
        });

        // Load agent data if exists
        if (user.agent) {
          setCreateAgentProfile(true);
          setAgentData({
            agent_code: user.agent.agent_code || '',
            employee_id: user.agent.employee_id || '',
            mitel_agent_name: user.agent.mitel_agent_name || '',
            agent_username: user.agent.agent_username || '',
            department: user.agent.department || '',
            designation: user.agent.designation || '',
            mitel_extension: user.agent.mitel_extension || '',
            skills: user.agent.skills || [],
            languages: user.agent.languages || ['en', 'ms'],
            max_concurrent_tickets: user.agent.max_concurrent_tickets || 5,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await getRoles();
      if (response.success && response.data.data) {
        setRoles(response.data.data.map(role => ({
          value: role.id.toString(),
          label: role.name,
        })));
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles');
    } finally {
      setRolesLoading(false);
    }
  };

  // Check if selected role is Agent or Supervisor
  useEffect(() => {
    const selectedRole = roles.find(r => r.value === formData.role_id);
    if (selectedRole && (selectedRole.label === 'Agent' || selectedRole.label === 'Supervisor')) {
      setCreateAgentProfile(true);
    }
  }, [formData.role_id, roles]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleAgentDataChange = (field, value) => {
    setAgentData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !agentData.skills.includes(skillInput.trim())) {
      setAgentData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setAgentData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleLanguageToggle = (lang) => {
    setAgentData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleMitelAgentSelect = (agent) => {
    setAgentData(prev => ({
      ...prev,
      employee_id: agent.id || '',
      mitel_extension: agent.extension || '',
      mitel_agent_name: agent.name || '',
      agent_username: agent.username || ''
    }));
    setMitelModalOpen(false);
  };

  const handleClearMitelAgent = () => {
    setAgentData(prev => ({
      ...prev,
      employee_id: '',
      mitel_extension: '',
      mitel_agent_name: '',
      agent_username: ''
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    // Password validation only required for create mode or when changing password
    if (!isEditMode) {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (formData.password !== formData.password_confirmation) {
        setError('Passwords do not match');
        return false;
      }
    } else if (formData.password) {
      // If editing and password is provided, validate it
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (formData.password !== formData.password_confirmation) {
        setError('Passwords do not match');
        return false;
      }
    }
    if (!formData.role_id) {
      setError('Role is required');
      return false;
    }

    // Validate agent data if creating agent profile
    if (createAgentProfile && !isEditMode) {
      if (!agentData.agent_code.trim()) {
        setError('Agent code is required');
        return false;
      }
      if (!agentData.department.trim()) {
        setError('Department is required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role_id: parseInt(formData.role_id),
        status: formData.status,
        ignite_id: formData.ignite_id.trim() || null,
      };

      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      // Add agent data if creating agent profile
      if (createAgentProfile) {
        payload.agent_data = {
          employee_id: agentData.employee_id.trim() || null,
          department: agentData.department.trim(),
          designation: agentData.designation.trim() || null,
          mitel_extension: agentData.mitel_extension.trim() || null,
          skills: agentData.skills,
          languages: agentData.languages,
          max_concurrent_tickets: agentData.max_concurrent_tickets,
        };
        if (!isEditMode) {
          payload.agent_data.agent_code = agentData.agent_code.trim();
          payload.agent_data.status = 'active';
          payload.agent_data.availability = 'available';
        }
        payload.agent_data.agent_username = agentData.agent_username.trim() || null;
      }

      const response = isEditMode 
        ? await updateUser(parseInt(id), payload)
        : await createUser(payload);

      if (response.success) {
        setSuccess(isEditMode ? 'User updated successfully!' : 'User created successfully!');
        setTimeout(() => {
          navigate('/system-administration');
        }, 2000);
      } else {
        setError(response.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, err);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/system-administration');
  };

  const departments = [
    { value: 'Customer Service', label: 'Customer Service' },
    { value: 'Technical Support', label: 'Technical Support' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Billing', label: 'Billing' },
    { value: 'General', label: 'General' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isEditMode ? 'Edit User' : 'Create User'} - JKDM CRM Portal</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation />

        {/* Loading State for Edit Mode */}
        {initialLoading ? (
          <div className="bg-card rounded-lg border border-border p-12">
            <div className="flex items-center justify-center">
              <Icon name="Loader" size={32} className="animate-spin text-primary mr-3" />
              <span className="text-muted-foreground">Loading user data...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {isEditMode ? 'Edit User' : 'Create New User'}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    {isEditMode 
                      ? 'Update user information and permissions' 
                      : 'Add a new user to the system with role and permissions'
                    }
                  </p>
                </div>
                <Button variant="outline" iconName="ArrowLeft" iconPosition="left" onClick={handleCancel}>
                  Back to Users
                </Button>
              </div>
            </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center">
              <Icon name="AlertTriangle" size={20} className="text-error mr-3" />
              <span className="text-sm text-error">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center">
              <Icon name="CheckCircle" size={20} className="text-success mr-3" />
              <span className="text-sm text-success">{success}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Icon name="User" size={20} className="mr-2" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password {!isEditMode && <span className="text-error">*</span>}
                  </label>
                  <Input
                    type="password"
                    placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password (min. 8 characters)"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required={!isEditMode}
                  />
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Only fill this if you want to change the password
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password {!isEditMode && <span className="text-error">*</span>}
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.password_confirmation}
                    onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                    required={!isEditMode && !!formData.password}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role <span className="text-error">*</span>
                  </label>
                  <Select
                    placeholder={rolesLoading ? "Loading roles..." : "Select role"}
                    options={roles}
                    value={formData.role_id}
                    onChange={(value) => handleInputChange('role_id', value)}
                    disabled={rolesLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status <span className="text-error">*</span>
                  </label>
                  <Select
                    placeholder="Select status"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value) => handleInputChange('status', value)}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ignite ID (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Ignite ID if applicable"
                    value={formData.ignite_id}
                    onChange={(e) => handleInputChange('ignite_id', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link this user to an Ignite Simulator agent
                  </p>
                </div>
              </div>
            </div>

            {/* Agent Profile Section */}
            {createAgentProfile && (
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center">
                    <Icon name="Briefcase" size={20} className="mr-2" />
                    Agent Profile
                  </h2>
                  <span className="text-xs text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                    Required for Agent/Supervisor roles
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Agent Code <span className="text-error">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., AGT001"
                      value={agentData.agent_code}
                      onChange={(e) => handleAgentDataChange('agent_code', e.target.value)}
                      required
                    />
                  </div>

                 {/*  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Employee ID
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter employee ID"
                      value={agentData.employee_id}
                      onChange={(e) => handleAgentDataChange('employee_id', e.target.value)}
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Department <span className="text-error">*</span>
                    </label>
                    <Select
                      placeholder="Select department"
                      options={departments}
                      value={agentData.department}
                      onChange={(value) => handleAgentDataChange('department', value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Designation
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Senior Agent"
                      value={agentData.designation}
                      onChange={(e) => handleAgentDataChange('designation', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mitel Employee ID
                    </label>
                    {agentData.employee_id ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-muted rounded-lg border border-border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {agentData.mitel_agent_name || agentData.employee_id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ID: {agentData.employee_id} {agentData.mitel_extension && `• Ext: ${agentData.mitel_extension}`}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleClearMitelAgent}
                              iconName="X"
                              iconPosition="left"
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setMitelModalOpen(true)}
                          iconName="RefreshCw"
                          iconPosition="left"
                          className="w-full"
                        >
                          Change Agent
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMitelModalOpen(true)}
                        iconName="Users"
                        iconPosition="left"
                        className="w-full justify-center"
                      >
                        Select Mitel Agent
                      </Button>
                    )}
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mitel Extension
                    </label>
                    <Input
                      type="text"
                      placeholder="Auto-populated from agent"
                      value={agentData.mitel_extension}
                      onChange={(e) => handleAgentDataChange('mitel_extension', e.target.value)}
                      disabled={!!agentData.mitel_agent_id}
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Max Concurrent Tickets
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={agentData.max_concurrent_tickets}
                      onChange={(e) => handleAgentDataChange('max_concurrent_tickets', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Skills
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        type="text"
                        placeholder="Add a skill (e.g., Technical Support)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSkill}
                        iconName="Plus"
                        iconPosition="left"
                      >
                        Add
                      </Button>
                    </div>
                    {agentData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {agentData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 hover:text-error"
                            >
                              <Icon name="X" size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Languages
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <Checkbox
                          checked={agentData.languages.includes('en')}
                          onChange={() => handleLanguageToggle('en')}
                        />
                        <span className="text-sm text-foreground">English</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Checkbox
                          checked={agentData.languages.includes('ms')}
                          onChange={() => handleLanguageToggle('ms')}
                        />
                        <span className="text-sm text-foreground">Bahasa Malaysia</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                iconName={loading ? "Loader" : "Save"}
                iconPosition="left"
                disabled={loading}
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
              </Button>
            </div>
          </div>
        </form>

        {/* Mitel Agent Selector Modal */}
        <MitelAgentSelector
          isOpen={mitelModalOpen}
          onClose={() => setMitelModalOpen(false)}
          onSelect={handleMitelAgentSelect}
          selectedAgentId={agentData.employee_id}
        />
        </>
        )}
      </div>
    </div>
  );
};

export default CreateUser;
