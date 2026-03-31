import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { aiLimiter } from "@/lib/utils/rate-limit";
import { recommendHunt } from "@/lib/services/findbot";

export async function POST(request: NextRequest) {
  try {
    await aiLimiter.check(request);
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "hunt_creator", "admin", "researcher");

    const body = await request.json();
    const {
      subject_domains = ["science_nature"],
      grade_band = "3-5",
      target_audience = "kids",
      location_type = "any",
      target_duration_min = 40,
      difficulty_progression = "ascending",
      num_stops = 5,
      theme,
    } = body;

    const supabase = await createSupabaseServiceClient();

    // Parse grade band into range
    const gradeMap: Record<string, { min: number; max: number }> = {
      "K-2": { min: 0, max: 2 },
      "3-5": { min: 3, max: 5 },
      "6-8": { min: 6, max: 8 },
      "9-12": { min: 9, max: 12 },
    };
    const gradeRange = gradeMap[grade_band] || { min: 3, max: 8 };

    // Fetch matching tasks from library
    let taskQuery = supabase
      .from("tasks")
      .select("id, title, subject_domain, tags, themes, challenge_type, difficulty_rating, location_dependency, location_type, estimated_minutes")
      .eq("is_library", true)
      .is("deleted_at", null)
      .lte("grade_range_min", gradeRange.max)
      .gte("grade_range_max", gradeRange.min)
      .limit(50);

    if (location_type !== "any") {
      taskQuery = taskQuery.in("location_type", [location_type, "any"]);
    }

    const { data: tasks } = await taskQuery;

    // Filter by subject domains in application code (array overlap)
    const filteredTasks = (tasks || []).filter(
      (t) => subject_domains.includes(t.subject_domain) || subject_domains.length === 0
    );

    // Fetch matching primers
    let primerQuery = supabase
      .from("primers")
      .select("id, title, subject_domain, tags, themes, difficulty_rating, location_dependency, location_type")
      .eq("is_library", true)
      .is("deleted_at", null)
      .limit(50);

    if (location_type !== "any") {
      primerQuery = primerQuery.in("location_type", [location_type, "any"]);
    }

    const { data: primers } = await primerQuery;

    const filteredPrimers = (primers || []).filter(
      (p) => subject_domains.includes(p.subject_domain || "") || subject_domains.length === 0
    );

    // Fetch pairing history for quality signals
    const { data: history } = await supabase
      .from("pairing_history")
      .select("primer_id, task_id, avg_score, times_used")
      .order("avg_score", { ascending: false })
      .limit(50);

    if (filteredTasks.length === 0) {
      throw new ApiError(404, "No matching tasks found in the library for these criteria");
    }

    const result = await recommendHunt({
      availableTasks: filteredTasks.map((t) => ({
        id: t.id,
        title: t.title,
        subject_domain: t.subject_domain || "",
        tags: t.tags || [],
        challenge_type: t.challenge_type,
        difficulty_rating: t.difficulty_rating || 5,
        location_type: t.location_type || "any",
        estimated_minutes: t.estimated_minutes || 5,
      })),
      availablePrimers: filteredPrimers.map((p) => ({
        id: p.id,
        title: p.title,
        subject_domain: p.subject_domain || "",
        tags: p.tags || [],
        difficulty_rating: p.difficulty_rating || 5,
        location_type: p.location_type || "any",
      })),
      pairingHistory: history?.map((h) => ({
        primer_id: h.primer_id,
        task_id: h.task_id,
        avg_score: h.avg_score || 0,
        times_used: h.times_used || 1,
      })) || [],
      huntSpec: {
        subject_domains,
        grade_band,
        target_audience,
        location_type,
        target_duration_min,
        difficulty_progression,
        num_stops,
        theme,
      },
    });

    return Response.json({
      recommendation: result,
      tasks_available: filteredTasks.length,
      primers_available: filteredPrimers.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const maxDuration = 30;
