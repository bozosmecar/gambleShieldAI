import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PROTECTED_PATHS = ["/admin"];

function isProtectedPath(pathname) {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Read the Supabase access token from cookies (set by @supabase/ssr or manual cookie storage)
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch =
    cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/) ||
    cookieHeader.match(/supabase-auth-token=([^;]+)/);

  if (!tokenMatch) {
    // No auth cookie found – redirect to login.
    // Note: if the app uses localStorage (not cookies) for session storage,
    // upgrade to @supabase/ssr with createBrowserClient for full middleware support.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const rawToken = decodeURIComponent(tokenMatch[1]);
    let accessToken = rawToken;

    // Supabase stores the token as a JSON array [access_token, refresh_token]
    if (rawToken.startsWith("[")) {
      const parsed = JSON.parse(rawToken);
      accessToken = Array.isArray(parsed) ? parsed[0] : rawToken;
    } else if (rawToken.startsWith("{")) {
      const parsed = JSON.parse(rawToken);
      accessToken = parsed.access_token ?? rawToken;
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error } = await admin.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: profile } = await admin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
