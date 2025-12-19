import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import OrderConfirmationClient from "@/components/order-confirmation-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/create-account");
  }

  if (!order_id) {
    redirect("/products");
  }

  // Fetch order details
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          primary_image_url
        )
      )
    `)
    .eq("id", order_id)
    .eq("user_id", session.user.id)
    .single();

  if (error || !order) {
    redirect("/products");
  }

  return (
    <main>
      <Navbar />
      <OrderConfirmationClient order={order} />
      <Footer />
    </main>
  );
}
