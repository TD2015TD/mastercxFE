import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE = '/api/v1/knowledge-base-articles';

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', category_code: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setArticles(res.data.data?.data || res.data.data || []);
    } catch (err) {
      const errorMsg = 'Failed to fetch articles';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/v1/lookups', {
        params: { type: 'knowledge_base_category' }
      });
      setCategories(res.data.data || []);
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

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.';
        setError(errorMsg);
        toast.error(errorMsg);
        e.target.value = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        const errorMsg = 'File size exceeds 10MB limit.';
        setError(errorMsg);
        toast.error(errorMsg);
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedFile && !editingId) {
      const errorMsg = 'Please select a file to upload';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category_code', form.category_code);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      };

      if (editingId) {
        await axios.post(`${API_BASE}/${editingId}`, formData, config);
        toast.success('Article updated successfully');
      } else {
        await axios.post(API_BASE, formData, config);
        toast.success('Article created successfully');
      }

      setForm({ title: '', category_code: '' });
      setSelectedFile(null);
      setEditingId(null);
      setUploadProgress(0);
      setError(null);
      fetchArticles();
      document.getElementById('fileInput').value = '';
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save article';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = article => {
    setForm({ title: article.title, category_code: article.category_code });
    setEditingId(article.id);
  };

  const handleDelete = async id => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      toast.success('Article deleted successfully');
      setError(null);
      fetchArticles();
    } catch (err) {
      const errorMsg = 'Failed to delete article';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: '', category_code: '' });
    setSelectedFile(null);
    setUploadProgress(0);
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Knowledge Base Article Management</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Article' : 'Upload New Article'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Enter article title" className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select name="category_code" value={form.category_code} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.code} value={cat.code}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Document File {!editingId && '*'} <span className="text-xs text-gray-500">(PDF, DOC, DOCX, TXT - Max 10MB)</span></label>
            <input type="file" id="fileInput" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className="w-full px-3 py-2 border rounded-md" required={!editingId} />
            {selectedFile && <div className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</div>}
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Processing...' : editingId ? 'Update Article' : 'Upload Article'}</button>
            {editingId && <button type="button" onClick={handleCancel} className="px-6 py-2 border rounded-md hover:bg-gray-50">Cancel</button>}
          </div>
        </form>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Articles</h3>
        {loading && articles.length === 0 ? <div className="text-center py-8 text-gray-500">Loading...</div> : articles.length === 0 ? <div className="text-center py-8 text-gray-500">No articles found</div> : <div className="space-y-4">{articles.map(article => <div key={article.id} className="border rounded-lg p-4"><div className="flex justify-between items-start mb-2"><div className="flex-1"><h4 className="text-lg font-semibold">{article.title}</h4><div className="flex items-center gap-4 mt-1 text-sm text-gray-600"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{article.category?.name || article.category_code}</span>{article.file_name && <span>{article.file_name}</span>}<span>By: {article.author}</span></div></div><div className="flex gap-2"><button onClick={() => handleEdit(article)} className="text-blue-600 px-3 py-1 text-sm">Edit</button><button onClick={() => handleDelete(article.id)} className="text-red-600 px-3 py-1 text-sm">Delete</button></div></div><div className="text-gray-700 text-sm line-clamp-3">{article.content?.substring(0, 200)}...</div></div>)}</div>}
      </div>
    </div>
  );
}
