import { redirect } from "next/navigation";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import AdminDashboardContent from "@/components/admin-dashboard-content";

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

  return <AdminDashboardContent rows={rows} counts={counts} totalSubmissions={totalSubmissions} />;
}