import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = '/api/knowledge-base/categories';

export default function ArticleCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setCategories(res.data);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      await axios.post(API_BASE, { name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Article Category Management</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="border px-2 py-1 rounded"
        />
        <button onClick={handleAddCategory} className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat.id} className="flex items-center justify-between border-b pb-1">
              <span>{cat.name}</span>
              <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
