import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TicketCreateForm from './components/TicketCreateForm';

const TicketCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract query parameters that can be passed from MiTel
  const callId = searchParams.get('call_id') || searchParams.get('callId');
  const caseId = searchParams.get('case_id') || searchParams.get('caseId') || searchParams.get('ID_Number');
  const phoneNumber = searchParams.get('Phone_Number');

  const queryParams = {
    customerId: searchParams.get('customer_id') || searchParams.get('customerId'),
    customerName: searchParams.get('customer_name') || searchParams.get('customerName'),
    customerPhone: phoneNumber || searchParams.get('customer_phone') || searchParams.get('customerPhone') || callId, // Use Phone_Number, then callId as fallback
    customerEmail: searchParams.get('customer_email') || searchParams.get('customerEmail'),
    channel: searchParams.get('channel') || 'phone', // Default to phone for MiTel calls
    callId: callId,
    caseId: caseId,
    conversationId: searchParams.get('conversation_id') || searchParams.get('conversationId'),
    agentId: searchParams.get('agent_id') || searchParams.get('agentId'),
    queueId: searchParams.get('queue_id') || searchParams.get('queueId'),
    subject: searchParams.get('subject'),
    priority: searchParams.get('priority'),
    category: searchParams.get('category'),
  };

  const handleTicketCreated = (ticketId: number) => {
    // Navigate to the ticket detail page after creation
    navigate(`/ticket-management/${ticketId}`);
  };

  const handleCancel = () => {
    // Navigate back to ticket management
    navigate('/ticket-management');
  };

  return (
    <>
      <Helmet>
        <title>Create New Ticket - CRM</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Ticket Management
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900">
                Create New Ticket
              </h1>
              {queryParams.callId && (
                <p className="mt-1 text-sm text-gray-600">
                  Call ID: {queryParams.callId}
                </p>
              )}
              {queryParams.caseId && (
                <p className="mt-1 text-sm text-gray-600">
                  Case ID: {queryParams.caseId}
                </p>
              )}
            </div>

            <div className="p-6">
              <TicketCreateForm
                onSuccess={handleTicketCreated}
                onCancel={handleCancel}
                initialData={queryParams}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketCreatePage;
