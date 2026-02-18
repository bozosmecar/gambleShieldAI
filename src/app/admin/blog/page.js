"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "@/lib/blogArticles";

const CARD_BACKGROUND_OPTIONS = [
  { value: "/3_Affiliate/zlatna/5.png", label: "1 Gold (zlatna)" },
  { value: "/3_Affiliate/crvena/5.png", label: "2 Red (crvena)" },
  { value: "/3_Affiliate/plava/5.png", label: "3 Blue (plava)" },
  { value: "/3_Affiliate/zelena/5.png", label: "4 Green (zelena)" },
  { value: "/3_Affiliate/ljubicasta/5.png", label: "5 Purple (ljubicasta)" },
];

const emptyForm = {
  title: "",
  excerpt: "",
  category: "",
  author: "",
  date: "",
  readTime: "",
  image: "",
  featured: false,
  content: "",
  cardBackground: "/3_Affiliate/zlatna/5.png",
};

export default function AdminBlogPage() {
  const [articles, setArticlesState] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingFeaturedId, setSettingFeaturedId] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  const contentTextareaRef = useRef(null);
  const contentCursorRef = useRef({ start: 0, end: 0 });

  const ITEMS_PER_PAGE = 5;

  const filteredArticles = articles.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (a.title || "").toLowerCase().includes(q) ||
      (a.excerpt || "").toLowerCase().includes(q) ||
      (a.category || "").toLowerCase().includes(q) ||
      (a.author || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / ITEMS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    async function load() {
      const data = await getArticles();
      setArticlesState(data);
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleEdit = (article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      author: article.author,
      date: article.date,
      readTime: article.readTime,
      image: article.image || "",
      featured: !!article.featured,
      content: article.content || "",
      cardBackground: article.cardBackground || "/3_Affiliate/zlatna/5.png",
    });
    setError(null);
  };

  const handleAddNew = () => {
    setEditingId("new");
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
      if (editingId === "new") {
        const created = await createArticle(formData);
        if (created) {
          setArticlesState((prev) => [created, ...prev]);
          handleCancel();
        } else {
          setError("Failed to create article. Check console for details.");
        }
      } else {
        const updated = await updateArticle(editingId, formData);
        if (updated) {
          setArticlesState((prev) =>
            prev.map((a) => (a.id === editingId ? updated : a)),
          );
          handleCancel();
        } else {
          setError("Failed to update article. Check console for details.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    const ok = await deleteArticle(id);
    if (ok) {
      setArticlesState((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) handleCancel();
    } else {
      setError("Failed to delete article. Check console for details.");
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
        })),
      );
      if (editingId === article.id)
        setFormData((f) => ({ ...f, featured: true }));
    } catch (err) {
      setError("Failed to set featured article.");
    } finally {
      setSettingFeaturedId(null);
    }
  };

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-blog-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateForm("image", data.url);
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleContentImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { start, end } = contentCursorRef.current;
    setUploadingContentImage(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-blog-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const imgTag = `<img src="${data.url}" alt="" class="max-w-full h-auto rounded-lg" referrerpolicy="no-referrer" />`;
      const content = formData.content || "";
      const newContent = content.slice(0, start) + imgTag + content.slice(end);
      updateForm("content", newContent);
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploadingContentImage(false);
      e.target.value = "";
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: "90px" }}>
        <div className="max-w-5xl mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: "90px" }}>
      <div className={`mx-auto px-4 py-8 w-full `}>
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Blog Articles
          </h1>
          <div className="flex gap-3 ">
            <Link
              href="/admin/polls"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Polls
            </Link>
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

        {/* Search */}
        <div className="mb-4 flex justify-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, excerpt, category, or author..."
            className="w-[60vw] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Article list */}
        <div className="bg-white rounded-xl shadow overflow-hidden w-[60vw] mx-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Title
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Author
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 w-28">
                  Featured
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {search.trim()
                      ? "No articles match your search."
                      : "No articles yet. Click &quot;Add new article&quot; to create one."}
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => (
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
                    <td className="py-3 px-4 text-gray-600">
                      {article.category}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {article.author}
                    </td>
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
                          {settingFeaturedId === article.id
                            ? "Setting…"
                            : "Set as featured"}
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

        {/* Pagination */}
        {filteredArticles.length > ITEMS_PER_PAGE && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredArticles.length)}{" "}
              of {filteredArticles.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-1 rounded-lg ${
                    n === currentPage
                      ? "bg-green-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Edit / Add form */}
        {editingId !== null && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId === "new" ? "New article" : "Edit article"}
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left: Edit form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Article title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => updateForm("excerpt", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Short summary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. Education"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => updateForm("author", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Author name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => updateForm("date", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. February 10, 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Read time
                    </label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => updateForm("readTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. 5 min read"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured image
                  </label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => updateForm("image", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Image URL or upload below"
                      />
                      <div className="flex items-center gap-2">
                        <label className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          {uploadingImage
                            ? "Uploading..."
                            : "Upload to Supabase"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs text-gray-500">
                          JPEG, PNG, GIF, WebP (max 5MB)
                        </span>
                      </div>
                    </div>
                    {formData.image && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => updateForm("featured", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium text-gray-700"
                  >
                    Featured article
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card background (scroll background)
                  </label>
                  <select
                    value={formData.cardBackground || "/3_Affiliate/zlatna/5.png"}
                    onChange={(e) => updateForm("cardBackground", e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {CARD_BACKGROUND_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content (HTML)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <label className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      {uploadingContentImage ? "Uploading..." : "Insert image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleContentImageUpload}
                        disabled={uploadingContentImage}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500 self-center">
                      Uploads to Supabase, inserts at cursor
                    </span>
                  </div>
                  <textarea
                    ref={contentTextareaRef}
                    value={formData.content}
                    onChange={(e) => updateForm("content", e.target.value)}
                    onBlur={(e) => {
                      contentCursorRef.current = {
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                      };
                    }}
                    onClick={(e) => {
                      contentCursorRef.current = {
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                      };
                    }}
                    onKeyUp={(e) => {
                      contentCursorRef.current = {
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                      };
                    }}
                    onSelect={(e) => {
                      contentCursorRef.current = {
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                      };
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    rows={12}
                    placeholder="<h2>Heading</h2><p>Paragraph...</p>"
                  />
                </div>

                <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-amber-900 mb-3">
                    HTML quick reference
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-900">
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;p&gt;...&lt;/p&gt;
                      </code>{" "}
                      — Paragraph (wraps text)
                    </li>
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;h1&gt;
                      </code>
                      –
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;h6&gt;
                      </code>{" "}
                      — Headings (h1 largest, h6 smallest)
                    </li>
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;h2&gt;...&lt;/h2&gt;
                      </code>{" "}
                      — Section heading
                    </li>
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;h3&gt;...&lt;/h3&gt;
                      </code>{" "}
                      — Subheading
                    </li>
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;br&gt;
                      </code>{" "}
                      or{" "}
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;br /&gt;
                      </code>{" "}
                      — Line break
                    </li>
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;strong&gt;...&lt;/strong&gt;
                      </code>{" "}
                      — <strong>Bold text</strong>
                    </li>
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;
                      </code>{" "}
                      — Bullet list
                    </li>
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;ol&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ol&gt;
                      </code>{" "}
                      — Numbered list
                    </li>
                    <li>
                      <code className="bg-amber-100 px-1 rounded">
                        &lt;a href=&quot;url&quot;&gt;link&lt;/a&gt;
                      </code>{" "}
                      — Link
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="xl:sticky xl:top-24">
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                      Live preview
                    </span>
                  </div>
                  <div className="p-6 min-h-[200px]">
                    <article>
                      <header className="mb-6">
                        {/* Category Badge */}
                        {formData.category && (
                          <div className="mb-4">
                            <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold">
                              {formData.category}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        {formData.title && (
                          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {formData.title}
                          </h1>
                        )}

                        {/* Author Info */}
                        {(formData.author ||
                          formData.date ||
                          formData.readTime) && (
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              {formData.author && (
                                <>
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {formData.author.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 text-sm">
                                      {formData.author}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      {formData.date && (
                                        <span>{formData.date}</span>
                                      )}
                                      {formData.date && formData.readTime && (
                                        <span>•</span>
                                      )}
                                      {formData.readTime && (
                                        <span>{formData.readTime}</span>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </header>

                      {/* Featured Image */}
                      {formData.image && (
                        <div className="relative h-64 bg-gradient-to-br from-orange-400 via-red-400 to-orange-500 rounded-2xl mb-6 overflow-hidden">
                          <img
                            src={formData.image}
                            alt={formData.title || ""}
                            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* Article Content */}
                      <div
                        className="prose prose-lg max-w-none
                          prose-headings:text-gray-900 prose-headings:font-bold
                          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                          prose-ul:my-6 prose-ul:space-y-2
                          prose-li:text-gray-700
                          prose-strong:text-gray-900 prose-strong:font-semibold"
                        dangerouslySetInnerHTML={{
                          __html:
                            formData.content ||
                            '<p class="text-gray-400">Content preview will appear here...</p>',
                        }}
                      />
                    </article>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
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
