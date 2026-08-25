"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Video, Image as ImageIcon, FileText } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  type: "TEXT" | "IMAGE" | "VIDEO";
  content?: string;
  mediaUrl?: string;
  createdAt: string;
}

// Convert various YouTube URL formats to standard embed URLs
function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // Match youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, etc.
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = cleanUrl.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1`;
  }

  return null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-600 w-7 h-7" /> Sacred Crafts & Traditions Blog
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Explore our stories, craftsmanship highlights, sacred traditions, and temple videos.
        </p>
      </div>

      {/* Blog Feed */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-xl border border-stone-200">
          <p className="text-stone-500 font-medium">No blog posts published yet.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {posts.map((post) => {
            const embedUrl = post.type === "VIDEO" ? getYouTubeEmbedUrl(post.mediaUrl) : null;

            return (
              <article
                key={post.id}
                className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition space-y-4"
              >
                {/* Media Header (for Image or Video) */}
                {post.type === "IMAGE" && post.mediaUrl && (
                  <div className="w-full max-h-[450px] bg-stone-100 overflow-hidden flex items-center justify-center">
                    <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {post.type === "VIDEO" && (
  <div className="relative w-full aspect-video bg-black rounded-t-2xl overflow-hidden">
    {embedUrl ? (
      <iframe
        src={embedUrl}
        title={post.title}
        className="w-full h-full border-0 absolute inset-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    ) : (
      <div className="flex items-center justify-center h-full text-stone-400 text-xs p-4">
        Invalid or unsupported YouTube URL format ({post.mediaUrl})
      </div>
    )}
  </div>
)}

                {/* Post Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      {post.type === "VIDEO" && <Video className="w-3 h-3" />}
                      {post.type === "IMAGE" && <ImageIcon className="w-3 h-3" />}
                      {post.type === "TEXT" && <FileText className="w-3 h-3" />}
                      {post.type}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-amber-950">{post.title}</h2>

                  {post.content && (
                    <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Callout Link */}
      <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-3">
        <h3 className="font-bold text-amber-950">Looking for your custom idol?</h3>
        <p className="text-stone-600 text-xs sm:text-sm">
          Enter your assigned security passcode to access your private Murti details and photo progress.
        </p>
        <div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-800 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition"
          >
            View Your Idol <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}