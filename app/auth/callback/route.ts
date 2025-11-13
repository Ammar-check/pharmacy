import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  // If no code is provided, redirect to home
  if (!code) {
    console.error("No verification code provided");
    return NextResponse.redirect(`${origin}/`);
  }

  try {
    const supabase = await createSupabaseRouteHandler();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // Log any errors for debugging
    if (error) {
      console.error("Email verification error:", error.message, error.code);
      // Redirect to home page with error info
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`);
    }

    // Check if user exists
    if (!data.user) {
      console.error("No user data returned from session exchange");
      return NextResponse.redirect(`${origin}/?error=verification_failed`);
    }

    // Create or update user profile in profiles table
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
      role: "user",
    });

    console.log("Email verified successfully for user:", data.user.email);

    // Redirect to email verification success page
    return NextResponse.redirect(`${origin}/email-verified`);
  } catch (err) {
    console.error("Unexpected error during email verification:", err);
    return NextResponse.redirect(`${origin}/?error=unexpected_error`);
  }
}
