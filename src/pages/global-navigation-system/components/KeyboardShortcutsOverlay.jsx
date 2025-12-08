import React from 'react';
import Icon from '../../../components/AppIcon';

const KeyboardShortcutsOverlay = ({ isOpen, onClose }) => {
  const shortcutCategories = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', 'H'], description: 'Go to Dashboard', action: 'Navigate to main dashboard' },
        { keys: ['Alt', '1'], description: 'Dashboard', action: 'Quick access to dashboard' },
        { keys: ['Alt', '2'], description: 'Tickets', action: 'Open ticket management' },
        { keys: ['Alt', '3'], description: 'Knowledge Base', action: 'Access knowledge articles' },
        { keys: ['Alt', '4'], description: 'Analytics', action: 'View reports and analytics' },
        { keys: ['Alt', '5'], description: 'Customers', action: 'Customer 360 profiles' },
        { keys: ['Alt', '6'], description: 'Administration', action: 'System settings' }
      ]
    },
    {
      title: 'Search & Actions',
      shortcuts: [
        { keys: ['Ctrl', '/'], description: 'Open Command Palette', action: 'Global search and commands' },
        { keys: ['Ctrl', 'K'], description: 'Quick Search', action: 'Alternative search shortcut' },
        { keys: ['Ctrl', 'N'], description: 'New Ticket', action: 'Create a new ticket' },
        { keys: ['Ctrl', 'Shift', 'N'], description: 'New Customer', action: 'Add new customer' }
      ]
    },
    {
      title: 'Interface',
      shortcuts: [
        { keys: ['F1'], description: 'Show Shortcuts', action: 'Display this help overlay' },
        { keys: ['Esc'], description: 'Close Overlays', action: 'Close modals and overlays' },
        { keys: ['Ctrl', 'B'], description: 'Toggle Sidebar', action: 'Show/hide navigation sidebar' },
        { keys: ['Ctrl', ','], description: 'Preferences', action: 'Open user settings' }
      ]
    },
    {
      title: 'Ticket Management',
      shortcuts: [
        { keys: ['R'], description: 'Reply (in ticket)', action: 'Quick reply to customer' },
        { keys: ['E'], description: 'Edit (in ticket)', action: 'Edit ticket details' },
        { keys: ['S'], description: 'Status Update', action: 'Change ticket status' },
        { keys: ['P'], description: 'Priority Change', action: 'Update ticket priority' },
        { keys: ['A'], description: 'Assign Ticket', action: 'Assign to agent' }
      ]
    },
    {
      title: 'General',
      shortcuts: [
        { keys: ['Ctrl', 'S'], description: 'Save', action: 'Save current form or changes' },
        { keys: ['Ctrl', 'Z'], description: 'Undo', action: 'Undo last action' },
        { keys: ['Ctrl', 'Y'], description: 'Redo', action: 'Redo last undone action' },
        { keys: ['Ctrl', 'F'], description: 'Find in Page', action: 'Search within current page' }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-popover border border-border rounded-lg shadow-modal w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Keyboard" size={20} color="white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
              <p className="text-sm text-muted-foreground">Boost your productivity with these shortcuts</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {shortcutCategories?.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-border pb-2">
                  {category?.title}
                </h3>
                
                <div className="space-y-2">
                  {category?.shortcuts?.map((shortcut, shortcutIndex) => (
                    <div key={shortcutIndex} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors duration-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">
                          {shortcut?.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {shortcut?.action}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {shortcut?.keys?.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground">
                              {key}
                            </kbd>
                            {keyIndex < shortcut?.keys?.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-muted/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={16} />
                <span>Most shortcuts work globally across all modules</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">
                F1
              </kbd>
              <span>anytime to see shortcuts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsOverlay;