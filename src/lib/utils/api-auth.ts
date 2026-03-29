import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/lib/types/database";
import type { UserRole } from "@/lib/types/enums";

/**
 * Extract the authenticated user from the request.
 * Supports both cookie-based auth (web) and Bearer token auth (mobile).
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  // Try Bearer token first (mobile app)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const serviceClient = await createSupabaseServiceClient();
    const {
      data: { user: authUser },
    } = await serviceClient.auth.getUser(token);
    if (!authUser) return null;

    const { data: profile } = await serviceClient
      .from("users")
      .select("id, auth_id, role, display_name")
      .eq("auth_id", authUser.id)
      .is("deleted_at", null)
      .single();

    return profile as AuthUser | null;
  }

  // Fall back to cookie-based auth (web)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // API routes don't need to set cookies
        },
      },
    }
  );

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const serviceClient = await createSupabaseServiceClient();
  const { data: profile } = await serviceClient
    .from("users")
    .select("id, auth_id, role, display_name")
    .eq("auth_id", authUser.id)
    .is("deleted_at", null)
    .single();

  return profile as AuthUser | null;
}

/**
 * Throw if user is not authenticated or doesn't have one of the required roles.
 */
export function requireRole(
  user: AuthUser | null,
  ...roles: UserRole[]
): asserts user is AuthUser {
  if (!user) {
    throw new ApiError(401, "Not authenticated");
  }
  if (roles.length > 0 && !roles.includes(user.role)) {
    throw new ApiError(403, "Forbidden");
  }
}

/**
 * Sanitize user input for use in PostgREST filter strings (.ilike, .or).
 * Escapes characters that have special meaning in PostgREST filter syntax.
 */
export function sanitizeFilterInput(input: string): string {
  // Remove PostgREST operators and special chars that could manipulate filters
  return input
    .replace(/[\\%_(),.]/g, "\\$&") // escape SQL LIKE wildcards and PostgREST delimiters
    .replace(/[^\w\s\-'"]/g, "")    // strip anything else that isn't word chars, spaces, hyphens, quotes
    .slice(0, 200);                  // cap length to prevent abuse
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Standard JSON error response.
 */
export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  console.error("Unhandled error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
