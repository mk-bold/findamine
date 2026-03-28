import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, errorResponse, ApiError } from "@/lib/utils/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliveryId } = await params;
    const user = await getAuthUser(request);
    if (!user) throw new ApiError(401, "Not authenticated");

    const body = await request.json();
    const supabase = await createSupabaseServiceClient();

    // Get delivery
    const { data: delivery } = await supabase
      .from("survey_deliveries")
      .select("survey_id, status")
      .eq("id", deliveryId)
      .eq("user_id", user.id)
      .single();

    if (!delivery) throw new ApiError(404, "Delivery not found");
    if (delivery.status === "submitted") throw new ApiError(409, "Already submitted");

    // Save response
    const { data: response, error } = await supabase
      .from("survey_responses")
      .insert({
        delivery_id: deliveryId,
        survey_id: delivery.survey_id,
        user_id: user.id,
        answers: body.answers || {},
      })
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    // Mark delivery as submitted
    await supabase
      .from("survey_deliveries")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("id", deliveryId);

    return Response.json({ response }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
