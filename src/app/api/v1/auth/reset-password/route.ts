import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw new ApiError(400, error.message);
    }

    return Response.json({ message: "Password updated successfully" });
  } catch (error) {
    return errorResponse(error);
  }
}
