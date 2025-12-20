import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get provider from database
    const supabase = await createSupabaseServiceRole();
    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to initialize database connection" },
        { status: 500 }
      );
    }

    const { data: provider, error: fetchError } = await supabase
      .from("provider_accounts")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !provider) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if provider has a password set
    if (!provider.password_hash) {
      return NextResponse.json(
        { error: "Password not set for this account. Please contact support." },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, provider.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check provider status
    if (provider.status === "rejected") {
      return NextResponse.json(
        { error: "Your provider account has been rejected. Please contact support." },
        { status: 403 }
      );
    }

    if (provider.status === "suspended") {
      return NextResponse.json(
        { error: "Your provider account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Check for pending_signature status
    if (provider.status === "pending_signature") {
      return NextResponse.json(
        {
          success: false,
          pending_signature: true,
          email: provider.email,
          error: "Your document signature is pending. Please sign and return the agreement form sent to your email.",
        },
        { status: 403 }
      );
    }

    // Return success with provider data (excluding sensitive information)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        provider: {
          id: provider.id,
          email: provider.email,
          firstName: provider.first_name,
          lastName: provider.last_name,
          companyName: provider.company_name,
          status: provider.status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in provider login:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
