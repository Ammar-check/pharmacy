import { notFound, redirect } from "next/navigation";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type Params = { params: Promise<{ id: string }> };

export default async function AdminViewPage({ params }: Params) {
  const { id } = await params;

  // Check admin gate cookie instead of Supabase user role
  const cookieStore = await cookies();
  const adminGate = cookieStore.get("admin_gate")?.value;
  if (adminGate !== "ok") {
    redirect("/admin/login");
  }

  // Use service role client to bypass RLS and fetch ALL submissions
  const supabase = createSupabaseServiceRole();

  if (!supabase) {
    throw new Error("Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  }

  const { data, error } = await supabase
    .from("form_submissions")
    .select("id, form_type, status, created_at, form_data, profiles(full_name, email)")
    .eq("id", id)
    .single();
  if (error) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Submission details</h1>
          <p className="text-gray-600">{new Date(data.created_at).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Form type</p>
              <p className="text-sm font-semibold text-blue-900">{data.form_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-semibold text-blue-900">{data.status || "pending"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm text-gray-800">
                {(Array.isArray(data.profiles) ? data.profiles[0]?.full_name : (data.profiles as any)?.full_name) || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-800">
                {(Array.isArray(data.profiles) ? data.profiles[0]?.email : (data.profiles as any)?.email) || "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Form data</p>
            <pre className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{JSON.stringify(data.form_data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}


