// app/api/products/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabase/server";

// GET - Fetch all products (with optional filters)
export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseRouteHandler();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status") || "active";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }

    if (featured === "true") {
      query = query.eq("featured", true);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new product (Admin only)
export async function POST(req: Request) {
  try {
    // Check admin gate cookie
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const adminGate = cookieStore.get("admin_gate")?.value;

    if (adminGate !== "ok") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const productData = await req.json();

    // Validate required fields
    if (!productData.name || !productData.base_price || productData.stock_quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields: name, base_price, stock_quantity" }, { status: 400 });
    }

    // Generate slug if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Use service role to insert
    const { createSupabaseServiceRole } = await import("@/lib/supabase/server");
    const supabase = createSupabaseServiceRole();

    if (!supabase) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
