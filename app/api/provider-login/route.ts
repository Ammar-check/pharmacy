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

    // Check for pending_signature, signature_sent, or signature_opened status
    if (["pending_signature", "signature_sent", "signature_opened"].includes(provider.status)) {
      return NextResponse.json(
        {
          success: false,
          pending_signature: true,
          email: provider.email,
          signatureUrl: provider.docuseal_signature_url,
          error: provider.status === "pending_signature"
            ? "Your document signature is pending. Please check your email for the signature link."
            : "Your document signature is pending. Please complete the electronic signature form sent to your email.",
        },
        { status: 403 }
      );
    }

    // Check for signature_declined status
    if (provider.status === "signature_declined") {
      return NextResponse.json(
        {
          error: "You have declined the provider agreement. Please contact support if you wish to reapply.",
        },
        { status: 403 }
      );
    }

    // Check for signature_expired status
    if (provider.status === "signature_expired") {
      return NextResponse.json(
        {
          error: "Your signature request has expired. Please contact support to receive a new signature link.",
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
