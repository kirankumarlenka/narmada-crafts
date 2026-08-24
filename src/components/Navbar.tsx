"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Sparkles, Shield, LogOut, LogIn } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="bg-amber-900 text-amber-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-wide">
          <Sparkles className="text-amber-400 w-5 h-5" />
          <span>Narmada-Crafts</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm hover:text-amber-200">
            Craft Gallery
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 bg-amber-700 hover:bg-amber-600 px-3 py-1.5 rounded text-sm transition"
            >
              <Shield className="w-4 h-4 text-amber-300" /> Admin Portal
            </Link>
          )}
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1 text-xs bg-amber-950 hover:bg-black px-3 py-1.5 rounded text-amber-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded shadow transition"
            >
              <LogIn className="w-4 h-4" /> Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}