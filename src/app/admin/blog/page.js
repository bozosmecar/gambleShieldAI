'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getArticles, createArticle, updateArticle, deleteArticle } from '@/lib/blogArticles';

const emptyForm = {
  title: '',
  excerpt: '',
  category: '',
  author: '',
  date: '',
  readTime: '',
  image: '',
  featured: false,
  content: '',
};

export default function AdminBlogPage() {
  const [articles, setArticlesState] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingFeaturedId, setSettingFeaturedId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getArticles();
      setArticlesState(data);
      setLoaded(true);
    }
    load();
  }, []);

  const handleEdit = (article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      author: article.author,
      date: article.date,
      readTime: article.readTime,
      image: article.image || '',
      featured: !!article.featured,
      content: article.content || '',
    });
    setError(null);
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData(emptyForm);
    setError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId === 'new') {
        const created = await createArticle(formData);
        if (created) {
          setArticlesState((prev) => [created, ...prev]);
          handleCancel();
        } else {
          setError('Failed to create article. Check console for details.');
        }
      } else {
        const updated = await updateArticle(editingId, formData);
        if (updated) {
          setArticlesState((prev) =>
            prev.map((a) => (a.id === editingId ? updated : a))
          );
          handleCancel();
        } else {
          setError('Failed to update article. Check console for details.');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    const ok = await deleteArticle(id);
    if (ok) {
      setArticlesState((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) handleCancel();
    } else {
      setError('Failed to delete article. Check console for details.');
    }
  };

  const handleSetFeatured = async (article) => {
    if (article.featured) return;
    setSettingFeaturedId(article.id);
    setError(null);
    try {
      const others = articles.filter((a) => a.id !== article.id);
      await Promise.all([
        ...others.map((a) => updateArticle(a.id, { ...a, featured: false })),
        updateArticle(article.id, { ...article, featured: true }),
      ]);
      setArticlesState((prev) =>
        prev.map((a) => ({
          ...a,
          featured: a.id === article.id,
        }))
      );
      if (editingId === article.id) setFormData((f) => ({ ...f, featured: true }));
    } catch (err) {
      setError('Failed to set featured article.');
    } finally {
      setSettingFeaturedId(null);
    }
  };

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: '90px' }}>
        <div className="max-w-5xl mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '90px' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Blog Articles</h1>
          <div className="flex gap-3">
            <Link
              href="/blog"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              View Blog
            </Link>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add new article
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Article list */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 w-28">Featured</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No articles yet. Click &quot;Add new article&quot; to create one.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-left font-medium text-gray-900 hover:text-green-600"
                      >
                        {article.title}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{article.category}</td>
                    <td className="py-3 px-4 text-gray-600">{article.author}</td>
                    <td className="py-3 px-4 text-gray-600">{article.date}</td>
                    <td className="py-3 px-4 text-center">
                      {article.featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-sm font-medium">
                          ★ Featured
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetFeatured(article)}
                          disabled={settingFeaturedId !== null}
                          className="px-2 py-1 text-sm font-medium text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingFeaturedId === article.id ? 'Setting…' : 'Set as featured'}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(article)}
                        className="mr-2 text-green-600 hover:text-green-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit / Add form */}
        {editingId !== null && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId === 'new' ? 'New article' : 'Edit article'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Article title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => updateForm('excerpt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="Short summary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. Education"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => updateForm('author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Author name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => updateForm('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. February 10, 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Read time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => updateForm('readTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. 5 min read"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => updateForm('image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="/blog/placeholder1.jpg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => updateForm('featured', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured article
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => updateForm('content', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={12}
                  placeholder="<h2>Heading</h2><p>Paragraph...</p>"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
