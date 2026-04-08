import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, errorResponse } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireRole(user, "admin");

    const supabase = await createSupabaseServiceClient();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString();

    // Overview counts
    const [
      totalUsers,
      usersToday,
      totalSessions,
      sessionsToday,
      completedSessions,
      totalEvents,
      eventsToday,
      blockedIps,
      loginAttempts,
      failedLogins,
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("users").select("*", { count: "exact", head: true }).is("deleted_at", null).gte("created_at", today),
      supabase.from("play_sessions").select("*", { count: "exact", head: true }),
      supabase.from("play_sessions").select("*", { count: "exact", head: true }).gte("created_at", today),
      supabase.from("play_sessions").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("behavioral_events").select("*", { count: "exact", head: true }),
      supabase.from("behavioral_events").select("*", { count: "exact", head: true }).gte("created_at", today),
      supabase.from("blocked_ips").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("login_attempts").select("*", { count: "exact", head: true }),
      supabase.from("login_attempts").select("*", { count: "exact", head: true }).eq("success", false),
    ]);

    // Hunt popularity (top 10 by play count)
    const { data: huntStats } = await supabase
      .from("play_sessions")
      .select("hunt_id, hunts(title)")
      .order("created_at", { ascending: false })
      .limit(500);

    const huntCounts = new Map<string, { title: string; count: number }>();
    for (const s of huntStats || []) {
      const huntsData = s.hunts as unknown as { title: string } | null;
      const title = huntsData?.title || "Unknown";
      const existing = huntCounts.get(s.hunt_id) || { title, count: 0 };
      existing.count++;
      huntCounts.set(s.hunt_id, existing);
    }
    const topHunts = Array.from(huntCounts.entries())
      .map(([id, { title, count }]) => ({ id, title, plays: count }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);

    // Daily activity (last 30 days)
    const { data: recentSessions } = await supabase
      .from("play_sessions")
      .select("created_at, status")
      .gte("created_at", monthAgo)
      .order("created_at");

    const dailyActivity: Record<string, { sessions: number; completed: number }> = {};
    for (const s of recentSessions || []) {
      const day = s.created_at.slice(0, 10);
      if (!dailyActivity[day]) dailyActivity[day] = { sessions: 0, completed: 0 };
      dailyActivity[day].sessions++;
      if (s.status === "completed") dailyActivity[day].completed++;
    }

    // Recent events (last 50)
    const { data: recentEvents } = await supabase
      .from("behavioral_events")
      .select("id, event_type, event_name, payload, platform, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    // Event type distribution
    const { data: allEvents } = await supabase
      .from("behavioral_events")
      .select("event_type")
      .gte("created_at", weekAgo);

    const eventTypeCounts: Record<string, number> = {};
    for (const e of allEvents || []) {
      eventTypeCounts[e.event_type] = (eventTypeCounts[e.event_type] || 0) + 1;
    }

    // Platform/device breakdown from events
    const { data: platformEvents } = await supabase
      .from("behavioral_events")
      .select("platform")
      .gte("created_at", weekAgo);

    const platformCounts: Record<string, number> = {};
    for (const e of platformEvents || []) {
      const p = e.platform || "unknown";
      platformCounts[p] = (platformCounts[p] || 0) + 1;
    }

    // Login activity (last 7 days)
    const { data: recentLogins } = await supabase
      .from("login_attempts")
      .select("success, ip_hash, user_agent, created_at")
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(50);

    // Bot events
    const { data: botEvents } = await supabase
      .from("behavioral_events")
      .select("event_type, payload, created_at")
      .in("event_type", ["bot_blocked", "bot_suspicious"])
      .order("created_at", { ascending: false })
      .limit(20);

    return Response.json({
      overview: {
        total_users: totalUsers.count || 0,
        users_today: usersToday.count || 0,
        total_sessions: totalSessions.count || 0,
        sessions_today: sessionsToday.count || 0,
        completed_sessions: completedSessions.count || 0,
        completion_rate: (totalSessions.count || 0) > 0
          ? Math.round(((completedSessions.count || 0) / (totalSessions.count || 1)) * 100)
          : 0,
        total_events: totalEvents.count || 0,
        events_today: eventsToday.count || 0,
        blocked_ips: blockedIps.count || 0,
        login_attempts: loginAttempts.count || 0,
        failed_logins: failedLogins.count || 0,
      },
      top_hunts: topHunts,
      daily_activity: Object.entries(dailyActivity)
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      event_types: Object.entries(eventTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      platforms: Object.entries(platformCounts)
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => b.count - a.count),
      recent_events: recentEvents || [],
      recent_logins: recentLogins || [],
      bot_events: botEvents || [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}
