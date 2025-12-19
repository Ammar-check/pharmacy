import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CheckoutClient from "@/components/checkout-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/create-account");
  }

  // Fetch cart items
  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      products (
        id,
        name,
        primary_image_url,
        stock_quantity
      )
    `)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Error fetching cart:", error);
  }

  // Redirect if cart is empty
  if (!cartItems || cartItems.length === 0) {
    redirect("/cart");
  }

  return (
    <main>
      <Navbar />
      <CheckoutClient cartItems={cartItems} userEmail={session.user.email || ""} />
      <Footer />
    </main>
  );
}
