import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) throw new ApiError(404, "Location not found");

    return Response.json({ location: data });
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
    requireRole(user, "teacher", "game_master", "admin", "researcher");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    const allowedFields = [
      "name", "description", "radius_meters", "address",
      "place_id", "location_type", "safety_notes", "is_library", "metadata",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    // Update lat/lng + geography if provided
    if (body.latitude !== undefined && body.longitude !== undefined) {
      updates.latitude = body.latitude;
      updates.longitude = body.longitude;
      updates.coordinates = `SRID=4326;POINT(${body.longitude} ${body.latitude})`;
    }

    const { data, error } = await supabase
      .from("locations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    return Response.json({ location: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "game_master", "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    const { error } = await supabase
      .from("locations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new ApiError(500, error.message);

    return Response.json({ message: "Location deleted" });
  } catch (error) {
    return errorResponse(error);
  }
}
