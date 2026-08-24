"use client";

import { useEffect, useState, useMemo } from "react";
import { Sparkles, MapPin, Building2, Search, X } from "lucide-react";

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

export default function HomePage() {
  const [idols, setIdols] = useState<DeityIdol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/idols")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIdols(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter idols dynamically by deity name, temple, location, or description
  const filteredIdols = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return idols;

    return idols.filter((idol) => {
      const matchName = idol.name?.toLowerCase().includes(query);
      const matchTemple = idol.templeName?.toLowerCase().includes(query);
      const matchLocation = idol.location?.toLowerCase().includes(query);
      const matchDesc = idol.description?.toLowerCase().includes(query);
      return matchName || matchTemple || matchLocation || matchDesc;
    });
  }, [idols, searchQuery]);

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-600 w-7 h-7" /> Sacred Murti & Idol Gallery
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Handcrafted sacred stone idols, Narmadeshwar lingams, and temple sculptures.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by deity name, temple, city, or material..."
            className="w-full pl-10 pr-10 py-2.5 rounded-full border border-stone-300 bg-white text-stone-800 placeholder-stone-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-stone-500 mt-2 px-2 text-center">
            Showing {filteredIdols.length} {filteredIdols.length === 1 ? "result" : "results"} for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Gallery Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800"></div>
        </div>
      ) : idols.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-xl border border-amber-200">
          <p className="text-stone-500 font-medium">No idols have been listed yet.</p>
          <p className="text-xs text-stone-400 mt-1">Log into the Admin Portal to add deity crafts and photos.</p>
        </div>
      ) : filteredIdols.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-xl border border-stone-200">
          <p className="text-stone-600 font-medium">No idols match your search.</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-xs text-amber-800 hover:underline font-semibold"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdols.map((idol) => {
            const primary = idol.images.find((img) => img.isPrimary) || idol.images[0];
            return (
              <div
                key={idol.id}
                className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition flex flex-col"
              >
                <div className="relative aspect-square w-full bg-stone-100 flex items-center justify-center overflow-hidden">
                  {primary ? (
                    <img
                      src={primary.url}
                      alt={idol.name}
                      className="object-cover w-full h-full hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <span className="text-xs text-stone-400">No Image Available</span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h2 className="font-bold text-lg text-amber-950">{idol.name}</h2>
                    {idol.templeName && (
                      <p className="text-xs text-stone-600 flex items-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" /> {idol.templeName}
                      </p>
                    )}
                    {idol.location && (
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {idol.location}
                      </p>
                    )}
                    {idol.description && (
                      <p className="text-xs text-stone-600 mt-2 line-clamp-2">{idol.description}</p>
                    )}
                  </div>

                  {idol.images.length > 1 && (
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto">
                      {idol.images.map((img) => (
                        <img
                          key={img.id}
                          src={img.url}
                          alt="thumbnail"
                          className="w-10 h-10 object-cover rounded border border-stone-200 shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}