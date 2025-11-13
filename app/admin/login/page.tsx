"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "same-origin",
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return setError(j.error || "Invalid credentials");
    }
    // Force full navigation to ensure cookie is available to server
    window.location.href = "/admin";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">Admin sign in</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">{loading ? "Signing in..." : "Sign in"}</button>
        </div>
      </form>
    </main>
  );
}


