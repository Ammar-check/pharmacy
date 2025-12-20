// app/api/cart/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabase/server";

// GET - Fetch user's cart items
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate cart total
    const total = cartItems?.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0) || 0;

    return NextResponse.json({
      cart_items: cartItems || [],
      item_count: cartItems?.length || 0,
      total: total.toFixed(2)
    });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST - Add item to cart
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

    const body = await req.json();
    const { product_id, productName, price, quantity, selected_variant, price_at_add, formType, formSubmissionId, prescriptionDetails } = body;

    // Handle prescription medication (custom item without product_id)
    if (!product_id && productName && price !== undefined) {
      if (!quantity || quantity < 1) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }

      // Add prescription medication as custom cart item
      const { data, error } = await supabase
        .from("cart_items")
        .insert([
          {
            user_id: session.user.id,
            product_id: null,
            custom_product_name: productName,
            quantity,
            price_at_add: price,
            selected_variant: JSON.stringify({
              formType,
              formSubmissionId,
              prescriptionDetails
            })
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding prescription to cart:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ cart_item: data, message: "Prescription added to cart" }, { status: 201 });
    }

    // Handle regular product
    if (!product_id || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 });
    }

    // Check if product exists and is active
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, base_price, stock_quantity, status")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.status !== "active") {
      return NextResponse.json({ error: "Product is not available" }, { status: 400 });
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("product_id", product_id)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating cart item:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ cart_item: data, message: "Cart updated" });
    } else {
      // Add new item to cart
      const { data, error } = await supabase
        .from("cart_items")
        .insert([
          {
            user_id: session.user.id,
            product_id,
            quantity,
            selected_variant: selected_variant || null,
            price_at_add: price_at_add || product.base_price,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding to cart:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ cart_item: data, message: "Added to cart" }, { status: 201 });
    }
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Clear entire cart
export async function DELETE(req: Request) {
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

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error clearing cart:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Cart cleared successfully" });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
