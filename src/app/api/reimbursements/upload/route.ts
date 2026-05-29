import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from("receipts")
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      if ((error as any)?.message?.includes("bucket") || (error as any)?.statusCode === 404) {
        await supabase.storage.createBucket("receipts", { public: true, allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf"] });
        const retry = await supabase.storage.from("receipts").upload(fileName, file, { contentType: file.type });
        if (retry.error) return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
      } else {
        return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
      }
    }

    const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(fileName);

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch {
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
