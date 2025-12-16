import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import Button from '../../../components/ui/Button';
import JsonEditor from './JsonEditor';

const LookupModal = ({ lookup, lookupTypes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: lookup?.type || '',
    code: lookup?.code || '',
    name_en: lookup?.name_en || '',
    name_ms: lookup?.name_ms || '',
    description_en: lookup?.description_en || '',
    description_ms: lookup?.description_ms || '',
    color: lookup?.color || '#3B82F6',
    icon: lookup?.icon || '',
    sort_order: lookup?.sort_order || 0,
    is_active: lookup?.is_active !== undefined ? lookup.is_active : true,
    metadata: lookup?.metadata || null
  });
  const [loading, setLoading] = useState(false);
  const [jsonError, setJsonError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (jsonError) {
      toast.error('Please fix JSON errors before saving');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };

      if (lookup) {
        await api.put(`/admin/lookups/${lookup.id}`, payload);
        toast.success('Lookup updated successfully');
      } else {
        await api.post('/admin/lookups', payload);
        toast.success('Lookup created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lookup');
    } finally {
      setLoading(false);
    }
  };

  const handleMetadataChange = (newMetadata, error) => {
    setFormData({ ...formData, metadata: newMetadata });
    setJsonError(error);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {lookup ? 'Edit Lookup' : 'Create Lookup'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
                disabled={!!lookup}
              >
                <option value="">Select Type</option>
                {lookupTypes.filter(t => t.value !== 'all').map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {lookup && (
                <p className="text-xs text-muted-foreground mt-1">
                  Type cannot be changed after creation
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name (English) *</label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name (Malay) *</label>
              <input
                type="text"
                required
                value={formData.name_ms}
                onChange={(e) => setFormData({ ...formData, name_ms: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description (English)</label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (Malay)</label>
              <textarea
                value={formData.description_ms}
                onChange={(e) => setFormData({ ...formData, description_ms: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
                rows="3"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-16 border border-border rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-border rounded-md"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="icon-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Metadata (JSON)</label>
            <JsonEditor
              data={formData.metadata}
              onChange={handleMetadataChange}
            />
            {jsonError && (
              <p className="text-xs text-red-500 mt-1">{jsonError}</p>
            )}
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || jsonError}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LookupModal;
