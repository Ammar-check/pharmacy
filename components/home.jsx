"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase/client";

export default function Home() {
  const forms = [
    { name: "Weight Loss Pad", link: "/weightlossForm", icon: "weight", type: "weightloss", isActive: true },
    { name: "Peptides Pad", link: "/peptidesForm", icon: "dna", type: "peptides", isActive: true },
    { name: "Sterile Pad", link: "/sterilePadForm", icon: "syringe", type: "sterile", isActive: true },
    { name: "Dermatology Pad", link: "/dermatologyPadForm", icon: "skin", type: "dermatology", isActive: true },
    { name: "Controls Pad", link: "/controlsPadForm", icon: "shield", type: "controls", isActive: true },
  ];

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      console.log("Auth check - Session exists:", !!session); // Debug log
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      console.log("Auth state changed - Session exists:", !!session); // Debug log
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOpen = (form) => {
    console.log("handleOpen called - isLoggedIn:", isLoggedIn); // Debug log

    // If user is logged in, directly navigate to form
    if (isLoggedIn) {
      console.log("User is logged in, navigating directly to form"); // Debug log
      const url = `${form.link}?type=${encodeURIComponent(form.type)}`;
      router.push(url);
      return;
    }

    // If user is NOT logged in, show password modal
    console.log("User is NOT logged in, showing password modal"); // Debug log
    setSelectedForm(form);
    setPassword("");
    setError("");
    setShowPassword(true);
  };

  const handleSubmit = () => {
    if (password === "abc123") {
      setShowPassword(false);
      const url = `${selectedForm.link}?type=${encodeURIComponent(selectedForm.type)}`;
      router.push(url);
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center py-10 bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="w-full max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-r from-blue-900 to-blue-700">
          <div className="relative p-6 md:p-8">
            <div className="flex items-start md:items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <img src="/medconnect logo.webp" alt="MedConnect" className="w-16 h-auto" />
                  <h1 className="text-2xl md:text-3xl font-bold text-white">MedConnect</h1>
                </div>
                <p className="text-blue-100 text-sm">Compounding • Wellness • Patient-Centric Care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-4 mt-8 px-4">
        {forms.map((form) => {
          const isActive = !!form.isActive;

          const renderIcon = () => {
            switch (form.icon) {
              case "weight":
                return (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 mr-4" aria-hidden>
                    <circle cx="12" cy="12" r="9" className="fill-blue-50 stroke-blue-500" strokeWidth="1.5"/>
                    <path d="M8 12h8" className="stroke-blue-600" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                );
              case "dna":
                return (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 mr-4" aria-hidden>
                    <path d="M7 4c6 0 6 16 12 16M17 4C11 4 11 20 5 20" className="stroke-blue-600" strokeWidth="2" fill="none"/>
                  </svg>
                );
              case "syringe":
                return (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 mr-4" aria-hidden>
                    <path d="M21 3l-6 6m-2 2l-6 6 4 4 6-6m-4-2l4 4" className="stroke-blue-600" strokeWidth="2" fill="none"/>
                  </svg>
                );
              case "skin":
                return (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 mr-4" aria-hidden>
                    <path d="M4 12c3-6 13-6 16 0-3 6-13 6-16 0z" className="fill-blue-50 stroke-blue-600" strokeWidth="1.5"/>
                  </svg>
                );
              case "shield":
                return (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 mr-4" aria-hidden>
                    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" className="fill-blue-50 stroke-blue-600" strokeWidth="1.5"/>
                  </svg>
                );
              default:
                return null;
            }
          };

          return (
            <button
              key={form.type}
              onClick={() => {
                if (isActive) {
                  handleOpen(form);
                }
              }}
              disabled={!isActive}
              className={`text-left flex items-center border border-gray-200 bg-white rounded-xl p-4 shadow-sm transition group ${
                isActive ? "hover:shadow-md hover:border-blue-500" : "opacity-60 cursor-not-allowed"
              }`}
            >
              {renderIcon()}
              <div className="flex-1">
                <span className="text-gray-900 font-semibold tracking-wide">{form.name.toUpperCase()}</span>
                <p className="text-xs text-gray-500">{isActive ? "Tap to open form" : "Coming soon"}</p>
              </div>
              <img
                src="https://img.icons8.com/ios-glyphs/24/chevron-right.png"
                alt="go"
                className={`opacity-40 ${isActive ? "group-hover:opacity-80" : ""}`}
              />
            </button>
          );
        })}
      </div>

      {/* Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPassword(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Enter password</h3>
            <p className="text-sm text-gray-600 mb-4">Access {selectedForm?.name}</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-black"
              placeholder="Password"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-5">
              <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700" onClick={() => setShowPassword(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={handleSubmit}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
