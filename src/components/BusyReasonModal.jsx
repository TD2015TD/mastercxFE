import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { getBusyReasonCodes } from '../services/mitelService';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

/**
 * BusyReasonModal Component
 *
 * Modal that displays available reason codes when agent changes status to Busy or DND.
 * Fetches reason codes from Mitel API and allows agent to select one.
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal is closed
 * @param {function} onSelectReason - Called when agent selects a reason
 * @param {string} statusType - Type of status: 'Busy' or 'Dnd' (default: 'Busy')
 * @param {string} employeeId - Optional employee ID (if not provided, gets from localStorage)
 */
const BusyReasonModal = ({ isOpen, onClose, onSelectReason, statusType = 'Busy', employeeId = null }) => {
  const [reasonCodes, setReasonCodes] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reason codes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchReasonCodes();
    }
  }, [isOpen, statusType]);

  const fetchReasonCodes = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get employee ID from prop or localStorage
      let agentEmployeeId = employeeId;
      if (!agentEmployeeId) {
        const authData = authService.getCurrentUser();
        agentEmployeeId = authData?.agent?.employee_id;
      }

      if (!agentEmployeeId) {
        setError('Employee ID not found');
        toast.error('Cannot load reason codes: Employee ID not found');
        setLoading(false);
        return;
      }

      const response = await getBusyReasonCodes(agentEmployeeId);

      if (response.success && response.data?._embedded?.items) {
        // Filter by status type (Busy or Dnd)
        const filteredReasons = response.data._embedded.items.filter(
          (item) => item.type === statusType
        );
        setReasonCodes(filteredReasons);

        // Auto-select first reason code if available
        if (filteredReasons.length > 0) {
          setSelectedReasonId(filteredReasons[0].id);
        }
      } else {
        setError(`No ${statusType.toLowerCase()} reason codes available`);
      }
    } catch (err) {
      console.error('Failed to fetch reason codes:', err);
      setError('Failed to load reason codes');
      toast.error('Failed to load reason codes');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedReasonId) {
      const selectedReason = reasonCodes.find((r) => r.id === selectedReasonId);
      onSelectReason(selectedReason);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedReasonId(null);
    onClose();
  };

  if (!isOpen) return null;

  // Dynamic properties based on status type
  const isDnd = statusType === 'Dnd';
  const iconName = isDnd ? 'bell-off' : 'clock';
  const iconColor = isDnd ? 'text-red-600' : 'text-yellow-600';
  const buttonColor = isDnd ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';
  const title = isDnd ? 'Choose a Do Not Disturb Reason' : 'Choose a Busy Reason';
  const buttonText = isDnd ? 'Confirm DND' : 'Confirm Busy';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-card border border-border rounded-lg p-6 w-[500px] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Icon name={iconName} className={`mr-2 ${iconColor}`} />
            {title}
          </h3>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="x" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mb-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading reason codes...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <Icon name="alert-circle" className="inline mr-2" />
              {error}
            </div>
          )}

          {!loading && !error && reasonCodes.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              <Icon name="alert-triangle" className="inline mr-2" />
              No busy reason codes available
            </div>
          )}

          {!loading && !error && reasonCodes.length > 0 && (
            <div className="space-y-2">
              {reasonCodes.map((reason) => (
                <div
                  key={reason.id}
                  onClick={() => setSelectedReasonId(reason.id)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${
                      selectedReasonId === reason.id
                        ? 'bg-primary/10 border-primary ring-2 ring-primary'
                        : 'bg-background border-border hover:border-primary/50 hover:bg-accent'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="font-medium">{reason.name}</div>
                      {reason.reporting && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Reporting Code: {reason.reporting}
                        </div>
                      )}
                    </div>
                    {selectedReasonId === reason.id && (
                      <Icon name="check-circle" className="text-primary ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedReasonId || loading}
            className={`${buttonColor} text-white`}
          >
            <Icon name="check" className="mr-2" />
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusyReasonModal;
