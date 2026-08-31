"use client";

import { useEffect, useState } from "react";
import { Plus, ImagePlus, Trash2, Upload, Edit, Check, X, Newspaper, KeyRound, Receipt } from "lucide-react";

interface IdolImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

interface DeityIdol {
  id: string;
  name: string;
  receiptNo?: string;
  templeName?: string;
  location?: string;
  description?: string;
  accessCode?: string;
  height?: string;
  totalAmount?: number;
  advanceAmount?: number;
  status?: string;
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

  // Add Idol State
  const [name, setName] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [templeName, setTempleName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [height, setHeight] = useState("");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [advanceAmount, setAdvanceAmount] = useState<string>("");
  const [status, setStatus] = useState("In progress");

  // Edit Idol State
  const [editingIdolId, setEditingIdolId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editReceiptNo, setEditReceiptNo] = useState("");
  const [editTempleName, setEditTempleName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAccessCode, setEditAccessCode] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editTotalAmount, setEditTotalAmount] = useState<string>("");
  const [editAdvanceAmount, setEditAdvanceAmount] = useState<string>("");
  const [editStatus, setEditStatus] = useState("In progress");

  // Photo Upload State
  const [selectedIdolId, setSelectedIdolId] = useState("");
  const [base64Image, setBase64Image] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Dynamic Blog State
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
        if (data.length > 0) {
          setSelectedIdolId((prev) => prev || data[0].id);
        }
      } else {
        console.error("API returned non-array data:", data);
      }
    })
    .catch((err) => console.error("Error fetching idols:", err));
};

  const fetchBlogs = () => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlogs(data);
      })
      .catch((err) => console.error("Error fetching blogs:", err));
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
      body: JSON.stringify({
        name,
        receiptNo,
        templeName,
        location,
        description,
        accessCode,
        height,
        totalAmount: parseFloat(totalAmount) || 0,
        advanceAmount: parseFloat(advanceAmount) || 0,
        status,
      }),
    });

    if (res.ok) {
      setName("");
      setReceiptNo("");
      setTempleName("");
      setLocation("");
      setDescription("");
      setAccessCode("");
      setHeight("");
      setTotalAmount("");
      setAdvanceAmount("");
      setStatus("In progress");
      fetchIdols();
    } else {
      alert("Failed to create deity record.");
    }
  };

  const startEdit = (idol: DeityIdol) => {
    setEditingIdolId(idol.id);
    setEditName(idol.name);
    setEditReceiptNo(idol.receiptNo || "");
    setEditTempleName(idol.templeName || "");
    setEditLocation(idol.location || "");
    setEditDescription(idol.description || "");
    setEditAccessCode(idol.accessCode || "");
    setEditHeight(idol.height || "");
    setEditTotalAmount(idol.totalAmount?.toString() || "");
    setEditAdvanceAmount(idol.advanceAmount?.toString() || "");
    setEditStatus(idol.status || "In progress");
  };

  const cancelEdit = () => {
    setEditingIdolId(null);
  };

  const handleSaveEdit = async (idolId: string) => {
    const res = await fetch(`/api/admin/idols/${idolId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        receiptNo: editReceiptNo,
        templeName: editTempleName,
        location: editLocation,
        description: editDescription,
        accessCode: editAccessCode,
        height: editHeight,
        totalAmount: parseFloat(editTotalAmount) || 0,
        advanceAmount: parseFloat(editAdvanceAmount) || 0,
        status: editStatus,
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
    if (!confirm(`Delete "${idolName}" and all associated photos?`)) return;
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
        body: JSON.stringify({ url: base64Image, caption, isPrimary }),
      });

      if (res.ok) {
        setBase64Image("");
        setCaption("");
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

  const parsedTotal = parseFloat(totalAmount) || 0;
  const parsedAdvance = parseFloat(advanceAmount) || 0;
  const calculatedBalance = Math.max(0, parsedTotal - parsedAdvance);

  const parsedEditTotal = parseFloat(editTotalAmount) || 0;
  const parsedEditAdvance = parseFloat(editAdvanceAmount) || 0;
  const calculatedEditBalance = Math.max(0, parsedEditTotal - parsedEditAdvance);

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-amber-950">Admin Craft & Order Dashboard</h1>

      {/* Grid: 1. Add Deity & 2. Attach Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Add Deity Idol */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-1.5">
            <Plus className="w-5 h-5" /> 1. Add New Deity Idol Order
          </h2>
          <form onSubmit={handleCreateIdol} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-stone-600">Deity / Idol Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Narmadeshwar Shivling"
                  className="w-full p-2 border rounded text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-stone-500" /> Receipt No
                </label>
                <input
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="e.g. REC-2026-001"
                  className="w-full p-2 border rounded text-sm mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Passcode *
                </label>
                <input
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g. KKOTE01"
                  className="w-full p-2 border-2 border-amber-300 rounded text-sm mt-1 uppercase font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Idol Height</label>
                <input
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 3.5 Feet / 24 Inches"
                  className="w-full p-2 border rounded text-sm mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-stone-600">Temple Name</label>
                <input
                  value={templeName}
                  onChange={(e) => setTempleName(e.target.value)}
                  placeholder="e.g. Omkareshwar Jyotirlinga"
                  className="w-full p-2 border rounded text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Khandwa, MP"
                  className="w-full p-2 border rounded text-sm mt-1"
                />
              </div>
            </div>

            {/* Financials & Status */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-amber-900">Total (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 border rounded text-xs mt-0.5 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-amber-900">Advance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 border rounded text-xs mt-0.5 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-amber-900">Balance (₹)</label>
                  <div className="w-full p-1.5 border border-amber-300 rounded text-xs mt-0.5 bg-white font-bold text-amber-950 flex items-center">
                    ₹{calculatedBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-amber-900">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-1.5 border rounded text-xs mt-0.5 bg-white font-medium"
                >
                  <option value="In progress">In progress</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600">Description / Specs</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about craftsmanship, natural river stone..."
                className="w-full p-2 border rounded text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-800 text-white py-2 rounded text-sm font-medium hover:bg-amber-700 transition"
            >
              Save Deity Record
            </button>
          </form>
        </div>

        {/* Form 2: Attach Photos */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-1.5">
            <ImagePlus className="w-5 h-5" /> 2. Attach Photo to Deity
          </h2>
          <form onSubmit={handleAddImage} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-600">Select Deity *</label>
              <select
                value={selectedIdolId}
                onChange={(e) => setSelectedIdolId(e.target.value)}
                className="w-full p-2 border rounded text-sm mt-1 bg-white"
              >
                {idols.map((idol) => (
                  <option key={idol.id} value={idol.id}>
                    {idol.name} {idol.receiptNo ? `[Rec: ${idol.receiptNo}]` : ""} - Passcode: {idol.accessCode || "None"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600">Upload Image File *</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileCompress(e.target.files[0], setBase64Image);
                }}
                className="w-full p-2 border rounded text-sm mt-1 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-amber-100 file:text-amber-800"
              />
            </div>

            {base64Image && (
              <div className="mt-1">
                <img
                  src={base64Image}
                  alt="Selected Preview"
                  className="w-20 h-20 object-cover rounded border border-stone-200"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-stone-600">Caption / Note</label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Finishing stage polishing complete"
                className="w-full p-2 border rounded text-sm mt-1"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
              <label htmlFor="isPrimary" className="text-xs text-stone-700">
                Set as Primary / Cover Photo
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedIdolId || !base64Image || uploading}
              className="w-full bg-stone-800 text-white py-2 rounded text-sm font-medium hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Saving Photo..." : "Upload Photo"}
            </button>
          </form>
        </div>
      </div>

      {/* Existing Deity Records & Management */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-4">
        <h2 className="text-lg font-bold text-stone-800">Existing Deity Order Records</h2>
        {idols.map((idol) => (
          <div key={idol.id} className="p-4 border rounded-lg bg-stone-50 space-y-3">
            {editingIdolId === idol.id ? (
              /* Inline Edit Mode */
              <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-300">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h3 className="text-sm font-bold text-amber-950">Editing Deity Details & Passcode</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700">Deity / Idol Name *</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Deity Name"
                      className="w-full p-2 border rounded text-xs bg-white mt-0.5 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-stone-500" /> Receipt No
                    </label>
                    <input
                      value={editReceiptNo}
                      onChange={(e) => setEditReceiptNo(e.target.value)}
                      placeholder="e.g. REC-2026-001"
                      className="w-full p-2 border rounded text-xs bg-white mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" /> Security Passcode *
                    </label>
                    <input
                      value={editAccessCode}
                      onChange={(e) => setEditAccessCode(e.target.value)}
                      placeholder="e.g. KKOTE01"
                      className="w-full p-2 border-2 border-amber-400 focus:border-amber-600 rounded text-xs bg-white mt-0.5 font-mono font-bold uppercase tracking-wider text-amber-950"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700">Idol Height</label>
                    <input
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      placeholder="e.g. 3.5 Feet"
                      className="w-full p-2 border rounded text-xs bg-white mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700">Temple Name</label>
                    <input
                      value={editTempleName}
                      onChange={(e) => setEditTempleName(e.target.value)}
                      placeholder="Temple Name"
                      className="w-full p-2 border rounded text-xs bg-white mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700">Location</label>
                    <input
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Location / City"
                      className="w-full p-2 border rounded text-xs bg-white mt-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-amber-200">
                  <div>
                    <label className="text-[10px] font-bold text-stone-600">Total (₹)</label>
                    <input
                      type="number"
                      value={editTotalAmount}
                      onChange={(e) => setEditTotalAmount(e.target.value)}
                      className="p-1.5 border rounded text-xs w-full bg-white mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600">Advance (₹)</label>
                    <input
                      type="number"
                      value={editAdvanceAmount}
                      onChange={(e) => setEditAdvanceAmount(e.target.value)}
                      className="p-1.5 border rounded text-xs w-full bg-white mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600">Balance (₹)</label>
                    <div className="p-1.5 border border-stone-200 rounded text-xs bg-stone-50 font-bold text-rose-700 mt-0.5">
                      ₹{calculatedEditBalance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="p-1.5 border rounded text-xs w-full bg-white font-medium mt-0.5"
                    >
                      <option value="In progress">In progress</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Craft description or notes..."
                    className="w-full p-2 border rounded text-xs bg-white mt-0.5"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded text-stone-700 font-medium transition"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(idol.id)}
                    className="flex items-center gap-1 text-xs px-4 py-1.5 bg-amber-800 hover:bg-amber-700 rounded text-white font-semibold shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* Normal View Mode */
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-amber-950 text-base">{idol.name}</h3>
                    {idol.receiptNo && (
                      <span className="text-xs bg-stone-200 text-stone-800 font-medium px-2 py-0.5 rounded">
                        Receipt: {idol.receiptNo}
                      </span>
                    )}
                    <span className="text-xs bg-amber-100 text-amber-900 font-mono px-2.5 py-0.5 rounded border border-amber-300 font-bold tracking-wider">
                      Passcode: {idol.accessCode || "None"}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        idol.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : idol.status === "Ready"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-200 text-amber-900"
                      }`}
                    >
                      {idol.status || "In progress"}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500">
                    {[
                      idol.height ? `Height: ${idol.height}` : null,
                      idol.templeName,
                      idol.location,
                    ]
                      .filter(Boolean)
                      .join(" • ") || "No location / height details"}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs pt-1">
                    <span className="bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded font-medium">
                      Total: ₹{(idol.totalAmount || 0).toLocaleString()}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      Advance: ₹{(idol.advanceAmount || 0).toLocaleString()}
                    </span>
                    <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                      Balance: ₹{Math.max(0, (idol.totalAmount || 0) - (idol.advanceAmount || 0)).toLocaleString()}
                    </span>
                  </div>

                  {idol.description && <p className="text-xs text-stone-600 pt-1">{idol.description}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(idol)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-semibold transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteIdol(idol.id, idol.name)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-md font-semibold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* Photos */}
            <div className="pt-2 border-t border-stone-200">
              <span className="text-xs font-semibold text-stone-600 mb-2 block">
                Photos ({idol.images.length})
              </span>
              {idol.images.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No photos attached yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {idol.images.map((img) => (
                    <div key={img.id} className="relative group w-16 h-16 rounded border overflow-hidden bg-stone-100">
                      <img src={img.url} alt="idol" className="w-full h-full object-cover" />
                      {img.isPrimary && (
                        <span className="absolute top-0 left-0 bg-amber-800 text-[9px] text-white px-1 py-0.5 rounded-br font-bold">
                          Cover
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute inset-0 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Blog Publisher */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
          <Newspaper className="w-5 h-5" /> Dynamic Blog Publisher
        </h2>
        <form onSubmit={handleCreateBlog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              placeholder="Blog Title *"
              className="w-full p-2 border rounded text-sm"
            />
            <select
              value={blogType}
              onChange={(e) => setBlogType(e.target.value as any)}
              className="w-full p-2 border rounded text-sm bg-white"
            >
              <option value="TEXT">1. Text Article</option>
              <option value="IMAGE">2. Image Story</option>
              <option value="VIDEO">3. YouTube Video Embed</option>
            </select>
          </div>

          {blogType === "IMAGE" && (
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileCompress(e.target.files[0], setBlogBase64Image);
              }}
              className="w-full p-2 border rounded text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-amber-100 file:text-amber-800"
            />
          )}

          {blogType === "VIDEO" && (
            <input
              type="url"
              required
              value={blogMediaUrl}
              onChange={(e) => setBlogMediaUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-2 border rounded text-sm"
            />
          )}

          <textarea
            rows={3}
            value={blogContent}
            onChange={(e) => setBlogContent(e.target.value)}
            placeholder="Article body content..."
            className="w-full p-2 border rounded text-sm"
          />

          <button
            type="submit"
            disabled={blogSubmitting}
            className="bg-amber-800 hover:bg-amber-700 text-white px-5 py-2 rounded text-sm font-semibold transition"
          >
            {blogSubmitting ? "Publishing..." : "Publish Post"}
          </button>
        </form>

        {blogs.length > 0 && (
          <div className="pt-3 border-t border-stone-200 space-y-2">
            {blogs.map((b) => (
              <div key={b.id} className="flex justify-between items-center bg-stone-50 p-2.5 rounded border text-sm">
                <span className="font-medium text-stone-800">{b.title}</span>
                <button
                  onClick={() => handleDeleteBlog(b.id)}
                  className="text-rose-700 text-xs font-semibold hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}