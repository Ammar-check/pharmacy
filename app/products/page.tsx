import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductsListingClient from "@/components/products-listing-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch all active products
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
  }

  // Get unique categories
  const categories = Array.from(new Set(products?.map((p) => p.category).filter(Boolean) || []));

  return (
    <main>
      <Navbar />
      <ProductsListingClient products={products || []} categories={categories} />
      <Footer />
    </main>
  );
}
