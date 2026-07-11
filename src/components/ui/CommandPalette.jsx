import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';

const CommandPalette = ({ isOpen, onClose, onCommandSelect, navigationItems = [], user = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const inputRef = useRef(null);
  
  // Define available commands
  const baseCommands = [
    {
      id: 'home',
      label: 'Go to Dashboard',
      description: 'Navigate to your main dashboard',
      action: 'home',
      icon: 'Home',
      shortcut: 'Ctrl+H'
    },
    {
      id: 'new-ticket',
      label: 'Create New Ticket',
      description: 'Start a new customer support ticket',
      action: 'navigate',
      path: '/ticket-management/create',
      icon: 'Plus',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'search-tickets',
      label: 'Search Tickets',
      description: 'Find existing tickets',
      action: 'navigate',
      path: '/ticket-management',
      icon: 'Search'
    },
    {
      id: 'knowledge-base',
      label: 'Browse Knowledge Base',
      description: 'Access help articles and documentation',
      action: 'navigate',
      path: '/knowledge-base-portal',
      icon: 'Book'
    },
  ];

  const allCommands = baseCommands;

  // Filter commands based on search query
  useEffect(() => {
    if (!searchQuery?.trim()) {
      setFilteredCommands(allCommands?.slice(0, 8));
    } else {
      const filtered = allCommands?.filter(command =>
        command?.label?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        command?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
      setFilteredCommands(filtered?.slice(0, 8));
    }
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef?.current) {
      inputRef?.current?.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      switch (event?.key) {
        case 'ArrowDown':
          event?.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands?.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event?.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands?.length - 1
          );
          break;
        case 'Enter':
          event?.preventDefault();
          if (filteredCommands?.[selectedIndex]) {
            handleCommandClick(filteredCommands?.[selectedIndex]);
          }
          break;
        case 'Escape':
          event?.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  const handleCommandClick = (command) => {
    onCommandSelect(command);
  };

  const handleBackdropClick = (event) => {
    if (event?.target === event?.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center pt-[10vh] backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Icon name="Search" size={20} className="text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-lg"
          />
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd>
            <span>to select</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands?.length > 0 ? (
            <div className="py-2">
              {filteredCommands?.map((command, index) => (
                <button
                  key={command?.id}
                  onClick={() => handleCommandClick(command)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-150 ${
                    index === selectedIndex
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 mr-3">
                    <Icon name={command?.icon || 'ArrowRight'} size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{command?.label}</div>
                    {command?.description && (
                      <div className="text-sm text-muted-foreground">{command?.description}</div>
                    )}
                  </div>
                  {command?.shortcut && (
                    <div className="text-xs text-muted-foreground ml-4">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">{command?.shortcut}</kbd>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Icon name="Search" size={24} className="mx-auto mb-2 opacity-50" />
              <div>No commands found</div>
              <div className="text-sm">Try a different search term</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/20">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Use ↑↓ arrows to navigate</span>
            <span>Tip: Type "home", "tickets", "kb" for quick access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;