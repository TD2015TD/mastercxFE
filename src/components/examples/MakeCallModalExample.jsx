import React, { useState, useEffect } from 'react';
import MakeCallModal from '../MakeCallModal';
import { useWebRTCSoftphone } from '../../hooks/useWebRTCSoftphone';
import { getAgentGroupPresence, makeOutboundCall } from '../../services/mitelService';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import Icon from '../AppIcon';
import Button from '../ui/Button';

/**
 * MakeCallModalExample Component
 *
 * Example implementation showing how to integrate the MakeCallModal
 * with WebRTC softphone or Mitel API calls.
 *
 * This component can be integrated into:
 * - Agent Dashboard
 * - Telephony Bar
 * - Customer 360 Profile
 * - Any component that needs outbound call functionality
 */
const MakeCallModalExample = () => {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [agentExtension, setAgentExtension] = useState('');
  const [isLoadingExtension, setIsLoadingExtension] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  // WebRTC softphone hook (optional - can fallback to Mitel API)
  const {
    isReady: softphoneReady,
    makeCall: makeWebRTCCall,
    currentCall,
    initialize: initSoftphone
  } = useWebRTCSoftphone();

  // Fetch agent extension when component mounts
  useEffect(() => {
    fetchAgentExtension();
  }, []);

  // Initialize WebRTC softphone when agent becomes available
  useEffect(() => {
    if (employeeId && !softphoneReady) {
      initSoftphone(employeeId).catch(error => {
        console.error('Failed to initialize WebRTC softphone:', error);
        // Fallback to Mitel API will be used
      });
    }
  }, [employeeId, softphoneReady, initSoftphone]);

  const fetchAgentExtension = async () => {
    setIsLoadingExtension(true);
    try {
      // Get employee ID from authenticated user
      const authData = authService.getCurrentUser();
      const empId = authData?.agent?.employee_id;

      if (!empId) {
        toast.error('Employee ID not found');
        setIsLoadingExtension(false);
        return;
      }

      setEmployeeId(empId);

      const response = await getAgentGroupPresence(empId);

      if (response.success && response.data?.agentGroups) {
        // Find Voice agent group
        const voiceAgent = response.data.agentGroups.find(
          (g) => g.mediaType === 'Voice'
        );

        if (voiceAgent) {
          // For this example, we'll use the agentId as extension
          // In production, you might need to fetch actual extension from agent profile
          setAgentExtension(voiceAgent.agentId.substring(0, 8)); // Use first 8 chars as display
        } else {
          toast.warning('No Voice agent group found');
        }
      }
    } catch (error) {
      console.error('Failed to fetch agent extension:', error);
      toast.error('Failed to fetch agent information');
    } finally {
      setIsLoadingExtension(false);
    }
  };

  const handleMakeCall = async (destination, options) => {
    console.log('Making call to:', destination);
    console.log('Call options:', options);
    // options: { dialAsIs, contactName, contactId, contact, lightDirectoryEntryModels }

    try {
      // Try WebRTC softphone first if available
      if (softphoneReady) {
        console.log('Using WebRTC softphone to make call');
        await makeWebRTCCall(destination);
        toast.success(`Calling ${options.contactName}...`);
      } else {
        // Use Mitel API
        console.log('WebRTC not ready, using Mitel API');

        if (!employeeId) {
          toast.error('Employee ID not found. Cannot make call.');
          return;
        }

        const response = await makeOutboundCall(employeeId, destination, {
          from: '',
          type: 'Voice',
          dialAsIs: options.dialAsIs,
          lightDirectoryEntryModels: options.lightDirectoryEntryModels || []
        });

        if (response.success) {
          toast.success(`Call initiated to ${options.contactName}`);
          console.log('Call response:', response.data);
        } else {
          toast.error('Failed to initiate call');
        }
      }
    } catch (error) {
      console.error('Failed to make call:', error);
      toast.error('Failed to make call: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-4">Make Call Example</h2>

        {/* Status Display */}
        <div className="mb-6 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Extension:</span>
            <span className="font-mono">
              {isLoadingExtension ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                agentExtension || 'Not available'
              )}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">WebRTC Status:</span>
            <span className={`text-sm ${softphoneReady ? 'text-green-600' : 'text-orange-600'}`}>
              {softphoneReady ? 'Ready' : 'Not Ready'}
            </span>
          </div>
          {currentCall && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Current Call:</span>
              <span className="text-sm text-blue-600">
                {currentCall.remoteIdentity} ({currentCall.status})
              </span>
            </div>
          )}
        </div>

        {/* Make Call Button */}
        <Button
          onClick={() => setIsCallModalOpen(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={!agentExtension}
        >
          <Icon name="phone" className="mr-2" />
          Make Call
        </Button>

        {/* Integration Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Integration Note</h3>
          <p className="text-xs text-blue-800">
            This is an example component. To integrate into your application:
          </p>
          <ol className="text-xs text-blue-800 mt-2 ml-4 list-decimal space-y-1">
            <li>Import MakeCallModal into your component</li>
            <li>Add state for modal visibility</li>
            <li>Implement handleMakeCall with your call logic</li>
            <li>Optionally integrate with WebRTC softphone</li>
          </ol>
        </div>
      </div>

      {/* Make Call Modal */}
      <MakeCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onMakeCall={handleMakeCall}
        fromExtension={agentExtension}
      />
    </div>
  );
};

export default MakeCallModalExample;
