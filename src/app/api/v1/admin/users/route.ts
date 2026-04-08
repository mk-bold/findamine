import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher");

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = await createSupabaseServiceClient();

    let query = supabase
      .from("users")
      .select("id, display_name, email, role, status, avatar_url, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (role) query = query.eq("role", role);
    if (q) {
      // Sanitize to prevent PostgREST filter injection
      const safeQ = q.replace(/[(),."'\\]/g, "").slice(0, 100);
      if (safeQ) query = query.or(`display_name.ilike.%${safeQ}%,email.ilike.%${safeQ}%`);
    }

    const { data, error } = await query;
    if (error) throw new ApiError(500, error.message);

    return Response.json({ users: data });
  } catch (error) {
    return errorResponse(error);
  }
}
