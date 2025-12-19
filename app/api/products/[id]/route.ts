// app/api/products/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabase/server";

// GET - Fetch single product by ID or slug
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseRouteHandler();

    // Try to fetch by ID first, then by slug
    let query = supabase.from("products").select("*");

    // Check if id is UUID format or slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(id)) {
      query = query.eq("id", id);
    } else {
      query = query.eq("slug", id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: data });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

// PUT - Update product (Admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin gate cookie
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const adminGate = cookieStore.get("admin_gate")?.value;

    if (adminGate !== "ok") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    const productData = await req.json();

    // Use service role to update
    const { createSupabaseServiceRole } = await import("@/lib/supabase/server");
    const supabase = createSupabaseServiceRole();

    if (!supabase) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete product (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin gate cookie
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const adminGate = cookieStore.get("admin_gate")?.value;

    if (adminGate !== "ok") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    // Use service role to delete
    const { createSupabaseServiceRole } = await import("@/lib/supabase/server");
    const supabase = createSupabaseServiceRole();

    if (!supabase) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
