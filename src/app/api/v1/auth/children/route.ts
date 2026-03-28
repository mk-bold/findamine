import { NextRequest } from "next/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
} from "@/lib/utils/api-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "parent", "admin");

    const supabase = await createSupabaseServiceClient();
    const { data: children, error } = await supabase
      .from("users")
      .select("id, display_name, avatar_url, role, date_of_birth, created_at")
      .eq("parent_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      return Response.json({ children: [] });
    }

    return Response.json({ children });
  } catch (error) {
    return errorResponse(error);
  }
}
