"use client";
import Link from "next/link";
import AuthMenu from "./auth-menu";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white/90 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <Link href="/" aria-label="MedConnect Home" className="block">
          <img
            src="/medconnect logo.webp"
            alt="MedConnect"
            className="h-16 w-auto"
          />
        </Link>
      </div>
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-blue-600 font-medium hover:underline">
          Home
        </Link>
        <AuthMenu />
      </div>
    </nav>
  );
}
