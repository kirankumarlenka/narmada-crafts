"use client";

import { useEffect, useState } from "react";
import { Plus, ImagePlus, Trash2, Upload, Edit, Check, X } from "lucide-react";

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
  images: IdolImage[];
}

export default function AdminPage() {
  const [idols, setIdols] = useState<DeityIdol[]>([]);
  const [name, setName] = useState("");
  const [templeName, setTempleName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Edit State
  const [editingIdolId, setEditingIdolId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTempleName, setEditTempleName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Photo Upload State
  const [selectedIdolId, setSelectedIdolId] = useState("");
  const [base64Image, setBase64Image] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [occasion, setOccasion] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchIdols = () => {
    fetch("/api/idols")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setIdols(data);
          if (data.length > 0 && !selectedIdolId) setSelectedIdolId(data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching idols:", err));
  };

  useEffect(() => {
    fetchIdols();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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

          setBase64Image(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateIdol = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/idols", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, templeName, location, description }),
    });

    if (res.ok) {
      setName("");
      setTempleName("");
      setLocation("");
      setDescription("");
      fetchIdols();
    } else {
      alert("Failed to create idol entry.");
    }
  };

  const startEdit = (idol: DeityIdol) => {
    setEditingIdolId(idol.id);
    setEditName(idol.name);
    setEditTempleName(idol.templeName || "");
    setEditLocation(idol.location || "");
    setEditDescription(idol.description || "");
  };

  const cancelEdit = () => {
    setEditingIdolId(null);
  };

  const handleSaveEdit = async (idolId: string) => {
    const res = await fetch(`/api/idols/${idolId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        templeName: editTempleName,
        location: editLocation,
        description: editDescription,
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
    if (!confirm(`Are you sure you want to delete "${idolName}" and all of its photos?`)) return;

    const res = await fetch(`/api/idols/${idolId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchIdols();
    } else {
      alert("Failed to delete idol record.");
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdolId || !base64Image) return;

    setUploading(true);
    try {
      const res = await fetch(`/api/admin/idols/${selectedIdolId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: base64Image,
          caption,
          occasion,
          isPrimary,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to upload photo"}`);
      } else {
        setBase64Image("");
        setCaption("");
        setOccasion("");
        setIsPrimary(false);
        fetchIdols();
      }
    } catch {
      alert("Upload failed. Check server connection.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    await fetch(`/api/admin/images/${imageId}`, { method: "DELETE" });
    fetchIdols();
  };

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-2xl font-bold text-amber-950">Admin Craft & Idol Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Add Deity Idol */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-1.5">
            <Plus className="w-5 h-5" /> 1. Add New Deity Idol
          </h2>
          <form onSubmit={handleCreateIdol} className="space-y-3">
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
            <div>
              <label className="text-xs font-semibold text-stone-600">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about craftsmanship, dimensions, river stone..."
                className="w-full p-2 border rounded text-sm mt-1"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-800 text-white py-2 rounded text-sm font-medium hover:bg-amber-700 transition"
            >
              Save Deity Idol
            </button>
          </form>
        </div>

        {/* Form 2: Attach Photos from Local Storage */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-1.5">
            <ImagePlus className="w-5 h-5" /> 2. Upload & Attach Photo
          </h2>
          <form onSubmit={handleAddImage} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-600">Select Deity *</label>
              <select
                value={selectedIdolId}
                onChange={(e) => setSelectedIdolId(e.target.value)}
                className="w-full p-2 border rounded text-sm mt-1"
              >
                {idols.map((idol) => (
                  <option key={idol.id} value={idol.id}>
                    {idol.name} ({idol.location || "No location"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600">Select Local Image *</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="w-full p-2 border rounded text-sm mt-1 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
              />
            </div>

            {base64Image && (
              <div className="mt-2">
                <p className="text-xs text-stone-500 mb-1">Preview:</p>
                <img
                  src={base64Image}
                  alt="Selected Preview"
                  className="w-24 h-24 object-cover rounded border border-stone-200"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-stone-600">Occasion / Shringar</label>
              <input
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Mahashivratri Abhishekam"
                className="w-full p-2 border rounded text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600">Caption</label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Hand-carved natural stone"
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
              <label htmlFor="isPrimary" className="text-xs font-medium text-stone-700">
                Set as Primary / Cover Photo
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedIdolId || !base64Image || uploading}
              className="w-full bg-stone-800 text-white py-2 rounded text-sm font-medium hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Saving Image..." : "Upload Local Photo"}
            </button>
          </form>
        </div>
      </div>

      {/* Existing Idols & Image Gallery Manager */}
      <div className="bg-white p-5 rounded-xl border border-stone-200">
        <h2 className="text-lg font-bold text-stone-800 mb-4">Existing Records & Management</h2>
        <div className="space-y-4">
          {idols.map((idol) => (
            <div key={idol.id} className="p-4 border rounded-lg bg-stone-50 space-y-3">
              {editingIdolId === idol.id ? (
                /* Edit Form */
                <div className="space-y-3 bg-white p-4 rounded-lg border border-amber-300">
                  <h3 className="text-sm font-bold text-amber-900">Editing Deity Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Deity Name"
                      className="p-1.5 border rounded text-xs"
                    />
                    <input
                      value={editTempleName}
                      onChange={(e) => setEditTempleName(e.target.value)}
                      placeholder="Temple Name"
                      className="p-1.5 border rounded text-xs"
                    />
                    <input
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Location"
                      className="p-1.5 border rounded text-xs sm:col-span-2"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="p-1.5 border rounded text-xs sm:col-span-2"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 text-xs px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(idol.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1 bg-amber-800 hover:bg-amber-700 rounded text-white font-medium"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Record Header */
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-amber-950 text-base">{idol.name}</h3>
                    <p className="text-xs text-stone-500">
                      {[idol.templeName, idol.location].filter(Boolean).join(" • ") || "No location details"}
                    </p>
                    {idol.description && <p className="text-xs text-stone-600 mt-1">{idol.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(idol)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-medium transition"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteIdol(idol.id, idol.name)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-medium transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Thumbnails */}
              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-600">
                    Photos ({idol.images.length})
                  </span>
                </div>
                {idol.images.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No photos attached yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {idol.images.map((img) => (
                      <div key={img.id} className="relative group w-20 h-20 rounded border overflow-hidden bg-stone-100">
                        <img src={img.url} alt="idol" className="w-full h-full object-cover" />
                        {img.isPrimary && (
                          <span className="absolute top-0 left-0 bg-amber-800 text-[9px] text-white px-1 py-0.5 rounded-br font-bold">
                            Cover
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute inset-0 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// Inside AdminPage component state:
const [userEmail, setUserEmail] = useState("");
const [userPassword, setUserPassword] = useState("");
const [userCreatedMsg, setUserCreatedMsg] = useState("");

const handleCreateUser = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail, password: userPassword, role: "USER" }),
  });

  if (res.ok) {
    setUserCreatedMsg(`Credentials configured for ${userEmail}`);
    setUserEmail("");
    setUserPassword("");
    setTimeout(() => setUserCreatedMsg(""), 4000);
  } else {
    alert("Failed to create user credentials");
  }
};

// Add this JSX block inside the Admin Dashboard grid:
<div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm col-span-full">
  <h2 className="text-base font-bold text-amber-900 mb-2">Configure Client Gallery Credentials</h2>
  <p className="text-xs text-stone-500 mb-4">
    Create username/email and passwords for clients to unlock the Craft Gallery.
  </p>
  <form onSubmit={handleCreateUser} className="flex flex-col sm:flex-row gap-3">
    <input
      type="email"
      required
      value={userEmail}
      onChange={(e) => setUserEmail(e.target.value)}
      placeholder="client@example.com"
      className="p-2 border rounded text-xs flex-1"
    />
    <input
      type="password"
      required
      value={userPassword}
      onChange={(e) => setUserPassword(e.target.value)}
      placeholder="Password"
      className="p-2 border rounded text-xs flex-1"
    />
    <button
      type="submit"
      className="bg-stone-800 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-stone-700"
    >
      Create Client Account
    </button>
  </form>
  {userCreatedMsg && <p className="text-xs text-emerald-700 font-medium mt-2">{userCreatedMsg}</p>}
</div>