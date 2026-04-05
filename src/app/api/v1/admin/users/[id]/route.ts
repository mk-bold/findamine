import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) throw new ApiError(404, "User not found");
    return Response.json({ user: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const validRoles = ["child", "teen", "parent", "teacher", "hunt_creator", "admin", "researcher"];
    const validStatuses = ["active", "inactive", "suspended", "banned", "pending_consent"];

    const updates: Record<string, unknown> = {};
    if (body.role !== undefined) {
      if (!validRoles.includes(body.role)) throw new ApiError(400, "Invalid role");
      updates.role = body.role;
    }
    if (body.status !== undefined) {
      if (!validStatuses.includes(body.status)) throw new ApiError(400, "Invalid status");
      updates.status = body.status;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    return Response.json({ user: data });
  } catch (error) {
    return errorResponse(error);
  }
}
