import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  buildStoragePath,
  validateImageUpload,
} from "@/lib/imageUpload";

const BUCKET = "photos";

export const runtime = "nodejs";

async function verifyAdminToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return false;

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}

export async function POST(request) {
  const isAdmin = await verifyAdminToken(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    const validation = await validateImageUpload(file);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status },
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const path = `blog/${buildStoragePath("img", validation.ext)}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, validation.buffer, {
        contentType: validation.mime,
        upsert: false,
      });

    if (error) {
      console.error("upload-blog-image storage error");
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    console.error("upload-blog-image error");
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
