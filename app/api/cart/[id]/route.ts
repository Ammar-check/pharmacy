// app/api/cart/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabase/server";

// PUT - Update cart item quantity
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseRouteHandler();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Verify the cart item belongs to the user
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // Update quantity
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating cart item:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ cart_item: data });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Remove item from cart
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseRouteHandler();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the cart item (RLS will ensure user owns it)
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error removing cart item:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
