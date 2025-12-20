import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRole } from "@/lib/supabase/server";
import { sendEmailWithAttachment } from "@/lib/email";
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

    // Send email with MedConnect_Provider_Terms_Form.pdf attachment
    try {
      const dummyFormPath = path.join(process.cwd(), "public", "MedConnect_Provider_Terms_Form.pdf");

      // Check if file exists
      if (!fs.existsSync(dummyFormPath)) {
        console.error("MedConnect_Provider_Terms_Form.pdf not found at:", dummyFormPath);
      }

      // Prepare email content
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .info-box { background-color: white; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; border-radius: 4px; }
            h1 { margin: 0; font-size: 24px; }
            h2 { color: #2563eb; font-size: 18px; margin-top: 20px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MedConnect Provider Application</h1>
            </div>
            <div class="content">
              <p>Dear ${firstName} ${lastName},</p>

              <p>Thank you for submitting your provider application to <strong>MedConnect</strong>! We're excited to begin the onboarding process with you.</p>

              <div class="info-box">
                <h2>Next Steps - Action Required</h2>
                <p>To complete your application, please follow these important steps:</p>
                <ol>
                  <li><strong>Review the Attached Agreement:</strong> We've attached a provider agreement form (PDF) to this email. Please read it carefully to understand the terms and conditions of our partnership.</li>
                  <li><strong>Sign the Agreement:</strong> Print the form, sign it with all required credentials (name, date, signature), and scan or photograph the completed document.</li>
                  <li><strong>Return the Signed Document:</strong> Reply to this email with the signed agreement attached, or upload it through your provider portal.</li>
                </ol>
              </div>

              <div class="info-box">
                <h2>Application Summary</h2>
                <ul>
                  <li><strong>Applicant:</strong> ${firstName} ${lastName} ${suffix || ""}</li>
                  <li><strong>Company:</strong> ${companyName}</li>
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Phone:</strong> ${phone}</li>
                  <li><strong>NPI Number:</strong> ${npiNumber}</li>
                  <li><strong>Application Status:</strong> Pending Signature</li>
                </ul>
              </div>

              <p><strong>Important:</strong> Your account will be activated once we receive your signed agreement. This typically takes 1-2 business days after submission.</p>

              <p>If you have any questions or need assistance, please don't hesitate to contact our provider support team.</p>

              <p>Best regards,<br>
              <strong>MedConnect Provider Relations Team</strong></p>
            </div>
            <div class="footer">
              <p>MedConnect | Provider Services</p>
              <p>This is an automated message. Please do not reply directly to this email.</p>
              <p>&copy; ${new Date().getFullYear()} MedConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email with attachment
      await sendEmailWithAttachment({
        to: email,
        subject: "MedConnect Provider Application - Action Required: Sign Agreement",
        html: emailHtml,
        attachments: fs.existsSync(dummyFormPath)
          ? [
            {
              filename: "Provider_Agreement_Form.pdf",
              path: dummyFormPath,
            },
          ]
          : [],
      });

      console.log(`Provider signup email sent successfully to: ${email}`);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request if email fails - the data is already saved
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Provider application submitted successfully",
        providerId: insertedProvider.id,
        email: insertedProvider.email,
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
