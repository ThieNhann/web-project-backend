import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || "profile-avatars";

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - The file content as buffer
 * @param {string} originalFilename - Original filename
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{publicUrl: string, path: string}>}
 */
export async function uploadFile(fileBuffer, originalFilename, mimeType) {
  try {
    // Generate unique filename
    const fileExtension = originalFilename.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `avatars/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      publicUrl: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading file to Supabase:", error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - The path of the file in Supabase Storage
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting file from Supabase:", error);
    throw error;
  }
}

/**
 * Get public URL for a file
 * @param {string} filePath - The path of the file in Supabase Storage
 * @returns {string} Public URL
 */
export function getPublicUrl(filePath) {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

export default supabase;
