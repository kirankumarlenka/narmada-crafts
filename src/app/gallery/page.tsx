"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { Sparkles, MapPin, Building2, Search, X, Lock } from "lucide-react";

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

export default function GalleryPage() {
  const { data: session, status } = useSession();
  const [idols, setIdols] = useState<DeityIdol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (session) {
      fetch("/api/idols")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setIdols(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

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

  if (status === "loading") {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  // If not logged in, prompt user credentials configured by Admin
  if (!session) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 shadow-md text-center space-y-4">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-amber-950">Protected Craft Gallery</h2>
        <p className="text-xs text-stone-600">
          Viewing this gallery requires authorized client credentials provided by our team.
        </p>
        <button
          onClick={() => signIn(undefined, { callbackUrl: "/gallery" })}
          className="w-full bg-amber-800 text-white py-2 rounded font-medium text-sm hover:bg-amber-700 transition"
        >
          Sign In with Access Credentials
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto px-4">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-600 w-7 h-7" /> Sacred Murti & Idol Gallery
        </h1>
        <p className="text-stone-600 text-sm">
          Exclusive access: Handcrafted sacred stone idols, lingams, and temple sculptures.
        </p>
      </div>

      {/* Search Filter */}
      <div className="max-w-xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by deity name, temple, city, or material..."
            className="w-full pl-10 pr-10 py-2.5 rounded-full border border-stone-300 bg-white text-stone-800 placeholder-stone-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 text-stone-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cards Display */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800"></div>
        </div>
      ) : filteredIdols.length === 0 ? (
        <p className="text-center text-stone-500 py-12">No idols match your search criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdols.map((idol) => {
            const primary = idol.images.find((img) => img.isPrimary) || idol.images[0];
            return (
              <div
                key={idol.id}
                className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-square w-full bg-stone-100 flex items-center justify-center overflow-hidden">
                  {primary ? (
                    <img src={primary.url} alt={idol.name} className="object-cover w-full h-full" />
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}