// app/api/form-submissions/route.ts
export const runtime = "nodejs"; // run this API in Node runtime to avoid Edge warnings for supabase-js

import { NextResponse } from "next/server";
import { createSupabaseRouteHandler } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // createSupabaseRouteHandler() is now async and returns a SupabaseClient
    const supabase = await createSupabaseRouteHandler();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session fetch error:", sessionError);
      return NextResponse.json({ error: "Failed to verify session." }, { status: 401 });
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body safely
    const { formType, formData, email } = (await req.json()) as {
      formType: string;
      formData: Record<string, any>;
      email?: string;
    };

    if (!formType || !formData) {
      return NextResponse.json({ error: "Missing formType or formData" }, { status: 400 });
    }

    // Sanitize form data (remove undefined / functions)
    const sanitizedFormData = JSON.parse(JSON.stringify(formData));

    // Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileError && (profileError as any).code !== "PGRST116") {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: (profileError as any).message || "Profile fetch failed" }, { status: 400 });
    }

    if (!profile) {
      const { error: insertProfileError } = await supabase.from("profiles").insert([
        {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || null,
          role: "user",
        },
      ]);

      if (insertProfileError) {
        console.error("Profile creation error:", insertProfileError);
        return NextResponse.json({ error: insertProfileError.message }, { status: 400 });
      }
    }

    // Insert form submission
    const { data: submissionData, error: insertError } = await supabase
      .from("form_submissions")
      .insert([
        {
          user_id: session.user.id,
          form_type: formType,
          form_data: sanitizedFormData,
          status: "submitted", // your schema supports `status` text column
        },
      ])
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Submission insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // Send email notifications (await to ensure completion before function terminates)
    await handleEmailNotifications({
      submissionId: submissionData.id,
      formType,
      formData: sanitizedFormData,
      sessionEmail: session.user.email,
      email,
    });

    return NextResponse.json({
      id: submissionData.id,
      created_at: submissionData.created_at,
      ok: true,
    });
  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

async function handleEmailNotifications({
  submissionId,
  formType,
  formData,
  sessionEmail,
  email,
}: {
  submissionId: string;
  formType: string;
  formData: Record<string, any>;
  sessionEmail?: string | null;
  email?: string;
}) {
  // Generate form data HTML once and reuse for both emails
  const formDataHtml = Object.entries(formData)
    .map(([key, value]) => `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${key}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`)
    .join('');

  // Prepare email sending promises
  const emailPromises: Promise<{ type: string; success: boolean; error?: any }>[] = [];

  // Send confirmation email to user
  const toUser = email || sessionEmail;
  if (toUser && isValidEmail(toUser)) {
    console.log(`Sending confirmation email to user: ${toUser}`);
    const userEmailPromise = sendEmail({
      to: toUser,
      subject: `Your ${formType} submission confirmation`,
      html: `
        <h2>Thank you for your submission!</h2>
        <p>Your form has been successfully submitted. Here's a copy of your responses:</p>
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          ${formDataHtml}
        </table>
        <p style="color: #666; font-size: 12px;">Submission ID: ${submissionId}</p>
        <p>If you have any questions, please contact us.</p>
      `,
    }).then(() => {
      console.log(`✓ Confirmation email sent successfully to: ${toUser}`);
      return { type: 'user', success: true };
    }).catch((error) => {
      console.error(`✗ Failed to send confirmation email to user: ${toUser}`, error);
      return { type: 'user', success: false, error };
    });
    emailPromises.push(userEmailPromise);
  } else if (toUser) {
    console.warn(`Invalid email format for user: ${toUser}`);
  }

  // Send notification to moderator with full details
  const moderatorEmail = process.env.MODERATOR_EMAIL || "hamzakamran843@gmail.com";
  console.log(`Sending notification email to moderator: ${moderatorEmail}`);
  const moderatorEmailPromise = sendEmail({
    to: moderatorEmail,
    subject: `New ${formType} form submission`,
    html: `
      <h2>New Form Submission</h2>
      <p><strong>Form Type:</strong> ${formType}</p>
      <p><strong>Submitted by:</strong> ${sessionEmail || "Unknown user"}</p>
      <p><strong>User's email:</strong> ${email || sessionEmail || "Not provided"}</p>
      <p><strong>Submission ID:</strong> ${submissionId}</p>

      <h3>Form Data:</h3>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        ${formDataHtml}
      </table>
    `,
  }).then(() => {
    console.log(`✓ Notification email sent successfully to moderator: ${moderatorEmail}`);
    return { type: 'moderator', success: true };
  }).catch((error) => {
    console.error(`✗ Failed to send notification email to moderator: ${moderatorEmail}`, error);
    return { type: 'moderator', success: false, error };
  });
  emailPromises.push(moderatorEmailPromise);

  // Send both emails in parallel for better performance
  try {
    const results = await Promise.allSettled(emailPromises);

    // Log summary of email sending results
    const summary = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return { success: false, error: result.reason };
    });

    console.log('Email sending summary:', summary);

    // Log environment info if any email failed
    if (summary.some(s => !s.success)) {
      console.error("Environment check:", {
        hasSmtpEmail: !!process.env.SMTP_EMAIL,
        hasSmtpPassword: !!process.env.SMTP_PASSWORD,
        smtpService: process.env.SMTP_SERVICE,
        moderatorEmail: process.env.MODERATOR_EMAIL,
      });
    }
  } catch (error) {
    console.error("Unexpected error in email notification handling:", error);
    // Don't throw - we don't want to fail the submission if email fails
  }
}

// Email validation helper function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
