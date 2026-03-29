import { NextRequest } from "next/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { generateResearchExport } from "@/lib/services/research-export";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher");

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get("study_id");
    const format = (searchParams.get("format") || "csv") as "csv" | "tsv";

    if (!studyId) throw new ApiError(400, "study_id required");

    const csvContent = await generateResearchExport({
      studyId,
      format,
    });

    if (!csvContent) {
      throw new ApiError(404, "No participants found for this study");
    }

    const contentType = format === "tsv" ? "text/tab-separated-values" : "text/csv";
    const filename = `study_${studyId}_export.${format}`;

    return new Response(csvContent, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const maxDuration = 60;
