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

    const supabase = await createSupabaseServiceClient();

    // Insert with raw SQL for PostGIS geography column
    const { data, error } = await supabase.rpc("insert_location", {
      p_name: body.name,
      p_description: body.description || null,
      p_latitude: body.latitude,
      p_longitude: body.longitude,
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
          latitude: body.latitude,
          longitude: body.longitude,
          coordinates: `SRID=4326;POINT(${body.longitude} ${body.latitude})`,
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
