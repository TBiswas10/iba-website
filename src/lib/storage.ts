import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function uploadImageToStorage(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();
  const uniqueFileName = `${Date.now()}-${fileName}`;
  const filePath = `gallery/${uniqueFileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from("gallery")
    .upload(filePath, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(`Failed to upload: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("gallery")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}