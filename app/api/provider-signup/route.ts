import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import { sendEmailWithAttachment } from "@/lib/email";
import { createProviderSignatureSubmission } from "@/lib/docuseal";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// Helper function to generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  return `${nameWithoutExt}_${timestamp}_${random}${extension}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract form fields
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const suffix = formData.get("suffix") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const companyName = formData.get("companyName") as string;
    const businessType = formData.get("businessType") as string;
    const website = formData.get("website") as string;
    const taxIdEin = formData.get("taxIdEin") as string;
    const npiNumber = formData.get("npiNumber") as string;
    const npiOwnerMatches = formData.get("npiOwnerMatches") === "true";
    const hasResellersLicense = formData.get("hasResellersLicense") as string;
    const resellersPermitNumber = formData.get("resellersPermitNumber") as string;
    const addressLine1 = formData.get("addressLine1") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const referredBy = formData.get("referredBy") as string;
    const additionalNotes = formData.get("additionalNotes") as string;
    const marketingConsent = formData.get("marketingConsent") === "true";

    // Get files
    const resellersCertificateFile = formData.get("resellers_certificate") as File | null;
    const businessLicenseFile = formData.get("business_license") as File | null;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !companyName || !website || !taxIdEin || !npiNumber || !addressLine1 || !city || !state || !zipCode || !referredBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);


    // Check if email already exists in provider_accounts
    const supabase = await createSupabaseServiceRole();
    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to initialize database connection" },
        { status: 500 }
      );
    }

    const { data: existingProvider } = await supabase
      .from("provider_accounts")
      .select("email")
      .eq("email", email)
      .single();

    if (existingProvider) {
      return NextResponse.json(
        { error: "This email is already registered as a provider. Please use a different email or contact support." },
        { status: 400 }
      );
    }

    // Upload files to Supabase Storage (if provided)
    let resellersCertificateUrl: string | null = null;
    let businessLicenseUrl: string | null = null;

    // Upload Reseller's Certificate
    if (resellersCertificateFile) {
      const fileName = generateUniqueFilename(resellersCertificateFile.name);
      const fileBuffer = Buffer.from(await resellersCertificateFile.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("provider-documents")
        .upload(`resellers-certificates/${fileName}`, fileBuffer, {
          contentType: resellersCertificateFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading reseller's certificate:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload reseller's certificate. Please try again." },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("provider-documents")
        .getPublicUrl(uploadData.path);

      resellersCertificateUrl = publicUrlData.publicUrl;
    }

    // Upload Business License
    if (businessLicenseFile) {
      const fileName = generateUniqueFilename(businessLicenseFile.name);
      const fileBuffer = Buffer.from(await businessLicenseFile.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("provider-documents")
        .upload(`business-licenses/${fileName}`, fileBuffer, {
          contentType: businessLicenseFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading business license:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload business license. Please try again." },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("provider-documents")
        .getPublicUrl(uploadData.path);

      businessLicenseUrl = publicUrlData.publicUrl;
    }

    // Prepare data for database insertion
    const providerData = {
      first_name: firstName,
      last_name: lastName,
      suffix: suffix || null,
      email,
      phone,
      password_hash: passwordHash,
      company_name: companyName,
      business_type: businessType,
      website,
      tax_id_ein: taxIdEin,
      npi_number: npiNumber,
      npi_owner_matches: npiOwnerMatches,
      has_resellers_license: hasResellersLicense,
      resellers_permit_number: resellersPermitNumber || null,
      resellers_certificate_url: resellersCertificateUrl,
      address_line1: addressLine1,
      city,
      state,
      zip_code: zipCode,
      business_license_url: businessLicenseUrl,
      referred_by: referredBy,
      additional_notes: additionalNotes || null,
      status: "pending_signature",
      marketing_consent: marketingConsent,
      form_data: {
        firstName,
        lastName,
        suffix,
        email,
        phone,
        companyName,
        businessType,
        website,
        taxIdEin,
        npiNumber,
        npiOwnerMatches,
        hasResellersLicense,
        resellersPermitNumber,
        addressLine1,
        city,
        state,
        zipCode,
        referredBy,
        additionalNotes,
        marketingConsent,
      },
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
      user_agent: req.headers.get("user-agent") || null,
      signature_sent_at: new Date().toISOString(),
    };

    // Insert into database
    const { data: insertedProvider, error: insertError } = await supabase
      .from("provider_accounts")
      .insert([providerData])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting provider data:", insertError);
      return NextResponse.json(
        { error: "Failed to create provider account. Please try again." },
        { status: 500 }
      );
    }

    // ========================================
    // CREATE DOCUSEAL E-SIGNATURE SUBMISSION
    // ========================================
    // Replace manual PDF email with automated DocuSeal signature request
    const docuSealResult = await createProviderSignatureSubmission({
      email,
      firstName,
      lastName,
      companyName,
      phone,
      npiNumber,
      taxIdEin,
      addressLine1,
      city,
      state,
      zipCode,
    });

    if (!docuSealResult.success) {
      console.error("Failed to create DocuSeal submission:", docuSealResult.error);
      // Return error - signature submission is critical for the flow
      return NextResponse.json(
        { error: "Failed to create signature request. Please try again or contact support." },
        { status: 500 }
      );
    }

    // Update provider account with DocuSeal submission details
    const { error: docuSealUpdateError } = await supabase
      .from("provider_accounts")
      .update({
        status: "signature_sent",
        docuseal_submission_id: docuSealResult.submissionId?.toString(),
        docuseal_submitter_uuid: docuSealResult.submitterUuid,
        docuseal_submitter_slug: docuSealResult.submitterSlug,
        docuseal_signature_url: docuSealResult.signatureUrl,
        signature_sent_at: new Date().toISOString(),
      })
      .eq("id", insertedProvider.id);

    if (docuSealUpdateError) {
      console.error("Error updating provider with DocuSeal data:", docuSealUpdateError);
      // Don't fail the request - DocuSeal submission was successful
    }

    console.log(`DocuSeal signature request created successfully for: ${email}`, {
      submissionId: docuSealResult.submissionId,
      signatureUrl: docuSealResult.signatureUrl,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Provider application submitted successfully",
        providerId: insertedProvider.id,
        email: insertedProvider.email,
        signatureUrl: docuSealResult.signatureUrl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in provider signup:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
