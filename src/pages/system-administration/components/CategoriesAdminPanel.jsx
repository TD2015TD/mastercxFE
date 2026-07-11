import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import CategoryModal from './CategoryModal';

const CategoriesAdminPanel = () => {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedParent, setSelectedParent] = useState('all');
  const [departments, setDepartments] = useState([{ value: 'all', label: 'All Departments' }]);
  const [parentCategories, setParentCategories] = useState([{ value: 'all', label: 'All Categories' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    loadAllCategories();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [selectedDepartment, selectedParent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, selectedParent]);

  const loadAllCategories = async () => {
    try {
      const response = await api.get('/categories', { params: { per_page: 10000 } });
      const fetched = response.data.data || [];
      setAllCategories(fetched);

      const deptMap = new Map();
      fetched.forEach(cat => {
        if (cat.department) {
          const lower = cat.department.toLowerCase();
          if (!deptMap.has(lower)) deptMap.set(lower, cat.department);
        }
      });
      setDepartments([
        { value: 'all', label: 'All Departments' },
        ...Array.from(deptMap.values()).map(d => ({ value: d, label: d }))
      ]);

      const parents = fetched.filter(c => c.parent_id === null).map(c => ({ value: c.id, label: c.name }));
      setParentCategories([{ value: 'all', label: 'All Categories' }, ...parents]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories', { params: { per_page: 1000 } });
      let list = response.data.data || [];

      if (selectedDepartment !== 'all') {
        const lower = selectedDepartment.toLowerCase();
        list = list.filter(c => c.department && c.department.toLowerCase() === lower);
      }
      if (selectedParent !== 'all') {
        list = list.filter(c => c.parent_id && c.parent_id.toString() === selectedParent.toString());
      }

      setCategories(list);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
      loadAllCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const getStatusBadge = (status) => {
    const label = typeof status === 'boolean' ? (status ? 'Active' : 'Inactive') : status;
    const cls = (status === true || status === 'Active') ? 'bg-success/10 text-success' : 'bg-error/10 text-error';
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
  };

  const getLevelBadge = (level) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level - 1] || 'bg-gray-100 text-gray-700'}`}>
        Level {level}
      </span>
    );
  };

  const paged = categories.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const totalPages = Math.ceil(categories.length / PER_PAGE);

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Categories &amp; Sub-categories</h3>
          <p className="text-sm text-muted-foreground">Manage ticket categories and sub-categories hierarchy</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            {parentCategories.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <Button variant="default" iconName="Plus" iconPosition="left" onClick={() => setShowCategoryModal(true)}>
            Add Category
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name (EN)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name (MS)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Level</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Parent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((cat) => (
                <tr key={cat.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm text-foreground font-mono">{cat.code}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{cat.name}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{cat.name_ms || '-'}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{cat.department}</td>
                  <td className="py-3 px-4">{getLevelBadge(cat.level)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{cat.parent?.name || '-'}</td>
                  <td className="py-3 px-4">{getStatusBadge(cat.is_active)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" iconName="Edit" onClick={() => { setEditingItem(cat); setShowCategoryModal(true); }}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" iconName="Trash2" onClick={() => handleDelete(cat.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && categories.length > PER_PAGE && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * PER_PAGE + 1, categories.length)}–{Math.min(currentPage * PER_PAGE, categories.length)} of {categories.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" iconName="ChevronLeft" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`e-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded text-sm ${p === currentPage ? 'bg-primary text-primary-foreground font-medium' : 'border border-border hover:bg-muted'}`}
                  >
                    {p}
                  </button>
                )
              )}
            <Button variant="outline" size="sm" iconName="ChevronRight" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
          </div>
        </div>
      )}

      {showCategoryModal && (
        <CategoryModal
          category={editingItem}
          categories={allCategories}
          onClose={() => { setShowCategoryModal(false); setEditingItem(null); }}
          onSave={() => { setShowCategoryModal(false); setEditingItem(null); loadCategories(); loadAllCategories(); }}
        />
      )}
    </div>
  );
};

export default CategoriesAdminPanel;
