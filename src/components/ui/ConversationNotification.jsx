import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useMitelSignalR } from '../../hooks/useMitelSignalR';

// ConversationNotification - Real-time Employee Inbox Notification Component
// Shows active conversations from Mitel SignalR in a dropdown format

const ConversationNotification = ({ className = '', onConversationEvent }) => {
  // Dropdown state logic
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // EmployeeInbox states
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('all'); // all, voice, email, chat, callback
  const [agentStatus, setAgentStatus] = useState('Offline');
  const [isLoading, setIsLoading] = useState(false);

  // ---- Mitel SignalR Hook ----
  const { state: connState, on, connection } = useMitelSignalR({
    baseUrl: 'https://micc.telediant.com.my/MiccSdk/signalr',
    hubs: ['queueHub', 'employeeHub', 'agentHub'],
    token: localStorage.getItem('mitel_token')
  });

  // ---- Dropdown/Popover close logic ----
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- Listen to Employee Conversation Events (Real-time SignalR) ----
  useEffect(() => {
    // Only set up listeners once connected
    if (connState !== 'connected' || !connection) {
        return;
    }

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
          const exists = prev.find(c => c.conversationId === newConversation.conversationId);
          if (exists) {
            return prev.map(c =>
              c.conversationId === newConversation.conversationId
                ? { ...c, ...newConversation }
                : c
            );
          }
          return [newConversation, ...prev];
        });

        onConversationEvent?.('inbox:conversation_added', newConversation);
      }
    });

    // Employee Conversation CHANGED - Conversation state changed
    const offConversationChanged = on('employeeHub', 'employeeConversationChanged', (conversationsData) => {
      console.log('📬 Employee Conversation CHANGED:', JSON.stringify(conversationsData, null, 2));

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
            return prev.map(c =>
              c.conversationId === updatedConversation.conversationId
                ? { ...c, ...updatedConversation }
                : c
            );
          }
          return [updatedConversation, ...prev];
        });

        onConversationEvent?.('inbox:conversation_changed', updatedConversation);
      });
    });

    // Employee Conversation REMOVED - Conversation ended/removed
    const offConversationRemoved = on('employeeHub', 'employeeConversationRemoved', (conversationIds) => {
      console.log('📬 Employee Conversation REMOVED:', JSON.stringify(conversationIds, null, 2));

      const idsToRemove = Array.isArray(conversationIds) ? conversationIds : [conversationIds];

      idsToRemove.forEach(conversationId => {
        setConversations(prev => prev.filter(c => c.conversationId !== conversationId));
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
      onConversationEvent?.('inbox:queue_conversation_added', data);
    });

    const offQueueConversationChanged = on('queueHub', 'queueConversationChanged', (data) => {
      onConversationEvent?.('inbox:queue_conversation_changed', data);
    });

    const offQueueConversationRemoved = on('queueHub', 'queueConversationRemoved', (data) => {
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
  }, [on, onConversationEvent, connState, connection]);

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

    // Close the dropdown after clicking
    setIsOpen(false);
    onConversationEvent?.('inbox:conversation_clicked', conversation);
  }, [navigate, onConversationEvent]);

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

  const activeConversationCount = conversations.length; // Used for badge/unread count

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {isLoading ? (
          <div className="animate-spin w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full"></div>
        ) : (
          <Icon name="Inbox" size={20} className="text-muted-foreground" />
        )}
        {/* Badge showing active conversations */}
        {activeConversationCount > 0 && !isLoading && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {activeConversationCount > 9 ? '9+' : activeConversationCount}
          </span>
        )}
      </button>

      {/* Employee Inbox Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-popover border border-border rounded-lg shadow-modal z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-popover-foreground flex items-center gap-2">
                <Icon name="Inbox" size={16} />
                Inbox
                {activeConversationCount > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                    ({activeConversationCount} active)
                    </span>
                )}
            </h3>

            {/* Agent Status and Connection Status */}
            <div className="flex items-center space-x-3">
                <span title={`SignalR: ${connState}`} className="text-sm">
                    {connectionStatus}
                </span>
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
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-start gap-2 px-4 py-2 border-b border-border">
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

          {/* Conversation List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin mx-auto mb-2 w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                <p className="text-sm text-muted-foreground">Connecting to Mitel...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Icon name="Inbox" size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No active conversations</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.conversationId}
                    onClick={() => handleConversationClick(conversation)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    {/* Media Type Icon */}
                    <div className={`flex-shrink-0 mt-0.5 p-2 rounded-lg ${
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
                      className="flex-shrink-0"
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

          {/* Footer */}
          {activeConversationCount > 0 && (
            <div className="border-t border-border px-4 py-2">
              <button
                onClick={() => {
                  navigate('/employee-inbox');
                  setIsOpen(false);
                }}
                className="w-full text-center text-xs text-primary hover:text-primary/80 transition-colors duration-200 py-1"
              >
                Go to Inbox View
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationNotification;
