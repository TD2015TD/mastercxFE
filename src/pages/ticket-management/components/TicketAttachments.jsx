import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { ticketService } from '../../../services/ticketService';

const TicketAttachments = ({ ticketId }) => {
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttachments();
  }, [ticketId]);

  const loadAttachments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ticketService.getAttachments(ticketId);
      if (response.success) {
        setAttachments(response.data);
      }
    } catch (err) {
      console.error('Error loading attachments:', err);
      setError('Failed to load attachments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const response = await ticketService.uploadAttachment(ticketId, selectedFile, description);

      if (response.success) {
        setAttachments([response.data, ...attachments]);
        setSelectedFile(null);
        setDescription('');
        // Reset file input
        document.getElementById('file-input').value = '';
        toast.success('File uploaded successfully');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      const response = await ticketService.deleteAttachment(ticketId, attachmentId);
      if (response.success) {
        setAttachments(attachments.filter(a => a.id !== attachmentId));
        toast.success('Attachment deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting attachment:', err);
      toast.error('Failed to delete attachment');
    }
  };

  const handleDownload = async (attachmentId, fileName) => {
    try {
      await ticketService.downloadAttachment(ticketId, attachmentId, fileName);
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Failed to download file');
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return 'Image';
      case 'document':
        return 'FileText';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Music';
      case 'archive':
        return 'Archive';
      default:
        return 'File';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Upload Section */}
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Upload" size={20} className="mr-2" />
          Upload Attachment
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                file:cursor-pointer cursor-pointer"
            />
            <p className="mt-1 text-xs text-muted-foreground">Max file size: 10MB</p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-muted rounded flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="File" size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          )}

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            iconName="Upload"
            iconPosition="left"
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>

          {isUploading && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Attachments List */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Paperclip" size={20} className="mr-2" />
          Attachments ({attachments.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader" size={32} className="animate-spin text-primary" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Paperclip" size={48} className="mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No attachments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="p-4 border border-border rounded hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded">
                      <Icon
                        name={getFileIcon(attachment.file_type)}
                        size={24}
                        className="text-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {attachment.file_name}
                      </h4>
                      {attachment.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {attachment.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>{attachment.file_size_formatted}</span>
                        <span>•</span>
                        <span>Uploaded by {attachment.uploader?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDate(attachment.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownload(attachment.id, attachment.file_name)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Download"
                    >
                      <Icon name="Download" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketAttachments;
