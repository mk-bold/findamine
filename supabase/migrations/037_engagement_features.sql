-- ══════════════════════════════════════════════════════════════
-- Migration 037: Engagement features tables
--
-- Featured hunts, seasonal events, mentor sessions, and
-- additional indexes for engagement queries.
-- ══════════════════════════════════════════════════════════════

-- Featured hunts
CREATE TABLE IF NOT EXISTS public.featured_hunts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID NOT NULL REFERENCES public.hunts(id),
  feature_type TEXT NOT NULL CHECK (feature_type IN ('weekly', 'monthly', 'editor_pick', 'trending')),
  curator_comment TEXT,
  active_from TIMESTAMPTZ DEFAULT NOW(),
  active_until TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_featured_active ON public.featured_hunts(active_from, active_until);
ALTER TABLE public.featured_hunts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "featured_select" ON public.featured_hunts FOR SELECT USING (true);
CREATE POLICY "featured_insert" ON public.featured_hunts FOR INSERT WITH CHECK (true);

-- Leaderboard snapshots for research
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID REFERENCES public.hunts(id),
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('baseline', 'periodic', 'post_intervention', 'endline')),
  leaderboard_type TEXT NOT NULL DEFAULT 'hunt_specific',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.leaderboard_snapshots_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snapshots_select" ON public.leaderboard_snapshots_v2 FOR SELECT USING (true);
CREATE POLICY "snapshots_insert" ON public.leaderboard_snapshots_v2 FOR INSERT WITH CHECK (true);

-- Mentor sessions tracking
CREATE TABLE IF NOT EXISTS public.mentor_sessions_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.users(id),
  mentee_id UUID NOT NULL REFERENCES public.users(id),
  hunt_id UUID REFERENCES public.hunts(id),
  team_id UUID REFERENCES public.teams(id),
  help_type TEXT CHECK (help_type IN ('hint', 'feedback', 'explanation', 'peer_review')),
  effectiveness_rating INT CHECK (effectiveness_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.mentor_sessions_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentor_sessions_select" ON public.mentor_sessions_v2 FOR SELECT USING (true);
CREATE POLICY "mentor_sessions_insert" ON public.mentor_sessions_v2 FOR INSERT WITH CHECK (true);

-- Community health metrics (aggregated, updated periodically)
CREATE TABLE IF NOT EXISTS public.community_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL DEFAULT 'global', -- 'global', 'hunt:{id}', 'team:{id}'
  health_score INT CHECK (health_score BETWEEN 0 AND 100),
  metrics JSONB DEFAULT '{}',
  -- metrics: { kindness_rate, flagged_rate, response_time_hrs, repeat_violation_rate }
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.community_health_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_select" ON public.community_health_snapshots FOR SELECT USING (true);
CREATE POLICY "health_insert" ON public.community_health_snapshots FOR INSERT WITH CHECK (true);
