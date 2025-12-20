import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function ArticleCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lookups', {
        params: { type: 'knowledge_base_category' }
      });
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Knowledge Base Categories</h2>

      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
        <p className="text-sm">
          <strong>Note:</strong> Knowledge Base categories are managed through the Lookup system.
          To add, edit, or remove categories, please use the Lookup Management section with type
          <code className="bg-blue-100 px-1 py-0.5 rounded mx-1">knowledge_base_category</code>.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Available Categories</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No categories found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name (English)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name (Malay)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description (English)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description (Malay)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cat.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {cat.name_en || cat.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {cat.name_ms || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {cat.description_en || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {cat.description_ms || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cat.sort_order || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">How to Manage Categories</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Navigate to System Administration → Lookup Management</li>
          <li>Filter by type: <code className="bg-gray-200 px-1 py-0.5 rounded">knowledge_base_category</code></li>
          <li>Add, edit, or deactivate categories as needed</li>
          <li>Refresh this page to see the changes</li>
        </ol>
      </div>
    </div>
  );
}
