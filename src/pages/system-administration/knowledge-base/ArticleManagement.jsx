import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = '/api/knowledge-base/articles';
const CATEGORY_API = '/api/knowledge-base/categories';

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category_id: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setArticles(res.data);
    } catch (err) {
      setError('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
      setCategories(res.data);
    } catch (err) {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, form);
      } else {
        await axios.post(API_BASE, form);
      }
      setForm({ title: '', content: '', category_id: '' });
      setEditingId(null);
      fetchArticles();
    } catch (err) {
      setError('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = article => {
    setForm({
      title: article.title,
      content: article.content,
      category_id: article.category_id,
    });
    setEditingId(article.id);
  };

  const handleDelete = async id => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchArticles();
    } catch (err) {
      setError('Failed to delete article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Article Management</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="border px-2 py-1 rounded w-full"
          required
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Content"
          className="border px-2 py-1 rounded w-full"
          required
        />
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
          {editingId ? 'Update' : 'Add'} Article
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', content: '', category_id: '' }); }} className="ml-2 px-4 py-1 rounded border">Cancel</button>
        )}
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {articles.map(article => (
            <li key={article.id} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{article.title}</div>
                  <div className="text-sm text-gray-600">{categories.find(c => c.id === article.category_id)?.name || 'Uncategorized'}</div>
                </div>
                <div>
                  <button onClick={() => handleEdit(article)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(article.id)} className="text-red-500">Delete</button>
                </div>
              </div>
              <div className="mt-1 text-gray-800 whitespace-pre-line">{article.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
