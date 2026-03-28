import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

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

    // Check if already arrived at this find
    const { data: existing } = await supabase
      .from("find_completions")
      .select("id")
      .eq("play_session_id", session.id)
      .eq("find_id", find_id)
      .maybeSingle();

    if (existing) {
      return Response.json({ completion: existing, already_arrived: true });
    }

    // Optionally validate GPS proximity
    let withinRadius = true;
    if (latitude && longitude) {
      const { data: find } = await supabase
        .from("finds")
        .select("locations(latitude, longitude, radius_meters)")
        .eq("id", find_id)
        .single();

      if (find?.locations) {
        const loc = find.locations as unknown as { latitude: number; longitude: number; radius_meters: number };
        const distance = haversineDistance(
          latitude, longitude, loc.latitude, loc.longitude
        );
        withinRadius = distance <= (loc.radius_meters || 50);
      }
    }

    const { data: completion, error } = await supabase
      .from("find_completions")
      .insert({
        play_session_id: session.id,
        find_id,
        arrived_at: new Date().toISOString(),
        metadata: {
          user_lat: latitude,
          user_lng: longitude,
          within_radius: withinRadius,
        },
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ completion, within_radius: withinRadius }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

function haversineDistance(
  lat1: number, lon1: number, lat2: number, lon2: number
): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
