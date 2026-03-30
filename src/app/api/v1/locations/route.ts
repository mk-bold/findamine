import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || "5000";
    const library = searchParams.get("library");

    const supabase = await createSupabaseServiceClient();

    // Nearby search
    if (lat && lng) {
      const { data, error } = await supabase.rpc("nearby_locations", {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_m: parseFloat(radius),
        max_results: 50,
      });

      if (error) throw new ApiError(500, error.message);
      return Response.json({ locations: data });
    }

    // Library or all
    let query = supabase
      .from("locations")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (library === "true") {
      query = query.eq("is_library", true);
    }

    const { data, error } = await query;
    if (error) throw new ApiError(500, error.message);

    return Response.json({ locations: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const body = await request.json();
    if (!body.latitude || !body.longitude) {
      throw new ApiError(400, "Latitude and longitude are required");
    }

    // Validate coordinates are valid numbers in range
    const lat = parseFloat(body.latitude);
    const lng = parseFloat(body.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new ApiError(400, "Invalid coordinates: latitude must be -90 to 90, longitude -180 to 180");
    }

    const supabase = await createSupabaseServiceClient();

    // Insert with raw SQL for PostGIS geography column
    const { data, error } = await supabase.rpc("insert_location", {
      p_name: body.name,
      p_description: body.description || null,
      p_latitude: lat,
      p_longitude: lng,
      p_radius_meters: body.radius_meters || 50,
      p_address: body.address || null,
      p_place_id: body.place_id || null,
      p_location_type: body.location_type || null,
      p_safety_notes: body.safety_notes || null,
      p_is_library: body.is_library || false,
      p_created_by: user.id,
    });

    if (error) {
      // Fallback: insert without PostGIS function if it doesn't exist yet
      const { data: loc, error: insertError } = await supabase
        .from("locations")
        .insert({
          name: body.name,
          description: body.description || null,
          latitude: lat,
          longitude: lng,
          coordinates: `SRID=4326;POINT(${lng} ${lat})`,
          radius_meters: body.radius_meters || 50,
          address: body.address || null,
          place_id: body.place_id || null,
          location_type: body.location_type || null,
          safety_notes: body.safety_notes || null,
          is_library: body.is_library || false,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw new ApiError(500, insertError.message);
      return Response.json({ location: loc }, { status: 201 });
    }

    return Response.json({ location: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
