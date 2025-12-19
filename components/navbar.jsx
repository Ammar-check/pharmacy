"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import AuthMenu from "./auth-menu";
import supabase from "@/lib/supabase/client";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Fetch cart count on load
    const fetchCartCount = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("cart_items")
          .select("quantity", { count: "exact" })
          .eq("user_id", session.user.id);

        if (data) {
          const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        }
      }
    };

    fetchCartCount();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCartCount();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center">
        <Link href="/" aria-label="MedConnect Home" className="block">
          <img
            src="/medconnect logo.webp"
            alt="MedConnect"
            className="h-12 w-auto"
          />
        </Link>
      </div>
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-gray-700 font-medium hover:text-blue-600 transition">
          Home
        </Link>
        <Link href="/products" className="text-gray-700 font-medium hover:text-blue-600 transition">
          Products
        </Link>
        <Link href="/cart" className="text-gray-700 font-medium hover:text-blue-600 transition relative">
          <svg className="w-6 h-6 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        <AuthMenu />
      </div>
    </nav>
  );
}
