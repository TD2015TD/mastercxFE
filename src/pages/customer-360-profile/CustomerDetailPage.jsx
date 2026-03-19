import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import TelephonyBar from '../../components/TelephonyBar';
import CustomerProfileHeader from './components/CustomerProfileHeader';
import InteractionTimeline from './components/InteractionTimeline';
import RelatedTicketsPanel from './components/RelatedTicketsPanel';
import CustomerMetrics from './components/CustomerMetrics';
import RelationshipMapping from './components/RelationshipMapping';
import CustomerFormModal from './components/CustomerFormModal';
import CustomerDocuments from './components/CustomerDocuments';
import CustomerNotes from './components/CustomerNotes';
import { customerService } from '../../services/customerService';
import { contactService } from '../../services/contactService';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customerContacts, setCustomerContacts] = useState([]);

  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await customerService.getCustomer(parseInt(id));
      
      if (response.success) {
        setCustomer(response.data);
        try {
          const contactsResponse = await contactService.getCustomerContacts(parseInt(id), { per_page: 100 });
          setCustomerContacts(contactsResponse?.data || []);
        } catch (contactError) {
          console.error('Error loading customer contacts:', contactError);
          setCustomerContacts([]);
        }
      } else {
        setError('Customer not found');
      }
    } catch (err) {
      console.error('Error loading customer:', err);
      setError('Failed to load customer details');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Tickets',
      value: customer?.total_tickets?.toString() || '0',
      subtext: `${customer?.open_tickets_count || 0} open`,
      icon: 'Ticket',
      color: 'text-blue-600'
    },
    {
      label: 'Satisfaction Score',
      value: customer?.satisfaction_rating != null
        ? `${parseFloat(customer.satisfaction_rating).toFixed(1)}/5`
        : 'N/A',
      subtext: customer?.satisfaction_rating != null ? 'Based on resolved tickets' : 'No ratings yet',
      icon: 'Star',
      color: 'text-yellow-500'
    },
    {
      label: 'Last Interaction',
      value: customer?.last_contact_at
        ? new Date(customer.last_contact_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'N/A',
      subtext: customer?.last_contact_at
        ? (() => {
            const days = Math.floor((new Date() - new Date(customer.last_contact_at)) / 86400000);
            return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
          })()
        : 'No contact yet',
      icon: 'Clock',
      color: 'text-green-600'
    },
    {
      label: 'Customer Since',
      value: customer?.created_at 
        ? (() => {
            const years = new Date().getFullYear() - new Date(customer.created_at).getFullYear();
            return years === 0 ? 'This year' : `${years} ${years === 1 ? 'year' : 'years'}`;
          })()
        : 'N/A',
      subtext: customer?.created_at 
        ? new Date(customer.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
        : 'Unknown',
      icon: 'Calendar',
      color: 'text-purple-600'
    }
  ];

  // Calculate customer metrics
  const customerMetrics = customer ? {
    totalTickets: customer.total_tickets || 0,
    avgResolutionTime: customer.resolution_rate ? `${customer.resolution_rate}%` : 'N/A',
    satisfactionScore: customer.satisfaction_rating || 'N/A',
    slaCompliance: customer.resolution_rate || 0,
    ticketsTrend: 0,
    resolutionTrend: 0,
    satisfactionTrend: 0,
    slaTrend: 0
  } : null;

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (formData) => {
    setIsSaving(true);
    try {
      const { contacts = [], ...customerPayload } = formData;

      // Convert empty strings to null for optional fields so backend nullable validation passes
      if (customerPayload.email === '') customerPayload.email = null;
      if (customerPayload.id_no === '') customerPayload.id_no = null;

      const response = await customerService.updateCustomer(parseInt(id), customerPayload);
      
      if (response.success) {
        const existingContactsResponse = await contactService.getCustomerContacts(parseInt(id), { per_page: 100 });
        const existingContacts = existingContactsResponse?.data || [];
        const incomingContacts = contacts.filter((contact) => contact.contact_type_id && contact.value);

        const incomingIds = new Set(incomingContacts.filter((contact) => contact.id).map((contact) => contact.id));

        for (const contact of existingContacts) {
          if (!incomingIds.has(contact.id)) {
            await contactService.deleteContact(contact.id);
          }
        }

        for (const contact of incomingContacts) {
          const payload = {
            contact_type_id: Number(contact.contact_type_id),
            value: contact.value,
            is_primary: !!contact.is_primary,
            notes: contact.notes || undefined,
          };

          if (contact.id) {
            await contactService.updateContact(contact.id, payload);
          } else {
            await contactService.createContact({
              customer_id: parseInt(id),
              ...payload,
            });
          }
        }

        // Reload customer data to get updated information
        await loadCustomer();
        setIsEditModalOpen(false);
        toast.success('Customer profile updated successfully');
      } else {
        toast.error(response.message || 'Failed to update customer profile');
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.errors ?
                          Object.values(err.response.data.errors).flat().join('\n') :
                          'Failed to update customer profile';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTicket = () => {
    if (customer) {
      const primaryPhone = customerContacts.find((contact) =>
        contact.is_primary && (contact.contactType?.code === 'phone' || contact.contactType?.code === 'mobile')
      ) || customerContacts.find((contact) => contact.contactType?.code === 'phone' || contact.contactType?.code === 'mobile');

      const queryParts = [
        `customerName=${encodeURIComponent(customer.name)}`,
        `customerEmail=${encodeURIComponent(customer.email)}`,
        `customerId=${customer.id}`,
      ];

      if (primaryPhone?.value) {
        queryParts.push(`customerPhone=${encodeURIComponent(primaryPhone.value)}`);
      }

      navigate(`/ticket-management/create?${queryParts.join('&')}`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: 'User' },
    { id: 'history', label: 'Ticket History', icon: 'Ticket' },
    { id: 'interactions', label: 'Interactions', icon: 'MessageSquare' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'notes', label: 'Notes', icon: 'StickyNote' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <CustomerProfileHeader 
                  customer={customer} 
                  customerContacts={customerContacts}
                  onEdit={handleEditProfile}
                  onCreateTicket={handleCreateTicket}
                />
                <CustomerMetrics metrics={customerMetrics} />
                <InteractionTimeline customerId={customer?.id} />
              </div>
              <div className="space-y-6">
                <RelatedTicketsPanel customerId={customer?.id} />
                <RelationshipMapping customer={customer} />
              </div>
            </div>
          </div>
        );
      
      case 'history':
        return <RelatedTicketsPanel customerId={customer?.id} />;
      
      case 'interactions':
        return <InteractionTimeline customerId={customer?.id} />;
      
      case 'documents':
        return <CustomerDocuments customerId={customer?.id} />;
      
      case 'notes':
        return <CustomerNotes customerId={customer?.id} />;
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {error || 'Customer Not Found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              The customer you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/customer-360-profile')}>
              Back to Customers
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{customer?.name || 'Customer'} - Customer 360 Profile - JKDM CRM</title>
        <meta name="description" content="Comprehensive customer profile with interaction history and insights" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TelephonyBar />
        
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <BreadcrumbNavigation />

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    iconName="ArrowLeft" 
                    onClick={() => navigate('/customer-360-profile')}
                  >
                    Back
                  </Button>
                  <h1 className="text-3xl font-bold text-foreground flex items-center">
                    <Icon name="User" size={32} className="mr-3 text-primary" />
                    {customer?.name}
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Comprehensive customer profile with interaction history and insights
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={loadCustomer}>
                  Refresh
                </Button>
                <Button variant="outline" iconName="Edit" iconPosition="left" onClick={handleEditProfile}>
                  Edit Profile
                </Button>
                <Button iconName="Plus" iconPosition="left" onClick={handleCreateTicket}>
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    <Icon name={stat.icon} size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Description */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'overview' && 'Complete overview of customer information, metrics, and recent interactions.'}
              {activeTab === 'history' && 'View all tickets submitted by this customer with status and resolution details.'}
              {activeTab === 'interactions' && 'Timeline of all interactions across phone, email, chat, and in-person channels.'}
              {activeTab === 'documents' && 'Manage customer-related documents, attachments, and files.'}
              {activeTab === 'notes' && 'Internal notes and observations about customer preferences and history.'}
            </p>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {renderTabContent()}
          </div>

          {/* Quick Actions Panel — hidden */}
        </main>

        {/* Edit Profile Modal */}
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
          customer={customer}
          isLoading={isSaving}
        />
      </div>
    </>
  );
};

export default CustomerDetailPage;
