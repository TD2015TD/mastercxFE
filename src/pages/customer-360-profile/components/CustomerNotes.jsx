import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';

const CustomerNotes = ({ customerId }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadNotes();
    }
  }, [customerId]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/customers/${customerId}/notes`);
      
      if (response.data.success) {
        setNotes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteContent('');
    setIsPinned(false);
    setShowAddModal(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setIsPinned(note.is_pinned);
    setShowAddModal(true);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      alert('Please enter note content');
      return;
    }

    try {
      setIsSaving(true);
      
      if (editingNote) {
        // Update existing note
        const response = await api.put(`/customers/${customerId}/notes/${editingNote.id}`, {
          content: noteContent,
          is_pinned: isPinned,
        });

        if (response.data.success) {
          setShowAddModal(false);
          loadNotes();
        }
      } else {
        // Create new note
        const response = await api.post(`/customers/${customerId}/notes`, {
          content: noteContent,
          is_pinned: isPinned,
        });

        if (response.data.success) {
          setShowAddModal(false);
          loadNotes();
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert(error.response?.data?.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const response = await api.put(`/customers/${customerId}/notes/${note.id}`, {
        is_pinned: !note.is_pinned,
      });

      if (response.data.success) {
        loadNotes();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert(error.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await api.delete(`/customers/${customerId}/notes/${noteId}`);
      
      if (response.data.success) {
        loadNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(error.response?.data?.message || 'Failed to delete note');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Icon name="StickyNote" size={20} />
              Customer Notes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
              {notes.filter(n => n.is_pinned).length > 0 && ` · ${notes.filter(n => n.is_pinned).length} pinned`}
            </p>
          </div>
          <Button
            iconName="Plus"
            iconPosition="left"
            onClick={handleAddNote}
          >
            Add Note
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="StickyNote" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No notes added yet</p>
            <Button
              variant="outline"
              iconName="Plus"
              iconPosition="left"
              onClick={handleAddNote}
            >
              Add First Note
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`border rounded-lg p-4 transition-colors ${
                  note.is_pinned 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                {/* Note Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {note.is_pinned && (
                      <Icon name="Pin" size={16} className="text-primary" />
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={12} />
                        {note.creator?.name || 'Unknown'}
                      </span>
                      <span>•</span>
                      <span title={formatDate(note.created_at)}>
                        {formatRelativeTime(note.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note)}
                      className={`p-1.5 rounded transition-colors ${
                        note.is_pinned
                          ? 'text-primary hover:bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Icon name="Pin" size={16} />
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                      title="Edit note"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete note"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {note.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Icon name="StickyNote" size={20} />
                {editingNote ? 'Edit Note' : 'Add Note'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNote(null);
                  setNoteContent('');
                  setIsPinned(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSaving}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Note Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Note Content *
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter your note here..."
                  rows={8}
                  maxLength={5000}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm resize-none"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {noteContent.length} / 5000 characters
                </p>
              </div>

              {/* Pin Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNote"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  disabled={isSaving}
                />
                <label htmlFor="pinNote" className="text-sm text-foreground flex items-center gap-1">
                  <Icon name="Pin" size={14} />
                  Pin this note to the top
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNote(null);
                  setNoteContent('');
                  setIsPinned(false);
                }}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={!noteContent.trim() || isSaving}
                iconName="Save"
                iconPosition="left"
                className="flex-1"
              >
                {isSaving ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerNotes;
