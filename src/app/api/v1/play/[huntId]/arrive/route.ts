import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { getHotColdZone, haversineDistance } from "@/lib/services/hot-cold";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ huntId: string }> }
) {
  try {
    const { huntId } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const { find_id, latitude, longitude } = body;

    if (!find_id) throw new ApiError(400, "find_id is required");

    const supabase = await createSupabaseServiceClient();

    // Get active session
    const { data: session } = await supabase
      .from("play_sessions")
      .select("id")
      .eq("hunt_id", huntId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!session) throw new ApiError(404, "No active play session");

    // Get find's location
    const { data: find } = await supabase
      .from("finds")
      .select("hot_cold_enabled, locations(latitude, longitude, radius_meters)")
      .eq("id", find_id)
      .single();

    const loc = find?.locations as unknown as {
      latitude: number;
      longitude: number;
      radius_meters: number;
    } | null;

    // Calculate distance and hot/cold zone
    let distance: number | null = null;
    let hotCold = null;
    let withinRadius = false;

    if (latitude && longitude && loc) {
      distance = haversineDistance(latitude, longitude, loc.latitude, loc.longitude);
      withinRadius = distance <= (loc.radius_meters || 50);

      if (find?.hot_cold_enabled !== false) {
        hotCold = getHotColdZone(distance);
      }
    }

    // If within radius, record arrival
    if (withinRadius || !loc) {
      // Check if already arrived
      const { data: existing } = await supabase
        .from("find_completions")
        .select("id, arrived_at")
        .eq("play_session_id", session.id)
        .eq("find_id", find_id)
        .maybeSingle();

      if (existing?.arrived_at) {
        return Response.json({
          arrived: true,
          already_arrived: true,
          completion_id: existing.id,
          distance,
          hot_cold: hotCold,
        });
      }

      // Record or update arrival
      if (existing) {
        await supabase
          .from("find_completions")
          .update({
            arrived_at: new Date().toISOString(),
            metadata: {
              ...(existing as { metadata?: Record<string, unknown> }).metadata,
              arrival_lat: latitude,
              arrival_lng: longitude,
              arrival_distance: distance,
            },
          })
          .eq("id", existing.id);

        return Response.json({
          arrived: true,
          completion_id: existing.id,
          distance,
          hot_cold: hotCold,
        });
      }

      const { data: completion, error } = await supabase
        .from("find_completions")
        .insert({
          play_session_id: session.id,
          find_id,
          arrived_at: new Date().toISOString(),
          metadata: {
            arrival_lat: latitude,
            arrival_lng: longitude,
            arrival_distance: distance,
          },
        })
        .select("id")
        .single();

      if (error) throw new ApiError(500, error.message);

      return Response.json({
        arrived: true,
        completion_id: completion.id,
        distance,
        hot_cold: hotCold,
      }, { status: 201 });
    }

    // Not within radius yet — return hot/cold data
    return Response.json({
      arrived: false,
      distance,
      hot_cold: hotCold,
      radius_needed: loc?.radius_meters || 50,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
