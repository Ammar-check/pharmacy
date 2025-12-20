"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import AuthMenu from "./auth-menu";
import supabase from "@/lib/supabase/client";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="w-full flex items-center justify-between px-4 md:px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          <Link href="/" aria-label="MedConnect Home" className="block">
            <img
              src="/medconnect logo.webp"
              alt="MedConnect"
              className="h-10 md:h-12 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
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

        {/* Mobile Menu Icons */}
        <div className="md:hidden flex items-center space-x-4">
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

          {/* Hamburger Icon */}
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header with Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <img
              src="/medconnect logo.webp"
              alt="MedConnect"
              className="h-10 w-auto"
            />
            <button
              onClick={closeMobileMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-6 py-6">
            <div className="flex flex-col space-y-6">
              <Link
                href="/"
                className="text-gray-700 font-medium hover:text-blue-600 transition text-lg"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-700 font-medium hover:text-blue-600 transition text-lg"
                onClick={closeMobileMenu}
              >
                Products
              </Link>
              <Link
                href="/cart"
                className="text-gray-700 font-medium hover:text-blue-600 transition text-lg flex items-center"
                onClick={closeMobileMenu}
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth Menu in Mobile */}
              <div className="pt-4 border-t border-gray-200">
                <AuthMenu />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
