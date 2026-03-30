import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAuthUser,
  requireRole,
  errorResponse,
  ApiError,
} from "@/lib/utils/api-auth";
import type { UserRole } from "@/lib/types/enums";

/**
 * Generic CRUD route factory for simple tables (tasks, primers, standards).
 * Reduces boilerplate across similar endpoints.
 */
export function createCrudHandlers(
  table: string,
  options: {
    writeRoles?: UserRole[];
    allowedInsertFields: string[];
    allowedUpdateFields: string[];
    ownerColumn?: string;
  }
) {
  const {
    writeRoles = ["teacher", "hunt_creator", "admin", "researcher"],
    allowedInsertFields,
    allowedUpdateFields,
    ownerColumn = "created_by",
  } = options;

  async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const library = searchParams.get("library");
      const limit = parseInt(searchParams.get("limit") || "100");

      const supabase = await createSupabaseServiceClient();

      let query = supabase
        .from(table)
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (library === "true") {
        query = query.eq("is_library", true);
      }

      const { data, error } = await query;
      if (error) throw new ApiError(500, error.message);

      return Response.json({ [table]: data });
    } catch (error) {
      return errorResponse(error);
    }
  }

  async function POST(request: NextRequest) {
    try {
      const user = await getAuthUser(request);
      requireRole(user, ...writeRoles);

      const body = await request.json();
      const supabase = await createSupabaseServiceClient();

      const insert: Record<string, unknown> = { [ownerColumn]: user.id };
      for (const field of allowedInsertFields) {
        if (body[field] !== undefined) insert[field] = body[field];
      }

      const { data, error } = await supabase
        .from(table)
        .insert(insert)
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);

      return Response.json({ [table.replace(/s$/, "")]: data }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  }

  return { GET, POST };
}

export function createItemHandlers(
  table: string,
  options: {
    writeRoles?: UserRole[];
    allowedUpdateFields: string[];
  }
) {
  const {
    writeRoles = ["teacher", "hunt_creator", "admin", "researcher"],
    allowedUpdateFields,
  } = options;

  async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const supabase = await createSupabaseServiceClient();

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (error || !data) throw new ApiError(404, `${table} item not found`);

      return Response.json({ [table.replace(/s$/, "")]: data });
    } catch (error) {
      return errorResponse(error);
    }
  }

  async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const user = await getAuthUser(request);
      requireRole(user, ...writeRoles);

      const body = await request.json();
      const supabase = await createSupabaseServiceClient();

      const updates: Record<string, unknown> = {};
      for (const field of allowedUpdateFields) {
        if (body[field] !== undefined) updates[field] = body[field];
      }

      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new ApiError(500, error.message);

      return Response.json({ [table.replace(/s$/, "")]: data });
    } catch (error) {
      return errorResponse(error);
    }
  }

  async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const user = await getAuthUser(request);
      requireRole(user, ...writeRoles);

      const supabase = await createSupabaseServiceClient();

      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw new ApiError(500, error.message);

      return Response.json({ message: "Deleted" });
    } catch (error) {
      return errorResponse(error);
    }
  }

  return { GET, PUT, DELETE };
}
