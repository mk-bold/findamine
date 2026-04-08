import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const range = new URL(request.url).searchParams.get("range") || "day";

    const now = new Date();
    const cutoffs: Record<string, Date> = {
      hour: new Date(now.getTime() - 3_600_000),
      day: new Date(now.getTime() - 86_400_000),
      week: new Date(now.getTime() - 7 * 86_400_000),
      month: new Date(now.getTime() - 30 * 86_400_000),
      year: new Date(now.getTime() - 365 * 86_400_000),
    };
    const since = cutoffs[range] || new Date(0);

    const supabase = await createSupabaseServiceClient();

    // Use find_completions which have GPS coordinates
    const { data: completions } = await supabase
      .from("find_completions")
      .select("id, play_session_id, score, completed_at")
      .gte("completed_at", since.toISOString())
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(2000);

    // Also get locations for GPS data
    const { data: locations } = await supabase
      .from("locations")
      .select("id, name, city, region, country");

    // Build location lookup
    const locMap = new Map((locations || []).map((l) => [l.id, l]));

    // Get finds with location_id to map completions to locations
    const findIds = [...new Set((completions || []).map((c) => c.play_session_id))];
    const { data: sessions } = await supabase
      .from("play_sessions")
      .select("id, hunt_id")
      .in("id", findIds.slice(0, 100));

    // Aggregate by location
    const locationCounts = new Map<string, { count: number; city: string; country: string }>();
    for (const loc of locations || []) {
      const key = `${loc.city || "Unknown"}, ${loc.country || "Unknown"}`;
      const existing = locationCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        locationCounts.set(key, { count: 1, city: loc.city || "Unknown", country: loc.country || "Unknown" });
      }
    }

    const points = Array.from(locationCounts.entries())
      .map(([key, val]) => ({ location: key, ...val }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    return Response.json({
      range,
      total_completions: completions?.length || 0,
      points,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
