"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Sparkles, BookOpen, Image as ImageIcon, Shield, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <nav className="bg-amber-950 text-amber-50 border-b border-amber-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/blog" className="flex items-center gap-2 font-bold text-lg tracking-wide text-amber-200">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Narmada Crafts</span>
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium">
          {/* Public links */}
          <Link href="/blog" className="flex items-center gap-1.5 hover:text-amber-300 transition">
            <BookOpen className="w-4 h-4" />
            <span>Blog</span>
          </Link>

          <Link href="/gallery" className="flex items-center gap-1.5 hover:text-amber-300 transition">
            <ImageIcon className="w-4 h-4" />
            <span>Craft Gallery</span>
          </Link>

          {/* Admin link only visible to ADMIN role */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 bg-amber-800 hover:bg-amber-700 px-3 py-1 rounded text-amber-100 transition text-xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Logout if authenticated */}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/blog" })}
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-white transition ml-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}