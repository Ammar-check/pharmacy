"use client";
import Link from "next/link";
import AuthMenu from "./auth-menu";

export default function Navbar() {
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
        <Link href="/weightlossForm" className="text-gray-700 font-medium hover:text-blue-600 transition">
          Weight Loss Pad
        </Link>
        <Link href="/sterilePadForm" className="text-gray-700 font-medium hover:text-blue-600 transition">
          Sterile Pad
        </Link>
        <Link href="/peptidesForm" className="text-gray-700 font-medium hover:text-blue-600 transition">
          Peptides Pad
        </Link>
        <Link href="/dermatologyPadForm" className="text-gray-700 font-medium hover:text-blue-600 transition">
          Dermatology Pad
        </Link>
        <Link href="/controlsPadForm" className="text-gray-700 font-medium hover:text-blue-600 transition">
          Controls Pad
        </Link>
        <AuthMenu />
      </div>
    </nav>
  );
}
