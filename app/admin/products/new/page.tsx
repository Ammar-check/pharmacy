import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminProductForm from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  // Check admin gate cookie (same as main admin page)
  const cookieStore = await cookies();
  const adminGate = cookieStore.get("admin_gate")?.value;
  if (adminGate !== "ok") {
    redirect("/admin/login");
  }

  return <AdminProductForm />;
}
