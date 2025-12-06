import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';

const CustomerDocuments = ({ customerId }) => {
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadAttachments();
    }
  }, [customerId]);

  const loadAttachments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/customers/${customerId}/attachments`);
      
      if (response.data.success) {
        setAttachments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post(`/customers/${customerId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setShowUploadModal(false);
        setSelectedFile(null);
        setDescription('');
        loadAttachments();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await api.delete(`/customers/${customerId}/attachments/${attachmentId}`);
      
      if (response.data.success) {
        loadAttachments();
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleDownload = (attachment) => {
    window.open(attachment.download_url, '_blank');
  };

  const getFileIcon = (fileType) => {
    const icons = {
      image: 'Image',
      document: 'FileText',
      video: 'Video',
      audio: 'Music',
      archive: 'Archive',
      other: 'File'
    };
    return icons[fileType] || 'File';
  };

  const getFileTypeColor = (fileType) => {
    const colors = {
      image: 'text-blue-600',
      document: 'text-green-600',
      video: 'text-purple-600',
      audio: 'text-orange-600',
      archive: 'text-yellow-600',
      other: 'text-gray-600'
    };
    return colors[fileType] || 'text-gray-600';
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

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Icon name="FileText" size={20} />
              Documents & Attachments
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {attachments.length} document{attachments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            iconName="Upload"
            iconPosition="left"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
            <Button
              variant="outline"
              iconName="Upload"
              iconPosition="left"
              onClick={() => setShowUploadModal(true)}
            >
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* File Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${getFileTypeColor(attachment.file_type)}`}>
                    <Icon name={getFileIcon(attachment.file_type)} size={24} />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {attachment.file_name}
                    </h3>
                    {attachment.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {attachment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="HardDrive" size={12} />
                        {attachment.file_size_formatted}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={12} />
                        {attachment.uploader?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={12} />
                        {formatDate(attachment.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(attachment)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                      title="Download"
                    >
                      <Icon name="Download" size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Icon name="Upload" size={20} />
                Upload Document
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDescription('');
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isUploading}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select File *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  disabled={isUploading}
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: 10MB
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for this document..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm resize-none"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDescription('');
                }}
                disabled={isUploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                iconName="Upload"
                iconPosition="left"
                className="flex-1"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDocuments;
