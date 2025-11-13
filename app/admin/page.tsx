import { redirect } from "next/navigation";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import AdminLogoutButton from "@/components/admin-logout-button";

type SubmissionRow = {
  id: string;
  form_type: string;
  status: string | null;
  created_at: string;
  form_data: any;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
};

async function getData() {
  // Use service role client to bypass RLS and fetch ALL submissions
  const supabase = createSupabaseServiceRole();

  if (!supabase) {
    throw new Error("Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  }

  // Get ALL submissions (removed limit)
  const { data, error } = await supabase
    .from("form_submissions")
    .select(`
      id,
      form_type,
      status,
      created_at,
      form_data,
      user_id,
      profiles:user_id(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Type cast to ensure profiles is treated as an object, not an array
  const rows = (data || []) as unknown as SubmissionRow[];

  // Count total and by category
  const counts: Record<string, number> = {
    weightloss: 0,
    peptides: 0,
    sterile: 0,
    dermatology: 0,
    controls: 0,
  };
  
  if (rows) {
    for (const r of rows) {
      if (counts.hasOwnProperty(r.form_type)) {
        counts[r.form_type]++;
      }
    }
  }

  const totalSubmissions = rows?.length || 0;

  return { rows: rows || [], counts, totalSubmissions };
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminGate = cookieStore.get("admin_gate")?.value;
  if (adminGate !== "ok") {
    redirect("/admin/login");
  }

  const { rows, counts, totalSubmissions } = await getData();

  const formCategories = [
    { name: "Weight Loss", type: "weightloss", color: "blue", icon: "⚖️" },
    { name: "Peptides", type: "peptides", color: "purple", icon: "🧬" },
    { name: "Sterile", type: "sterile", color: "green", icon: "💉" },
    { name: "Dermatology", type: "dermatology", color: "pink", icon: "👁️" },
    { name: "Controls", type: "controls", color: "orange", icon: "🛡️" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold">Admin</span>
            </p>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Total Stats Card */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm uppercase tracking-wide mb-2">Total Submissions</p>
                <p className="text-6xl font-bold">{totalSubmissions}</p>
                <p className="text-blue-200 mt-2">All time submissions across all forms</p>
              </div>
              <div className="text-8xl opacity-20">📊</div>
            </div>
          </div>
        </div>

        {/* Category Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Submissions by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {formCategories.map((cat) => (
              <div 
                key={cat.type}
                className="bg-white rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md transition p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${cat.color}-50 text-${cat.color}-700`}>
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{cat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{counts[cat.type] || 0}</p>
                <p className="text-xs text-gray-500 mt-2">submissions</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">All Submissions</h2>
              <span className="text-sm text-gray-500">Total: {rows.length}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Form Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-gray-500 text-lg font-medium">No submissions yet</p>
                        <p className="text-gray-400 text-sm">Submissions will appear here once users fill forms</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const category = formCategories.find(c => c.type === r.form_type);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(r.created_at).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(r.created_at).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour12: true })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{category?.icon}</span>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {r.form_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                            ${r.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {r.status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {r.profiles?.full_name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {r.profiles?.email || "—"}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Today's Submissions</p>
            <p className="text-2xl font-bold text-gray-900">
              {rows.filter(r => 
                new Date(r.created_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {rows.filter(r => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(r.created_at) >= weekAgo;
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Pending Review</p>
            <p className="text-2xl font-bold text-gray-900">
              {rows.filter(r => r.status === 'pending' || !r.status).length}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}