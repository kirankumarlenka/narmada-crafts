"use client";

import { useState } from "react";
import { MapPin, Building2, KeyRound, Ruler, ZoomIn, ZoomOut, Maximize2, X, RotateCcw } from "lucide-react";

interface IdolImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

interface DeityIdol {
  id: string;
  name: string;
  templeName?: string;
  location?: string;
  description?: string;
  height?: string;
  totalAmount?: number;
  advanceAmount?: number;
  status?: string;
  images: IdolImage[];
}

export default function ViewYourIdolPage() {
  const [passcode, setPasscode] = useState("");
  const [idol, setIdol] = useState<DeityIdol | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // In-line hover zoom state
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Modal full-screen zoom state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScale, setModalScale] = useState(1);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/idols/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Invalid passcode");
        setIdol(null);
      } else {
        setIdol(data);
        setActiveImageIndex(0);
      }
    } catch {
      setErrorMsg("Failed to verify passcode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const openModal = () => {
    setModalScale(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalScale(1);
  };

  const balance = Math.max(0, (idol?.totalAmount || 0) - (idol?.advanceAmount || 0));
  const activeImage = idol?.images?.[activeImageIndex];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Passcode Unlock Form */}
      <div className="text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-amber-950">View Your Private Idol Craft</h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Enter your assigned security passcode to track craft progress, dimensions, and photos.
        </p>

        <form onSubmit={handleUnlock} className="flex gap-2 pt-2">
          <input
            type="text"
            required
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode (e.g. KKOTE01)"
            className="flex-1 p-2.5 border rounded-lg text-sm bg-white border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800 uppercase tracking-wider font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-800 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Unlock"}
          </button>
        </form>

        {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}
      </div>

      {/* Unlocked Idol Card Display */}
      {idol && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden space-y-6 p-6">
          <div className="border-b border-stone-100 pb-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded">
                Verified Private Record
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  idol.status === "Delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : idol.status === "Ready"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-200 text-amber-900"
                }`}
              >
                Status: {idol.status || "In progress"}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-amber-950">{idol.name}</h2>

            <div className="flex flex-wrap gap-4 text-xs text-stone-600">
              {idol.height && (
                <span className="flex items-center gap-1 font-semibold text-amber-900">
                  <Ruler className="w-3.5 h-3.5 text-amber-700" /> Height: {idol.height}
                </span>
              )}
              {idol.templeName && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" /> {idol.templeName}
                </span>
              )}
              {idol.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" /> {idol.location}
                </span>
              )}
            </div>

            {/* Financial Overview Card */}
            {(idol.totalAmount || idol.advanceAmount) ? (
              <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                <div>
                  <span className="text-[11px] text-stone-500 font-medium block">Total Amount</span>
                  <span className="text-sm font-bold text-stone-800">
                    ₹{(idol.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-700 font-medium block">Advance Paid</span>
                  <span className="text-sm font-bold text-emerald-700">
                    ₹{(idol.advanceAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-rose-700 font-medium block">Balance Due</span>
                  <span className="text-sm font-bold text-rose-700">
                    ₹{balance.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : null}

            {idol.description && <p className="text-sm text-stone-600 pt-1 leading-relaxed">{idol.description}</p>}
          </div>

          {/* Photo Gallery with Zoom */}
          {idol.images.length > 0 && activeImage ? (
            <div className="space-y-4">
              {/* Interactive Zoom Window */}
              <div
                className="relative aspect-[4/3] w-full max-h-[500px] bg-stone-900/5 rounded-xl overflow-hidden cursor-crosshair border border-stone-200 group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseMove={handleMouseMove}
                onClick={openModal}
              >
                <img
                  src={activeImage.url}
                  alt={idol.name}
                  className="w-full h-full object-contain transition-transform duration-150 ease-out"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isHovering ? "scale(2.2)" : "scale(1)",
                  }}
                />

                {/* Hover instruction badge */}
                <div className="absolute bottom-3 right-3 bg-stone-900/75 text-white text-[11px] px-2.5 py-1 rounded-md backdrop-blur-sm pointer-events-none flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Hover to zoom • Click to expand</span>
                </div>
              </div>

              {activeImage.caption && (
                <p className="text-xs text-center text-stone-500 italic">
                  {activeImage.caption}
                </p>
              )}

              {/* Thumbnails */}
              {idol.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
                  {idol.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        activeImageIndex === idx ? "border-amber-800 scale-105" : "border-stone-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-stone-400 text-center py-8 italic">No photos attached yet.</p>
          )}
        </div>
      )}

      {/* Fullscreen Interactive Zoom Lightbox Modal */}
      {isModalOpen && activeImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 select-none">
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => setModalScale((s) => Math.min(s + 0.5, 4))}
              className="p-2 bg-stone-800/80 hover:bg-stone-700 text-white rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setModalScale((s) => Math.max(s - 0.5, 1))}
              className="p-2 bg-stone-800/80 hover:bg-stone-700 text-white rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setModalScale(1)}
              className="p-2 bg-stone-800/80 hover:bg-stone-700 text-white rounded-lg transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={closeModal}
              className="p-2 bg-rose-700/80 hover:bg-rose-600 text-white rounded-lg transition ml-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scalable Modal Image */}
          <div className="w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center overflow-auto">
            <img
              src={activeImage.url}
              alt="Zoomed preview"
              className="object-contain max-h-full transition-transform duration-200 ease-out"
              style={{ transform: `scale(${modalScale})` }}
            />
          </div>

          {/* Bottom Caption in Modal */}
          {activeImage.caption && (
            <p className="text-stone-300 text-xs mt-3">{activeImage.caption}</p>
          )}
        </div>
      )}
    </div>
  );
}