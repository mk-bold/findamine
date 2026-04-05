-- ══════════════════════════════════════════════════════════════
-- Migration 039: Scale readiness — RPC functions + indexes
--
-- Moves expensive in-memory aggregations to PostgreSQL for
-- handling 1000+ concurrent users. Adds performance indexes.
-- ══════════════════════════════════════════════════════════════

-- ─── RPC: User improvement leaderboard ───────────────────────
-- Replaces: leaderboard/types improvement (was loading ALL sessions into JS)

CREATE OR REPLACE FUNCTION public.get_user_improvements(p_limit INT DEFAULT 25)
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  first_score INT,
  latest_score INT,
  improvement INT
) LANGUAGE sql STABLE AS $$
  WITH user_scores AS (
    SELECT
      ps.user_id,
      FIRST_VALUE(ps.total_score) OVER (PARTITION BY ps.user_id ORDER BY ps.completed_at ASC) AS first_score,
      FIRST_VALUE(ps.total_score) OVER (PARTITION BY ps.user_id ORDER BY ps.completed_at DESC) AS latest_score
    FROM public.play_sessions ps
    WHERE ps.status = 'completed' AND ps.total_score IS NOT NULL
  ),
  improvements AS (
    SELECT DISTINCT ON (us.user_id)
      us.user_id,
      us.first_score,
      us.latest_score,
      (us.latest_score - us.first_score) AS improvement
    FROM user_scores us
    WHERE us.latest_score > us.first_score
    ORDER BY us.user_id, improvement DESC
  )
  SELECT
    i.user_id,
    u.display_name,
    i.first_score,
    i.latest_score,
    i.improvement
  FROM improvements i
  JOIN public.users u ON u.id = i.user_id
  ORDER BY i.improvement DESC
  LIMIT p_limit;
$$;

-- ─── RPC: Speed run leaderboard ──────────────────────────────
-- Replaces: leaderboard/types speed_run (was in-memory sort)

CREATE OR REPLACE FUNCTION public.get_speed_run_leaderboard(p_limit INT DEFAULT 25)
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  hunt_title TEXT,
  duration_min NUMERIC,
  score INT
) LANGUAGE sql STABLE AS $$
  SELECT
    ps.user_id,
    u.display_name,
    h.title AS hunt_title,
    ROUND(EXTRACT(EPOCH FROM (ps.completed_at - ps.started_at)) / 60.0, 1) AS duration_min,
    ps.total_score AS score
  FROM public.play_sessions ps
  JOIN public.users u ON u.id = ps.user_id
  JOIN public.hunts h ON h.id = ps.hunt_id
  WHERE ps.status = 'completed'
    AND ps.total_score >= 60
    AND ps.started_at IS NOT NULL
    AND ps.completed_at IS NOT NULL
  ORDER BY duration_min ASC
  LIMIT p_limit;
$$;

-- ─── RPC: Hunt insights for analytics ────────────────────────
-- Replaces: analytics/insights (was loading 5000 rows into JS)

CREATE OR REPLACE FUNCTION public.get_hunt_insights(p_limit INT DEFAULT 10)
RETURNS TABLE(
  hunt_id UUID,
  title TEXT,
  target_audience TEXT,
  plays BIGINT,
  avg_score NUMERIC,
  avg_duration_min NUMERIC
) LANGUAGE sql STABLE AS $$
  SELECT
    h.id AS hunt_id,
    h.title,
    h.target_audience,
    COUNT(ps.id) AS plays,
    ROUND(AVG(ps.total_score), 0) AS avg_score,
    ROUND(AVG(EXTRACT(EPOCH FROM (ps.completed_at - ps.started_at)) / 60.0), 0) AS avg_duration_min
  FROM public.hunts h
  JOIN public.play_sessions ps ON ps.hunt_id = h.id
  WHERE ps.status = 'completed'
    AND h.is_public = true
    AND h.deleted_at IS NULL
  GROUP BY h.id, h.title, h.target_audience
  HAVING COUNT(ps.id) >= 3
  ORDER BY avg_score DESC
  LIMIT p_limit;
$$;

-- ─── RPC: Roster average scores for team formation ───────────
-- Replaces: teams/form performance calculation (was N+1 loop)

CREATE OR REPLACE FUNCTION public.get_roster_avg_scores(p_roster_id UUID)
RETURNS TABLE(
  user_id UUID,
  avg_score NUMERIC,
  hunts_completed BIGINT
) LANGUAGE sql STABLE AS $$
  SELECT
    re.student_id AS user_id,
    COALESCE(ROUND(AVG(ps.total_score), 0), 0) AS avg_score,
    COUNT(ps.id) AS hunts_completed
  FROM public.roster_entries re
  LEFT JOIN public.play_sessions ps ON ps.user_id = re.student_id AND ps.status = 'completed'
  WHERE re.roster_id = p_roster_id
  GROUP BY re.student_id;
$$;

-- ─── RPC: Challenge type effectiveness ───────────────────────
-- Replaces: analytics/insights challenge type aggregation

CREATE OR REPLACE FUNCTION public.get_challenge_type_effectiveness()
RETURNS TABLE(
  challenge_type TEXT,
  avg_score NUMERIC,
  sample_size BIGINT
) LANGUAGE sql STABLE AS $$
  SELECT
    t.challenge_type,
    ROUND(AVG(fc.score), 0) AS avg_score,
    COUNT(fc.id) AS sample_size
  FROM public.find_completions fc
  JOIN public.finds f ON f.id = fc.find_id
  JOIN public.tasks t ON t.id = f.task_id
  WHERE fc.score IS NOT NULL AND fc.completed_at IS NOT NULL
  GROUP BY t.challenge_type
  HAVING COUNT(fc.id) >= 5
  ORDER BY avg_score DESC;
