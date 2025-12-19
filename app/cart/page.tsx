import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ShoppingCartClient from "@/components/shopping-cart-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/create-account");
  }

  // Fetch cart items with product details
  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      products (
        id,
        name,
        slug,
        primary_image_url,
        base_price,
        stock_quantity,
        status
      )
    `)
    .eq("user_id", session.user.id)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching cart:", error);
  }

  return (
    <main>
      <Navbar />
      <ShoppingCartClient cartItems={cartItems || []} />
      <Footer />
    </main>
  );
}
