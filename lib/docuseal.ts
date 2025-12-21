/**
 * DocuSeal API Service
 * Handles all interactions with DocuSeal API for e-signature automation
 */

const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || "https://api.docuseal.com";
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY;
const DOCUSEAL_TEMPLATE_SLUG = process.env.DOCUSEAL_TEMPLATE_SLUG;
const DOCUSEAL_WEBHOOK_SECRET = process.env.DOCUSEAL_WEBHOOK_SECRET;

export interface DocuSealSubmitter {
    email: string;
    name?: string;
    role?: string;
    phone?: string;
    send_email?: boolean;
    send_sms?: boolean;
    values?: Record<string, string | number | boolean>;
    metadata?: Record<string, any>;
}

export interface DocuSealSubmission {
    template_id?: string;
    template_slug?: string;
    send_email?: boolean;
    order?: "preserved" | "random";
    completed_redirect_url?: string;
    submitters: DocuSealSubmitter[];
}

export interface DocuSealWebhookPayload {
    event_type: "submission.created" | "submission.completed" | "submission.expired" | "submission.archived";
    timestamp: string;
    data: {
        id: number;
        status: "pending" | "completed" | "declined" | "expired";
        submitters: Array<{
            id: number;
            uuid: string;
            email: string;
            slug: string;
            status: "completed" | "declined" | "opened" | "sent" | "awaiting";
            sent_at: string | null;
            opened_at: string | null;
            completed_at: string | null;
            declined_at: string | null;
            documents: Array<{
                name: string;
                url: string;
            }>;
        }>;
        audit_log_url: string | null;
        completed_at: string | null;
    };
}

/**
 * Create a signature submission for a provider
 */
export async function createProviderSignatureSubmission(providerData: {
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    phone: string;
    npiNumber: string;
    taxIdEin: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
}): Promise<{
    success: boolean;
    submissionId?: number;
    submitterUuid?: string;
    submitterSlug?: string;
    signatureUrl?: string;
    error?: string;
}> {
    try {
        if (!DOCUSEAL_API_KEY) {
            throw new Error("DOCUSEAL_API_KEY not configured");
        }

        if (!DOCUSEAL_TEMPLATE_SLUG) {
            throw new Error("DOCUSEAL_TEMPLATE_SLUG not configured");
        }

        const submissionPayload: DocuSealSubmission = {
            template_slug: DOCUSEAL_TEMPLATE_SLUG,
            send_email: true,
            order: "preserved",
            completed_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/provider-signature-complete`,
            submitters: [
                {
                    email: providerData.email,
                    name: `${providerData.firstName} ${providerData.lastName}`,
                    role: "Provider",
                    phone: providerData.phone,
                    send_email: true,
                    values: {
                        // Pre-fill form fields in the PDF template
                        "Provider Name": `${providerData.firstName} ${providerData.lastName}`,
                        "Company Name": providerData.companyName,
                        "Email": providerData.email,
                        "Phone": providerData.phone,
                        "NPI Number": providerData.npiNumber,
                        "Tax ID/EIN": providerData.taxIdEin,
                        "Address": providerData.addressLine1,
                        "City": providerData.city,
                        "State": providerData.state,
                        "ZIP Code": providerData.zipCode,
                    },
                    metadata: {
                        provider_signup: true,
                        company_name: providerData.companyName,
                    },
                },
            ],
        };

        const response = await fetch(`${DOCUSEAL_API_URL}/submissions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Auth-Token": DOCUSEAL_API_KEY,
            },
            body: JSON.stringify(submissionPayload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("DocuSeal API error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
            });
            throw new Error(`DocuSeal API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();

        // Extract submitter information
        const submitter = result.submitters?.[0];
        if (!submitter) {
            throw new Error("No submitter returned from DocuSeal");
        }

        // Construct signature URL
        const signatureUrl = `https://docuseal.com/s/${submitter.slug}`;

        return {
            success: true,
            submissionId: result.id,
            submitterUuid: submitter.uuid,
            submitterSlug: submitter.slug,
            signatureUrl,
        };
    } catch (error: any) {
        console.error("Error creating DocuSeal submission:", error);
        return {
            success: false,
            error: error.message || "Failed to create signature submission",
        };
    }
}

/**
 * Get submission status from DocuSeal
 */
export async function getSubmissionStatus(submissionId: number): Promise<{
    success: boolean;
    status?: string;
    submitters?: any[];
    error?: string;
}> {
    try {
        if (!DOCUSEAL_API_KEY) {
            throw new Error("DOCUSEAL_API_KEY not configured");
        }

        const response = await fetch(`${DOCUSEAL_API_URL}/submissions/${submissionId}`, {
            method: "GET",
            headers: {
                "X-Auth-Token": DOCUSEAL_API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error(`DocuSeal API error: ${response.status}`);
        }

        const result = await response.json();

        return {
            success: true,
            status: result.status,
            submitters: result.submitters,
        };
    } catch (error: any) {
        console.error("Error getting DocuSeal submission status:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Validate webhook signature for security
 */
export function validateWebhookSignature(payload: string, signature: string): boolean {
    try {
        if (!DOCUSEAL_WEBHOOK_SECRET) {
            console.warn("DOCUSEAL_WEBHOOK_SECRET not configured - webhook validation skipped");
            return true; // Allow if secret not configured (development mode)
        }

        // DocuSeal uses HMAC-SHA256 for webhook signatures
        const crypto = require("crypto");
        const hmac = crypto.createHmac("sha256", DOCUSEAL_WEBHOOK_SECRET);
        hmac.update(payload);
        const expectedSignature = hmac.digest("hex");

        return signature === expectedSignature;
    } catch (error) {
        console.error("Error validating webhook signature:", error);
        return false;
    }
}

/**
 * Parse and process webhook payload
 */
export function parseWebhookPayload(body: any): DocuSealWebhookPayload | null {
    try {
        // Validate required fields
        if (!body.event_type || !body.data) {
            console.error("Invalid webhook payload: missing required fields");
            return null;
        }

        return body as DocuSealWebhookPayload;
    } catch (error) {
        console.error("Error parsing webhook payload:", error);
        return null;
    }
}
