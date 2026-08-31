"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, KeyRound, Shield, LogOut, CalendarPlus } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <nav className="bg-[#2a170e] text-amber-50 border-b border-amber-900/60 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/blog" className="flex items-center gap-2 transition hover:opacity-95">
          <div className="relative h-14 w-40 sm:h-16 sm:w-48 bg-white/90 rounded-lg p-1 shadow-inner flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Narmada Crafts Logo"
              fill
              priority
              className="object-contain p-0.5"
            />
          </div>
        </Link>

        {/* Menu Links */}
        <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
          <Link href="/blog" className="flex items-center gap-1.5 hover:text-amber-300 transition text-xs sm:text-sm">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Blog</span>
          </Link>

          <Link href="/book-idol" className="flex items-center gap-1.5 hover:text-amber-300 transition text-xs sm:text-sm">
            <CalendarPlus className="w-4 h-4 text-amber-400" />
            <span>Book Idol</span>
          </Link>

          <Link href="/gallery" className="flex items-center gap-1.5 hover:text-amber-300 transition text-xs sm:text-sm">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>View Your Idol</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg text-amber-100 transition text-xs font-semibold shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin Portal</span>
            </Link>
          )}

          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/blog" })}
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-white transition ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}