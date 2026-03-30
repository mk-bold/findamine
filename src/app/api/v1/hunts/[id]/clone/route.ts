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
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const { searchParams } = new URL(request.url);
    const deep = searchParams.get("deep") === "true";

    const supabase = await createSupabaseServiceClient();

    // Get source hunt with finds and their nested relations
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
    // By default (shallow): finds keep their original location_id, task_id, primer_id
    // foreign keys, referencing shared library resources. This is intentional —
    // locations, tasks, and primers are reusable (see is_library flag).
    //
    // With ?deep=true: sub-resources are also cloned as independent copies
    // owned by the current user, so edits won't affect the originals.
    if (finds && finds.length > 0) {
      // Dedup maps for deep clone (same resource referenced by multiple finds → clone once)
      const locationMap = new Map<string, string>(); // old_id → new_id
      const taskMap = new Map<string, string>();
      const primerMap = new Map<string, string>();

      for (const f of finds) {
        const { id: _fid, hunt_id: _fhid, created_at: _fca, updated_at: _fua, locations, tasks, primers, ...findData } = f as {
          id: string; hunt_id: string; created_at: string; updated_at: string;
          locations: Record<string, unknown> | null;
          tasks: Record<string, unknown> | null;
          primers: Record<string, unknown> | null;
          [key: string]: unknown;
        };

        let locationId = findData.location_id as string | null;
        let taskId = findData.task_id as string | null;
        let primerId = findData.primer_id as string | null;

        if (deep) {
          // Clone location if not already cloned
          if (locationId && locations && !locationMap.has(locationId)) {
            const { id: _lid, created_at: _lca, updated_at: _lua, ...locData } = locations as Record<string, unknown>;
            const { data: newLoc } = await supabase
              .from("locations")
              .insert({ ...locData, is_library: false, created_by: user.id })
              .select("id")
              .single();
            if (newLoc) locationMap.set(locationId, newLoc.id);
          }

          // Clone task if not already cloned
          if (taskId && tasks && !taskMap.has(taskId)) {
            const { id: _tid, created_at: _tca, updated_at: _tua, ...taskData } = tasks as Record<string, unknown>;
            const { data: newTask } = await supabase
              .from("tasks")
              .insert({ ...taskData, is_library: false, created_by: user.id })
              .select("id")
              .single();
            if (newTask) taskMap.set(taskId, newTask.id);
          }

          // Clone primer if not already cloned
          if (primerId && primers && !primerMap.has(primerId)) {
            const { id: _pid, created_at: _pca, updated_at: _pua, ...primerData } = primers as Record<string, unknown>;
            const { data: newPrimer } = await supabase
              .from("primers")
              .insert({ ...primerData, is_library: false, created_by: user.id })
              .select("id")
              .single();
            if (newPrimer) primerMap.set(primerId, newPrimer.id);
          }

          // Remap foreign keys to cloned resources
          if (locationId && locationMap.has(locationId)) locationId = locationMap.get(locationId)!;
          if (taskId && taskMap.has(taskId)) taskId = taskMap.get(taskId)!;
          if (primerId && primerMap.has(primerId)) primerId = primerMap.get(primerId)!;
        }

        await supabase.from("finds").insert({
          ...findData,
          hunt_id: newHunt.id,
          location_id: locationId,
          task_id: taskId,
          primer_id: primerId,
          deleted_at: null,
        });
      }
    }

    return Response.json({ hunt: newHunt, deep }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
