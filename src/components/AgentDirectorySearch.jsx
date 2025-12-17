import React, { useState, useEffect, useCallback } from 'react';
import Icon from './AppIcon';
import { searchDirectory } from '../services/mitelService';
import { toast } from 'react-toastify';

/**
 * AgentDirectorySearch Component
 *
 * Searchable directory component for selecting agents/employees for call transfer.
 * Displays agent presence status and allows searching by name or extension.
 *
 * @param {function} onSelectAgent - Called when an agent is selected. Receives agent object
 * @param {string} placeholder - Placeholder text for search input
 */
const AgentDirectorySearch = ({ onSelectAgent, placeholder = 'Search by name or extension...' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || searchQuery === '') {
        performSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const response = await searchDirectory(query, true, 0, 25);

      if (response.success && response.data?._embedded?.items) {
        setAgents(response.data._embedded.items);
        setShowDropdown(true);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Failed to search directory:', error);
      toast.error('Failed to search directory');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setSearchQuery(`${agent.name} (${agent.phone})`);
    setShowDropdown(false);
    onSelectAgent(agent);
  };

  const handleInputFocus = () => {
    if (agents.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedAgent(null);
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

  const getPresenceLabel = (agent) => {
    const voicePresence = agent.presence?.voice?.[0];
    if (voicePresence) {
      return voicePresence.state;
    }
    return agent.presence?.aggregate?.state || 'Unknown';
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-3 py-2 pl-10 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Icon
          name={loading ? 'loader' : 'search'}
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${
            loading ? 'animate-spin' : ''
          }`}
          size={18}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedAgent(null);
              setAgents([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && agents.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => handleSelectAgent(agent)}
              className="px-3 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Extension: {agent.phone}
                    {agent.email && ` • ${agent.email}`}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getPresenceColor(getPresenceLabel(agent))} mr-1`}></div>
                    <span className="text-xs text-muted-foreground">{getPresenceLabel(agent)}</span>
                  </div>
                  <Icon name="chevron-right" size={16} className="text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showDropdown && !loading && searchQuery && agents.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground">
          <Icon name="search-x" className="mx-auto mb-2" size={24} />
          <div className="text-sm">No agents found for "{searchQuery}"</div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default AgentDirectorySearch;
