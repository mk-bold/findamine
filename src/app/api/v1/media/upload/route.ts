import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { uploadLimiter } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    await uploadLimiter.check(request);
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "hunt-media";
    const entityType = formData.get("entity_type") as string | null;
    const entityId = formData.get("entity_id") as string | null;

    if (!file) throw new ApiError(400, "No file provided");

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      throw new ApiError(400, "File too large (max 2MB)");
    }

    // Validate content type
    const ALLOWED_TYPES = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "audio/mpeg", "audio/wav", "audio/webm",
      "video/mp4", "video/webm",
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(400, `File type not allowed. Accepted: ${ALLOWED_TYPES.join(", ")}`);
    }

    // Restrict bucket to allowed values
    const ALLOWED_BUCKETS = ["hunt-media", "avatars", "captures"];
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      throw new ApiError(400, "Invalid storage bucket");
    }

    const supabase = await createSupabaseServiceClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw new ApiError(500, uploadError.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

    // Record in media table
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .insert({
        bucket,
        path: uploadData.path,
        filename: file.name,
        content_type: file.type,
        size_bytes: file.size,
        entity_type: entityType,
        entity_id: entityId,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (mediaError) throw new ApiError(500, mediaError.message);

    return Response.json(
      { media: { ...media, url: publicUrl } },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export const maxDuration = 30;
