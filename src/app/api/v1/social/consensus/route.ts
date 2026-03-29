import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, blockChildren, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team_id");
    if (!teamId) throw new ApiError(400, "team_id required");

    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const supabase = await createSupabaseServiceClient();

    const { data } = await supabase
      .from("consensus")
      .select("*, consensus_votes(*)")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    return Response.json({ items: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");
    blockChildren(user, "consensus voting");

    const body = await request.json();
    if (!body.team_id || !body.question) {
      throw new ApiError(400, "team_id and question required");
    }

    const supabase = await createSupabaseServiceClient();

    // If voting on existing consensus
    if (body.consensus_id && body.vote) {
      const { data, error } = await supabase
        .from("consensus_votes")
        .insert({
          consensus_id: body.consensus_id,
          user_id: user.id,
          vote: body.vote,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") throw new ApiError(409, "Already voted");
        throw new ApiError(500, error.message);
      }

      return Response.json({ vote: data }, { status: 201 });
    }

    // Create new consensus
    const { data, error } = await supabase
      .from("consensus")
      .insert({
        team_id: body.team_id,
        find_id: body.find_id || null,
        question: body.question,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ consensus: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
