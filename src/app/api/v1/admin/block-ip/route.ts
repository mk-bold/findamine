import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const { ip_hash, reason, expires_in_days } = await request.json();
    if (!ip_hash) throw new ApiError(400, "ip_hash required");

    const supabase = await createSupabaseServiceClient();

    const expiresAt = expires_in_days
      ? new Date(Date.now() + expires_in_days * 86_400_000).toISOString()
      : null;

    await supabase.from("blocked_ips").insert({
      ip_hash,
      reason: reason || "Manual block by admin",
      blocked_by: user.id,
      expires_at: expiresAt,
    });

    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "block_ip",
      entity_type: "blocked_ip",
      entity_id: ip_hash,
      new_values: { reason, expires_in_days },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const supabase = await createSupabaseServiceClient();
    const { data } = await supabase
      .from("blocked_ips")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return Response.json({ blocked_ips: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const { id } = await request.json();
    if (!id) throw new ApiError(400, "id required");

    const supabase = await createSupabaseServiceClient();
    await supabase
      .from("blocked_ips")
      .update({ is_active: false })
      .eq("id", id);

    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "unblock_ip",
      entity_type: "blocked_ip",
      entity_id: id,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
