import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TicketCreateForm = ({ currentUser, onTicketCreate }) => {
  const navigate = useNavigate();
  const [currentLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [autoFillMode, setAutoFillMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    customerIC: '',
    
    // Ticket Classification
    priority: 'P3',
    department: '',
    category: '',
    subCategory: '',
    assignedTo: currentUser?.name || '',
    
    // Issue Details
    subject: '',
    description: '',
    urgency: 'Medium',
    impact: 'Low',
    
    // Additional Fields
    tags: [],
    attachments: []
  });

  // Mock data for dropdowns
  const priorityOptions = [
    { value: 'P1', label: 'P1 - Critical (1 hour SLA)', color: 'text-red-600' },
    { value: 'P2', label: 'P2 - High (4 hours SLA)', color: 'text-orange-600' },
    { value: 'P3', label: 'P3 - Medium (24 hours SLA)', color: 'text-yellow-600' },
    { value: 'P4', label: 'P4 - Low (72 hours SLA)', color: 'text-green-600' }
  ];

  const departmentOptions = [
    { value: 'customs_operations', label: 'Customs Operations' },
    { value: 'tax_policy', label: 'Tax Policy' },
    { value: 'enforcement', label: 'Enforcement Division' },
    { value: 'trade_facilitation', label: 'Trade Facilitation' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'it_support', label: 'IT Support' }
  ];

  const categoryOptions = {
    customs_operations: [
      { value: 'import_declaration', label: 'Import Declaration' },
      { value: 'export_declaration', label: 'Export Declaration' },
      { value: 'duty_payment', label: 'Duty Payment' },
      { value: 'customs_clearance', label: 'Customs Clearance' }
    ],
    tax_policy: [
      { value: 'gst_inquiry', label: 'GST Inquiry' },
      { value: 'tax_calculation', label: 'Tax Calculation' },
      { value: 'tax_exemption', label: 'Tax Exemption' },
      { value: 'rate_classification', label: 'Rate Classification' }
    ],
    customer_service: [
      { value: 'general_inquiry', label: 'General Inquiry' },
      { value: 'complaint', label: 'Complaint' },
      { value: 'feedback', label: 'Feedback' },
      { value: 'account_issue', label: 'Account Issue' }
    ]
  };

  const urgencyOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ];

  const impactOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ];

  // Mock existing customers for auto-fill
  const existingCustomers = [
    {
      name: 'Lim Wei Ming',
      email: 'lim.weiming@techimport.com.my',
      phone: '+60 12-345-6789',
      company: 'Tech Import Solutions Sdn Bhd',
      ic: '801234-56-7890'
    },
    {
      name: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@globaltrading.my',
      phone: '+60 13-456-7890',
      company: 'Global Trading Enterprise',
      ic: '851234-56-7890'
    },
    {
      name: 'Ahmad Zulkifli',
      email: 'ahmad.zulkifli@logistics.com.my',
      phone: '+60 14-567-8901',
      company: 'Malaysia Logistics Hub',
      ic: '791234-56-7890'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-fill customer data if email matches existing customer
    if (field === 'customerEmail' && value) {
      const existingCustomer = existingCustomers?.find(
        customer => customer?.email?.toLowerCase() === value?.toLowerCase()
      );
      if (existingCustomer) {
        setSelectedCustomer(existingCustomer);
        setAutoFillMode(true);
      } else {
        setSelectedCustomer(null);
        setAutoFillMode(false);
      }
    }
  };

  const handleAutoFillCustomer = () => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        customerCompany: selectedCustomer?.company,
        customerIC: selectedCustomer?.ic
      }));
      setAutoFillMode(false);
    }
  };

  const generateTicketId = () => {
    const now = new Date();
    const year = now?.getFullYear();
    const month = String(now?.getMonth() + 1)?.padStart(2, '0');
    const day = String(now?.getDate())?.padStart(2, '0');
    const random = Math?.floor(Math?.random() * 1000)?.toString()?.padStart(3, '0');
    return `TK-${year}${month}${day}-${random}`;
  };

  const calculateSLA = (priority) => {
    const slaHours = {
      'P1': 1,
      'P2': 4,
      'P3': 24,
      'P4': 72
    };
    
    const hours = slaHours[priority] || 24;
    const resolutionTime = new Date(Date?.now() + hours * 60 * 60 * 1000);
    
    return {
      status: 'On Track',
      responseTime: `${hours} hours`,
      resolutionTime: resolutionTime?.toISOString(),
      isPaused: false
    };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate new ticket ID
      const newTicketId = generateTicketId();
      
      // Create ticket object
      const newTicket = {
        id: newTicketId,
        ticketNumber: newTicketId,
        subject: formData?.subject,
        description: formData?.description,
        status: 'Open',
        priority: formData?.priority,
        category: formData?.category,
        department: formData?.department,
        assignedTo: formData?.assignedTo,
        impact: formData?.impact,
        urgency: formData?.urgency,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: {
          name: formData?.customerName,
          email: formData?.customerEmail,
          phone: formData?.customerPhone,
          company: formData?.customerCompany,
          ic: formData?.customerIC,
          avatar: null,
          avatarAlt: `Profile photo of ${formData?.customerName}`
        },
        sla: calculateSLA(formData?.priority),
        communications: [
          {
            id: 1,
            channel: 'system',
            author: 'System',
            content: `Ticket ${newTicketId} created by ${currentUser?.name}. Initial status set to Open.`,
            timestamp: new Date()
          }
        ],
        statusHistory: [
          {
            from: null,
            to: 'Open',
            timestamp: new Date(),
            updatedBy: currentUser?.name
          }
        ],
        tags: formData?.tags,
        attachments: formData?.attachments
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call parent callback if provided
      if (onTicketCreate) {
        onTicketCreate(newTicket);
      }

      // Navigate to the new ticket detail page
      navigate(`/ticket-management?id=${newTicketId}`);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      ...formData,
      status: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to localStorage as draft
    localStorage?.setItem('ticket_draft', JSON?.stringify(draftData));
    alert('Draft saved successfully!');
  };

  const availableCategories = formData?.department ? categoryOptions[formData?.department] || [] : [];

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Form Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Plus" size={24} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {currentLanguage === 'ms' ? 'Cipta Tiket Baharu' : 'Create New Ticket'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentLanguage === 'ms' ? 'Isikan butiran untuk mencipta tiket baru' : 'Fill in the details to create a new customer ticket'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            TK-Auto-Generated-Pending
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Customer Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Icon name="User" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {currentLanguage === 'ms' ? 'Maklumat Pelanggan' : 'Customer Information'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Nama' : 'Customer Name'} *
              </label>
              <Input
                value={formData?.customerName}
                onChange={(e) => handleInputChange('customerName', e?.target?.value)}
                placeholder="Enter customer full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'E-mel' : 'Email'} *
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={formData?.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e?.target?.value)}
                  placeholder="customer@email.com"
                  required
                />
                {autoFillMode && selectedCustomer && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Existing Customer Found</p>
                        <p className="text-xs text-muted-foreground">{selectedCustomer?.name} - {selectedCustomer?.company}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAutoFillCustomer}
                      >
                        Auto-Fill
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'No. Telefon' : 'Phone Number'}
              </label>
              <Input
                value={formData?.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e?.target?.value)}
                placeholder="+60 12-345-6789"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Syarikat' : 'Company'}
              </label>
              <Input
                value={formData?.customerCompany}
                onChange={(e) => handleInputChange('customerCompany', e?.target?.value)}
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                IC/Passport Number
              </label>
              <Input
                value={formData?.customerIC}
                onChange={(e) => handleInputChange('customerIC', e?.target?.value)}
                placeholder="801234-56-7890"
              />
            </div>
          </div>
        </div>

        {/* Classification Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Icon name="Tag" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {currentLanguage === 'ms' ? 'Klasifikasi Tiket' : 'Ticket Classification'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Keutamaan' : 'Priority'} *
              </label>
              <Select
                value={formData?.priority}
                onChange={(value) => handleInputChange('priority', value)}
                options={priorityOptions}
                placeholder="Select priority"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Jabatan' : 'Department'} *
              </label>
              <Select
                value={formData?.department}
                onChange={(value) => handleInputChange('department', value)}
                options={departmentOptions}
                placeholder="Select department"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Kategori' : 'Category'}
              </label>
              <Select
                value={formData?.category}
                onChange={(value) => handleInputChange('category', value)}
                options={availableCategories}
                placeholder="Select category"
                disabled={!formData?.department}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Kecemasan' : 'Urgency'}
              </label>
              <Select
                value={formData?.urgency}
                onChange={(value) => handleInputChange('urgency', value)}
                options={urgencyOptions}
                placeholder="Select urgency"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Kesan' : 'Impact'}
              </label>
              <Select
                value={formData?.impact}
                onChange={(value) => handleInputChange('impact', value)}
                options={impactOptions}
                placeholder="Select impact"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Diberikan Kepada' : 'Assigned To'}
              </label>
              <Input
                value={formData?.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e?.target?.value)}
                placeholder="Agent name"
              />
            </div>
          </div>
        </div>

        {/* Issue Description Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {currentLanguage === 'ms' ? 'Butiran Isu' : 'Issue Description'}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Subjek' : 'Subject'} *
              </label>
              <Input
                value={formData?.subject}
                onChange={(e) => handleInputChange('subject', e?.target?.value)}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {currentLanguage === 'ms' ? 'Penerangan Terperinci' : 'Detailed Description'} *
              </label>
              <textarea
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                className="w-full min-h-[120px] p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                placeholder="Provide detailed information about the customer's issue, including steps taken, error messages, and any relevant context..."
                required
              />
            </div>
          </div>
        </div>

        {/* SLA Calculation Preview */}
        {formData?.priority && (
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">SLA Information</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <p className="font-medium text-foreground">{formData?.priority}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Response Time:</span>
                <p className="font-medium text-foreground">{calculateSLA(formData?.priority)?.responseTime}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium text-green-600">On Track</p>
              </div>
              <div>
                <span className="text-muted-foreground">Next Action:</span>
                <p className="font-medium text-foreground">Initial Response</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/agent-dashboard')}
            >
              <Icon name="ArrowLeft" size={16} />
              {currentLanguage === 'ms' ? 'Batal' : 'Cancel'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!formData?.subject || !formData?.customerName}
            >
              <Icon name="Save" size={16} />
              {currentLanguage === 'ms' ? 'Simpan Draf' : 'Save Draft'}
            </Button>
          </div>

          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting || !formData?.subject || !formData?.customerName || !formData?.customerEmail}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                {currentLanguage === 'ms' ? 'Mencipta...' : 'Creating...'}
              </>
            ) : (
              <>
                <Icon name="Plus" size={16} />
                {currentLanguage === 'ms' ? 'Cipta Tiket' : 'Create Ticket'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreateForm;