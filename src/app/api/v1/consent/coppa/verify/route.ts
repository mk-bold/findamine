import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { errorResponse, ApiError } from "@/lib/utils/api-auth";

/**
 * Verify parental consent via email link.
 * Parent clicks link with token -> consent verified -> child account activated.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const childId = searchParams.get("child_id");

    if (!token || !childId) {
      throw new ApiError(400, "Missing token or child_id");
    }

    const supabase = await createSupabaseServiceClient();

    // Verify consent record exists with matching token
    const { data: consent } = await supabase
      .from("consent_records")
      .select("id, user_id, metadata")
      .eq("consent_type", "parental")
      .is("revoked_at", null)
      .maybeSingle();

    if (!consent) {
      throw new ApiError(404, "Consent record not found");
    }

    const metadata = consent.metadata as Record<string, unknown>;
    if (metadata?.verification_token !== token) {
      throw new ApiError(400, "Invalid verification token");
    }

    // Mark consent as verified
    await supabase
      .from("consent_records")
      .update({
        metadata: { ...metadata, verified: true, verified_at: new Date().toISOString() },
      })
      .eq("id", consent.id);

    // Verify the parent-child link
    await supabase
      .from("parent_child_links")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("child_id", childId);

    // Activate the child's account
    await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", childId);

    // Redirect to success page
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findamine.app";
    return Response.redirect(`${siteUrl}/consent-verified?success=true`);
  } catch (error) {
    return errorResponse(error);
  }
}
