export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createSupabaseServiceRole } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature found" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      await handlePaymentFailed(failedPayment);
      break;

    case "payment_intent.canceled":
      const canceledPayment = event.data.object;
      console.log("PaymentIntent canceled:", canceledPayment.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const supabase = createSupabaseServiceRole();

  if (!supabase) {
    console.error("Service role client not available");
    return;
  }

  try {
    const metadata = paymentIntent.metadata;
    const userId = metadata.user_id;

    if (!userId) {
      console.error("No user_id in payment intent metadata");
      return;
    }

    // Parse shipping address from metadata
    const shippingAddress = JSON.parse(metadata.shipping_address || "{}");

    // Get cart items for order items creation
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        quantity,
        price_at_add,
        products (
          name,
          sku,
          primary_image_url
        )
      `
      )
      .eq("user_id", userId);

    if (cartError || !cartItems || cartItems.length === 0) {
      console.error("Error fetching cart items:", cartError);
      return;
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_email: metadata.customer_email,
        customer_name: metadata.customer_name,
        customer_phone: metadata.customer_phone || null,
        shipping_address_line1: shippingAddress.line1,
        shipping_address_line2: shippingAddress.line2 || null,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_zip: shippingAddress.zip,
        subtotal: parseFloat(metadata.subtotal),
        tax_amount: parseFloat(metadata.tax),
        shipping_cost: parseFloat(metadata.shipping),
        total_amount: parseFloat(metadata.total),
        payment_status: "paid",
        order_status: "processing",
        payment_intent_id: paymentIntent.id,
        customer_notes: metadata.customer_notes || null,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      return;
    }

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price_at_add,
      total_price: item.price_at_add * item.quantity,
      product_name: item.products?.name || "Unknown Product",
      product_sku: item.products?.sku || null,
      product_image_url: item.products?.primary_image_url || null,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError);
      return;
    }

    // Update product stock quantities
    for (const item of cartItems) {
      // Get current stock
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (product) {
        const newStock = product.stock_quantity - item.quantity;
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", item.product_id);

        if (stockError) {
          console.error("Error updating stock:", stockError);
        }
      }
    }

    // Clear user's cart
    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (clearCartError) {
      console.error("Error clearing cart:", clearCartError);
    }

    console.log(
      `Order ${order.id} created successfully for PaymentIntent ${paymentIntent.id}`
    );

    // TODO: Send order confirmation email
  } catch (error) {
    console.error("Error in handlePaymentIntentSucceeded:", error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log(`Payment failed for PaymentIntent ${paymentIntent.id}`);

  // If an order was already created, mark it as failed
  const supabase = createSupabaseServiceRole();

  if (!supabase) {
    console.error("Service role client not available");
    return;
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_intent_id", paymentIntent.id)
    .single();

  if (order) {
    await supabase
      .from("orders")
      .update({
        payment_status: "failed",
        order_status: "cancelled",
      })
      .eq("id", order.id);

    console.log(`Order ${order.id} marked as failed`);
  }
}
