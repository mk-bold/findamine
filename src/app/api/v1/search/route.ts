import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q || q.length < 2) throw new ApiError(400, "Query must be at least 2 characters");

    const limit = parseInt(searchParams.get("limit") || "20");
    const supabase = await createSupabaseServiceClient();

    // Search across hunts, tasks, locations, primers using tsvector where available
    const [hunts, tasks, locations] = await Promise.all([
      supabase
        .from("hunts")
        .select("id, title, description, status")
        .is("deleted_at", null)
        .eq("is_public", true)
        .textSearch("search_vector", q, { type: "websearch" })
        .limit(limit),
      supabase
        .from("tasks")
        .select("id, title, subject_domain, challenge_type")
        .is("deleted_at", null)
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(limit),
      supabase
        .from("locations")
        .select("id, name, address")
        .is("deleted_at", null)
        .or(`name.ilike.%${q}%,address.ilike.%${q}%`)
        .limit(limit),
    ]);

    return Response.json({
      results: {
        hunts: hunts.data || [],
        tasks: tasks.data || [],
        locations: locations.data || [],
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
