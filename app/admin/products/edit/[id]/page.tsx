import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import AdminProductForm from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // Check admin gate cookie (same as main admin page)
  const cookieStore = await cookies();
  const adminGate = cookieStore.get("admin_gate")?.value;
  if (adminGate !== "ok") {
    redirect("/admin/login");
  }

  // Use service role to fetch product
  const supabase = createSupabaseServiceRole();

  if (!supabase) {
    throw new Error("Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  }

  // Fetch product
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    redirect("/admin/products");
  }

  return <AdminProductForm product={product} />;
}
