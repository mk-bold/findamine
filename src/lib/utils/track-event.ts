/**
 * Lightweight event tracking helper.
 * Logs to behavioral_events table. Fire-and-forget (never throws).
 */

import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function trackEvent(opts: {
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventName?: string;
  payload?: Record<string, unknown>;
  platform?: string;
}): Promise<void> {
  try {
    const supabase = await createSupabaseServiceClient();
    await supabase.from("behavioral_events").insert({
      user_id: opts.userId || null,
      session_id: opts.sessionId || null,
      event_type: opts.eventType,
      event_name: opts.eventName || opts.eventType,
      payload: opts.payload || {},
      platform: opts.platform || "web",
    });
  } catch {
    // Fire-and-forget — never block the main request
  }
}
