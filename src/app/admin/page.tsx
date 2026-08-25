"use client";

import { useEffect, useState } from "react";
import { Plus, ImagePlus, Trash2, Upload, Edit, Check, X, Newspaper, Video, FileText, ImageIcon } from "lucide-react";

interface IdolImage {
  id: string;
  url: string;
  caption?: string;
  occasion?: string;
  isPrimary: boolean;
}

interface DeityIdol {
  id: string;
  name: string;
  templeName?: string;
  location?: string;
  description?: string;
  accessCode?: string;
  images: IdolImage[];
}

interface BlogPost {
  id: string;
  title: string;
  type: "TEXT" | "IMAGE" | "VIDEO";
  content?: string;
  mediaUrl?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [idols, setIdols] = useState<DeityIdol[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  // Idol State
  const [name, setName] = useState("");
  const [templeName, setTempleName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [accessCode, setAccessCode] = useState("");

  // Edit Idol State
  const [editingIdolId, setEditingIdolId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTempleName, setEditTempleName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAccessCode, setEditAccessCode] = useState("");

  // Photo Upload State
  const [selectedIdolId, setSelectedIdolId] = useState("");
  const [base64Image, setBase64Image] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [occasion, setOccasion] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Blog Post State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogType, setBlogType] = useState<"TEXT" | "IMAGE" | "VIDEO">("TEXT");
  const [blogContent, setBlogContent] = useState("");
  const [blogMediaUrl, setBlogMediaUrl] = useState("");
  const [blogBase64Image, setBlogBase64Image] = useState("");
  const [blogSubmitting, setBlogSubmitting] = useState(false);

  const fetchIdols = () => {
    fetch("/api/idols")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setIdols(data);
          if (data.length > 0 && !selectedIdolId) setSelectedIdolId(data[0].id);
        }
      });
  };

  const fetchBlogs = () => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlogs(data);
      });
  };

  useEffect(() => {
    fetchIdols();
    fetchBlogs();
  }, []);

  const handleFileCompress = (file: File, callback: (result: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateIdol = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/idols", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, templeName, location, description, accessCode }),
    });

    if (res.ok) {
      setName("");
      setTempleName("");
      setLocation("");
      setDescription("");
      setAccessCode("");
      fetchIdols();
    } else {
      alert("Failed to create idol entry.");
    }
  };

  const handleSaveEdit = async (idolId: string) => {
    const res = await fetch(`/api/admin/idols/${idolId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        templeName: editTempleName,
        location: editLocation,
        description: editDescription,
        accessCode: editAccessCode,
      }),
    });

    if (res.ok) {
      setEditingIdolId(null);
      fetchIdols();
    } else {
      alert("Failed to update idol.");
    }
  };

  const handleDeleteIdol = async (idolId: string, idolName: string) => {
    if (!confirm(`Delete "${idolName}" and all photos?`)) return;
    await fetch(`/api/admin/idols/${idolId}`, { method: "DELETE" });
    fetchIdols();
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdolId || !base64Image) return;

    setUploading(true);
    try {
      const res = await fetch(`/api/admin/idols/${selectedIdolId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: base64Image, caption, occasion, isPrimary }),
      });

      if (res.ok) {
        setBase64Image("");
        setCaption("");
        setOccasion("");
        setIsPrimary(false);
        fetchIdols();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/admin/images/${imageId}`, { method: "DELETE" });
    fetchIdols();
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogSubmitting(true);

    const media = blogType === "IMAGE" ? blogBase64Image : blogMediaUrl;

    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: blogTitle,
        type: blogType,
        content: blogContent,
        mediaUrl: media,
      }),
    });

    if (res.ok) {
      setBlogTitle("");
      setBlogContent("");
      setBlogMediaUrl("");
      setBlogBase64Image("");
      fetchBlogs();
    } else {
      alert("Failed to publish blog post.");
    }
    setBlogSubmitting(false);
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/blogs/${blogId}`, { method: "DELETE" });
    fetchBlogs();
  };

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-amber-950">Admin Dashboard: Idols & Dynamic Blog</h1>

      {/* 1. Dynamic Blog Publisher Form */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
          <Newspaper className="w-5 h-5" /> Publish New Blog Post (Text / Image / YouTube)
        </h2>
        <form onSubmit={handleCreateBlog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-600">Blog Title *</label>
              <input
                required
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="e.g. History of Omkareshwar Jyotirlinga Stone"
                className="w-full p-2 border rounded text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600">Post Type *</label>
              <select
                value={blogType}
                onChange={(e) => setBlogType(e.target.value as any)}
                className="w-full p-2 border rounded text-sm mt-1 bg-white"
              >
                <option value="TEXT">1. Text Article</option>
                <option value="IMAGE">2. Image Story (Upload Local Image)</option>
                <option value="VIDEO">3. YouTube Video Embed</option>
              </select>
            </div>
          </div>

          {/* Conditional Media Input */}
          {blogType === "IMAGE" && (
            <div>
              <label className="text-xs font-semibold text-stone-600">Upload Blog Image *</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileCompress(e.target.files[0], setBlogBase64Image);
                }}
                className="w-full p-2 border rounded text-sm mt-1 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-amber-100 file:text-amber-800"
              />
            </div>
          )}

          {blogType === "VIDEO" && (
            <div>
              <label className="text-xs font-semibold text-stone-600">YouTube Video URL *</label>
              <input
                type="url"
                required
                value={blogMediaUrl}
                onChange={(e) => setBlogMediaUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-2 border rounded text-sm mt-1"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-600">Article Content / Description</label>
            <textarea
              rows={4}
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              placeholder="Write the blog text, context, or explanation..."
              className="w-full p-2 border rounded text-sm mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={blogSubmitting}
            className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-2 rounded text-sm font-semibold transition"
          >
            {blogSubmitting ? "Publishing..." : "Publish Post to Live Blog"}
          </button>
        </form>

        {/* Existing Blogs List */}
        {blogs.length > 0 && (
          <div className="pt-4 border-t border-stone-200">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Published Posts</h3>
            <div className="space-y-2">
              {blogs.map((b) => (
                <div key={b.id} className="flex justify-between items-center bg-stone-50 p-3 rounded border text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {b.type}
                    </span>
                    <span className="font-semibold text-stone-800">{b.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBlog(b.id)}
                    className="text-rose-700 hover:text-rose-900 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Idols & Photos Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form: Add Idol */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-1.5">
            <Plus className="w-5 h-5" /> Add New Deity Idol
          </h2>
          <form onSubmit={handleCreateIdol} className="space-y-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Deity / Idol Name *"
              className="w-full p-2 border rounded text-sm"
            />
            <input
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Passcode for Customer (e.g. SHIVA-108) *"
              className="w-full p-2 border rounded text-sm uppercase"
            />
            <input
              value={templeName}
              onChange={(e) => setTempleName(e.target.value)}
              placeholder="Temple Name"
              className="w-full p-2 border rounded text-sm"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full p-2 border rounded text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              className="w-full p-2 border rounded text-sm"
            />
            <button
              type="submit"
              className="w-full bg-amber-800 text-white py-2 rounded text-sm font-medium hover:bg-amber-700"
            >
              Save Deity Idol
            </button>
          </form>
        </div>

        {/* Form: Attach Photos */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-1.5">
            <ImagePlus className="w-5 h-5" /> Attach Photo to Deity
          </h2>
          <form onSubmit={handleAddImage} className="space-y-3">
            <select
              value={selectedIdolId}
              onChange={(e) => setSelectedIdolId(e.target.value)}
              className="w-full p-2 border rounded text-sm bg-white"
            >
              {idols.map((idol) => (
                <option key={idol.id} value={idol.id}>
                  {idol.name} (Code: {idol.accessCode || "None"})
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileCompress(e.target.files[0], setBase64Image);
              }}
              className="w-full p-2 border rounded text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-amber-100 file:text-amber-800"
            />
            <input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Occasion / Shringar"
              className="w-full p-2 border rounded text-sm"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption"
              className="w-full p-2 border rounded text-sm"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
              <label htmlFor="isPrimary" className="text-xs text-stone-700">
                Set as Primary Photo
              </label>
            </div>
            <button
              type="submit"
              disabled={!selectedIdolId || !base64Image || uploading}
              className="w-full bg-stone-800 text-white py-2 rounded text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
            >
              {uploading ? "Saving..." : "Upload Photo"}
            </button>
          </form>
        </div>
      </div>

      {/* Existing Idols List */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-4">
        <h2 className="text-lg font-bold text-stone-800">Existing Deity Records</h2>
        {idols.map((idol) => (
          <div key={idol.id} className="p-4 border rounded-lg bg-stone-50 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-amber-950">{idol.name}</h3>
                  <span className="text-xs bg-amber-100 text-amber-900 font-mono px-2 py-0.5 rounded border border-amber-300 font-semibold">
                    Passcode: {idol.accessCode || "None"}
                  </span>
                </div>
                <p className="text-xs text-stone-500">{[idol.templeName, idol.location].filter(Boolean).join(" • ")}</p>
              </div>
              <button
                onClick={() => handleDeleteIdol(idol.id, idol.name)}
                className="text-xs px-2.5 py-1 bg-rose-100 text-rose-800 rounded font-medium hover:bg-rose-200"
              >
                Delete
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
              {idol.images.map((img) => (
                <div key={img.id} className="relative group w-16 h-16 rounded border overflow-hidden">
                  <img src={img.url} alt="idol" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute inset-0 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}