import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PaymentSuccessClient from "@/components/payment-success-client";
import PaymentProcessing from "@/components/payment-processing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    payment_intent?: string;
    payment_intent_client_secret?: string;
    redirect_status?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/create-account");
  }

  if (!params.payment_intent) {
    redirect("/products");
  }

  // Wait a bit for the webhook to process (if needed)
  // In production, you might want to poll or use a more sophisticated approach
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Fetch order details using payment_intent_id
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (
          name,
          primary_image_url
        )
      )
    `
    )
    .eq("payment_intent_id", params.payment_intent)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    // If order not found, show a loading/pending page
    return (
      <main>
        <Navbar />
        <PaymentProcessing />
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <PaymentSuccessClient
        order={order}
        sessionId={params.payment_intent}
      />
      <Footer />
    </main>
  );
}
