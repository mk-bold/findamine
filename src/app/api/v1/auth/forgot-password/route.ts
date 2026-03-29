import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { errorResponse, ApiError } from "@/lib/utils/api-auth";
import { authLimiter } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    authLimiter.check(request);
    const body = await request.json();
    const { email } = body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://findamine.app";

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    // Always return success to prevent email enumeration
    return Response.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
