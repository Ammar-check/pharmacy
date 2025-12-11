"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase/client";

export default function Home() {
  const forms = [
    { name: "Weight Loss Pad", link: "/weightlossForm", icon: "weight", type: "weightloss", isActive: true },
    { name: "Sterile Pad", link: "/sterilePadForm", icon: "syringe", type: "sterile", isActive: true },
    { name: "Peptides Pad", link: "/peptidesForm", icon: "dna", type: "peptides", isActive: true },
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
      console.log("Auth check - Session exists:", !!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      console.log("Auth state changed - Session exists:", !!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOpen = (form) => {
    console.log("handleOpen called - isLoggedIn:", isLoggedIn);

    if (isLoggedIn) {
      console.log("User is logged in, navigating directly to form");
      const url = `${form.link}?type=${encodeURIComponent(form.type)}`;
      router.push(url);
      return;
    }

    console.log("User is NOT logged in, showing password modal");
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

  const renderIcon = (icon) => {
    const iconClass = "w-10 h-10";
    switch (icon) {
      case "weight":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={iconClass} fill="none">
            <circle cx="12" cy="12" r="9" className="stroke-blue-600" strokeWidth="2" />
            <path d="M8 12h8" className="stroke-blue-600" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "dna":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={iconClass} fill="none">
            <path d="M7 4c6 0 6 16 12 16M17 4C11 4 11 20 5 20" className="stroke-blue-600" strokeWidth="2" />
          </svg>
        );
      case "syringe":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={iconClass} fill="none">
            <rect x="6" y="6" width="12" height="12" className="stroke-blue-600" strokeWidth="2" rx="2" />
            <path d="M10 10h4M10 14h4" className="stroke-blue-600" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "skin":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={iconClass} fill="none">
            <path d="M4 12c3-6 13-6 16 0-3 6-13 6-16 0z" className="stroke-blue-600" strokeWidth="2" />
            <circle cx="12" cy="12" r="2" className="fill-blue-600" />
          </svg>
        );
      case "shield":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={iconClass} fill="none">
            <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" className="stroke-blue-600" strokeWidth="2" />
            <path d="M9 12l2 2 4-4" className="stroke-blue-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 py-12 px-4">
      {/* Left Wave Decoration - Positioned at intersection of first and second row */}
      <svg className="absolute left-[66px] md:left-[98px] top-[115px] md:top-[155px] w-24 h-24 md:w-32 md:h-32 text-blue-600 opacity-70 z-10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 50 Q 7.5 45, 15 50 Q 22.5 55, 30 50 Q 37.5 45, 45 50 Q 52.5 55, 60 50 Q 67.5 45, 75 50 Q 82.5 55, 90 50 Q 97.5 45, 105 50 Q 112.5 55, 120 50" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M0 60 Q 7.5 55, 15 60 Q 22.5 65, 30 60 Q 37.5 55, 45 60 Q 52.5 65, 60 60 Q 67.5 55, 75 60 Q 82.5 65, 90 60 Q 97.5 55, 105 60 Q 112.5 65, 120 60" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M0 70 Q 7.5 65, 15 70 Q 22.5 75, 30 70 Q 37.5 65, 45 70 Q 52.5 75, 60 70 Q 67.5 65, 75 70 Q 82.5 75, 90 70 Q 97.5 65, 105 70 Q 112.5 75, 120 70" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M0 80 Q 7.5 75, 15 80 Q 22.5 85, 30 80 Q 37.5 75, 45 80 Q 52.5 85, 60 80 Q 67.5 75, 75 80 Q 82.5 85, 90 80 Q 97.5 75, 105 80 Q 112.5 85, 120 80" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>

      {/* Right Wave Decoration - Positioned at intersection of first and second row */}
      <svg className="absolute right-[66px] md:right-[98px] top-[585px] md:top-[625px] w-24 h-24 md:w-32 md:h-32 text-blue-600 opacity-70 z-10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 50 Q 7.5 45, 15 50 Q 22.5 55, 30 50 Q 37.5 45, 45 50 Q 52.5 55, 60 50 Q 67.5 45, 75 50 Q 82.5 55, 90 50 Q 97.5 45, 105 50 Q 112.5 55, 120 50" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M0 60 Q 7.5 55, 15 60 Q 22.5 65, 30 60 Q 37.5 55, 45 60 Q 52.5 65, 60 60 Q 67.5 55, 75 60 Q 82.5 65, 90 60 Q 97.5 55, 105 60 Q 112.5 65, 120 60" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M0 70 Q 7.5 65, 15 70 Q 22.5 75, 30 70 Q 37.5 65, 45 70 Q 52.5 75, 60 70 Q 67.5 65, 75 70 Q 82.5 75, 90 70 Q 97.5 65, 105 70 Q 112.5 75, 120 70" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M0 80 Q 7.5 75, 15 80 Q 22.5 85, 30 80 Q 37.5 75, 45 80 Q 52.5 85, 60 80 Q 67.5 75, 75 80 Q 82.5 85, 90 80 Q 97.5 75, 105 80 Q 112.5 85, 120 80" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Top <span className="text-blue-600">services</span> we offer
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          In today's fast-paced world, your health deserves the utmost attention and convenience. That's why MedConnect offers a suite of integrated services designed to cater to your healthcare needs digitally.
        </p>
      </div>

      {/* Services Bento Grid */}
      <div className="max-w-6xl mx-auto px-4">
        {/* First Row - Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Weight Loss Pad - Takes 2 columns */}
          <button
            onClick={() => {
              if (forms[0].isActive) {
                handleOpen(forms[0]);
              }
            }}
            disabled={!forms[0].isActive}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300 text-left group md:col-span-2"
          >
            {/* Icon */}
            <div className="mb-4">
              {renderIcon(forms[0].icon)}
            </div>

            {/* Title with External Link Icon */}
            <h3 className="text-lg font-semibold text-blue-600 mb-2 flex items-center gap-2">
              {forms[0].name}
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-gray-600 mb-4">Tap to open form & details below</p>

            {/* Bullet Points */}
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <span className="mr-2">•</span>
                <span className="uppercase tracking-wide">Patient Information</span>
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="mr-2">•</span>
                <span className="uppercase tracking-wide">Physician Information</span>
              </li>
            </ul>
          </button>

          {/* Sterile Pad - Takes 1 column */}
          <button
            onClick={() => {
              if (forms[1].isActive) {
                handleOpen(forms[1]);
              }
            }}
            disabled={!forms[1].isActive}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300 text-left group"
          >
            {/* Icon */}
            <div className="mb-4">
              {renderIcon(forms[1].icon)}
            </div>

            {/* Title with External Link Icon */}
            <h3 className="text-lg font-semibold text-blue-600 mb-2 flex items-center gap-2">
              {forms[1].name}
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-gray-600 mb-4">Tap to open form & details below</p>

            {/* Bullet Points */}
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <span className="mr-2">•</span>
                <span className="uppercase tracking-wide">Patient Information</span>
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="mr-2">•</span>
                <span className="uppercase tracking-wide">Physician Information</span>
              </li>
            </ul>
          </button>
        </div>

        {/* Second Row - Three Equal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forms.slice(2).map((form) => (
            <button
              key={form.type}
              onClick={() => {
                if (form.isActive) {
                  handleOpen(form);
                }
              }}
              disabled={!form.isActive}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300 text-left group"
            >
              {/* Icon */}
              <div className="mb-4">
                {renderIcon(form.icon)}
              </div>

              {/* Title with External Link Icon */}
              <h3 className="text-lg font-semibold text-blue-600 mb-2 flex items-center gap-2">
                {form.name}
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-gray-600 mb-4">Tap to open form & details below</p>

              {/* Bullet Points */}
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <span className="mr-2">•</span>
                  <span className="uppercase tracking-wide">Patient Information</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <span className="mr-2">•</span>
                  <span className="uppercase tracking-wide">Physician Information</span>
                </li>
              </ul>
            </button>
          ))}
        </div>
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
