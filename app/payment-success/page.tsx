import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PaymentSuccessClient from "@/components/payment-success-client";
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
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Processing Your Order...
              </h1>
              <p className="text-xl text-gray-600">
                Please wait while we confirm your payment.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
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
