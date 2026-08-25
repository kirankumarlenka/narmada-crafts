import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const sampleBlogs = [
    {
      id: "1",
      title: "The Sacred Heritage of Narmadeshwar Shivlings",
      date: "August 2026",
      excerpt:
        "Discovered naturally in the sacred bed of the Narmada River, these divine stones carry timeless spiritual resonance and exquisite natural patterning.",
    },
    {
      id: "2",
      title: "Traditional Murti Craftsmanship and Ritual Care",
      date: "July 2026",
      excerpt:
        "An exploration of ancient stone sculpting techniques, sacred dimensions, and proper upkeep for temple idols.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-600 w-7 h-7" /> Sacred Crafts & Traditions Blog
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Read articles on temple heritage, river stone crafting, and idol preservation.
        </p>
      </div>

      <div className="grid gap-6">
        {sampleBlogs.map((post) => (
          <article
            key={post.id}
            className="p-6 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition space-y-3"
          >
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded">
              {post.date}
            </span>
            <h2 className="text-xl font-bold text-stone-900">{post.title}</h2>
            <p className="text-stone-600 text-sm leading-relaxed">{post.excerpt}</p>
          </article>
        ))}
      </div>

      <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-3">
        <h3 className="font-bold text-amber-950">Looking for our Idol & Murti Collection?</h3>
        <p className="text-stone-600 text-xs sm:text-sm">
          Access to our curated Craft Gallery requires client credentials configured by the administrator.
        </p>
        <div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-800 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition"
          >
            Access Craft Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}