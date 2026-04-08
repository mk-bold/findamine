import { NextRequest } from "next/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user);

    const body = await request.json();
    const allowedFields = ["display_name", "avatar_url", "metadata", "profile_visibility"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid fields to update");
    }

    const supabase = await createSupabaseServiceClient();
    const { data: profile, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("id, email, display_name, avatar_url, role, metadata")
      .single();

    if (error) {
      throw new ApiError(500, "Failed to update profile");
    }

    return Response.json({ user: profile });
  } catch (error) {
    return errorResponse(error);
  }
}
