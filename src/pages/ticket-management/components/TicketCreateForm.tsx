import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../../services/ticketService';
import { ticketSequenceService } from '../../../services/ticketSequenceService';
import lookupService from '../../../services/lookupService';
import { agentService, type Agent } from '../../../services/agentService';
import { customerService, type Customer, type CustomerNote } from '../../../services/customerService';
import categoryService, { type Category } from '../../../services/categoryService';
import { authService } from '../../../services/authService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';

interface TicketFormData {
  // Customer Information
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_id_type: string;
  customer_id_no: string;
  
  // Ticket Classification
  priority: string;
  department: string;
  category: string;
  sub_category?: string;
  urgency: string;
  impact: string;
  
  // Ticket Details
  subject: string;
  description: string;
  channel: 'phone' | 'email' | 'chat' | 'web' | 'walk-in';
  source?: string;
  
  // Assignment
  assigned_to?: number;
  
  // Additional
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

const TicketCreateForm: React.FC<{ 
  onCancel?: () => void; 
  onSuccess?: (ticketId: number) => void;
  initialData?: Partial<Record<string, string | null>>;
}> = ({ onCancel, onSuccess, initialData }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sequencePreview, setSequencePreview] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ id: number; ticket_number: string } | null>(null);
  
  // User and Agent Management
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string; agent?: { id: number; mitel_agent_id?: string } } | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  
  // Customer Phone Autocomplete
  const [phoneSearchResults, setPhoneSearchResults] = useState<Customer[]>([]);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [showCustomerConfirmModal, setShowCustomerConfirmModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pinnedNotes, setPinnedNotes] = useState<CustomerNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  // Lookups
  const [priorities, setPriorities] = useState<Array<{ value: string; label: string; hours: number }>>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [channelOptions, setChannelOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [urgencyOptions, setUrgencyOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [impactOptions, setImpactOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [idTypeOptions, setIdTypeOptions] = useState<Array<{ value: string; label: string }>>([]);
  
  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  const [formData, setFormData] = useState<TicketFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_id_type: 'MyKad',
    customer_id_no: '',
    priority: 'P3',
    department: '',
    category: '',
    sub_category: '',
    urgency: 'Medium',
    impact: 'Low',
    subject: '',
    description: '',
    channel: 'phone',
    source: '',
    tags: [],
    custom_fields: {}
  });

  // Load current user on mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        console.log('Current user loaded:', user);
        console.log('User role:', user.role);
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
    }
  };

  // Auto-fetch customer when phone number is provided in query params
  useEffect(() => {
    if (initialData?.customerPhone && !initialData.customerId) {
      // Automatically search and populate customer data by phone
      searchAndPopulateCustomer(initialData.customerPhone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.customerPhone]);

  const searchAndPopulateCustomer = async (phoneNumber: string) => {
    try {
      const response = await customerService.getCustomers({
        search: phoneNumber,
        per_page: 5
      });
      
      if (response.success && response.data?.data) {
        const matchingCustomers = response.data.data.filter((customer: Customer) => 
          customer.phone_number === phoneNumber
        );
        
        if (matchingCustomers.length > 0) {
          const customer = matchingCustomers[0];
          setFormData(prev => ({
            ...prev,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone_number,
            customer_id_type: customer.id_type,
            customer_id_no: customer.id_no
          }));
        } else {
          // No exact match, just populate the phone number
          setFormData(prev => ({
            ...prev,
            customer_phone: phoneNumber,
            ...(initialData?.customerName && { customer_name: initialData.customerName }),
            ...(initialData?.customerEmail && { customer_email: initialData.customerEmail })
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching customer by phone:', err);
      // On error, just populate with available data
      setFormData(prev => ({
        ...prev,
        customer_phone: phoneNumber,
        ...(initialData?.customerName && { customer_name: initialData.customerName }),
        ...(initialData?.customerEmail && { customer_email: initialData.customerEmail })
      }));
    }
  };

  // Apply initial data from query params and handle auto-assignment
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...(initialData.customerId && { customer_id_no: initialData.customerId }),
        ...(initialData.channel && { channel: initialData.channel as 'phone' | 'email' | 'chat' | 'web' | 'walk-in' }),
        ...(initialData.subject && { subject: initialData.subject }),
        ...(initialData.priority && { priority: initialData.priority }),
        ...(initialData.category && { category: initialData.category }),
        // Store MiTel-specific data in custom_fields
        custom_fields: {
          ...(initialData.callId && { call_id: initialData.callId }),
          ...(initialData.agentId && { agent_id: initialData.agentId }),
          ...(initialData.queueId && { queue_id: initialData.queueId }),
        }
      }));

      // Auto-assign for non-admin/supervisor users with MiTel agent_id
      if (initialData.agentId && currentUser) {
        handleAutoAssignment(initialData.agentId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, currentUser]);

  const handleAutoAssignment = async (mitelAgentId: string) => {
    // Only auto-assign for agent role (not super_admin/admin/supervisor)
    if (!currentUser || currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'supervisor') {
      return;
    }

    try {
      // Find agent by mitel_agent_id
      const response = await agentService.getAgents({ search: mitelAgentId });
      if (response.success && response.data.data && response.data.data.length > 0) {
        const agent = response.data.data[0];
        setFormData(prev => ({ ...prev, assigned_to: agent.id }));
        setSelectedAgent(agent);
      }
    } catch (err) {
      console.error('Error auto-assigning agent:', err);
    }
  };

  // Load lookups on mount
  useEffect(() => {
    loadLookups();
  }, []);

  const loadAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const response = await agentService.getAgents({
        status: 'active',
        per_page: 100
      });
      if (response.success && response.data.data) {
        setAgents(response.data.data);
      }
    } catch (err) {
      console.error('Error loading agents:', err);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleAssignToClick = () => {
    if (currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'supervisor')) {
      loadAgents();
      setShowAgentModal(true);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData(prev => ({ ...prev, assigned_to: agent.id }));
    setShowAgentModal(false);
  };

  const previewTicketNumber = useCallback(async () => {
    try {
      const channelSequences = await ticketSequenceService.getChannelSequences();
      const channelKey = formData.channel === 'walk-in' ? 'walkIn' : formData.channel;
      const sequence = (channelSequences as Record<string, unknown>)[channelKey] || channelSequences.default;
      
      if (sequence) {
        const preview = await ticketSequenceService.previewSequence(sequence.id);
        if (preview.success) {
          setSequencePreview(preview.data.sample_output);
        }
      }
    } catch (err) {
      console.error('Error previewing ticket number:', err);
    }
  }, [formData.channel]);

  // Update sequence preview when channel changes
  useEffect(() => {
    previewTicketNumber();
  }, [previewTicketNumber]);
      
  // Debounced phone number search
  const searchCustomerByPhone = useCallback(
    async (phoneNumber: string) => {
      if (!phoneNumber || phoneNumber.length < 3) {
        setPhoneSearchResults([]);
        setShowPhoneDropdown(false);
        return;
      }

      setIsSearchingPhone(true);
      try {
        const response = await customerService.getCustomers({
          search: phoneNumber,
          per_page: 5
        });
        
        if (response.success && response.data?.data) {
          // Filter to only customers with matching phone numbers
          const matchingCustomers = response.data.data.filter((customer: Customer) => 
            customer.phone_number.includes(phoneNumber)
          );
          setPhoneSearchResults(matchingCustomers);
          setShowPhoneDropdown(matchingCustomers.length > 0);
        }
      } catch (err) {
        console.error('Error searching customers by phone:', err);
      } finally {
        setIsSearchingPhone(false);
      }
    },
    []
  );

  // Fetch customer notes
  const fetchCustomerNotes = async (customerId: number) => {
    setIsLoadingNotes(true);
    try {
      const response = await customerService.getNotes(customerId);
      if (response.success && response.data) {
        // Filter pinned notes
        const pinned = response.data.filter((note: CustomerNote) => note.is_pinned);
        setPinnedNotes(pinned);
      }
    } catch (error) {
      console.error('Error fetching customer notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Debounce phone search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomerByPhone(formData.customer_phone);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.customer_phone, searchCustomerByPhone]);

  const handleSelectCustomerFromPhone = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPhoneDropdown(false);
    setShowCustomerConfirmModal(true);
    // Fetch customer notes
    if (customer.id) {
      fetchCustomerNotes(customer.id);
    }
  };

  const handleConfirmCustomerSelection = () => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customer_name: selectedCustomer.name,
        customer_email: selectedCustomer.email,
        customer_phone: selectedCustomer.phone_number,
        customer_id_type: selectedCustomer.id_type,
        customer_id_no: selectedCustomer.id_no
      }));
      setShowCustomerConfirmModal(false);
      // Keep selectedCustomer to maintain notes display
    }
  };

  const handleCancelCustomerSelection = () => {
    setShowCustomerConfirmModal(false);
    setSelectedCustomer(null);
    setPinnedNotes([]);
  };

  // Load categories when department changes
  const loadCategories = useCallback(async (department: string) => {
    if (!department) {
      setCategories([]);
      setSubcategories([]);
      return;
    }

    setIsLoadingCategories(true);
    try {
      const categoryData = await categoryService.getRootCategories(department);
      setCategories(categoryData);
      // Reset subcategories when department changes
      setSubcategories([]);
      setFormData(prev => ({ ...prev, category: '', sub_category: '' }));
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Load subcategories when category changes
  const loadSubcategories = useCallback(async (department: string, categoryId: number) => {
    if (!department || !categoryId) {
      setSubcategories([]);
      return;
    }

    setIsLoadingSubcategories(true);
    try {
      const subcategoryData = await categoryService.getSubcategories(department, categoryId);
      setSubcategories(subcategoryData);
      // Reset sub_category when category changes
      setFormData(prev => ({ ...prev, sub_category: '' }));
    } catch (err) {
      console.error('Error loading subcategories:', err);
      setSubcategories([]);
    } finally {
      setIsLoadingSubcategories(false);
    }
  }, []);

  // Load categories when department is selected
  useEffect(() => {
    if (formData.department) {
      loadCategories(formData.department);
    }
  }, [formData.department, loadCategories]);

  // Load subcategories when category is selected
  useEffect(() => {
    if (formData.category && formData.department) {
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      if (selectedCategory) {
        loadSubcategories(formData.department, selectedCategory.id);
      }
    }
  }, [formData.category, formData.department, categories, loadSubcategories]);

  const loadLookups = async () => {
    try {
      const [deptData, prioData, channelData, urgencyData, impactData, idTypeData] = await Promise.all([
        lookupService.getDepartments(),
        lookupService.getPriorities(),
        lookupService.getChannels(),
        lookupService.getUrgencies(),
        lookupService.getImpacts(),
        lookupService.getIdTypes()
      ]);

      setDepartments(deptData.map((d) => d.name));
      
      const mappedPrios = prioData.map((p) => {
        let metadata: { hours?: number } = {};
        if (typeof p.metadata === 'string') {
          try {
            metadata = JSON.parse(p.metadata);
          } catch {
            metadata = {};
          }
        } else if (p.metadata && typeof p.metadata === 'object') {
          metadata = p.metadata as { hours?: number };
        }
        return {
          value: p.code,
          label: `${p.name} (${metadata.hours || 24}h SLA)`,
          hours: metadata.hours || 24
        };
      });
      
      setPriorities(mappedPrios);
      setChannelOptions(channelData.map(c => ({ value: c.code, label: c.name })));
      setUrgencyOptions(urgencyData.map(u => ({ value: u.code, label: u.name })));
      setImpactOptions(impactData.map(i => ({ value: i.code, label: i.name })));
      setIdTypeOptions(idTypeData.map(t => ({ value: t.code, label: t.name })));
    } catch (err) {
      console.error('Error loading lookups:', err);
    }
  };

  const handleInputChange = (field: keyof TicketFormData, value: string | string[] | Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.customer_name || !formData.customer_email) {
      setError('Customer name and email are required');
      return false;
    }
    
    if (!formData.subject || !formData.description) {
      setError('Subject and description are required');
      return false;
    }
    
    if (!formData.department || !formData.priority) {
      setError('Department and priority are required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create or find customer first
      let customerId: number;
      
      // Check if customer already exists by ID number or email
      const searchResult = await customerService.searchCustomer({
        id_no: formData.customer_id_no,
        email: formData.customer_email
      });
      
      if (searchResult.success && searchResult.data) {
        // Customer exists, use their ID
        customerId = searchResult.data.id;
      } else {
        // Create new customer
        const customerData = {
          name: formData.customer_name,
          email: formData.customer_email,
          phone_number: formData.customer_phone,
          id_type: formData.customer_id_type as Customer['id_type'],
          id_no: formData.customer_id_no,
          customer_type: 'individual' as const,
          status: 'active' as const,
          preferred_language: 'en' as const,
          country: 'Malaysia',
        };
        
        const customerResponse = await customerService.createCustomer(customerData);
        
        if (!customerResponse.success || !customerResponse.data) {
          throw new Error('Failed to create customer');
        }
        
        customerId = customerResponse.data.id;
      }
      
      // Step 2: Create ticket with customer_id
      const ticketData = {
        customer_id: customerId,
        
        // Ticket classification
        priority: formData.priority,
        department: formData.department,
        category: formData.category,
        sub_category: formData.sub_category,
        urgency: formData.urgency,
        impact: formData.impact,
        
        // Ticket details
        subject: formData.subject,
        description: formData.description,
        channel: formData.channel,
        source: formData.source,
        
        // Assignment (if specified)
        assigned_to: formData.assigned_to,
        
        // Additional fields
        tags: formData.tags,
        custom_fields: formData.custom_fields,
      };

      const response = await ticketService.createTicket(ticketData as Parameters<typeof ticketService.createTicket>[0]);
      
      if (response.success) {
        // Show success modal with ticket number
        setCreatedTicket({
          id: response.data.id,
          ticket_number: response.data.ticket_number || sequencePreview
        });
        setShowSuccessModal(true);
      } else {
        setError(response.message || 'Failed to create ticket');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create ticket. Please try again.')
        : 'Failed to create ticket. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage as draft
    localStorage.setItem('ticket_draft', JSON.stringify(formData));
    alert('Draft saved successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        {sequencePreview && (
          <div className="mb-4">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Next Ticket Number</p>
                  <p className="text-4xl md:text-5xl font-mono font-bold text-primary tracking-tight select-all">{sequencePreview}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
                    <Icon name="Hash" size={12} />
                    <span>Auto-generated on submission</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400 mr-3 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Customer Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="User" size={20} className="mr-2" />
          Customer Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Customer Name *"
            type="text"
            value={formData.customer_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('customer_name', e.target.value)}
            required
            placeholder="Enter customer name"
          />
          
          <Input
            label="Email Address *"
            type="email"
            value={formData.customer_email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('customer_email', e.target.value)}
            required
            placeholder="customer@example.com"
          />
          
          <div className="relative">
            <Input
              label="Phone Number"
              type="tel"
              value={formData.customer_phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleInputChange('customer_phone', e.target.value);
              }}
              onFocus={() => {
                if (phoneSearchResults.length > 0) {
                  setShowPhoneDropdown(true);
                }
              }}
              onBlur={() => {
                // Delay to allow click on dropdown item
                setTimeout(() => setShowPhoneDropdown(false), 200);
              }}
              placeholder="+60 12-345-6789"
            />
            
            {/* Autocomplete Dropdown */}
            {showPhoneDropdown && phoneSearchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearchingPhone && (
                  <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Searching...
                  </div>
                )}
                {phoneSearchResults.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectCustomerFromPhone(customer)}
                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone_number}</p>
                        <p className="text-xs text-muted-foreground mt-1">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">{customer.id_type}</span>
                        <p className="text-xs text-muted-foreground">{customer.id_no}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Select
            label="ID Type"
            value={formData.customer_id_type}
            onChange={(value) => handleInputChange('customer_id_type', value as string)}
            options={idTypeOptions}
          />
          
          <Input
            label="ID Number"
            type="text"
            value={formData.customer_id_no}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('customer_id_no', e.target.value)}
            placeholder="Enter ID number"
          />
        </div>

        {/* Pinned Customer Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center mb-3">
              <Icon name="Pin" size={16} className="mr-2 text-warning" />
              <h4 className="text-sm font-semibold text-foreground">Customer Notes</h4>
            </div>
            <div className="space-y-2">
              {pinnedNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-warning/10 border border-warning/20 rounded-md p-3"
                >
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>By: {note.creator?.name || 'Unknown'}</span>
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoadingNotes && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Loading customer notes...
            </div>
          </div>
        )}
      </div>

      {/* Ticket Classification */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Tag" size={20} className="mr-2" />
          Ticket Classification
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Channel *"
            value={formData.channel}
            onChange={(value) => handleInputChange('channel', value as string)}
            options={channelOptions}
            required
          />
          
          <Select
            label="Department *"
            value={formData.department}
            onChange={(value) => handleInputChange('department', value as string)}
            options={[
              { value: '', label: 'Select Department' },
              ...departments.map(dept => ({ value: dept, label: dept }))
            ]}
            required
          />
          
          <Select
            label="Priority *"
            value={formData.priority}
            onChange={(value) => handleInputChange('priority', value as string)}
            options={priorities.map(p => ({ value: p.value, label: p.label }))}
            required
          />
          
          <Select
            label="Category"
            value={formData.category}
            onChange={(value) => handleInputChange('category', value as string)}
            options={[
              { value: '', label: isLoadingCategories ? 'Loading categories...' : 'Select Category' },
              ...categories.map(cat => ({ value: cat.name, label: cat.name }))
            ]}
            disabled={!formData.department || isLoadingCategories}
          />
          
          <Select
            label="Sub Category"
            value={formData.sub_category || ''}
            onChange={(value) => handleInputChange('sub_category', value as string)}
            options={[
              { value: '', label: isLoadingSubcategories ? 'Loading subcategories...' : 'Select Sub Category' },
              ...subcategories.map(subcat => ({ value: subcat.name, label: subcat.name }))
            ]}
            disabled={!formData.category || isLoadingSubcategories || subcategories.length === 0}
          />
          
          <Select
            label="Urgency"
            value={formData.urgency}
            onChange={(value) => handleInputChange('urgency', value as string)}
            options={urgencyOptions}
          />
          
          <Select
            label="Impact"
            value={formData.impact}
            onChange={(value) => handleInputChange('impact', value as string)}
            options={impactOptions}
          />
        </div>
      </div>

      {/* Ticket Details */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="FileText" size={20} className="mr-2" />
          Ticket Details
        </h3>
        
        <div className="space-y-4">
          <Input
            label="Subject *"
            type="text"
            value={formData.subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('subject', e.target.value)}
            required
            placeholder="Brief description of the issue"
          />
          
          <Textarea
            label="Description *"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
            required
            rows={6}
            placeholder="Provide detailed information about the issue..."
          />
          
          <Input
            label="Source/Reference"
            type="text"
            value={formData.source || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('source', e.target.value)}
            placeholder="e.g., Call ID, Email Reference, etc."
          />
        </div>
      </div>

      {/* Assignment Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Users" size={20} className="mr-2" />
          Assignment
        </h3>
        
        <div className="space-y-4">
          {currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'supervisor') ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Assign To
              </label>
              <div className="flex items-center gap-3">
                {selectedAgent ? (
                  <div className="flex-1 flex items-center justify-between px-4 py-3 bg-muted rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{selectedAgent.user?.name || selectedAgent.employee_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAgent.designation} • {selectedAgent.department}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAgent(null);
                        setFormData(prev => ({ ...prev, assigned_to: undefined }));
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="X" size={20} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    iconName="UserPlus"
                    iconPosition="left"
                    onClick={handleAssignToClick}
                    className="flex-1"
                  >
                    Select Agent
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Select an agent or supervisor to assign this ticket to
              </p>
            </div>
          ) : (
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Auto-Assignment Enabled
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {selectedAgent ? (
                      <>This ticket will be automatically assigned to <strong>{selectedAgent.user?.name || 'you'}</strong></>
                    ) : (
                      <>This ticket will be automatically assigned to you based on the MiTel call information</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          iconName="Save"
          iconPosition="left"
          onClick={handleSaveDraft}
        >
          Save Draft
        </Button>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            iconName="Check"
            iconPosition="left"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </div>

      {/* Agent Selection Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Icon name="Users" size={20} />
                Select Agent
              </h3>
              <button
                type="button"
                onClick={() => setShowAgentModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingAgents ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No agents available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => handleSelectAgent(agent)}
                      className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="User" size={24} className="text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">
                          {agent.user?.name || agent.employee_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {agent.designation} • {agent.department}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              agent.availability === 'available'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : agent.availability === 'busy'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                          >
                            {agent.availability}
                          </span>
                          {agent.skills && agent.skills.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {agent.skills.slice(0, 3).join(', ')}
                              {agent.skills.length > 3 && ` +${agent.skills.length - 3}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAgentModal(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Confirmation Modal */}
      {showCustomerConfirmModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Icon name="User" size={20} />
                Customer Found
              </h3>
              <button
                type="button"
                onClick={handleCancelCustomerSelection}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Existing Customer Found
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      We found an existing customer with this phone number. Would you like to use this customer's information?
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">{selectedCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.customer_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Icon name="Phone" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedCustomer.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Mail" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CreditCard" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {selectedCustomer.id_type}: {selectedCustomer.id_no}
                    </span>
                  </div>
                  {selectedCustomer.company_name && (
                    <div className="flex items-center gap-2">
                      <Icon name="Building" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedCustomer.company_name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Tickets:</span>
                    <span className="font-medium text-foreground">{selectedCustomer.total_tickets}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Resolution Rate:</span>
                    <span className="font-medium text-foreground">
                      {selectedCustomer.resolution_rate ? `${selectedCustomer.resolution_rate}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCustomerSelection}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleConfirmCustomerSelection}
                iconName="Check"
                iconPosition="left"
                className="flex-1"
              >
                Use This Customer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && createdTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="text-center p-8 border-b border-border">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={40} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Ticket Created Successfully!</h2>
              <p className="text-sm text-muted-foreground">Your ticket has been created and is ready for assignment</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Ticket Number */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 rounded-xl p-8 mb-6 shadow-lg">
                <div className="text-center">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide block mb-3">Ticket Number</span>
                  <div className="text-5xl md:text-6xl font-mono font-bold text-primary mb-3 tracking-tight select-all">
                    {createdTicket.ticket_number}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Info" size={12} />
                    <span>Click to select and copy</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (onSuccess) {
                      onSuccess(createdTicket.id);
                    } else {
                      navigate(`/ticket-management/${createdTicket.id}`);
                    }
                  }}
                  fullWidth
                  iconName="ExternalLink"
                  iconPosition="left"
                >
                  View Ticket Details
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCreatedTicket(null);
                    // Optionally reset form here if needed
                    window.location.reload(); // Simple way to create another ticket
                  }}
                  variant="outline"
                  fullWidth
                  iconName="Plus"
                  iconPosition="left"
                >
                  Create Another Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default TicketCreateForm;
