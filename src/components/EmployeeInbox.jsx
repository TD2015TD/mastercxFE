import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import Button from './ui/Button';
import { useMitelSignalR } from '../hooks/useMitelSignalR';
import customerInteractionService from '../services/customerInteractionService';

const EmployeeInbox = ({ className = '', onConversationEvent }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('all'); // all, voice, email, chat, callback
  const [isExpanded, setIsExpanded] = useState(true);
  const [agentStatus, setAgentStatus] = useState('Offline');

  // ---- Helper: Log Customer Interaction Asynchronously ----
  const logInteractionAsync = useCallback(async (interactionData) => {
    try {
      // Get agent info from localStorage or auth context
      const authData = JSON.parse(localStorage.getItem('user') || '{}');
      const agentId = authData?.agent?.id;

      const payload = {
        agent_id: agentId,
        interaction_at: new Date().toISOString(),
        ...interactionData,
      };

      // Log asynchronously without blocking UI
      customerInteractionService.createInteraction(payload).catch(err => {
        console.error('Failed to log interaction:', err);
        // Silent fail - don't disrupt user experience
      });
    } catch (error) {
      console.error('Error preparing interaction log:', error);
    }
  }, []);

  // ---- Mitel SignalR Hook ----
  const { state: connState, on } = useMitelSignalR({
    baseUrl: `${import.meta.env.VITE_MITEL_BASE_URL || 'https://micc.telediant.com.my'}/MiccSdk/signalr`,
    hubs: ['queueHub', 'employeeHub', 'agentHub'],
    token: localStorage.getItem('mitel_token')
  });

  // ---- Listen to Employee Conversation Events ----
  useEffect(() => {
    console.log('📬 Setting up Employee Inbox event listeners...');

    // Employee Conversation ADDED - New conversation assigned to agent
    const offConversationAdded = on('employeeHub', 'employeeConversationAdded', (data) => {
      console.log('📬 Employee Conversation ADDED:', JSON.stringify(data, null, 2));

      if (data) {
        const newConversation = {
          conversationId: data.conversationId || data.id || `conv-${Date.now()}`,
          mediaType: data.mediaType || 'Voice',
          direction: data.direction || 'Inbound',
          conversationState: data.conversationState || data.state || 'Offered',
          fromName: data.fromName || data.ani || 'Unknown',
          fromAddress: data.fromAddress || data.ani || 'Unknown',
          toName: data.toName || data.dnis || 'Agent',
          toAddress: data.toAddress || data.dnis || 'Unknown',
          subject: data.subject || '',
          queueName: data.queueName || 'General',
          timestamp: new Date().toISOString(),
        };

        setConversations(prev => {
          // Check if conversation already exists
          const exists = prev.find(c => c.conversationId === newConversation.conversationId);
          if (exists) {
            // Update existing conversation
            return prev.map(c =>
              c.conversationId === newConversation.conversationId
                ? { ...c, ...newConversation }
                : c
            );
          }
          // Add new conversation
          return [newConversation, ...prev];
        });

        // Log conversation added interaction asynchronously
        logInteractionAsync({
          interaction_type: newConversation.mediaType?.toLowerCase() === 'email' ? 'email' :
                           newConversation.mediaType?.toLowerCase() === 'chat' ? 'chat' :
                           newConversation.mediaType?.toLowerCase() === 'sms' ? 'sms' : 'call',
          channel: newConversation.mediaType?.toLowerCase() === 'voice' ? 'phone' :
                   newConversation.mediaType?.toLowerCase() || 'web',
          subject: `${newConversation.mediaType || 'Conversation'} conversation added - ${newConversation.fromName}`,
          description: `New ${newConversation.direction?.toLowerCase() || 'inbound'} ${newConversation.mediaType?.toLowerCase() || 'conversation'} from ${newConversation.fromAddress}`,
          metadata: {
            conversationId: newConversation.conversationId,
            mediaType: newConversation.mediaType,
            direction: newConversation.direction,
            conversationState: newConversation.conversationState,
            fromName: newConversation.fromName,
            fromAddress: newConversation.fromAddress,
            queueName: newConversation.queueName,
            subject: newConversation.subject,
          },
        });

        onConversationEvent?.('inbox:conversation_added', newConversation);
      }
    });

    // Employee Conversation CHANGED - Conversation state changed
    const offConversationChanged = on('employeeHub', 'employeeConversationChanged', (conversationsData) => {
      console.log('📬 Employee Conversation CHANGED:', JSON.stringify(conversationsData, null, 2));

      // The event sends an ARRAY of conversations
      const conversationList = Array.isArray(conversationsData) ? conversationsData : [conversationsData];

      conversationList.forEach(conversation => {
        if (!conversation) return;

        const updatedConversation = {
          conversationId: conversation.conversationId || conversation.id,
          mediaType: conversation.mediaType || 'Voice',
          direction: conversation.direction || 'Inbound',
          conversationState: conversation.conversationState || conversation.state,
          fromName: conversation.fromName || conversation.ani || 'Unknown',
          fromAddress: conversation.fromAddress || conversation.ani || 'Unknown',
          toName: conversation.toName || conversation.dnis || 'Agent',
          toAddress: conversation.toAddress || conversation.dnis || 'Unknown',
          subject: conversation.subject || '',
          queueName: conversation.queueName || 'General',
          timestamp: new Date().toISOString(),
        };

        setConversations(prev => {
          const exists = prev.find(c => c.conversationId === updatedConversation.conversationId);
          if (exists) {
            // Update existing conversation
            return prev.map(c =>
              c.conversationId === updatedConversation.conversationId
                ? { ...c, ...updatedConversation }
                : c
            );
          }
          // Add new conversation if it doesn't exist
          return [updatedConversation, ...prev];
        });

        // Log conversation state change interaction asynchronously (only for significant state changes)
        const significantStates = ['Connected', 'Active', 'Established', 'Disconnected', 'Ended', 'Completed'];
        if (significantStates.includes(updatedConversation.conversationState)) {
          logInteractionAsync({
            interaction_type: updatedConversation.mediaType?.toLowerCase() === 'email' ? 'email' :
                             updatedConversation.mediaType?.toLowerCase() === 'chat' ? 'chat' :
                             updatedConversation.mediaType?.toLowerCase() === 'sms' ? 'sms' : 'call',
            channel: updatedConversation.mediaType?.toLowerCase() === 'voice' ? 'phone' :
                     updatedConversation.mediaType?.toLowerCase() || 'web',
            subject: `Conversation state changed to ${updatedConversation.conversationState} - ${updatedConversation.fromName}`,
            description: `${updatedConversation.mediaType || 'Conversation'} from ${updatedConversation.fromAddress} changed to ${updatedConversation.conversationState}`,
            metadata: {
              conversationId: updatedConversation.conversationId,
              mediaType: updatedConversation.mediaType,
              direction: updatedConversation.direction,
              conversationState: updatedConversation.conversationState,
              fromName: updatedConversation.fromName,
              fromAddress: updatedConversation.fromAddress,
              queueName: updatedConversation.queueName,
              eventType: 'state_change',
            },
          });
        }

        onConversationEvent?.('inbox:conversation_changed', updatedConversation);
      });
    });

    // Employee Conversation REMOVED - Conversation ended/removed
    const offConversationRemoved = on('employeeHub', 'employeeConversationRemoved', (conversationIds) => {
      console.log('📬 Employee Conversation REMOVED:', JSON.stringify(conversationIds, null, 2));

      // conversationIds can be an array or a single ID
      const idsToRemove = Array.isArray(conversationIds) ? conversationIds : [conversationIds];

      idsToRemove.forEach(conversationId => {
        // Get conversation details before removing for logging
        const conversation = conversations.find(c => c.conversationId === conversationId);

        setConversations(prev => prev.filter(c => c.conversationId !== conversationId));

        // Log conversation removal interaction asynchronously
        if (conversation) {
          logInteractionAsync({
            interaction_type: conversation.mediaType?.toLowerCase() === 'email' ? 'email' :
                             conversation.mediaType?.toLowerCase() === 'chat' ? 'chat' :
                             conversation.mediaType?.toLowerCase() === 'sms' ? 'sms' : 'call',
            channel: conversation.mediaType?.toLowerCase() === 'voice' ? 'phone' :
                     conversation.mediaType?.toLowerCase() || 'web',
            subject: `Conversation removed/ended - ${conversation.fromName || 'Unknown'}`,
            description: `${conversation.mediaType || 'Conversation'} from ${conversation.fromAddress || 'Unknown'} was removed from inbox`,
            metadata: {
              conversationId: conversation.conversationId,
              mediaType: conversation.mediaType,
              direction: conversation.direction,
              conversationState: conversation.conversationState,
              fromName: conversation.fromName,
              fromAddress: conversation.fromAddress,
              queueName: conversation.queueName,
              eventType: 'conversation_removed',
            },
          });
        }

        onConversationEvent?.('inbox:conversation_removed', { conversationId });
      });
    });

    // Employee State Changed
    const offEmployeeState = on('employeeHub', 'employeeStateChanged', (data) => {
      console.log('👤 Employee State Changed (Inbox):', data);
      if (data?.presence?.aggregate?.state) {
        setAgentStatus(data.presence.aggregate.state);
      }
    });

    // Agent State Changed (alternative event)
    const offAgentState = on('agentHub', 'onAgentStateChanged', (data) => {
      console.log('🎧 Agent State Changed (Inbox):', data);
      if (data?.state) {
        setAgentStatus(data.state);
      }
    });

    // Queue Conversation Events (for monitoring queue activity)
    const offQueueConversationAdded = on('queueHub', 'queueConversationAdded', (data) => {
      console.log('📋 Queue Conversation ADDED:', JSON.stringify(data, null, 2));
      onConversationEvent?.('inbox:queue_conversation_added', data);
    });

    const offQueueConversationChanged = on('queueHub', 'queueConversationChanged', (data) => {
      console.log('📋 Queue Conversation CHANGED:', JSON.stringify(data, null, 2));
      onConversationEvent?.('inbox:queue_conversation_changed', data);
    });

    const offQueueConversationRemoved = on('queueHub', 'queueConversationRemoved', (data) => {
      console.log('📋 Queue Conversation REMOVED:', JSON.stringify(data, null, 2));
      onConversationEvent?.('inbox:queue_conversation_removed', data);
    });

    return () => {
      offConversationAdded();
      offConversationChanged();
      offConversationRemoved();
      offEmployeeState();
      offAgentState();
      offQueueConversationAdded();
      offQueueConversationChanged();
      offQueueConversationRemoved();
    };
  }, [on, onConversationEvent, conversations, logInteractionAsync]);

  // ---- Filter conversations ----
  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    return conv.mediaType?.toLowerCase() === filter.toLowerCase();
  });

  // ---- Get media type icon ----
  const getMediaTypeIcon = (mediaType) => {
    switch (mediaType?.toLowerCase()) {
      case 'voice':
      case 'phone':
        return 'Phone';
      case 'email':
        return 'Mail';
      case 'chat':
      case 'webchat':
        return 'MessageSquare';
      case 'callback':
        return 'PhoneCall';
      case 'sms':
        return 'MessageCircle';
      default:
        return 'Inbox';
    }
  };

  // ---- Get state badge color ----
  const getStateBadgeColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'offered':
      case 'ringing':
      case 'alerting':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'connected':
      case 'active':
      case 'established':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'held':
      case 'hold':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'disconnected':
      case 'ended':
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // ---- Handle conversation click ----
  const handleConversationClick = useCallback((conversation) => {
    console.log('🖱️ Conversation clicked:', conversation);

    // Log conversation click interaction asynchronously
    logInteractionAsync({
      interaction_type: conversation.mediaType?.toLowerCase() === 'email' ? 'email' :
                       conversation.mediaType?.toLowerCase() === 'chat' ? 'chat' :
                       conversation.mediaType?.toLowerCase() === 'sms' ? 'sms' : 'call',
      channel: conversation.mediaType?.toLowerCase() === 'voice' ? 'phone' :
               conversation.mediaType?.toLowerCase() || 'web',
      subject: `Conversation clicked - ${conversation.fromName || 'Unknown'}`,
      description: `Agent opened ${conversation.mediaType?.toLowerCase() || 'conversation'} from ${conversation.fromAddress || 'Unknown'}`,
      metadata: {
        conversationId: conversation.conversationId,
        mediaType: conversation.mediaType,
        direction: conversation.direction,
        conversationState: conversation.conversationState,
        fromName: conversation.fromName,
        fromAddress: conversation.fromAddress,
        queueName: conversation.queueName,
        eventType: 'conversation_clicked',
      },
    });

    // Navigate based on media type
    if (conversation.mediaType?.toLowerCase() === 'voice' || conversation.mediaType?.toLowerCase() === 'phone') {
      // Navigate to ticket creation with caller information
      navigate(`/ticket-management/create?callId=${encodeURIComponent(conversation.fromAddress)}&source=call&conversationId=${conversation.conversationId}`);
    } else if (conversation.mediaType?.toLowerCase() === 'email') {
      // Navigate to email handling interface
      navigate(`/communications/email?conversationId=${conversation.conversationId}`);
    } else if (conversation.mediaType?.toLowerCase() === 'chat') {
      // Navigate to chat interface
      navigate(`/communications/chat?conversationId=${conversation.conversationId}`);
    }

    onConversationEvent?.('inbox:conversation_clicked', conversation);
  }, [navigate, onConversationEvent, logInteractionAsync]);

  // ---- Connection indicator ----
  const connectionStatus = {
    'connected': '🟢',
    'connecting': '🟡',
    'reconnecting': '🟡',
    'disconnected': '🔴'
  }[connState] || '⚪';

  // ---- Count by media type ----
  const counts = {
    all: conversations.length,
    voice: conversations.filter(c => c.mediaType?.toLowerCase() === 'voice').length,
    email: conversations.filter(c => c.mediaType?.toLowerCase() === 'email').length,
    chat: conversations.filter(c => c.mediaType?.toLowerCase() === 'chat').length,
    callback: conversations.filter(c => c.mediaType?.toLowerCase() === 'callback').length,
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={18} />
            <Icon name="Inbox" size={20} />
            <span className="font-semibold text-sm">Employee Inbox</span>
            {conversations.length > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                {conversations.length}
              </span>
            )}
          </button>

          <span title={`SignalR: ${connState}`} className="text-sm">
            {connectionStatus}
          </span>

          {/* Agent Status */}
          {agentStatus && (
            <div className="flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground border border-border">
              <Icon
                name={agentStatus === 'Available' ? 'CheckCircle2' : agentStatus === 'Busy' ? 'AlertCircle' : 'Circle'}
                size={12}
                className={`mr-1 ${agentStatus === 'Available' ? 'text-green-600' : agentStatus === 'Busy' ? 'text-red-600' : 'text-gray-600'}`}
              />
              <span>{agentStatus}</span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {isExpanded && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter('voice')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'voice'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="Phone" size={12} />
              Voice ({counts.voice})
            </button>
            <button
              onClick={() => setFilter('email')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'email'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="Mail" size={12} />
              Email ({counts.email})
            </button>
            <button
              onClick={() => setFilter('chat')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'chat'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="MessageSquare" size={12} />
              Chat ({counts.chat})
            </button>
          </div>
        )}
      </div>

      {/* Conversation List */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mb-2 opacity-50" />
              <p className="text-sm">No conversations</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.conversationId}
                  onClick={() => handleConversationClick(conversation)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  {/* Media Type Icon */}
                  <div className={`p-2 rounded-lg ${
                    conversation.mediaType?.toLowerCase() === 'voice' ? 'bg-blue-100 text-blue-600' :
                    conversation.mediaType?.toLowerCase() === 'email' ? 'bg-purple-100 text-purple-600' :
                    conversation.mediaType?.toLowerCase() === 'chat' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon name={getMediaTypeIcon(conversation.mediaType)} size={16} />
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {conversation.fromName}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStateBadgeColor(conversation.conversationState)}`}>
                        {conversation.conversationState}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{conversation.fromAddress}</span>
                      <span>•</span>
                      <span className="truncate">{conversation.queueName}</span>
                      <span>•</span>
                      <Icon name={conversation.direction === 'Inbound' ? 'ArrowDownLeft' : 'ArrowUpRight'} size={10} />
                      <span>{conversation.direction}</span>
                    </div>
                    {conversation.subject && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {conversation.subject}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="ExternalLink"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConversationClick(conversation);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeInbox;
