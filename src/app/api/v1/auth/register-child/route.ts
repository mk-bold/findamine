import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "parent", "teacher", "admin");

    const body = await request.json();
    const { email, password, display_name, date_of_birth } = body;

    if (!display_name) {
      throw new ApiError(400, "Display name is required for child accounts");
    }

    // Determine role from date of birth
    let role = "child";
    if (date_of_birth) {
      const age = Math.floor(
        (Date.now() - new Date(date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      );
      if (age >= 13) role = "teen";
    }

    const supabase = await createSupabaseServiceClient();

    // Create auth user (children may not have email)
    const childEmail =
      email || `${display_name.toLowerCase().replace(/\s+/g, "")}_${Date.now()}@child.findamine.app`;

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: childEmail,
        password: password || Math.random().toString(36).slice(2) + "Aa1!",
        email_confirm: true, // Skip email verification for children
      });

    if (authError) {
      throw new ApiError(400, authError.message);
    }

    const { data: child, error: userError } = await supabase
      .from("users")
      .insert({
        auth_id: authData.user.id,
        email: childEmail,
        display_name,
        role,
        date_of_birth: date_of_birth || null,
        parent_id: user.id,
      })
      .select()
      .single();

    if (userError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new ApiError(500, "Failed to create child profile");
    }

    return Response.json(
      {
        child: {
          id: child.id,
          display_name: child.display_name,
          role: child.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
