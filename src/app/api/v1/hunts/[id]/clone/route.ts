import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "game_master", "admin", "researcher");

    const supabase = await createSupabaseServiceClient();

    // Get source hunt with finds
    const { data: source, error: fetchError } = await supabase
      .from("hunts")
      .select("*, finds(*, locations(*), tasks(*), primers(*))")
      .eq("id", id)
      .single();

    if (fetchError || !source) throw new ApiError(404, "Hunt not found");

    // Clone the hunt
    const { id: _sid, created_at: _sca, updated_at: _sua, finds, ...huntData } = source;

    const { data: newHunt, error: huntError } = await supabase
      .from("hunts")
      .insert({
        ...huntData,
        title: `${huntData.title} (Copy)`,
        status: "draft",
        is_public: false,
        source_template_id: id,
        created_by: user.id,
        deleted_at: null,
      })
      .select()
      .single();

    if (huntError) throw new ApiError(500, huntError.message);

    // Clone finds
    if (finds && finds.length > 0) {
      const newFinds = finds.map(
        (f: { id: string; hunt_id: string; created_at: string; updated_at: string; locations: unknown; tasks: unknown; primers: unknown; [key: string]: unknown }) => {
          const { id: _fid, hunt_id: _fhid, created_at: _fca, updated_at: _fua, locations: _l, tasks: _t, primers: _p, ...findData } = f;
          return {
            ...findData,
            hunt_id: newHunt.id,
            deleted_at: null,
          };
        }
      );

      await supabase.from("finds").insert(newFinds);
    }

    return Response.json({ hunt: newHunt }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
