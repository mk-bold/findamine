-- ══════════════════════════════════════════════════════════════
-- Migration 040: Security fixes + move PostGIS out of public
--
-- Fixes:
--   1. PostGIS in public schema (645 functions) causes PostgREST
--      stack depth overflow — ALL REST API calls fail
--   2. 13 tables have overly-permissive write policies open to
--      anon users (public role)
--   3. task/primer_standard_alignments deletable by anon
-- ══════════════════════════════════════════════════════════════

-- ─── Part 1: Prep for PostGIS move ──────────────────────────
-- PostGIS SET SCHEMA is not supported; the actual move is in
-- migration 041. This just sets the search_path.

-- Ensure extensions schema exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Add extensions to search_path so existing SQL still works
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;

-- Also set for current session
SET search_path TO "$user", public, extensions;


-- ─── Part 2: Fix overly-permissive WRITE policies ──────────
-- These policies use WITH CHECK (true) or USING (true) for
-- INSERT/UPDATE/DELETE on the public role, meaning anyone with
-- the anon key can write data. The app uses service_role for
-- all writes, so these should block anon.

-- ── task_standard_alignments: block anon DELETE and INSERT ──
DROP POLICY IF EXISTS "task_alignments_delete" ON public.task_standard_alignments;
DROP POLICY IF EXISTS "task_alignments_insert" ON public.task_standard_alignments;
CREATE POLICY "task_alignments_service_delete" ON public.task_standard_alignments
  FOR DELETE USING (false);  -- service role bypasses RLS
CREATE POLICY "task_alignments_service_insert" ON public.task_standard_alignments
  FOR INSERT WITH CHECK (false);  -- service role bypasses RLS

-- ── primer_standard_alignments: block anon DELETE and INSERT ──
DROP POLICY IF EXISTS "primer_alignments_delete" ON public.primer_standard_alignments;
DROP POLICY IF EXISTS "primer_alignments_insert" ON public.primer_standard_alignments;
CREATE POLICY "primer_alignments_service_delete" ON public.primer_standard_alignments
  FOR DELETE USING (false);  -- service role bypasses RLS
CREATE POLICY "primer_alignments_service_insert" ON public.primer_standard_alignments
  FOR INSERT WITH CHECK (false);  -- service role bypasses RLS

-- ── community_health_snapshots: block anon INSERT ──
DROP POLICY IF EXISTS "health_service_insert" ON public.community_health_snapshots;
CREATE POLICY "health_service_only_insert" ON public.community_health_snapshots
  FOR INSERT WITH CHECK (false);

-- ── leaderboard_snapshots_v2: block anon INSERT ──
DROP POLICY IF EXISTS "snapshots_service_insert" ON public.leaderboard_snapshots_v2;
CREATE POLICY "snapshots_service_only_insert" ON public.leaderboard_snapshots_v2
  FOR INSERT WITH CHECK (false);

-- ── mentor_sessions_v2: block anon INSERT ──
DROP POLICY IF EXISTS "mentor_sessions_service_insert" ON public.mentor_sessions_v2;
CREATE POLICY "mentor_sessions_service_only_insert" ON public.mentor_sessions_v2
  FOR INSERT WITH CHECK (false);

-- ── technique_reviews: block anon INSERT ──
DROP POLICY IF EXISTS "technique_reviews_service_insert" ON public.technique_reviews;
CREATE POLICY "technique_reviews_service_only_insert" ON public.technique_reviews
  FOR INSERT WITH CHECK (false);

-- ── user_accommodations: block anon INSERT and UPDATE ──
-- (INSERT was already blocked by existing RLS in practice, but
--  the policy is still wrong; UPDATE with USING(true) is open)
DROP POLICY IF EXISTS "accommodations_service_write" ON public.user_accommodations;
DROP POLICY IF EXISTS "accommodations_service_update" ON public.user_accommodations;
CREATE POLICY "accommodations_service_only_insert" ON public.user_accommodations
  FOR INSERT WITH CHECK (false);
CREATE POLICY "accommodations_service_only_update" ON public.user_accommodations
  FOR UPDATE USING (false);

-- ── pairing_history: block anon INSERT and UPDATE ──
DROP POLICY IF EXISTS "pairing_history_insert" ON public.pairing_history;
DROP POLICY IF EXISTS "pairing_history_update" ON public.pairing_history;
CREATE POLICY "pairing_history_service_insert" ON public.pairing_history
  FOR INSERT WITH CHECK (false);
CREATE POLICY "pairing_history_service_update" ON public.pairing_history
  FOR UPDATE USING (false);

-- ── hunt_ratings: block anon INSERT ──
-- (Public read is fine — ratings are non-sensitive)
DROP POLICY IF EXISTS "hunt_ratings_own_write" ON public.hunt_ratings;
CREATE POLICY "hunt_ratings_authenticated_insert" ON public.hunt_ratings
  FOR INSERT WITH CHECK (
    (current_setting('request.jwt.claim.role', true)) = 'authenticated'
    OR (current_setting('role', true)) = 'rls_pgrest_supabase_super_admin'
  );

-- ── hint_ratings: tighten INSERT to authenticated only ──
-- (No existing insert policy found to be open, but add one for safety)
DROP POLICY IF EXISTS "hint_ratings_own_insert" ON public.hint_ratings;
CREATE POLICY "hint_ratings_authenticated_insert" ON public.hint_ratings
  FOR INSERT WITH CHECK (
    (current_setting('request.jwt.claim.role', true)) = 'authenticated'
    OR (current_setting('role', true)) = 'rls_pgrest_supabase_super_admin'
  );


-- ─── Part 3: Tighten public SELECT on sensitive tables ──────
-- These are readable by anyone. Most are fine (reference data),
-- but some contain user-linked data.

-- ── pairing_history: analytics data, restrict to service role ──
DROP POLICY IF EXISTS "pairing_history_select" ON public.pairing_history;
CREATE POLICY "pairing_history_service_select" ON public.pairing_history
  FOR SELECT USING (false);

-- ── leaderboard_snapshots: research data, restrict to service role ──
DROP POLICY IF EXISTS "ls_select_all" ON public.leaderboard_snapshots;
CREATE POLICY "ls_service_select" ON public.leaderboard_snapshots
  FOR SELECT USING (false);

-- ── shoutouts: contain sender/receiver UUIDs, restrict to authenticated ──
DROP POLICY IF EXISTS "shoutouts_select_all" ON public.shoutouts;
CREATE POLICY "shoutouts_authenticated_select" ON public.shoutouts
  FOR SELECT USING (
    (current_setting('request.jwt.claim.role', true)) = 'authenticated'
    OR (current_setting('role', true)) = 'rls_pgrest_supabase_super_admin'
  );

-- ── team_members: contain user UUIDs, restrict to authenticated ──
DROP POLICY IF EXISTS "team_members_select_all" ON public.team_members;
CREATE POLICY "team_members_authenticated_select" ON public.team_members
  FOR SELECT USING (
    (current_setting('request.jwt.claim.role', true)) = 'authenticated'
    OR (current_setting('role', true)) = 'rls_pgrest_supabase_super_admin'
  );
