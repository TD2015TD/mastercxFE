import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Icon from './AppIcon';
import { getMitelAgents } from '../services/mitelService';

const MitelAgentSelector = ({ isOpen, onClose, onSelect, selectedAgentId }) => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMitelAgents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = agents.filter(agent => 
        agent.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.extension?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents(agents);
    }
  }, [searchTerm, agents]);

  const fetchMitelAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMitelAgents();
      
      if (response.success && response.data) {
        setAgents(response.data);
        setFilteredAgents(response.data);
        
        // Pre-select current agent if exists
        if (selectedAgentId) {
          const current = response.data.find(a => a.id === selectedAgentId);
          if (current) {
            setSelectedAgent(current);
          }
        }
      } else {
        setError('Failed to load Mitel agents');
      }
    } catch (err) {
      console.error('Error fetching Mitel agents:', err);
      setError(err.response?.data?.message || 'Failed to fetch Mitel agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (agent) => {
    setSelectedAgent(agent);
  };

  const handleConfirm = async () => {
    if (selectedAgent) {
      try {
        // Assuming `onSelect` sends the selected agent to the backend
        const updatedAgent = {
          ...selectedAgent,
          agent_username: selectedAgent.id, // Assign agent_username as the agent ID or other unique identifier
          employee_id: selectedAgent.employeeId, // Include employee_id if available
        };

        await onSelect(updatedAgent); // Pass updated agent with agent_username and employee_id
        onClose();
      } catch (error) {
        console.error('Error assigning agent_username and employee_id:', error);
      }
    }
  };

  const handleClear = () => {
    setSelectedAgent(null);
    onSelect(null);
    onClose();
  };

  const getAgentStatusBadge = (state) => {
    const stateConfig = {
      'Available': 'bg-success/10 text-success',
      'Busy': 'bg-warning/10 text-warning',
      'Away': 'bg-info/10 text-info',
      'DoNotDisturb': 'bg-error/10 text-error',
      'Logout': 'bg-muted/10 text-muted-foreground'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stateConfig[state] || 'bg-muted/10 text-muted-foreground'}`}>
        {state || 'Unknown'}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Mitel Agent"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {selectedAgent && (
            <Button variant="ghost" onClick={handleClear}>
              Clear Selection
            </Button>
          )}
          <Button 
            variant="default" 
            onClick={handleConfirm}
            disabled={!selectedAgent}
          >
            Select Agent
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div>
          <Input
            type="search"
            placeholder="Search by Agent ID, Name, or Extension..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader" size={32} className="animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading Mitel agents...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center">
              <Icon name="AlertTriangle" size={20} className="text-error mr-3" />
              <div>
                <p className="text-sm text-error font-medium">{error}</p>
                <button
                  onClick={fetchMitelAgents}
                  className="text-xs text-error underline mt-1 hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agents List */}
        {!loading && !error && (
          <div className="max-h-96 overflow-y-auto border border-border rounded-lg">
            {filteredAgents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Icon name="Users" size={48} className="mx-auto mb-3 opacity-50" />
                <p>No agents found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedAgent?.id === agent.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                    }`}
                    onClick={() => handleSelect(agent)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Radio Button */}
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedAgent?.id === agent.id 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedAgent?.id === agent.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>

                        {/* Agent Info */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">{agent.name || agent.id}</span>
                            {agent.state && getAgentStatusBadge(agent.state)}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Icon name="Hash" size={14} className="mr-1" />
                              ID: {agent.id}
                            </span>
                            {agent.extension && (
                              <span className="flex items-center">
                                <Icon name="Phone" size={14} className="mr-1" />
                                Ext: {agent.extension}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {agent.queue_count !== undefined && (
                        <div className="text-sm text-muted-foreground">
                          <span>{agent.queue_count} queues</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Message */}
        <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
          <div className="flex items-start">
            <Icon name="Info" size={16} className="text-info mr-2 mt-0.5" />
            <p className="text-xs text-info">
              Select a Mitel agent to link with this CRM user. This will enable telephony features and call management.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MitelAgentSelector;
