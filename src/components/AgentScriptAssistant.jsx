import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import Input from './ui/Input';

const AgentScriptAssistant = forwardRef(({
  currentTicket = null,
  currentChannel = null,
  onInsertScript = null,
  hideTrigger = false,
  className = ""
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('call');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [autoSuggestMode, setAutoSuggestMode] = useState(true);
  const panelRef = useRef(null);

  // Mock script data categorized by type
  const mockScripts = {
    call: [
      {
        id: 1,
        title: 'Greeting Script',
        content: 'Hi, this is Ahmad from JKDM Contact Centre. May I have your name and ID number, please?',
        tags: ['greeting', 'opening', 'identification'],
        category: 'General',
        favorites: 45
      },
      {
        id: 2,
        title: 'Complaint Script',
        content: 'Thank you for your report. Can you please provide the reference number for verification? I will investigate this matter immediately.',
        tags: ['complaint', 'reference', 'investigation'],
        category: 'Complaints',
        favorites: 32
      },
      {
        id: 3,
        title: 'Import Declaration Script',
        content: 'Regarding your import declaration issue, I can see that container MSKU123456 is pending. Let me check the HS code validation for you.',
        tags: ['import', 'declaration', 'container', 'hs code'],
        category: 'Import Declaration',
        favorites: 28
      },
      {
        id: 4,
        title: 'GST Calculation Script',
        content: 'For GST calculations, the standard rate is 6%. Based on your declared value of RM 45,000, the GST amount would be RM 2,700.',
        tags: ['gst', 'calculation', 'tax', 'rate'],
        category: 'Tax & Duties',
        favorites: 21
      },
      {
        id: 5,
        title: 'Follow-up Script',
        content: 'I\'m following up on your case regarding your import declaration. Have you received our update? Is there anything else I can assist you with?',
        tags: ['follow-up', 'update', 'assistance'],
        category: 'Follow-up',
        favorites: 18
      },
      {
        id: 6,
        title: 'Hold Script',
        content: 'I need to place you on a brief hold while I check with my supervisor regarding this matter. This will take approximately 2-3 minutes.',
        tags: ['hold', 'supervisor', 'escalation'],
        category: 'Call Management',
        favorites: 15
      }
    ],
    chat: [
      {
        id: 7,
        title: 'Live Chat Opening',
        content: 'Hello! Welcome to JKDM Customer Support. How may I assist you today?',
        tags: ['greeting', 'opening', 'chat'],
        category: 'General',
        favorites: 52
      },
      {
        id: 8,
        title: 'Chat Acknowledgment',
        content: 'I understand your concern. Let me check that for you right away. Please give me a moment.',
        tags: ['acknowledgment', 'checking', 'patience'],
        category: 'General',
        favorites: 38
      },
      {
        id: 9,
        title: 'Documentation Request',
        content: 'Could you please upload a copy of your commercial invoice and packing list? You can drag and drop the files here.',
        tags: ['documentation', 'upload', 'files'],
        category: 'Documentation',
        favorites: 29
      },
      {
        id: 10,
        title: 'Chat Closing',
        content: 'Is there anything else I can help you with today? If not, please feel free to contact us again if you need further assistance.',
        tags: ['closing', 'assistance', 'contact'],
        category: 'General',
        favorites: 41
      },
      {
        id: 11,
        title: 'Technical Issue Chat',
        content: 'I see you\'re experiencing a technical issue. I\'ve escalated this to our IT team. You should receive an update within 30 minutes.',
        tags: ['technical', 'escalation', 'timeline'],
        category: 'Technical Support',
        favorites: 25
      }
    ],
    email: [
      {
        id: 12,
        title: 'Email Opening - Formal',
        content: 'Dear Mr./Ms. [Customer Name],\n\nThank you for contacting JKDM Customer Service. I have received your inquiry regarding [subject].',
        tags: ['opening', 'formal', 'acknowledgment'],
        category: 'General',
        favorites: 44
      },
      {
        id: 13,
        title: 'Document Request Email',
        content: 'To proceed with your request, we require the following documents:\n\n• Commercial Invoice\n• Packing List\n• Bill of Lading\n• Copy of ID\n\nPlease reply to this email with the attached documents.',
        tags: ['documentation', 'requirements', 'attachments'],
        category: 'Documentation',
        favorites: 37
      },
      {
        id: 14,
        title: 'Resolution Confirmation',
        content: 'I am pleased to inform you that your issue has been resolved. The system has been updated and you should now be able to proceed with your import declaration.',
        tags: ['resolution', 'confirmation', 'update'],
        category: 'Resolution',
        favorites: 33
      },
      {
        id: 15,
        title: 'Email Closing - Professional',
        content: 'Should you require any further assistance, please do not hesitate to contact us.\n\nBest regards,\nAhmad Rahman\nCustomer Service Officer\nJKDM Contact Centre',
        tags: ['closing', 'professional', 'contact'],
        category: 'General',
        favorites: 48
      }
    ]
  };

  // Initialize panel state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('script-assistant-state');
    if (savedState) {
      const { isOpen: savedIsOpen, activeTab: savedTab } = JSON.parse(savedState);
      setActiveTab(savedTab || 'call');
      // Don't restore isOpen state - let user control visibility
    }
  }, []);

  // Save panel state to localStorage
  useEffect(() => {
    localStorage.setItem('script-assistant-state', JSON.stringify({ 
      isOpen, 
      activeTab 
    }));
  }, [isOpen, activeTab]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyboard = (event) => {
      if (event?.ctrlKey && event?.shiftKey && event?.key === 'S') {
        event?.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  // Auto-suggest based on ticket/channel context
  useEffect(() => {
    if (autoSuggestMode && currentTicket && isOpen) {
      // Auto-filter based on ticket category or channel
      if (currentTicket?.category?.includes('Import')) {
        setSearchQuery('import');
      } else if (currentTicket?.category?.includes('GST')) {
        setSearchQuery('gst');
      } else if (currentChannel === 'chat') {
        setActiveTab('chat');
      } else if (currentChannel === 'email') {
        setActiveTab('email');
      }
    }
  }, [autoSuggestMode, currentTicket, currentChannel, isOpen]);

  // Filter scripts based on search query
  const filteredScripts = mockScripts?.[activeTab]?.filter(script => {
    if (!searchQuery) return true;
    
    const query = searchQuery?.toLowerCase();
    return (script?.title?.toLowerCase()?.includes(query) ||
    script?.content?.toLowerCase()?.includes(query) ||
    script?.tags?.some(tag => tag?.toLowerCase()?.includes(query)) || script?.category?.toLowerCase()?.includes(query));
  }) || [];

  const handleCopyScript = async (script) => {
    try {
      await navigator.clipboard?.writeText(script?.content);
      setCopiedId(script?.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleInsertScript = (script) => {
    if (onInsertScript && typeof onInsertScript === 'function') {
      onInsertScript(script?.content);
    }
    // Keep panel open for multiple insertions
  };

  const togglePanel = () => {
    setIsOpen(prev => !prev);
  };

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: togglePanel,
  }));

  return (
    <>
      {/* Floating Action Button */}
      {!hideTrigger && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <Button
            onClick={togglePanel}
            size="lg"
            className={`rounded-full shadow-lg transition-all duration-300 ${
              isOpen
                ? 'bg-primary/90 hover:bg-primary scale-110' :'bg-primary hover:bg-primary/90'
            }`}
            title="Script Assistant (Ctrl+Shift+S)"
          >
            <div className="flex items-center gap-2">
              <Icon name="MessageSquare" size={20} />
              <span className="hidden sm:inline text-sm font-medium">Scripts</span>
            </div>
          </Button>
        </div>
      )}
      {/* Slide-out Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div 
            ref={panelRef}
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl z-50 transform transition-transform duration-300 flex flex-col ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            } lg:max-w-lg`}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Icon name="MessageSquare" size={20} className="text-primary" />
                <h3 className="font-semibold text-foreground">Script Assistant</h3>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Auto-suggest toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoSuggestMode(!autoSuggestMode)}
                  className={`text-xs ${autoSuggestMode ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Auto
                </Button>
                
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search scripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border bg-muted/20">
              {[
                { id: 'call', label: 'Call Scripts', icon: 'Phone' },
                { id: 'chat', label: 'Chat Scripts', icon: 'MessageCircle' },
                { id: 'email', label: 'Email', icon: 'Mail' }
              ]?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span className="hidden sm:inline">{tab?.label}</span>
                </button>
              ))}
            </div>

            {/* Scripts List */}
            <div className="flex-1 overflow-y-auto">
              {filteredScripts?.length > 0 ? (
                <div className="p-4 space-y-3">
                  {filteredScripts?.map((script) => (
                    <div
                      key={script?.id}
                      className="p-4 bg-background border border-border rounded-lg hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">
                            {script?.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                              {script?.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Icon name="Heart" size={12} />
                              {script?.favorites}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {script?.content}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyScript(script)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Icon 
                            name={copiedId === script?.id ? "Check" : "Copy"} 
                            size={12} 
                          />
                          {copiedId === script?.id ? 'Copied!' : 'Copy'}
                        </Button>
                        
                        {onInsertScript && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleInsertScript(script)}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Icon name="Plus" size={12} />
                            Insert
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <Icon name="Search" size={48} className="text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Scripts Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Ctrl + Shift + S to toggle</span>
                <span>{filteredScripts?.length} scripts</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default AgentScriptAssistant;