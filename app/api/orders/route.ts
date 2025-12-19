// app/api/orders/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabase/server";

// GET - Fetch user's orders
export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseRouteHandler();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch orders with order items
    const { data: orders, error } = await supabase
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
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new order from cart
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseRouteHandler();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderData = await req.json();

    // Validate required fields
    if (!orderData.customer_email || !orderData.customer_name || !orderData.shipping_address_line1) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (
          id,
          name,
          sku,
          primary_image_url,
          stock_quantity
        )
      `)
      .eq("user_id", session.user.id);

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0);
    const taxAmount = orderData.tax_amount || 0;
    const shippingCost = orderData.shipping_cost || 0;
    const discountAmount = orderData.discount_amount || 0;
    const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: session.user.id,
          customer_email: orderData.customer_email,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone || null,
          shipping_address_line1: orderData.shipping_address_line1,
          shipping_address_line2: orderData.shipping_address_line2 || null,
          shipping_city: orderData.shipping_city,
          shipping_state: orderData.shipping_state,
          shipping_zip: orderData.shipping_zip,
          shipping_country: orderData.shipping_country || "USA",
          billing_same_as_shipping: orderData.billing_same_as_shipping !== false,
          subtotal,
          tax_amount: taxAmount,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          payment_method: orderData.payment_method || "pending",
          customer_notes: orderData.customer_notes || null,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    // Create order items from cart
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      product_sku: item.products.sku || "",
      product_image_url: item.products.primary_image_url || null,
      selected_variant: item.selected_variant,
      quantity: item.quantity,
      unit_price: item.price_at_add,
      total_price: item.price_at_add * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    // Clear cart after successful order
    await supabase.from("cart_items").delete().eq("user_id", session.user.id);

    return NextResponse.json({
      order,
      message: "Order created successfully",
    }, { status: 201 });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
