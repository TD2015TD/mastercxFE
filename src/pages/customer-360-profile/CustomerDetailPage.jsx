import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      value: customer?.satisfaction_rating || 'N/A',
      subtext: 'Out of 5.0',
      icon: 'Star',
      color: 'text-yellow-600'
    },
    {
      label: 'Last Interaction',
      value: customer?.last_contact_at 
        ? (() => {
            const days = Math.floor((new Date() - new Date(customer.last_contact_at)) / (1000 * 60 * 60 * 24));
            return days === 0 ? 'Today' : `${days} days ago`;
          })()
        : 'N/A',
      subtext: customer?.last_contact_at 
        ? new Date(customer.last_contact_at).toLocaleDateString('en-GB')
        : 'No interactions',
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
      const response = await customerService.updateCustomer(parseInt(id), formData);
      
      if (response.success) {
        // Reload customer data to get updated information
        await loadCustomer();
        setIsEditModalOpen(false);
      } else {
        alert(response.message || 'Failed to update customer profile');
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors ? 
                          Object.values(err.response.data.errors).flat().join('\n') :
                          'Failed to update customer profile';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTicket = () => {
    if (customer) {
      navigate(`/ticket-management/create?customerPhone=${encodeURIComponent(customer.phone_number)}&customerName=${encodeURIComponent(customer.name)}&customerEmail=${encodeURIComponent(customer.email)}`);
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

          {/* Quick Actions Panel */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="Zap" size={20} className="mr-2 text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="justify-start" 
                iconName="Plus" 
                iconPosition="left"
                onClick={handleCreateTicket}
              >
                Create Ticket
              </Button>
              <Button variant="outline" className="justify-start" iconName="MessageSquare" iconPosition="left">
                Log Interaction
              </Button>
              <Button variant="outline" className="justify-start" iconName="Mail" iconPosition="left">
                Send Email
              </Button>
              <Button variant="outline" className="justify-start" iconName="StickyNote" iconPosition="left">
                Add Note
              </Button>
            </div>
          </div>
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
