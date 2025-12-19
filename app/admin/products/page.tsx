import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import AdminProductsContent from "@/components/admin-products-content";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // Check admin gate cookie (same as main admin page)
  const cookieStore = await cookies();
  const adminGate = cookieStore.get("admin_gate")?.value;
  if (adminGate !== "ok") {
    redirect("/admin/login");
  }

  // Use service role to fetch products
  const supabase = createSupabaseServiceRole();

  if (!supabase) {
    throw new Error("Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  }

  // Fetch all products
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
  }

  return <AdminProductsContent products={products || []} />;
}
