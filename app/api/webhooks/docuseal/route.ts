import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import { validateWebhookSignature, parseWebhookPayload } from "@/lib/docuseal";
import type { DocuSealWebhookPayload } from "@/lib/docuseal";

export const runtime = "nodejs";

/**
 * DocuSeal Webhook Handler
 * Processes signature lifecycle events from DocuSeal
 * Events: submission.created, submission.completed, submission.expired, submission.archived
 */
export async function POST(req: NextRequest) {
    try {
        // Get raw body for signature validation
        const rawBody = await req.text();
        const signature = req.headers.get("x-docuseal-signature") || "";

        // Validate webhook signature for security
        const isValid = validateWebhookSignature(rawBody, signature);
        if (!isValid) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // Parse webhook payload
        const body = JSON.parse(rawBody);
        const payload = parseWebhookPayload(body);

        if (!payload) {
            console.error("Invalid webhook payload");
            return NextResponse.json(
                { error: "Invalid payload" },
                { status: 400 }
            );
        }

        console.log(`DocuSeal webhook received: ${payload.event_type}`, {
            submissionId: payload.data.id,
            status: payload.data.status,
        });

        // Initialize Supabase client
        const supabase = await createSupabaseServiceRole();
        if (!supabase) {
            console.error("Failed to initialize Supabase");
            return NextResponse.json(
                { error: "Database connection failed" },
                { status: 500 }
            );
        }

        // Process webhook event
        await processWebhookEvent(supabase, payload);

        // Return success response
        return NextResponse.json(
            { success: true, event: payload.event_type },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error processing DocuSeal webhook:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Process webhook event and update provider account
 */
async function processWebhookEvent(
    supabase: any,
    payload: DocuSealWebhookPayload
) {
    const { event_type, data } = payload;
    const submissionId = data.id;
    const submitter = data.submitters[0]; // Get first submitter (provider)

    if (!submitter) {
        console.error("No submitter found in webhook payload");
        return;
    }

    // Find provider account by DocuSeal submission ID or email
    const { data: provider, error: fetchError } = await supabase
        .from("provider_accounts")
        .select("*")
        .or(`docuseal_submission_id.eq.${submissionId},email.eq.${submitter.email}`)
        .single();

    if (fetchError || !provider) {
        console.error("Provider not found for DocuSeal submission:", {
            submissionId,
            email: submitter.email,
            error: fetchError,
        });
        return;
    }

    // Prepare update data based on event type
    let updateData: any = {
        updated_at: new Date().toISOString(),
    };

    switch (event_type) {
        case "submission.created":
            updateData = {
                ...updateData,
                status: "signature_sent",
                docuseal_submission_id: submissionId.toString(),
                docuseal_submitter_uuid: submitter.uuid,
                docuseal_submitter_slug: submitter.slug,
                docuseal_signature_url: `https://docuseal.com/s/${submitter.slug}`,
                signature_sent_at: new Date().toISOString(),
            };
            console.log(`Signature request sent to: ${submitter.email}`);
            break;

        case "submission.completed":
            // Get signed document URL
            const signedDocumentUrl = submitter.documents?.[0]?.url || null;
            const auditLogUrl = data.audit_log_url || null;

            updateData = {
                ...updateData,
                status: "signature_received",
                signature_completed_at: submitter.completed_at || new Date().toISOString(),
                docuseal_signed_document_url: signedDocumentUrl,
                docuseal_audit_log_url: auditLogUrl,
            };

            // Track if signature was opened before completion
            if (submitter.opened_at && !provider.signature_opened_at) {
                updateData.signature_opened_at = submitter.opened_at;
            }

            console.log(`Signature completed by: ${submitter.email}`);

            // TODO: Send notification email to admin about completed signature
            // TODO: Optionally send confirmation email to provider
            break;

        case "submission.expired":
            updateData = {
                ...updateData,
                status: "signature_expired",
                signature_expired_at: new Date().toISOString(),
            };
            console.log(`Signature request expired for: ${submitter.email}`);

            // TODO: Send notification to provider about expiration
            break;

        case "submission.archived":
            console.log(`Submission archived: ${submissionId}`);
            // No status change needed for archived submissions
            return;

        default:
            console.log(`Unhandled event type: ${event_type}`);
            return;
    }

    // Track signature opened event (if status changed from sent to opened)
    if (
        submitter.status === "opened" &&
        !provider.signature_opened_at &&
        provider.status === "signature_sent"
    ) {
        updateData.status = "signature_opened";
        updateData.signature_opened_at = submitter.opened_at || new Date().toISOString();
    }

    // Track signature declined event
    if (submitter.status === "declined") {
        updateData.status = "signature_declined";
        updateData.signature_declined_at = submitter.declined_at || new Date().toISOString();
    }

    // Update provider account
    const { error: updateError } = await supabase
        .from("provider_accounts")
        .update(updateData)
        .eq("id", provider.id);

    if (updateError) {
        console.error("Error updating provider account:", updateError);
        throw updateError;
    }

    console.log(`Provider account updated successfully:`, {
        providerId: provider.id,
        email: provider.email,
        newStatus: updateData.status,
        event: event_type,
    });
}
