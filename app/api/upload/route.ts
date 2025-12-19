// app/api/upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { uploadFileToStorage, validateImageFile, validateFileSize } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    // Check admin gate cookie
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const adminGate = cookieStore.get("admin_gate")?.value;

    if (adminGate !== "ok") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!validateImageFile(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const fileUrl = await uploadFileToStorage(buffer, file.name, file.type);

    return NextResponse.json(
      {
        success: true,
        url: fileUrl,
        message: "File uploaded successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
