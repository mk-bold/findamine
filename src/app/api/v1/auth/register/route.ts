import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { errorResponse, ApiError } from "@/lib/utils/api-auth";
import { authLimiter } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    authLimiter.check(request);
    const body = await request.json();
    const { email, password, display_name, role, date_of_birth } = body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Only allow self-registration for these roles.
    // Admin and researcher accounts must be created via the admin panel.
    const selfRegisterRoles = [
      "child",
      "teen",
      "parent",
      "teacher",
      "game_master",
    ];
    const userRole = selfRegisterRoles.includes(role) ? role : "parent";

    const supabase = await createSupabaseServiceClient();

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
      });

    if (authError) {
      if (authError.message.includes("already")) {
        throw new ApiError(409, "An account with this email already exists");
      }
      throw new ApiError(400, authError.message);
    }

    // Create app user row
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        auth_id: authData.user.id,
        email,
        display_name: display_name || null,
        role: userRole,
        date_of_birth: date_of_birth || null,
      })
      .select()
      .single();

    if (userError) {
      // Rollback: delete the auth user if app user creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new ApiError(500, "Failed to create user profile");
    }

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
        },
        message: "Account created. Please check your email to verify.",
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
