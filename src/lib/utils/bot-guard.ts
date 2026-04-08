/**
 * Bot guard — call at the top of API routes to detect and auto-block bots.
 *
 * Usage in a route handler:
 *   const blocked = await botGuard(request);
 *   if (blocked) return blocked;
 */

import { NextRequest } from "next/server";
import { detectBot, getIpHash, isIpBlocked, autoBlockBot } from "./bot-detector";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Returns a 403 Response if the request is from a blocked IP or
 * a definite bot (auto-blocks it). Returns null if the request is OK.
 */
export async function botGuard(request: NextRequest): Promise<Response | null> {
  const ipHash = getIpHash(request);

  // Check if already blocked
  if (await isIpBlocked(ipHash)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Score the request
  const result = detectBot(request);

  // Auto-block definite bots (100% confidence)
  if (result.definite) {
    await autoBlockBot(ipHash, result.reasons);

    // Log the event
    try {
      const supabase = await createSupabaseServiceClient();
      await supabase.from("behavioral_events").insert({
        event_type: "bot_blocked",
        event_name: "Auto-blocked bot traffic",
        payload: {
          ip_hash: ipHash,
          score: result.score,
          reasons: result.reasons,
          user_agent: request.headers.get("user-agent"),
          path: new URL(request.url).pathname,
        },
      });
    } catch {
      // Don't fail the guard if logging fails
    }

    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Log suspicious activity (score >= 50) but don't block
  if (result.score >= 50) {
    try {
      const supabase = await createSupabaseServiceClient();
      await supabase.from("behavioral_events").insert({
        event_type: "bot_suspicious",
        event_name: "Suspicious traffic detected",
        payload: {
          ip_hash: ipHash,
          score: result.score,
          classification: result.classification,
          reasons: result.reasons,
          user_agent: request.headers.get("user-agent"),
          path: new URL(request.url).pathname,
        },
      });
    } catch {
      // Don't fail if logging fails
    }
  }

  return null; // Request is OK
}
