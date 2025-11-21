"use client";
import { useState } from "react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export default function CreateAccountPage() {
  const [mode, setMode] = useState<"signup" | "login">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setError(null);
    setLoading(true);

    // Hardcore email validation
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

    if (!email || email.trim() === "") {
      setLoading(false);
      setError("Email is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setLoading(false);
      setError("Please enter a valid email address (e.g., user@example.com)");
      return;
    }

    if (email.length > 254) {
      setLoading(false);
      setError("Email address is too long");
      return;
    }

    // Check if email already exists in profiles table
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (existingProfile) {
      setLoading(false);
      setError("This email is already registered. Please try logging in instead or use a different email.");
      // Auto-switch to login mode after showing error
      setTimeout(() => {
        setMode("login");
        setPassword("");
        setFullName("");
      }, 3000);
      return;
    }

    // Get the redirect URL dynamically
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : "https://pharmacy-landingpage.vercel.app/auth/callback";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectUrl,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Check if user already exists (Supabase returns user but with empty identities)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("This email is already registered. Please try logging in instead or use a different email.");
      // Auto-switch to login mode after showing error
      setTimeout(() => {
        setMode("login");
        setPassword("");
        setFullName("");
      }, 3000);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, email: data.user.email, full_name: fullName });

      // Show email verification message
      setShowVerificationMessage(true);

      // After 5 seconds, switch to login mode
      setTimeout(() => {
        setShowVerificationMessage(false);
        setMode("login");
        setEmail("");
        setPassword("");
        setFullName("");
      }, 5000);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/");
  };

  const handleOAuthLogin = async (provider: "google") => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <main>
      <Navbar />
      <div className="min-h-[80vh] bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hidden md:flex items-center justify-center rounded-2xl bg-white shadow-sm p-8">
            <div className="text-center">
              <img src="/medconnect logo.webp" alt="MedConnect" className="w-48 h-auto mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800">MedConnect</h2>
              <p className="text-gray-600 text-sm mt-1">Your trusted compounding partner</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex mb-6">
              <button
                className={`flex-1 py-2 rounded-lg font-semibold ${mode === "signup" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setMode("signup")}
              >
                Create account
              </button>
              <button
                className={`flex-1 py-2 rounded-lg font-semibold ml-2 ${mode === "login" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setMode("login")}
              >
                Log in
              </button>
            </div>

            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Facebook OAuth Button (UI Only) */}
              <button
                onClick={(e) => e.preventDefault()}
                disabled={loading}
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>

              {/* Microsoft OAuth Button (UI Only) */}
              <button
                onClick={(e) => e.preventDefault()}
                disabled={loading}
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M0 0h11.377v11.372H0z"/>
                  <path fill="#00A4EF" d="M12.623 0H24v11.372H12.623z"/>
                  <path fill="#7FBA00" d="M0 12.623h11.377V24H0z"/>
                  <path fill="#FFB900" d="M12.623 12.623H24V24H12.623z"/>
                </svg>
                Continue with Microsoft
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>

            {/* Email Verification Message */}
            {showVerificationMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-green-800">Account Created Successfully!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Please check your email inbox and verify your email address before logging in.
                    </p>
                    <p className="text-xs text-green-600 mt-2 italic">
                      Redirecting to login in 5 seconds...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mode === "signup" ? (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Password</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">{loading ? "Creating..." : "Create account"}</button>
                <p className="text-sm text-gray-600 text-center">
                  Already have an account? {" "}
                  <button type="button" className="text-blue-600 font-semibold hover:underline" onClick={() => setMode("login")}>Log in</button>
                </p>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Password</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">{loading ? "Logging in..." : "Log in"}</button>
                <p className="text-sm text-gray-600 text-center">
                  New here? {" "}
                  <button type="button" className="text-blue-600 font-semibold hover:underline" onClick={() => setMode("signup")}>Create account</button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}



