import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    // Check team capacity
    const { data: team } = await supabase
      .from("teams")
      .select("max_size, status")
      .eq("id", id)
      .single();

    if (!team) throw new ApiError(404, "Team not found");
    if (!["forming", "ready"].includes(team.status)) {
      throw new ApiError(400, "Team is not accepting members");
    }

    const { count } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", id)
      .eq("status", "active");

    if ((count || 0) >= team.max_size) {
      throw new ApiError(400, "Team is full");
    }

    // Check not already a member
    const { data: existing } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      throw new ApiError(409, "Already a member of this team");
    }

    const { data: member, error } = await supabase
      .from("team_members")
      .insert({ team_id: id, user_id: user.id, role: "member" })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ member }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
