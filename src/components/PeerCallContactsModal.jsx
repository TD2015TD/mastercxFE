import React, { useState, useEffect, useCallback } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import api from '../services/api';
import presenceService from '../services/presenceService';

const PeerCallContactsModal = ({ isOpen, onClose, onSelect, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [, forceUpdate] = useState(0);

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/signaling/directory', { params: { search: searchQuery } });
      const users = response?.data?.data || [];
      setResults(users.filter((u) => u.id !== currentUserId));
    } catch (err) {
      console.error('User search error:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentUserId]);

  useEffect(() => {
    if (!isOpen) return;
    const debounce = setTimeout(() => search(), 300);
    return () => clearTimeout(debounce);
  }, [search, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setError(null);
    }
  }, [isOpen]);

  // Presence is tracked outside React state (a shared singleton), so
  // subscribe and force a re-render whenever who's online changes — that's
  // what determines whether each row is actually callable.
  useEffect(() => {
    if (!isOpen) return;
    return presenceService.onChange(() => forceUpdate((n) => n + 1));
  }, [isOpen]);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  const sortedResults = [...results].sort((a, b) => {
    const aOnline = presenceService.isOnline(a.id) ? 1 : 0;
    const bOnline = presenceService.isOnline(b.id) ? 1 : 0;
    return bOnline - aOnline;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-[500px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold mb-4">Call a CRM User</h2>
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background text-foreground"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && <div className="text-red-500 text-center py-4">{error}</div>}

          {!loading && !error && results.length === 0 && (
            <div className="text-muted-foreground text-center py-8">
              <Icon name="Search" className="mx-auto mb-2" size={32} />
              <p>No users found</p>
            </div>
          )}

          {!loading && !error && sortedResults.map((user) => {
            const online = presenceService.isOnline(user.id);
            return (
              <div
                key={user.id}
                onClick={() => online && onSelect(user)}
                className={`flex items-center gap-4 p-4 rounded-lg border border-border mb-2 transition-colors ${
                  online ? 'hover:bg-accent cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {getInitials(user.name)}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      online ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.role?.name || ''}</div>
                </div>
                <div className={`text-xs font-medium ${online ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {online ? 'Online' : 'Offline'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-border flex justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default PeerCallContactsModal;
