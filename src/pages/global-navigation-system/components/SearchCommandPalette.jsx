import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const SearchCommandPalette = ({ isOpen, onClose, onCommandSelect, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);

  // Mock search suggestions and commands
  const commands = [
    {
      id: 'home',
      type: 'navigation',
      title: 'Go to Dashboard',
      description: 'Navigate to main dashboard',
      icon: 'Home',
      action: 'navigate',
      path: '/agent-dashboard',
      shortcut: 'Ctrl+H'
    },
    {
      id: 'tickets',
      type: 'navigation',
      title: 'Ticket Management',
      description: 'View and manage tickets',
      icon: 'Ticket',
      action: 'navigate',
      path: '/ticket-management'
    },
    {
      id: 'kb',
      type: 'navigation',
      title: 'Knowledge Base',
      description: 'Access knowledge articles',
      icon: 'Book',
      action: 'navigate',
      path: '/knowledge-base-portal'
    },
    {
      id: 'customers',
      type: 'navigation',
      title: 'Customer 360',
      description: 'Customer profiles and interactions',
      icon: 'Users',
      action: 'navigate',
      path: '/customer-360-profile'
    },
    {
      id: 'analytics',
      type: 'navigation',
      title: 'Analytics & Reports',
      description: 'View performance metrics and reports',
      icon: 'BarChart3',
      action: 'navigate',
      path: '/analytics-and-reporting'
    },
    {
      id: 'shortcuts',
      type: 'action',
      title: 'Show Keyboard Shortcuts',
      description: 'Display all available shortcuts',
      icon: 'Keyboard',
      action: 'shortcuts'
    }
  ];

  // Mock search results
  const searchResults = [
    {
      id: 'ticket-1',
      type: 'ticket',
      title: 'TK-2024-1028: GST calculation discrepancy',
      description: 'Urgent ticket from Siti Nurhaliza',
      icon: 'AlertTriangle',
      action: 'navigate',
      path: '/ticket-management/TK-2024-1028'
    },
    {
      id: 'customer-1',
      type: 'customer',
      title: 'Muhammad Ali - Customs Declaration',
      description: 'Customer with active ticket TK-2024-1029',
      icon: 'User',
      action: 'navigate',
      path: '/customer-360-profile/muhammad-ali'
    },
    {
      id: 'article-1',
      type: 'article',
      title: 'GST Calculation Guidelines',
      description: 'Step-by-step guide for GST calculations',
      icon: 'FileText',
      action: 'navigate',
      path: '/knowledge-base-portal/gst-guidelines'
    }
  ];

  const filteredItems = searchQuery 
    ? [...commands?.filter(cmd => 
        cmd?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        cmd?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      ), ...searchResults?.filter(result =>
        result?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        result?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      )]
    : commands;

  useEffect(() => {
    if (isOpen && searchInputRef?.current) {
      searchInputRef?.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event?.key) {
        case 'ArrowDown':
          event?.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredItems?.length);
          break;
        case 'ArrowUp':
          event?.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredItems?.length) % filteredItems?.length);
          break;
        case 'Enter':
          event?.preventDefault();
          if (filteredItems?.[selectedIndex]) {
            if (searchQuery && !commands?.includes(filteredItems?.[selectedIndex])) {
              onSearch(searchQuery);
            } else {
              onCommandSelect(filteredItems?.[selectedIndex]);
            }
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
  }, [isOpen, selectedIndex, filteredItems, onCommandSelect, onClose, onSearch, searchQuery, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]">
      <div className="bg-popover border border-border rounded-lg shadow-modal w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Icon name="Search" size={20} className="text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            placeholder="Search tickets, customers, articles... or type a command"
            className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
          />
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted border border-border rounded">↑↓</kbd>
            <span>navigate</span>
            <kbd className="px-2 py-1 bg-muted border border-border rounded">↵</kbd>
            <span>select</span>
            <kbd className="px-2 py-1 bg-muted border border-border rounded">esc</kbd>
            <span>close</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {filteredItems?.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
              <p>No results found</p>
              <p className="text-sm mt-1">Try searching for tickets, customers, or articles</p>
            </div>
          ) : (
            <div className="py-2">
              {!searchQuery && (
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </div>
              )}
              
              {filteredItems?.map((item, index) => (
                <button
                  key={item?.id}
                  onClick={() => {
                    if (searchQuery && !commands?.includes(item)) {
                      onSearch(searchQuery);
                    } else {
                      onCommandSelect(item);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-muted transition-colors duration-200 ${
                    index === selectedIndex ? 'bg-muted' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item?.type === 'navigation' ? 'bg-blue-100 text-blue-600' :
                    item?.type === 'ticket' ? 'bg-red-100 text-red-600' :
                    item?.type === 'customer' ? 'bg-green-100 text-green-600' :
                    item?.type === 'article'? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon name={item?.icon} size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {item?.title}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {item?.description}
                    </div>
                  </div>
                  
                  {item?.shortcut && (
                    <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono text-muted-foreground">
                      {item?.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>🔍 Global search across all modules</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Press</span>
            <kbd className="px-2 py-1 bg-muted border border-border rounded">Ctrl /</kbd>
            <span>anytime to search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchCommandPalette;