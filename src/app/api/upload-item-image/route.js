import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const BUCKET = "items";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

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

  const { data: { user }, error } = await supabase.auth.getUser(token);
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

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "item";
}

/**
 * POST /api/upload-item-image
 *
 * multipart/form-data:
 *   file: <File>           required, image/png|jpeg|gif|webp, ≤ 5 MB
 *   name: string           optional, used to build a friendlier filename
 *
 * Returns: { url, path }
 *   url  → public URL to plug straight into items.image_path
 *   path → bucket-relative path, e.g. "items/<slug>-<rand>.png", also accepted
 *          by items.image_path (resolveItemImage() expands it)
 */
export async function POST(request) {
  const isAdmin = await verifyAdminToken(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const nameField = formData.get("name");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const slug = slugifyName(
      typeof nameField === "string" && nameField ? nameField : file.name,
    );
    const path = `${slug}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("upload-item-image storage error:", error);
      return NextResponse.json(
        { error: error.message || "Upload failed" },
        { status: 500 },
      );
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({
      url: urlData.publicUrl,
      path: `${BUCKET}/${path}`,
    });
  } catch (err) {
    console.error("upload-item-image error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
