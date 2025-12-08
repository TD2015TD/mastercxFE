import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';

const CustomerFormModal = ({ isOpen, onClose, onSave, customer = null, isLoading = false }) => {
  const isEditMode = !!customer;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    id_type: 'MyKad',
    id_no: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Malaysia',
    customer_type: 'individual',
    business_registration_no: '',
    preferred_language: 'en',
    status: 'active',
    tags: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone_number: customer.phone_number || '',
        id_type: customer.id_type || 'MyKad',
        id_no: customer.id_no || '',
        company_name: customer.company_name || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postal_code: customer.postal_code || '',
        country: customer.country || 'Malaysia',
        customer_type: customer.customer_type || 'individual',
        business_registration_no: customer.business_registration_no || '',
        preferred_language: customer.preferred_language || 'en',
        status: customer.status || 'active',
        tags: customer.tags || [],
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }

    if (!formData.id_no.trim()) {
      newErrors.id_no = 'ID number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  const idTypeOptions = [
    { value: 'MyKad', label: 'MyKad' },
    { value: 'MyTentera', label: 'MyTentera' },
    { value: 'MyPolis', label: 'MyPolis' },
    { value: 'MyPR', label: 'MyPR' },
    { value: 'Passport', label: 'Passport' }
  ];

  const customerTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blocked', label: 'Blocked' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ms', label: 'Bahasa Malaysia' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ta', label: 'Tamil' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Icon name={isEditMode ? "Edit" : "UserPlus"} size={24} />
            {isEditMode ? 'Edit Customer Profile' : 'Add New Customer'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="User" size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Full Name *"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter full name"
                    error={errors.name}
                    disabled={isLoading}
                  />
                </div>

                <Input
                  label="Email Address *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  error={errors.email}
                  disabled={isLoading}
                />

                <Input
                  label="Phone Number *"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  placeholder="+60 12-345-6789"
                  error={errors.phone_number}
                  disabled={isLoading}
                />

                <Select
                  label="ID Type *"
                  value={formData.id_type}
                  onChange={(value) => handleChange('id_type', value)}
                  options={idTypeOptions}
                  disabled={isLoading}
                />

                <Input
                  label="ID Number *"
                  type="text"
                  value={formData.id_no}
                  onChange={(e) => handleChange('id_no', e.target.value)}
                  placeholder="Enter ID number"
                  error={errors.id_no}
                  disabled={isLoading}
                />

                <Select
                  label="Customer Type"
                  value={formData.customer_type}
                  onChange={(value) => handleChange('customer_type', value)}
                  options={customerTypeOptions}
                  disabled={isLoading}
                />

                <Select
                  label="Preferred Language"
                  value={formData.preferred_language}
                  onChange={(value) => handleChange('preferred_language', value)}
                  options={languageOptions}
                  disabled={isLoading}
                />

                {isEditMode && (
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(value) => handleChange('status', value)}
                    options={statusOptions}
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>

            {/* Business Information (if business type) */}
            {formData.customer_type === 'business' && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="Building" size={20} />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Enter company name"
                    disabled={isLoading}
                  />

                  <Input
                    label="Business Registration No."
                    type="text"
                    value={formData.business_registration_no}
                    onChange={(e) => handleChange('business_registration_no', e.target.value)}
                    placeholder="Enter registration number"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="MapPin" size={20} />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Textarea
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter street address"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>

                <Input
                  label="City"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Enter city"
                  disabled={isLoading}
                />

                <Input
                  label="State"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Enter state"
                  disabled={isLoading}
                />

                <Input
                  label="Postal Code"
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="Enter postal code"
                  disabled={isLoading}
                />

                <Input
                  label="Country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="Enter country"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="FileText" size={20} />
                Additional Information
              </h3>
              <Textarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes about the customer..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              iconName={isEditMode ? "Save" : "UserPlus"}
              iconPosition="left"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Customer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
