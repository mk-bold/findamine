-- ── Migration 010: Atomic increment functions ──────────────────
-- Fixes bugs where usage_count and sample_size were set to 1 instead of incremented.

-- Increment ai_hint_cache usage_count by 1
CREATE OR REPLACE FUNCTION public.increment_hint_usage(p_cache_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.ai_hint_cache
  SET usage_count = usage_count + 1
  WHERE id = p_cache_id;
$$;

-- Increment treatment_studies current_sample_size by 1
CREATE OR REPLACE FUNCTION public.increment_sample_size(p_study_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.treatment_studies
  SET current_sample_size = current_sample_size + 1
  WHERE id = p_study_id;
$$;

-- Aggregated overall leaderboard: one row per user, summed scores
CREATE OR REPLACE FUNCTION public.overall_leaderboard(p_limit INT DEFAULT 25)
RETURNS TABLE (
  user_id UUID,
  total_score BIGINT,
  hunts_completed BIGINT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT,
  best_codename TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ps.user_id,
    SUM(ps.total_score)::BIGINT AS total_score,
    COUNT(*)::BIGINT AS hunts_completed,
    u.display_name,
    u.avatar_url,
    u.role,
    -- Pick the most recently used codename for display
    (SELECT ps2.codename
     FROM public.play_sessions ps2
     WHERE ps2.user_id = ps.user_id
       AND ps2.codename IS NOT NULL
       AND ps2.status = 'completed'
     ORDER BY ps2.completed_at DESC NULLS LAST
     LIMIT 1
    ) AS best_codename
  FROM public.play_sessions ps
  JOIN public.users u ON u.id = ps.user_id
  WHERE ps.status = 'completed'
    AND u.deleted_at IS NULL
  GROUP BY ps.user_id, u.display_name, u.avatar_url, u.role
  ORDER BY total_score DESC
  LIMIT p_limit;
$$;
