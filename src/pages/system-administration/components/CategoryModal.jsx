import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { getDepartments } from '../../../services/lookupService';
import Button from '../../../components/ui/Button';

const CategoryModal = ({ category, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    name_ms: category?.name_ms || '',
    department: category?.department || '',
    level: category?.level || 1,
    parent_id: category?.parent_id || null,
    code: category?.code || '',
    description: category?.description || '',
    description_ms: category?.description_ms || '',
    is_active: category?.is_active !== undefined ? category.is_active : true,
    sort_order: category?.sort_order || 0
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const deptLookups = await getDepartments();
      const distinctDepts = deptLookups.map(d => ({
        value: d.code,
        label: d.name
      }));
      setDepartments(distinctDepts);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Automatically set level based on parent
      const submitData = { ...formData };
      if (submitData.parent_id) {
        const parent = categories.find(cat => cat.id.toString() === submitData.parent_id.toString());
        submitData.level = parent ? parent.level + 1 : 2;
      } else {
        submitData.level = 1;
      }
      
      if (category) {
        await api.put(`/categories/${category.id}`, submitData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', submitData);
        toast.success('Category created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Filter to show only Level 1 categories (parent_id is null)
  const availableParents = categories.filter(cat => 
    cat.parent_id === null &&
    cat.department === formData.department &&
    cat.id !== category?.id
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {category ? 'Edit Category' : 'Create Category'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name (English) *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name (Malay)</label>
              <input
                type="text"
                value={formData.name_ms}
                onChange={(e) => setFormData({ ...formData, name_ms: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value, parent_id: null })}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
          </div>

          {formData.department && (
            <div>
              <label className="block text-sm font-medium mb-1">Parent Category</label>
              <select
                size={10}
                value={formData.parent_id ? String(formData.parent_id) : ''}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-border rounded-md overflow-y-auto"
                style={{ height: 'auto' }}
              >
                <option value="">None (This will be a Level 1 category)</option>
                {availableParents.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.parent_id ? 'This will be a Level 2 sub-category' : 'This will be a Level 1 parent category'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description (English)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
            <div className="flex items-center pt-6">
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
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
