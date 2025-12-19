import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductDetailClient from "@/components/product-detail-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch product by slug
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch related products from same category
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .eq("status", "active")
    .neq("id", product.id)
    .limit(4);

  return (
    <main>
      <Navbar />
      <ProductDetailClient product={product} relatedProducts={relatedProducts || []} />
      <Footer />
    </main>
  );
}