$$;


-- ─── Performance Indexes ─────────────────────────────────────

-- Play sessions: hot path for leaderboard, analytics, play flow
CREATE INDEX IF NOT EXISTS idx_ps_hunt_user_status
  ON public.play_sessions(hunt_id, user_id, status);
CREATE INDEX IF NOT EXISTS idx_ps_completed_score
  ON public.play_sessions(status, completed_at DESC, total_score DESC)
  WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_ps_user_completed
  ON public.play_sessions(user_id, status, completed_at DESC)
  WHERE status = 'completed';

-- Find completions: hot path for scoring, progress, analytics
CREATE INDEX IF NOT EXISTS idx_fc_session_find
  ON public.find_completions(play_session_id, find_id);
CREATE INDEX IF NOT EXISTS idx_fc_find_score
  ON public.find_completions(find_id, score)
  WHERE completed_at IS NOT NULL;

-- Social/communication: hot path for team chat, notifications
CREATE INDEX IF NOT EXISTS idx_tm_team_created
  ON public.team_messages(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_user_created
  ON public.notifications(user_id, created_at DESC);

-- Events: hot path for experiment data, analytics
-- (only create if columns exist — app_events may have different schema)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_events_user_type
    ON public.app_events(user_id, event_type, created_at DESC);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- Standards alignment: hot path for curriculum browsing
CREATE INDEX IF NOT EXISTS idx_tsa_standard
  ON public.task_standard_alignments(standard_id);
CREATE INDEX IF NOT EXISTS idx_tsa_task
  ON public.task_standard_alignments(task_id);

-- ─── RPC: Hunt analytics (per-hunt aggregation) ──────────────

CREATE OR REPLACE FUNCTION public.get_hunt_analytics(p_hunt_id UUID)
RETURNS TABLE(
  total_plays BIGINT,
  completed_plays BIGINT,
  avg_score NUMERIC,
  avg_duration_min NUMERIC,
  completion_rate NUMERIC
) LANGUAGE sql STABLE AS $$
  SELECT
    COUNT(ps.id) AS total_plays,
    COUNT(ps.id) FILTER (WHERE ps.status = 'completed') AS completed_plays,
    ROUND(AVG(ps.total_score) FILTER (WHERE ps.status = 'completed'), 0) AS avg_score,
    ROUND(AVG(EXTRACT(EPOCH FROM (ps.completed_at - ps.started_at)) / 60.0) FILTER (WHERE ps.status = 'completed' AND ps.completed_at IS NOT NULL), 0) AS avg_duration_min,
    CASE WHEN COUNT(ps.id) > 0
      THEN ROUND(COUNT(ps.id) FILTER (WHERE ps.status = 'completed') * 100.0 / COUNT(ps.id), 0)
      ELSE 0
    END AS completion_rate
  FROM public.play_sessions ps
  WHERE ps.hunt_id = p_hunt_id;
$$;

-- ─── RPC: Per-stop analytics for a hunt ──────────────────────

CREATE OR REPLACE FUNCTION public.get_stop_analytics(p_hunt_id UUID)
RETURNS TABLE(
  find_id UUID,
  avg_score NUMERIC,
  avg_hints NUMERIC,
  completion_count BIGINT
) LANGUAGE sql STABLE AS $$
  SELECT
    fc.find_id,
    ROUND(AVG(fc.score), 0) AS avg_score,
    ROUND(AVG(COALESCE(fc.hints_used, 0) + COALESCE(fc.clue_hints_used, 0) + COALESCE(fc.challenge_hints_used, 0)), 1) AS avg_hints,
    COUNT(fc.id) FILTER (WHERE fc.completed_at IS NOT NULL) AS completion_count
  FROM public.find_completions fc
  JOIN public.play_sessions ps ON ps.id = fc.play_session_id
  WHERE ps.hunt_id = p_hunt_id AND ps.status = 'completed'
  GROUP BY fc.find_id;
$$;

-- ─── RPC: User gamification stats ────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE(
  hunts_completed BIGINT,
  total_score BIGINT,
  badges_earned BIGINT,
  current_streak INT
) LANGUAGE sql STABLE AS $$
  SELECT
    (SELECT COUNT(*) FROM public.play_sessions WHERE user_id = p_user_id AND status = 'completed'),
    (SELECT COALESCE(SUM(total_score), 0) FROM public.play_sessions WHERE user_id = p_user_id AND status = 'completed'),
    (SELECT COUNT(*) FROM public.user_badges WHERE user_id = p_user_id),
    (SELECT COALESCE(current_streak, 0) FROM public.streaks WHERE user_id = p_user_id LIMIT 1);
$$;

-- ─── RPC: Audience breakdown for insights ────────────────────

CREATE OR REPLACE FUNCTION public.get_audience_insights()
RETURNS TABLE(
  target_audience TEXT,
  total_plays BIGINT,
  avg_score NUMERIC
) LANGUAGE sql STABLE AS $$
  SELECT
    h.target_audience,
    COUNT(ps.id) AS total_plays,
    ROUND(AVG(ps.total_score), 0) AS avg_score
  FROM public.play_sessions ps
  JOIN public.hunts h ON h.id = ps.hunt_id
  WHERE ps.status = 'completed'
  GROUP BY h.target_audience
  HAVING COUNT(ps.id) >= 3;
$$;

-- Profile visibility for privacy system
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_visibility JSONB DEFAULT '{}';
