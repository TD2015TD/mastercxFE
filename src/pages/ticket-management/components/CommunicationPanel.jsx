import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CommunicationPanel = ({ ticket, onAddNote, onTranslate }) => {
  const [newNote, setNewNote] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('note');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleAddNote = () => {
    if (newNote?.trim()) {
      onAddNote({
        type: selectedChannel,
        content: newNote,
        timestamp: new Date(),
        author: 'Ahmad Rahman'
      });
      setNewNote('');
    }
  };

  const handleTranslate = async (messageId, content) => {
    setIsTranslating(true);
    try {
      await onTranslate(messageId, content);
    } finally {
      setIsTranslating(false);
    }
  };

  const getChannelIcon = (channel) => {
    const icons = {
      'phone': 'Phone',
      'email': 'Mail',
      'chat': 'MessageSquare',
      'social': 'Share2',
      'note': 'FileText',
      'system': 'Settings'
    };
    return icons?.[channel] || 'MessageSquare';
  };

  const getChannelColor = (channel) => {
    const colors = {
      'phone': 'text-blue-600',
      'email': 'text-green-600',
      'chat': 'text-purple-600',
      'social': 'text-orange-600',
      'note': 'text-gray-600',
      'system': 'text-red-600'
    };
    return colors?.[channel] || 'text-gray-600';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date?.toDateString() === now?.toDateString();
    
    if (isToday) {
      return date?.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Communication Timeline</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Languages"
            iconPosition="left"
            loading={isTranslating}
            onClick={() => handleTranslate(null, 'Auto-translate enabled')}
          >
            Translate
          </Button>
        </div>
      </div>
      {/* Timeline */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {ticket?.communications?.map((comm, index) => (
          <div key={index} className="flex gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getChannelColor(comm?.channel)}`}>
              <Icon name={getChannelIcon(comm?.channel)} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{comm?.author}</span>
                <span className="text-xs text-muted-foreground capitalize">{comm?.channel}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(comm?.timestamp)}
                </span>
              </div>
              
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-foreground leading-relaxed">{comm?.content}</p>
                
                {comm?.channel === 'chat' && comm?.originalLanguage && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Languages" size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Translated from {comm?.originalLanguage}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">{comm?.originalText}</p>
                  </div>
                )}
                
                {comm?.attachments && comm?.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {comm?.attachments?.map((attachment, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs text-primary">
                        <Icon name="Paperclip" size={12} />
                        <span>{attachment?.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Add New Communication */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2 mb-3">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e?.target?.value)}
            className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="note">Internal Note</option>
            <option value="email">Email Reply</option>
            <option value="chat">Chat Message</option>
            <option value="phone">Phone Call Log</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a note or communication..."
            value={newNote}
            onChange={(e) => setNewNote(e?.target?.value)}
            onKeyPress={(e) => e?.key === 'Enter' && handleAddNote()}
            className="flex-1"
          />
          <Button
            variant="default"
            size="default"
            iconName="Send"
            iconPosition="left"
            onClick={handleAddNote}
            disabled={!newNote?.trim()}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationPanel;