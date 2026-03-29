import { NextRequest } from "next/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";
import { checkTierPromotion } from "@/lib/services/gamification";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const result = await checkTierPromotion(user.id);

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
