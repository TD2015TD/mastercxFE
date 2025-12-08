import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DirectorySearchTab = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    location: ''
  });

  // Mock directory data - in a real app, this would come from an API
  const mockDirectoryData = [
    {
      id: 1,
      name: 'Ahmad Rahman',
      department: 'Customer Service',
      role: 'Senior Agent',
      email: 'ahmad.rahman@jkdm.gov.my',
      extension: '345',
      location: 'Putrajaya HQ',
      availability: 'Available',
      phone: '+603-8882-3345',
      directLine: '03-8882-3345'
    },
    {
      id: 2,
      name: 'Siti Aminah',
      department: 'Assessment & Valuation',
      role: 'Assessment Officer',
      email: 'siti.aminah@jkdm.gov.my',
      extension: '256',
      location: 'Johor Bahru',
      availability: 'In Meeting',
      phone: '+607-221-4256',
      directLine: '07-221-4256'
    },
    {
      id: 3,
      name: 'Muhammad Hafiz',
      department: 'Enforcement',
      role: 'Enforcement Officer',
      email: 'muhammad.hafiz@jkdm.gov.my',
      extension: '189',
      location: 'Port Klang',
      availability: 'Available',
      phone: '+603-3168-2189',
      directLine: '03-3168-2189'
    },
    {
      id: 4,
      name: 'Nurul Huda',
      department: 'Import/Export Licensing',
      role: 'Licensing Specialist',
      email: 'nurul.huda@jkdm.gov.my',
      extension: '432',
      location: 'Penang',
      availability: 'On Leave',
      phone: '+604-261-8432',
      directLine: '04-261-8432'
    },
    {
      id: 5,
      name: 'Inspector Razak',
      department: 'Intelligence & Investigation',
      role: 'Senior Inspector',
      email: 'razak.inspector@jkdm.gov.my',
      extension: '567',
      location: 'Kuala Lumpur',
      availability: 'Available',
      phone: '+603-2142-6567',
      directLine: '03-2142-6567'
    },
    {
      id: 6,
      name: 'Fatimah Hassan',
      department: 'GST Division',
      role: 'Tax Advisor',
      email: 'fatimah.hassan@jkdm.gov.my',
      extension: '298',
      location: 'Putrajaya HQ',
      availability: 'Busy',
      phone: '+603-8882-3298',
      directLine: '03-8882-3298'
    },
    {
      id: 7,
      name: 'Lim Wei Ming',
      department: 'IT Support',
      role: 'System Administrator',
      email: 'lim.weiming@jkdm.gov.my',
      extension: '501',
      location: 'Cyberjaya',
      availability: 'Available',
      phone: '+603-8314-2501',
      directLine: '03-8314-2501'
    },
    {
      id: 8,
      name: 'Raj Kumar',
      department: 'Legal Affairs',
      role: 'Legal Officer',
      email: 'raj.kumar@jkdm.gov.my',
      extension: '378',
      location: 'Putrajaya HQ',
      availability: 'Available',
      phone: '+603-8882-3378',
      directLine: '03-8882-3378'
    },
    {
      id: 9,
      name: 'Dr. Sarah Abdullah',
      department: 'Training & Development',
      role: 'Training Director',
      email: 'sarah.abdullah@jkdm.gov.my',
      extension: '612',
      location: 'Academy Campus',
      availability: 'In Training',
      phone: '+603-8888-4612',
      directLine: '03-8888-4612'
    },
    {
      id: 10,
      name: 'Azman Ismail',
      department: 'Border Control',
      role: 'Operations Manager',
      email: 'azman.ismail@jkdm.gov.my',
      extension: '789',
      location: 'KLIA',
      availability: 'Available',
      phone: '+603-8777-3789',
      directLine: '03-8777-3789'
    }
  ];

  const departments = [
    'Customer Service',
    'Assessment & Valuation',
    'Enforcement',
    'Import/Export Licensing',
    'Intelligence & Investigation',
    'GST Division',
    'IT Support',
    'Legal Affairs',
    'Training & Development',
    'Border Control'
  ];

  const roles = [
    'Senior Agent',
    'Assessment Officer',
    'Enforcement Officer',
    'Licensing Specialist',
    'Senior Inspector',
    'Tax Advisor',
    'System Administrator',
    'Legal Officer',
    'Training Director',
    'Operations Manager'
  ];

  const locations = [
    'Putrajaya HQ',
    'Johor Bahru',
    'Port Klang',
    'Penang',
    'Kuala Lumpur',
    'Cyberjaya',
    'Academy Campus',
    'KLIA'
  ];

  useEffect(() => {
    // Initialize with all data
    setSearchResults(mockDirectoryData);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...mockDirectoryData];

    // Apply text search
    if (searchQuery?.trim()) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered?.filter(person =>
        person?.name?.toLowerCase()?.includes(query) ||
        person?.department?.toLowerCase()?.includes(query) ||
        person?.role?.toLowerCase()?.includes(query) ||
        person?.email?.toLowerCase()?.includes(query) ||
        person?.extension?.includes(query)
      );
    }

    // Apply department filter
    if (filters?.department) {
      filtered = filtered?.filter(person => person?.department === filters?.department);
    }

    // Apply role filter
    if (filters?.role) {
      filtered = filtered?.filter(person => person?.role === filters?.role);
    }

    // Apply location filter
    if (filters?.location) {
      filtered = filtered?.filter(person => person?.location === filters?.location);
    }

    setSearchResults(filtered);
    setIsLoading(false);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      department: '',
      role: '',
      location: ''
    });
    setSearchResults(mockDirectoryData);
  };

  const exportDirectory = () => {
    // Mock export functionality
    const csvContent = [
      ['Name', 'Department', 'Email', 'Extension', 'Availability'],
      ...searchResults?.map(person => [
        person?.name,
        person?.department,
        person?.email,
        person?.extension,
        person?.availability
      ])
    ]?.map(row => row?.join(','))?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'directory_export.csv';
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  const getAvailabilityColor = (availability) => {
    switch (availability?.toLowerCase()) {
      case 'available':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'busy':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'in meeting':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'on leave':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'in training':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Search for internal contacts and departments within the CRM ecosystem.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search by name, department, email, or extension..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pr-10"
              onKeyPress={(e) => e?.key === 'Enter' && handleSearch()}
            />
            <Icon 
              name="Search" 
              size={20} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Icon name="Search" size={16} className="mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            placeholder="All Departments"
            value={filters?.department}
            onChange={(value) => handleFilterChange('department', value)}
            options={departments?.map(dept => ({ value: dept, label: dept }))}
          />
          <Select
            placeholder="All Roles"
            value={filters?.role}
            onChange={(value) => handleFilterChange('role', value)}
            options={roles?.map(role => ({ value: role, label: role }))}
          />
          <Select
            placeholder="All Locations"
            value={filters?.location}
            onChange={(value) => handleFilterChange('location', value)}
            options={locations?.map(loc => ({ value: loc, label: loc }))}
          />
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              <Icon name="RotateCcw" size={14} className="mr-1" />
              Clear Filters
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {searchResults?.length} contacts found
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={exportDirectory}
              disabled={searchResults?.length === 0}
            >
              <Icon name="Download" size={14} className="mr-1" />
              Export Directory
            </Button>
          </div>
        </div>
      </div>
      {/* Results Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {searchResults?.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No contacts found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ext
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {searchResults?.map((person) => (
                  <tr key={person?.id} className="hover:bg-muted/25 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary">
                            {person?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {person?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {person?.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{person?.department}</div>
                      <div className="text-xs text-muted-foreground">{person?.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={`mailto:${person?.email}`}
                        className="text-sm text-primary hover:text-primary/80 underline"
                      >
                        {person?.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-foreground">{person?.extension}</div>
                      <div className="text-xs text-muted-foreground">{person?.directLine}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(person?.availability)}`}>
                        {person?.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.location.href = `mailto:${person?.email}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Send Email"
                        >
                          <Icon name="Mail" size={16} />
                        </button>
                        <button
                          onClick={() => window.location.href = `tel:${person?.phone}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Call Phone"
                        >
                          <Icon name="Phone" size={16} />
                        </button>
                        <button
                          onClick={() => navigator.clipboard?.writeText(`${person?.name}\n${person?.email}\n${person?.directLine}`)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Copy Contact Info"
                        >
                          <Icon name="Copy" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorySearchTab;