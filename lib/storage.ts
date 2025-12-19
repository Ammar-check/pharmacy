// lib/storage.ts (formerly s3.ts)
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = "product-images"; // Supabase storage bucket name

/**
 * Upload a file to Supabase Storage
 * @param file - File buffer
 * @param fileName - Name of the file
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadFileToStorage(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `products/${timestamp}-${sanitizedFileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw new Error(error.message);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param fileUrl - Full public URL of the file
 */
export async function deleteFileFromStorage(fileUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
    const filePath = pathParts[1];

    if (!filePath) {
      throw new Error("Invalid file URL");
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error("Error deleting from Supabase Storage:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error deleting file from storage:", error);
    throw error;
  }
}

/**
 * Validate file type for product images
 */
export function validateImageFile(contentType: string): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  return allowedTypes.includes(contentType);
}

/**
 * Validate file size (max 5MB)
 */
export function validateFileSize(sizeInBytes: number): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return sizeInBytes <= maxSize;
}
