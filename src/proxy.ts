import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages that pending_consent users CAN access
const CONSENT_ALLOWED_PATHS = [
  "/consent-pending",
  "/api/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-type",
  "Access-Control-Max-Age": "86400",
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS preflight for API routes
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // COPPA consent gate: block pending_consent users from app pages
  if (authUser) {
    const pathname = request.nextUrl.pathname;
    const isAllowed = CONSENT_ALLOWED_PATHS.some((p) => pathname.startsWith(p));

    if (!isAllowed) {
      // Check user status — use a lightweight query via the anon key
      // (RLS will scope to the authenticated user's data)
      const { data: profile } = await supabase
        .from("users")
        .select("status")
        .eq("auth_id", authUser.id)
        .single();

      if (profile?.status === "pending_consent") {
        const url = request.nextUrl.clone();
        url.pathname = "/consent-pending";
        return NextResponse.redirect(url);
      }
    }
  }

  // Append CORS headers to API responses
  if (pathname.startsWith("/api/")) {
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      supabaseResponse.headers.set(key, value);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
