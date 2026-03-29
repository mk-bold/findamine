import { NextRequest } from "next/server";
import { getAuthUser, requireRole, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { checkBalance } from "@/lib/services/randomization";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin", "researcher");

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get("study_id");

    if (!studyId) throw new ApiError(400, "study_id required");

    const result = await checkBalance(studyId);

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
