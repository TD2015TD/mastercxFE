import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import lookupService from '../../../services/lookupService';
import categoryService from '../../../services/categoryService';
import publicTicketService from '../../../services/publicTicketService';
import type { PublicTicketSubmission } from '../../../services/publicTicketService';

interface Category {
  id: number;
  name: string;
  name_ms?: string;
}

const PublicTicketSubmitForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ ticketNumber: string; department: string } | null>(null);
  
  // Lookups
  const [departments, setDepartments] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<PublicTicketSubmission>({
    category: '',
    subcategory: '',
    priority: 'medium',
    subject: '',
    description: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_company: '',
    customer_id_number: '',
    attachments: [],
  });

  const loadCategories = useCallback(async (department: string) => {
    if (!department) return;
    
    try {
      const categoryData = await categoryService.getRootCategories(department);
      setCategories(categoryData);
      setSubcategories([]);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const deptData = await lookupService.getDepartments();
      setDepartments(deptData.map((d) => d.name));
      
      // Load categories for first department
      if (deptData.length > 0) {
        loadCategories(deptData[0].name);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  }, [loadCategories]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const loadSubcategories = async (department: string, categoryId: number) => {
    if (!department || !categoryId) return;
    
    try {
      const subcategoryData = await categoryService.getSubcategories(department, categoryId);
      setSubcategories(subcategoryData);
    } catch (err) {
      console.error('Error loading subcategories:', err);
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    setFormData(prev => ({ ...prev, category: categoryName, subcategory: '' }));
    
    const selectedCategory = categories.find(cat => cat.name === categoryName);
    if (selectedCategory && departments[0]) {
      loadSubcategories(departments[0], selectedCategory.id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + (formData.attachments?.length || 0) > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.customer_name || !formData.customer_email) {
      setError('Name and email are required');
      return false;
    }
    
    if (!formData.subject || !formData.description) {
      setError('Subject and description are required');
      return false;
    }
    
    if (formData.description.length < 20) {
      setError('Description must be at least 20 characters');
      return false;
    }
    
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await publicTicketService.submitTicket(formData);
      
      if (response.success) {
        setSuccess({
          ticketNumber: response.data.ticket_number,
          department: response.data.assigned_department
        });
        // Reset form
        setFormData({
          category: '',
          subcategory: '',
          priority: 'medium',
          subject: '',
          description: '',
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          customer_company: '',
          customer_id_number: '',
          attachments: [],
        });
      }
    } catch (err: unknown) {
      console.error('Error submitting ticket:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Ticket Submitted Successfully!</h3>
        <p className="text-muted-foreground mb-4">
          Your ticket has been created and assigned to <strong>{success.department}</strong> department.
        </p>
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Your Ticket Number</p>
          <p className="text-2xl font-bold text-primary">{success.ticketNumber}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Please save this number for tracking your ticket
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setSuccess(null)}
            variant="outline"
            iconName="Plus"
            iconPosition="left"
          >
            Submit Another Ticket
          </Button>
          <Button
            onClick={() => window.location.href = `#track?ticket=${success.ticketNumber}`}
            iconName="Search"
            iconPosition="left"
          >
            Track This Ticket
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
        <Icon name="Plus" size={20} className="mr-2 text-primary" />
        Submit a New Ticket
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Customer Information */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            value={formData.customer_name}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
            required
          />
          <Input
            label="Email Address *"
            type="email"
            value={formData.customer_email}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
            required
          />
          <Input
            label="Phone Number"
            value={formData.customer_phone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
          />
          <Input
            label="ID Number (MyKad/Passport)"
            value={formData.customer_id_number || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_id_number: e.target.value }))}
          />
          <Input
            label="Company Name (Optional)"
            value={formData.customer_company || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_company: e.target.value }))}
          />
        </div>
      </div>

      {/* Issue Details */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Issue Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subcategory
              </label>
              <select
                value={formData.subcategory || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        
        <Input
          label="Subject *"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Brief summary of your issue"
          required
          className="mb-4"
        />
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description * (minimum 20 characters)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
            placeholder="Please provide detailed information about your issue..."
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.description.length} characters
          </p>
        </div>
      </div>

      {/* Attachments */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Attachments (Optional - Max 5 files, 5MB each)
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileChange}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
        />
        {formData.attachments && formData.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded">
                <span className="text-sm text-foreground">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          iconName={isSubmitting ? undefined : 'Send'}
          iconPosition="left"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </div>
    </form>
  );
};

export default PublicTicketSubmitForm;
