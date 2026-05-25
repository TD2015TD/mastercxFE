import { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { toast } from 'react-toastify';

const ArticleForm = ({ article, categories, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    category_code: '',
    status: 'draft'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        category_code: article.category_code || article.category || '',
        status: article.status || 'draft'
      });
    }
  }, [article]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        const errorMsg = 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.';
        setFileError(errorMsg);
        toast.error(errorMsg);
        e.target.value = '';
        return;
      }

      if (file.size > 30 * 1024 * 1024) {
        const errorMsg = 'File size exceeds 30MB limit.';
        setFileError(errorMsg);
        toast.error(errorMsg);
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setFileError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if file is required (for new articles)
    if (!article && !selectedFile) {
      const errorMsg = 'Please select a document file to upload';
      setFileError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Pass both formData and selectedFile to parent
    onSave({ ...formData, file: selectedFile });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed inset-0 left-60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-foreground">
            {article ? 'Edit Article' : 'Create New Article'}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter article title"
            />
          </div>

          {/* Category and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category_code}
                onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.code} value={cat.code}>
                    {cat.name || cat.value || cat.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Document File {!article && '*'}
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              required={!article}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, DOC, DOCX, TXT (Max 30MB)
            </p>
            {article && (
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to keep the current document
              </p>
            )}
            {selectedFile && (
              <div className="mt-2 flex items-center gap-2 text-sm text-foreground bg-primary/10 px-3 py-2 rounded">
                <Icon name="FileText" size={16} />
                <span>{selectedFile.name}</span>
                <span className="text-muted-foreground">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
            {fileError && (
              <p className="text-xs text-red-500 mt-1">{fileError}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Upload a PDF, Word document, or text file</li>
                  <li>The system will automatically extract and index the text content</li>
                  <li>You can only edit the title and category after upload</li>
                  <li>To change the content, upload a new document</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : article ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default ArticleForm;
