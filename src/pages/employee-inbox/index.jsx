import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import { useMitelSignalR } from '../../hooks/useMitelSignalR';

const EmployeeInboxPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('all'); // all, voice, email, chat, callback
  const [agentStatus, setAgentStatus] = useState('Offline');

  // ---- Mitel SignalR Hook ----
  const { state: connState, on } = useMitelSignalR({
    baseUrl: 'https://micc.telediant.com.my/MiccSdk/signalr',
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
      });
    });

    // Employee Conversation REMOVED - Conversation ended/removed
    const offConversationRemoved = on('employeeHub', 'employeeConversationRemoved', (conversationIds) => {
      console.log('📬 Employee Conversation REMOVED:', JSON.stringify(conversationIds, null, 2));

      // conversationIds can be an array or a single ID
      const idsToRemove = Array.isArray(conversationIds) ? conversationIds : [conversationIds];

      idsToRemove.forEach(conversationId => {
        setConversations(prev => prev.filter(c => c.conversationId !== conversationId));
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
    });

    const offQueueConversationChanged = on('queueHub', 'queueConversationChanged', (data) => {
      console.log('📋 Queue Conversation CHANGED:', JSON.stringify(data, null, 2));
    });

    const offQueueConversationRemoved = on('queueHub', 'queueConversationRemoved', (data) => {
      console.log('📋 Queue Conversation REMOVED:', JSON.stringify(data, null, 2));
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
  }, [on]);

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
  }, [navigate]);

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
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Employee Inbox - JKDM CRM Portal</title>
        <meta name="description" content="Manage your conversations, calls, emails, and chats" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNavigation />

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Inbox" size={32} className="text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Employee Inbox</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage all your conversations in one place
                </p>
              </div>
              {conversations.length > 0 && (
                <span className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {conversations.length} Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span title={`SignalR: ${connState}`} className="text-2xl">
                {connectionStatus}
              </span>

              {/* Agent Status */}
              {agentStatus && (
                <div className="flex items-center px-3 py-2 rounded-lg text-sm bg-card border border-border">
                  <Icon
                    name={agentStatus === 'Available' ? 'CheckCircle2' : agentStatus === 'Busy' ? 'AlertCircle' : 'Circle'}
                    size={16}
                    className={`mr-2 ${agentStatus === 'Available' ? 'text-green-600' : agentStatus === 'Busy' ? 'text-red-600' : 'text-gray-600'}`}
                  />
                  <span className="font-medium">{agentStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-card rounded-lg border border-border mb-6 p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground mr-2">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter('voice')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === 'voice'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="Phone" size={14} />
              Voice ({counts.voice})
            </button>
            <button
              onClick={() => setFilter('email')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === 'email'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="Mail" size={14} />
              Email ({counts.email})
            </button>
            <button
              onClick={() => setFilter('chat')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === 'chat'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="MessageSquare" size={14} />
              Chat ({counts.chat})
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="bg-card rounded-lg border border-border">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Icon name="Inbox" size={64} className="mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No conversations</h3>
              <p className="text-sm">Your inbox is empty. New conversations will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.conversationId}
                  onClick={() => handleConversationClick(conversation)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  {/* Media Type Icon */}
                  <div className={`p-3 rounded-xl ${
                    conversation.mediaType?.toLowerCase() === 'voice' ? 'bg-blue-100 text-blue-600' :
                    conversation.mediaType?.toLowerCase() === 'email' ? 'bg-purple-100 text-purple-600' :
                    conversation.mediaType?.toLowerCase() === 'chat' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon name={getMediaTypeIcon(conversation.mediaType)} size={20} />
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-base font-semibold text-foreground truncate">
                        {conversation.fromName}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStateBadgeColor(conversation.conversationState)}`}>
                        {conversation.conversationState}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="truncate">{conversation.fromAddress}</span>
                      <span>•</span>
                      <span className="truncate">{conversation.queueName}</span>
                      <span>•</span>
                      <Icon name={conversation.direction === 'Inbound' ? 'ArrowDownLeft' : 'ArrowUpRight'} size={12} />
                      <span>{conversation.direction}</span>
                    </div>
                    {conversation.subject && (
                      <p className="text-sm text-muted-foreground mt-2 truncate">
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
      </div>
    </div>
  );
};

export default EmployeeInboxPage;
