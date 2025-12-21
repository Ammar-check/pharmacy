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

    // STEP 1: Check if email exists in database
    const { data: provider, error: fetchError } = await supabase
      .from("provider_accounts")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !provider) {
      return NextResponse.json(
        {
          error: "No account found with this email. Please sign up first or check your email address.",
          errorType: "email_not_found"
        },
        { status: 404 }
      );
    }

    // STEP 2: Verify password
    if (!provider.password_hash) {
      return NextResponse.json(
        { error: "Password not set for this account. Please contact support." },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, provider.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: "Incorrect password. Please try again.",
          errorType: "invalid_password"
        },
        { status: 401 }
      );
    }

    // STEP 3: Check signature status in database
    console.log(`Login attempt for ${email} - Status: ${provider.status}`);

    // Pending signature - signature request not sent yet, block login
    if (provider.status === "pending_signature") {
      return NextResponse.json(
        {
          success: false,
          statusType: "pending_signature",
          email: provider.email,
          message: "Email verified. Account setup in progress.",
          error: "Your account is being set up. Please wait for the signature request email. This usually takes a few minutes.",
        },
        { status: 403 }
      );
    }

    // Signature declined
    if (provider.status === "signature_declined") {
      return NextResponse.json(
        {
          success: false,
          statusType: "signature_declined",
          email: provider.email,
          message: "Email verified. Signature declined.",
          error: "You declined the provider agreement. Please contact support at support@medconnect.com if you wish to reapply.",
        },
        { status: 403 }
      );
    }

    // Signature expired
    if (provider.status === "signature_expired") {
      return NextResponse.json(
        {
          success: false,
          statusType: "signature_expired",
          email: provider.email,
          message: "Email verified. Signature link expired.",
          error: "Your signature request has expired. Please contact support at support@medconnect.com to receive a new signature link.",
        },
        { status: 403 }
      );
    }


    // Account rejected by admin
    if (provider.status === "rejected") {
      return NextResponse.json(
        {
          success: false,
          statusType: "rejected",
          email: provider.email,
          message: "Email verified. Account rejected.",
          error: "Your provider account application has been rejected. Please contact support at support@medconnect.com for more information.",
        },
        { status: 403 }
      );
    }

    // Account suspended
    if (provider.status === "suspended") {
      return NextResponse.json(
        {
          success: false,
          statusType: "suspended",
          email: provider.email,
          message: "Email verified. Account suspended.",
          error: "Your provider account has been suspended. Please contact support at support@medconnect.com for assistance.",
        },
        { status: 403 }
      );
    }

    // STEP 4: Allow login for valid statuses (signature_sent and beyond)
    const allowedStatuses = [
      "signature_sent",      // ✅ Email sent - can login
      "signature_opened",    // ✅ User opened form - can login
      "signature_received",  // ✅ Signature completed - can login
      "approved",           // ✅ Admin approved - can login
      "active"              // ✅ Account active - can login
    ];

    if (allowedStatuses.includes(provider.status)) {
      console.log(`✅ Successful login for ${email} - Status: ${provider.status}`);

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
    }

    // Unknown status
    return NextResponse.json(
      {
        success: false,
        statusType: "unknown",
        email: provider.email,
        message: "Email verified. Unknown account status.",
        error: `Account status: ${provider.status}. Please contact support at support@medconnect.com for assistance.`,
      },
      { status: 403 }
    );

  } catch (error: any) {
    console.error("Error in provider login:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
