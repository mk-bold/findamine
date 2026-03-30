import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/utils/api-auth";
import { authLimiter } from "@/lib/utils/rate-limit";
import { withLogging } from "@/lib/utils/with-logging";

export const POST = withLogging("POST /api/v1/auth/login", async (request: NextRequest) => {
  await authLimiter.check(request);
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const isMobile = request.headers.get("x-client-type") === "mobile";

  if (isMobile) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ApiError(401, "Invalid email or password");
    }

    const serviceClient = await createSupabaseServiceClient();
    const { data: profile } = await serviceClient
      .from("users")
      .select("id, role, display_name, avatar_url")
      .eq("auth_id", data.user.id)
      .is("deleted_at", null)
      .single();

    return Response.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: profile,
    });
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new ApiError(401, "Invalid email or password");
  }

  const serviceClient = await createSupabaseServiceClient();
  const { data: profile } = await serviceClient
    .from("users")
    .select("id, role, display_name, avatar_url")
    .eq("auth_id", data.user.id)
    .is("deleted_at", null)
    .single();

  return Response.json({ user: profile });
});
