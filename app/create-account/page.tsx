"use client";
import { useState, useEffect, Suspense } from "react";
import supabase from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { CheckCircle } from "lucide-react";

// Inner component with search params logic
function CreateAccountContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignatureSuccess, setShowSignatureSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if redirected from DocuSeal signature completion
    const signatureCompleted = searchParams.get("signature");
    if (signatureCompleted === "completed") {
      setShowSignatureSuccess(true);
      // Auto-hide after 10 seconds
      setTimeout(() => setShowSignatureSuccess(false), 10000);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // First, try provider login
      const providerResponse = await fetch("/api/provider-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await providerResponse.json();

      console.log("Provider login response:", {
        status: providerResponse.status,
        ok: providerResponse.ok,
        success: responseData.success,
        statusType: responseData.statusType,
        providerStatus: responseData.provider?.status
      });

      // SUCCESS - Login approved
      if (providerResponse.ok && responseData.success) {
        console.log("✅ Login successful! Redirecting to home page...");
        localStorage.setItem("provider", JSON.stringify(responseData.provider));
        setLoading(false);

        // Force redirect to home page
        window.location.href = "/";
        return;
      }

      // EMAIL NOT FOUND (404)
      if (providerResponse.status === 404) {
        setLoading(false);
        setError(responseData.error || "No account found with this email.");
        return;
      }

      // INVALID PASSWORD (401)
      if (providerResponse.status === 401) {
        // Try regular user login as fallback
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (authError) {
          setError(responseData.error || "Incorrect password. Please try again.");
          return;
        }
        router.push("/");
        return;
      }

      // SIGNATURE/STATUS ISSUES (403)
      if (providerResponse.status === 403) {
        setLoading(false);

        // Only redirect to pending signature page for "pending_signature" status
        if (responseData.statusType === "pending_signature") {
          console.log("⏳ Account setup in progress. Redirecting to pending signature page...");
          const signatureUrlParam = responseData.signatureUrl
            ? `&signatureUrl=${encodeURIComponent(responseData.signatureUrl)}`
            : '';
          router.push(`/provider-pending-signature?email=${encodeURIComponent(responseData.email)}${signatureUrlParam}`);
          return;
        }

        console.log("❌ Status issue:", responseData.statusType);

        // For other status issues, show error message
        const statusMessage = responseData.message
          ? `${responseData.message}\n\n${responseData.error}`
          : responseData.error;

        setError(statusMessage);
        return;
      }

      // OTHER ERRORS
      setLoading(false);
      setError(responseData.error || "Login failed. Please try again.");

    } catch (error: any) {
      setLoading(false);
      setError(error.message || "An error occurred during login");
    }
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
        <div className="w-full max-w-4xl">
          {/* Signature Completion Success Banner */}
          {showSignatureSuccess && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-fade-in">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-800">Signature Completed Successfully!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your provider agreement has been signed. Your application is now being reviewed by our team.
                    You can log in once your account is approved. We'll notify you via email when your account is ready.
                  </p>
                  <button
                    onClick={() => setShowSignatureSuccess(false)}
                    className="text-sm text-green-600 hover:text-green-800 font-semibold mt-2 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="flex-1 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  onClick={() => router.push("/provider-signup")}
                  type="button"
                >
                  Create Provider's Account
                </button>
                <div className="flex-1 py-2 rounded-lg font-semibold ml-2 bg-blue-600 text-white flex items-center justify-center">
                  Log in
                </div>
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
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
                    <path fill="#F25022" d="M0 0h11.377v11.372H0z" />
                    <path fill="#00A4EF" d="M12.623 0H24v11.372H12.623z" />
                    <path fill="#7FBA00" d="M0 12.623h11.377V24H0z" />
                    <path fill="#FFB900" d="M12.623 12.623H24V24H12.623z" />
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

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">Password</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required />
                </div>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Logging in..." : "Log in"}</button>
                <p className="text-sm text-gray-600 text-center">
                  New provider? {" "}
                  <button type="button" className="text-blue-600 font-semibold hover:underline" onClick={() => router.push("/provider-signup")}>Create Provider's Account</button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CreateAccountContent />
    </Suspense>
  );
}



