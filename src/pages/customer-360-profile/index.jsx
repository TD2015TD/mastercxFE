import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import TelephonyBar from '../../components/TelephonyBar';
import CustomerFormModal from './components/CustomerFormModal';
import { customerService } from '../../services/customerService';

const CustomerListingPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState({
    customer_type: '',
    status: '',
    id_type: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    loadCustomers();
  }, [pagination.current_page, filters]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await customerService.getCustomers({
        search: searchQuery,
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters
      });

      console.log('API Response:', response);

      if (response.success) {
        // Handle paginated response structure
        const customerData = response.data.data || response.data;
        console.log('Customer Data:', customerData);
        
        setCustomers(Array.isArray(customerData) ? customerData : []);
        
        // Set pagination info
        if (response.data.current_page !== undefined) {
          setPagination({
            current_page: response.data.current_page,
            per_page: response.data.per_page,
            total: response.data.total,
            last_page: response.data.last_page
          });
        }
      } else {
        setError('Failed to load customers');
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current_page: 1 }));
    loadCustomers();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customer-360-profile/${customerId}`);
  };

  const handleCreateTicket = (customer) => {
    // Phone number is now tracked in interactions, not on customer record
    navigate(`/ticket-management/create?customerName=${encodeURIComponent(customer.name)}&customerEmail=${encodeURIComponent(customer.email)}&customerId=${customer.id}`);
  };

  const handleAddCustomer = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = async (formData) => {
    setIsSaving(true);
    try {
      const response = await customerService.createCustomer(formData);
      
      if (response.success) {
        setIsAddModalOpen(false);
        await loadCustomers(); // Reload the list
        toast.success('Customer added successfully');
        // Optionally navigate to the new customer's detail page
        if (response.data?.id) {
          navigate(`/customer-360-profile/${response.data.id}`);
        }
      } else {
        toast.error(response.message || 'Failed to add customer');
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.errors ?
                          Object.values(err.response.data.errors).flat().join('\n') :
                          'Failed to add customer';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
      'blocked': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors['active'];
  };

  const getCustomerTypeIcon = (type) => {
    return type === 'business' ? 'Building' : 'User';
  };

  const stats = [
    {
      label: 'Total Customers',
      value: pagination.total.toString(),
      icon: 'Users',
      color: 'text-blue-600'
    },
    {
      label: 'Active Customers',
      value: customers.filter(c => c.status === 'active').length.toString(),
      icon: 'UserCheck',
      color: 'text-green-600'
    },
    {
      label: 'Business Accounts',
      value: customers.filter(c => c.customer_type === 'business').length.toString(),
      icon: 'Building',
      color: 'text-purple-600'
    },
    {
      label: 'Individual Accounts',
      value: customers.filter(c => c.customer_type === 'individual').length.toString(),
      icon: 'User',
      color: 'text-orange-600'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Customer 360 - JKDM CRM</title>
        <meta name="description" content="Comprehensive customer management and profiles" />
      </Helmet>

      <div className="min-h-screen bg-background">        
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="Users" size={32} className="mr-3 text-primary" />
                  Customer 360
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage and view comprehensive customer profiles
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={loadCustomers}>
                  Refresh
                </Button>
                <Button iconName="Plus" iconPosition="left" onClick={handleAddCustomer}>
                  Add Customer
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
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    <Icon name={stat.icon} size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Search Customers
                  </label>
                  <div className="relative">
                    <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or ID number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Customer Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Customer Type
                  </label>
                  <select
                    value={filters.customer_type}
                    onChange={(e) => handleFilterChange('customer_type', e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" iconName="Search" iconPosition="left">
                  Search
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ customer_type: '', status: '', id_type: '' });
                    setPagination(prev => ({ ...prev, current_page: 1 }));
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </form>
          </div>

          {/* Customer Table */}
          <div className="bg-card rounded-lg border border-border">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 m-4">
                <div className="flex items-center">
                  <Icon name="AlertCircle" size={20} className="text-red-600 mr-2" />
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader" size={48} className="animate-spin text-primary" />
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Customers Found</h3>
                  <p className="text-muted-foreground">
                    {error ? 'There was an error loading customers' : 'Try adjusting your search or filters'}
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        ID Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tickets
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customers.map((customer) => (
                      <tr 
                        key={customer.id} 
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleViewCustomer(customer.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon name={getCustomerTypeIcon(customer.customer_type)} size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{customer.name}</p>
                              {customer.company_name && (
                                <p className="text-sm text-muted-foreground">{customer.company_name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-foreground">{customer.email}</p>
                            <p className="text-muted-foreground text-xs">See interactions for phone</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-foreground">{customer.id_type}</p>
                            <p className="text-muted-foreground">{customer.id_no}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Icon name={getCustomerTypeIcon(customer.customer_type)} size={16} className="text-muted-foreground" />
                            <span className="text-sm text-foreground capitalize">{customer.customer_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-foreground font-medium">{customer.total_tickets || 0} total</p>
                            <p className="text-muted-foreground">{customer.open_tickets_count || 0} open</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              iconName="Eye"
                              iconPosition="left"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCustomer(customer.id);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              iconName="Plus"
                              iconPosition="left"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateTicket(customer);
                              }}
                            >
                              Create Ticket
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!isLoading && customers.length > 0 && (
              <div className="px-6 py-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                    {pagination.total} customers
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current_page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setPagination(prev => ({ ...prev, current_page: page }))}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              pagination.current_page === page
                                ? 'bg-primary text-white'
                                : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current_page === pagination.last_page}
                      onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Add Customer Modal */}
        <CustomerFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveCustomer}
          customer={null}
          isLoading={isSaving}
        />
      </div>
    </>
  );
};

export default CustomerListingPage;
