import React, { useState, useEffect, useCallback } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { authService } from '../services/authService';

const VoiceContactsModal = ({ isOpen, onClose, onSelect, currentExtension }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [dialAsIs, setDialAsIs] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = ['All', 'Employees', 'Queues', 'External', 'Active Directory', 'Extension'];

  // Map tabs to Mitel DirectoryEntryType filters
  const getFilterForTab = (tab) => {
    const filters = {
      'All': '',
      'Employees': "Type eq Mitel.MiccSdk.Models.DirectoryEntryType'Employee'",
      'Queues': "Type eq Mitel.MiccSdk.Models.DirectoryEntryType'Queue'",
      'External': "Type eq Mitel.MiccSdk.Models.DirectoryEntryType'ElasticContact'",
      'Active Directory': "Type eq Mitel.MiccSdk.Models.DirectoryEntryType'ADUser' or Type eq Mitel.MiccSdk.Models.DirectoryEntryType'ADContact' or Type eq Mitel.MiccSdk.Models.DirectoryEntryType'ADGroup'",
      'Extension': "Type eq Mitel.MiccSdk.Models.DirectoryEntryType'Extension'"
    };
    return filters[tab] || '';
  };

  // Search directory using Mitel API
  const searchDirectory = useCallback(async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mitelToken = authService.getMitelToken();
      const mitelBaseUrl = import.meta.env.VITE_MITEL_BASE_URL || 'https://micc.telediant.com.my';

      const params = new URLSearchParams();
      const filter = getFilterForTab(activeTab);
      if (filter) {
        params.append('$filter', filter);
      }
      params.append('$search', `'${searchQuery}'`);
      params.append('dialAsIs', dialAsIs.toString());
      params.append('voiceOnly', 'true');
      // Remove $orderby as it causes errors with non-primitive collections
      params.append('$skip', '0');
      params.append('$top', '25');

      const response = await fetch(
        `${mitelBaseUrl}/MiccSdk/api/v1/directory/?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${mitelToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search directory: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data._embedded?.items || []);
    } catch (err) {
      console.error('Directory search error:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, dialAsIs]);

  // Search when query or tab changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      searchDirectory();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchDirectory]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveTab('All');
      setDialAsIs(false);
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  const handleSelect = (contact) => {
    const destination = contact.phoneDialable || contact.phone || contact.mobilePhoneDialable || contact.mobilePhone || contact.name;

    // For employees, extract the agent ID from presence.voice[0].deviceId
    let agentId = null;
    if (contact.type === 'Employee' && contact.presence?.voice?.length > 0) {
      agentId = contact.presence.voice[0].deviceId;
      console.log('📞 Extracted agent ID from presence.voice for employee:', contact.name, agentId);
    }

    // Pass the full contact object with id, type, and other metadata
    const contactInfo = {
      destination,
      id: contact.id,
      name: contact.name,
      type: contact.type,
      phone: contact.phone || contact.phoneDialable,
      mobilePhone: contact.mobilePhone || contact.mobilePhoneDialable,
      agentId: agentId
    };
    onSelect(destination, contactInfo);
    onClose();
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar color based on type
  const getAvatarColor = (type) => {
    const colors = {
      'Employee': 'bg-green-600',
      'Queue': 'bg-blue-600',
      'ElasticContact': 'bg-purple-600',
      'ADUser': 'bg-orange-600',
      'ADContact': 'bg-orange-600',
      'ADGroup': 'bg-orange-600',
      'Extension': 'bg-gray-600',
      'Dummy': 'bg-gray-400'
    };
    return colors[type] || 'bg-gray-600';
  };

  // Format type display
  const formatType = (type) => {
    const typeMap = {
      'Employee': 'Employees',
      'Queue': 'Queue',
      'ElasticContact': 'External',
      'ADUser': 'Active Directory',
      'ADContact': 'Active Directory',
      'ADGroup': 'Active Directory',
      'Extension': 'Extension',
      'Dummy': 'Extension'
    };
    return typeMap[type] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-[900px] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-semibold mb-4">Voice Contacts</h2>

          {/* From Extension Display */}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm font-medium text-muted-foreground px-3 py-2 bg-accent rounded-md">
              From
            </label>
            <div className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-foreground">
              {currentExtension || '8002'}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background text-foreground text-lg"
              autoFocus
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground hover:bg-accent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dial as is checkbox */}
          <div className="flex items-center gap-2 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={dialAsIs}
                  onChange={e => setDialAsIs(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${dialAsIs ? 'bg-primary' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${dialAsIs ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
              <span className="text-sm text-foreground">Dial as is</span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Results</h3>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-4">
              <Icon name="AlertCircle" className="mx-auto mb-2" />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && searchQuery && (
            <div className="text-muted-foreground text-center py-8">
              <Icon name="Search" className="mx-auto mb-2" size={32} />
              <p>No contacts found</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && !searchQuery && (
            <div className="text-muted-foreground text-center py-8">
              <Icon name="Users" className="mx-auto mb-2" size={32} />
              <p>Enter a search term to find contacts</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-2">
              {results.map((contact, index) => (
                <div
                  key={`${contact.name}-${index}`}
                  onClick={() => handleSelect(contact)}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(contact.type)} flex items-center justify-center text-white font-semibold flex-shrink-0 relative`}>
                    {getInitials(contact.name)}
                    {contact.type !== 'Dummy' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {contact.name} {contact.phone || contact.mobilePhone}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Type: {formatType(contact.type)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="default" iconName="Plus" className="bg-primary hover:bg-primary/90">
              Add
            </Button>
            <Button variant="outline" iconName="Download">
              Download
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceContactsModal;
