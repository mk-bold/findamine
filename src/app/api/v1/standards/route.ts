import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";

export async function GET() {
  try {
    const supabase = await createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("standard_frameworks")
      .select("*, standards(*)")
      .order("name");

    if (error) throw new ApiError(500, error.message);

    return Response.json({ frameworks: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "teacher", "admin");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    if (body.framework) {
      // Create framework
      const { data, error } = await supabase
        .from("standard_frameworks")
        .insert({
          name: body.framework.name,
          description: body.framework.description || null,
          jurisdiction: body.framework.jurisdiction || null,
          grade_range_min: body.framework.grade_range_min || null,
          grade_range_max: body.framework.grade_range_max || null,
        })
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);
      return Response.json({ framework: data }, { status: 201 });
    }

    if (body.standard) {
      // Create standard within framework
      const { data, error } = await supabase
        .from("standards")
        .insert({
          framework_id: body.standard.framework_id,
          code: body.standard.code,
          description: body.standard.description,
          grade_level: body.standard.grade_level || null,
          subject: body.standard.subject || null,
        })
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);
      return Response.json({ standard: data }, { status: 201 });
    }

    throw new ApiError(400, "Provide either framework or standard object");
  } catch (error) {
    return errorResponse(error);
  }
}
