"use client";
import { useEffect, useState, useRef } from "react";
import supabase from "@/lib/supabase/client";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

type SessionState = {
  email: string | null;
  isAdmin: boolean;
};

export default function AuthMenu() {
  const [state, setState] = useState<SessionState>({ email: null, isAdmin: false });
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user || null;
      if (!mounted) return;
      if (!user) {
        setState({ email: null, isAdmin: false });
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, email")
        .eq("id", user.id)
        .single();
      setState({ email: user.email ?? profile?.email ?? null, isAdmin: profile?.role === "admin" });
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <span className="text-gray-500 text-sm">Loading…</span>;

  if (!state.email) {
    return (
      <>
        <Link href="/create-account" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition">Login</Link>
      </>
    );
  }

  // Generate initials from email
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Generate a consistent color based on email
  const getColorFromEmail = (email: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <div className={`w-10 h-10 rounded-full ${getColorFromEmail(state.email || '')} flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-shadow`}>
          {getInitials(state.email || '')}
        </div>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-100 py-2 z-[9999] animate-slideDown">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${getColorFromEmail(state.email || '')} flex items-center justify-center text-white font-bold`}>
                {getInitials(state.email || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{state.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition"
            >
              <LogOut size={18} className="text-red-600" />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


