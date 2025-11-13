"use client";

export default function AdminLogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
    >
      Logout
    </button>
  );
}
