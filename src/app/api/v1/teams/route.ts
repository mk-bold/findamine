import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const huntId = searchParams.get("hunt_id");
    const mine = searchParams.get("mine");

    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    if (mine === "true") {
      const { data } = await supabase
        .from("team_members")
        .select("team_id, role, teams(*, team_members(user_id, role, users(id, display_name, avatar_url)))")
        .eq("user_id", user.id)
        .eq("status", "active");

      return Response.json({ teams: (data || []).map((d: { teams: unknown }) => d.teams) });
    }

    if (huntId) {
      const { data } = await supabase
        .from("teams")
        .select("*, team_members(user_id, role, users(id, display_name, avatar_url))")
        .eq("hunt_id", huntId)
        .order("created_at");

      return Response.json({ teams: data || [] });
    }

    throw new ApiError(400, "Provide hunt_id or mine=true");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    if (!body.hunt_id) throw new ApiError(400, "hunt_id is required");

    const supabase = await createSupabaseServiceClient();

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        hunt_id: body.hunt_id,
        name: body.name || `Team ${Date.now().toString(36)}`,
        max_size: body.max_size || 6,
        formation_method: body.formation_method || "self_select",
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    // Creator becomes captain
    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "captain",
    });

    return Response.json({ team }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
