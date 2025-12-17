import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { searchDirectory } from '../services/mitelService';
import { toast } from 'react-toastify';

/**
 * MakeCallModal Component
 *
 * Voice Contacts modal for making outbound calls.
 * Similar to Mitel Ignite's "Voice Contacts" interface.
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal is closed
 * @param {function} onMakeCall - Called when making a call. Receives destination and options
 * @param {string} fromExtension - Agent's extension to display in "From" field
 */
const MakeCallModal = ({ isOpen, onClose, onMakeCall, fromExtension = '' }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialAsIs, setDialAsIs] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const tabs = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'employees', label: 'Employees', icon: 'users' },
    { id: 'queues', label: 'Queues', icon: 'phone-incoming' },
    { id: 'external', label: 'External', icon: 'phone-outgoing' },
    { id: 'activedir', label: 'Active Directory', icon: 'building' },
    { id: 'extension', label: 'Extension', icon: 'hash' }
  ];

  // Fetch contacts when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || activeTab === 'all' || activeTab === 'employees') {
        performSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Load recent contacts on mount
  useEffect(() => {
    if (isOpen) {
      loadRecentContacts();
    }
  }, [isOpen]);

  const loadRecentContacts = () => {
    // Load from localStorage or API
    const stored = localStorage.getItem('recentCallContacts');
    if (stored) {
      try {
        setRecentContacts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent contacts:', e);
      }
    }
  };

  const saveRecentContact = (contact) => {
    const recent = [contact, ...recentContacts.filter(c => c.id !== contact.id)].slice(0, 10);
    setRecentContacts(recent);
    localStorage.setItem('recentCallContacts', JSON.stringify(recent));
  };

  const performSearch = async (query) => {
    setLoading(true);
    try {
      let response;

      // Filter by tab
      if (activeTab === 'employees' || activeTab === 'all') {
        response = await searchDirectory(query, true, 0, 25, 'text');

        if (response.success && response.data?._embedded?.items) {
          setContacts(response.data._embedded.items);
        } else {
          setContacts([]);
        }
      } else {
        // For other tabs, clear results for now
        setContacts([]);
      }
    } catch (error) {
      console.error('Failed to search directory:', error);
      toast.error('Failed to search directory');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleMakeCall = () => {
    if (!selectedContact) {
      toast.warning('Please select a contact to call');
      return;
    }

    // Save to recent contacts
    saveRecentContact(selectedContact);

    // Prepare contact data for the call
    const contactData = {
      dialAsIs,
      contactName: selectedContact.name,
      contactId: selectedContact.id,
      contact: selectedContact,
      lightDirectoryEntryModels: [
        {
          id: selectedContact.id,
          name: selectedContact.name,
          email: selectedContact.email || '',
          phone: selectedContact.phone,
          agentId: selectedContact.agentId || null,
          type: selectedContact.type || 'Employee'
        }
      ]
    };

    // Make the call - pass agentId if available, otherwise phone number
    const destination = selectedContact.agentId || selectedContact.phone;
    onMakeCall(destination, contactData);

    // Close modal
    onClose();
  };

  const handleRecentContactClick = (contact) => {
    setSelectedContact(contact);
  };

  const getPresenceColor = (presenceState) => {
    switch (presenceState) {
      case 'Available':
        return 'bg-green-500';
      case 'Busy':
        return 'bg-yellow-500';
      case 'Away':
        return 'bg-orange-500';
      case 'Offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPresenceLabel = (contact) => {
    const voicePresence = contact.presence?.voice?.[0];
    if (voicePresence) {
      return voicePresence.state;
    }
    return contact.presence?.aggregate?.state || 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-card border border-border rounded-lg w-[700px] max-h-[700px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center">
            <Icon name="phone" className="mr-2 text-primary" />
            Voice Contacts
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="x" size={24} />
          </button>
        </div>

        {/* From Field */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center">
            <label className="text-sm font-medium mr-3 w-16">From:</label>
            <div className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm">
              {fromExtension || 'Not available'}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full px-3 py-2 pl-10 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Icon
              name={loading ? 'loader' : 'search'}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${
                loading ? 'animate-spin' : ''
              }`}
              size={18}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 overflow-x-auto">
          <div className="flex space-x-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon name={tab.icon} size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Contact History Section */}
          {recentContacts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                <Icon name="clock" size={16} className="mr-2" />
                Contact History
              </h3>
              <div className="space-y-1">
                {recentContacts.slice(0, 3).map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleRecentContactClick(contact)}
                    className={`
                      px-3 py-2 rounded-md cursor-pointer transition-all flex items-center
                      ${
                        selectedContact?.id === contact.id
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-accent border border-transparent'
                      }
                    `}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">{contact.phone}</div>
                    </div>
                    {selectedContact?.id === contact.id && (
                      <Icon name="check-circle" className="text-primary ml-2" size={18} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Searching...</span>
            </div>
          )}

          {!loading && contacts.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="search-x" className="mx-auto mb-2" size={32} />
              <div className="text-sm">No contacts found for "{searchQuery}"</div>
            </div>
          )}

          {!loading && contacts.length > 0 && (
            <div className="space-y-1">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`
                    px-3 py-3 rounded-md cursor-pointer transition-all border
                    ${
                      selectedContact?.id === contact.id
                        ? 'bg-primary/10 border-primary ring-2 ring-primary'
                        : 'bg-background border-border hover:border-primary/50 hover:bg-accent'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Extension: {contact.phone}
                        {contact.email && ` • ${contact.email}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full ${getPresenceColor(
                            getPresenceLabel(contact)
                          )} mr-1`}
                        ></div>
                        <span className="text-xs text-muted-foreground">
                          {getPresenceLabel(contact)}
                        </span>
                      </div>
                      {selectedContact?.id === contact.id && (
                        <Icon name="check-circle" className="text-primary" size={18} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={dialAsIs}
                onChange={(e) => setDialAsIs(e.target.checked)}
                className="mr-2 w-4 h-4 text-primary focus:ring-2 focus:ring-primary rounded"
              />
              Dial as is
            </label>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Icon name="plus" size={16} className="mr-1" />
                Add
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="download" size={16} className="mr-1" />
                Download
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleMakeCall}
              disabled={!selectedContact}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Icon name="phone" className="mr-2" />
              Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeCallModal;
