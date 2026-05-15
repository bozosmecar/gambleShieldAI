import { randomUUID } from "node:crypto";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

// MIME → canonical extension. The filename's extension is ignored.
export const ALLOWED_IMAGE_TYPES = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
});

// SVG is intentionally not on the list: it can carry <script>/<foreignObject>
// and would be served as image/svg+xml from a public Supabase bucket.

/**
 * Verify magic bytes match the declared MIME. The browser-supplied `file.type`
 * is attacker-controlled, so we re-check the actual bytes.
 *
 * @param {Buffer} buf
 * @param {string} mime
 * @returns {boolean}
 */
export function magicBytesMatch(buf, mime) {
  if (!buf || buf.length < 12) return false;

  switch (mime) {
    case "image/jpeg":
      // FF D8 FF
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case "image/png":
      // 89 50 4E 47 0D 0A 1A 0A
      return (
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47 &&
        buf[4] === 0x0d &&
        buf[5] === 0x0a &&
        buf[6] === 0x1a &&
        buf[7] === 0x0a
      );
    case "image/gif":
      // "GIF87a" or "GIF89a"
      return (
        buf[0] === 0x47 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x38 &&
        (buf[4] === 0x37 || buf[4] === 0x39) &&
        buf[5] === 0x61
      );
    case "image/webp":
      // "RIFF" .... "WEBP"
      return (
        buf[0] === 0x52 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x46 &&
        buf[8] === 0x57 &&
        buf[9] === 0x45 &&
        buf[10] === 0x42 &&
        buf[11] === 0x50
      );
    default:
      return false;
  }
}

/**
 * Validate a File from FormData and return a server-trusted buffer + extension.
 * Returns `{ ok: false, status, error }` on failure (suitable for NextResponse.json).
 *
 * @param {unknown} file
 * @returns {Promise<
 *   | { ok: true, buffer: Buffer, ext: string, mime: keyof typeof ALLOWED_IMAGE_TYPES }
 *   | { ok: false, status: number, error: string }
 * >}
 */
export async function validateImageUpload(file) {
  if (!file || typeof file !== "object" || !(file instanceof File)) {
    return { ok: false, status: 400, error: "No file provided" };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, status: 400, error: "File too large (max 5MB)" };
  }
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return {
      ok: false,
      status: 400,
      error: "Invalid file type. Use JPEG, PNG, GIF, or WebP.",
    };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!magicBytesMatch(buffer, file.type)) {
    return {
      ok: false,
      status: 400,
      error: "File content does not match its declared image type.",
    };
  }
  return { ok: true, buffer, ext, mime: file.type };
}

/**
 * Slug-safe filename component (a-z, 0-9, -). Returns "" for empty/invalid input.
 *
 * @param {unknown} name
 * @returns {string}
 */
export function slugifyFilename(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Build a random, slug-prefixed path inside a bucket: "<slug>-<rand>.<ext>".
 * @param {string} slug
 * @param {string} ext
 */
export function buildStoragePath(slug, ext) {
  const rand = randomUUID().replace(/-/g, "").slice(0, 12);
  const base = slug || "image";
  return `${base}-${rand}.${ext}`;
}
