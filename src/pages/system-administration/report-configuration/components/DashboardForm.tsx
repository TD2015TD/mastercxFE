import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
// @ts-ignore
import { Checkbox } from '../../../../components/ui/Checkbox';
import supersetDashboardService, {
  type SupersetDashboard,
  type DashboardFormData,
} from '../../../../services/supersetDashboardService';

interface DashboardFormProps {
  dashboard?: SupersetDashboard | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DashboardForm: React.FC<DashboardFormProps> = ({ dashboard, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DashboardFormData>({
    superset_id: '',
    slug: '',
    title_en: '',
    description_en: '',
    title_ms: '',
    description_ms: '',
    category: '',
    icon: '',
    order: 0,
    is_active: true,
    is_public: false,
    tags: '',
    thumbnail_url: '',
  });

  useEffect(() => {
    if (dashboard) {
      setFormData({
        superset_id: dashboard.superset_id,
        slug: dashboard.slug,
        title_en: dashboard.title_en,
        description_en: dashboard.description_en || '',
        title_ms: dashboard.title_ms,
        description_ms: dashboard.description_ms || '',
        category: dashboard.category || '',
        icon: dashboard.icon || '',
        order: dashboard.order,
        is_active: dashboard.is_active,
        is_public: dashboard.is_public,
        tags: dashboard.tags?.join(', ') || '',
        thumbnail_url: dashboard.thumbnail_url || '',
      });
    }
  }, [dashboard]);

  const handleInputChange = (field: keyof DashboardFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.superset_id || !formData.slug || !formData.title_en || !formData.title_ms) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = dashboard
        ? await supersetDashboardService.updateDashboard(dashboard.id, formData)
        : await supersetDashboardService.createDashboard(formData);

      if (response.success) {
        toast.success(dashboard ? 'Dashboard updated successfully' : 'Dashboard created successfully');
        onSuccess();
      } else {
        toast.error(response.error || 'Failed to save dashboard');
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast.error('Failed to save dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <Icon name="BarChart" className="mr-2" size={24} />
            {dashboard ? 'Edit Dashboard' : 'Create New Dashboard'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Superset ID"
                  type="text"
                  value={formData.superset_id}
                  onChange={(e) => handleInputChange('superset_id', e.target.value)}
                  required
                  placeholder="e.g., dashboard-123"
                />
                <Input
                  label="Slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  required
                  placeholder="e.g., sales-analytics"
                />
                <Input
                  label="Title (English)"
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  required
                  placeholder="Dashboard title in English"
                />
                <Input
                  label="Title (Malay)"
                  type="text"
                  value={formData.title_ms}
                  onChange={(e) => handleInputChange('title_ms', e.target.value)}
                  required
                  placeholder="Dashboard title in Malay"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (English)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.description_en}
                  onChange={(e) => handleInputChange('description_en', e.target.value)}
                  rows={3}
                  placeholder="Dashboard description in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (Malay)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.description_ms}
                  onChange={(e) => handleInputChange('description_ms', e.target.value)}
                  rows={3}
                  placeholder="Dashboard description in Malay"
                />
              </div>
            </div>

            {/* Categorization */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Categorization</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Sales, Operations"
                />
                <Input
                  label="Icon"
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="e.g., BarChart, PieChart"
                />
                <Input
                  label="Display Order"
                  type="number"
                  value={formData.order?.toString() || '0'}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Additional Settings</h3>
              <div className="space-y-4">
                <Input
                  label="Tags (comma-separated)"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="e.g., analytics, sales, reporting"
                />
                <Input
                  label="Thumbnail URL"
                  type="text"
                  value={formData.thumbnail_url}
                  onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Status & Visibility</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked: boolean) => handleInputChange('is_active', checked)}
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Active
                  </label>
                  <span className="text-xs text-muted-foreground">
                    (Dashboard is available for use)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked: boolean) => handleInputChange('is_public', checked)}
                  />
                  <label
                    htmlFor="is_public"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Public
                  </label>
                  <span className="text-xs text-muted-foreground">
                    (Accessible to all users without role restrictions)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={loading}
            iconName={loading ? 'Loader' : 'Save'}
            iconPosition="left"
          >
            {loading ? 'Saving...' : dashboard ? 'Update Dashboard' : 'Create Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardForm;
