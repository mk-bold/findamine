import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const [consent, privacy] = await Promise.all([
      supabase
        .from("consent_records")
        .select("*")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    return Response.json({
      consent_records: consent.data || [],
      privacy_settings: privacy.data || { granularity_tier: "simple", settings: {} },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    // Record consent
    if (body.consent_type) {
      // COPPA: only parents/teachers/admins can create parental consent records
      if (body.consent_type === "parental") {
        if (!["parent", "teacher", "admin"].includes(user.role)) {
          throw new ApiError(403, "Only parents, teachers, or admins can grant parental consent");
        }
      }

      // Children cannot create any consent records for themselves
      if (["child"].includes(user.role) && body.consent_type !== "terms") {
        throw new ApiError(403, "Consent must be granted by a parent or teacher");
      }

      const { data, error } = await supabase
        .from("consent_records")
        .insert({
          user_id: user.id,
          consent_type: body.consent_type,
          form_version: body.form_version || "1.0",
          granted: body.granted ?? true,
          signature_name: body.signature_name || null,
          ip_address: request.headers.get("x-forwarded-for") || null,
          metadata: body.metadata || {},
        })
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);
      return Response.json({ consent: data }, { status: 201 });
    }

    // Update privacy settings
    if (body.privacy_settings) {
      const { data, error } = await supabase
        .from("privacy_settings")
        .upsert({
          user_id: user.id,
          granularity_tier: body.privacy_settings.granularity_tier || "simple",
          settings: body.privacy_settings.settings || {},
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);
      return Response.json({ privacy_settings: data });
    }

    throw new ApiError(400, "Provide consent_type or privacy_settings");
  } catch (error) {
    return errorResponse(error);
  }
}
