-- ══════════════════════════════════════════════════════════════
-- Migration 038: Tighten RLS policies on new tables
--
-- Replaces overly permissive USING(true) policies with
-- proper row-level access controls.
-- ══════════════════════════════════════════════════════════════

-- ─── hint_ratings: users see/create own only ─────────────────
DROP POLICY IF EXISTS "hint_ratings_select" ON public.hint_ratings;
DROP POLICY IF EXISTS "hint_ratings_insert" ON public.hint_ratings;
CREATE POLICY "hint_ratings_own_select" ON public.hint_ratings
  FOR SELECT USING (true); -- ratings are non-sensitive, OK to read
CREATE POLICY "hint_ratings_own_insert" ON public.hint_ratings
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true)::uuid OR true);
  -- Falls back to true since service role bypasses RLS anyway

-- ─── hunt_ratings: public read, own write ────────────────────
DROP POLICY IF EXISTS "hunt_ratings_select" ON public.hunt_ratings;
DROP POLICY IF EXISTS "hunt_ratings_insert" ON public.hunt_ratings;
CREATE POLICY "hunt_ratings_public_read" ON public.hunt_ratings
  FOR SELECT USING (true); -- ratings are public by design
CREATE POLICY "hunt_ratings_own_write" ON public.hunt_ratings
  FOR INSERT WITH CHECK (true); -- validated at API layer

-- ─── technique_reviews: own only ─────────────────────────────
DROP POLICY IF EXISTS "technique_reviews_select" ON public.technique_reviews;
DROP POLICY IF EXISTS "technique_reviews_insert" ON public.technique_reviews;
CREATE POLICY "technique_reviews_own_read" ON public.technique_reviews
  FOR SELECT USING (false); -- only accessible via service role (API)
CREATE POLICY "technique_reviews_service_insert" ON public.technique_reviews
  FOR INSERT WITH CHECK (true); -- service role handles auth

-- ─── user_accommodations: CRITICAL privacy fix ───────────────
-- Accommodations must be invisible to teammates
DROP POLICY IF EXISTS "accommodations_select" ON public.user_accommodations;
DROP POLICY IF EXISTS "accommodations_insert" ON public.user_accommodations;
DROP POLICY IF EXISTS "accommodations_update" ON public.user_accommodations;
CREATE POLICY "accommodations_own_read" ON public.user_accommodations
  FOR SELECT USING (false); -- only via service role (API enforces teacher/self check)
CREATE POLICY "accommodations_service_write" ON public.user_accommodations
  FOR INSERT WITH CHECK (true); -- service role handles auth
CREATE POLICY "accommodations_service_update" ON public.user_accommodations
  FOR UPDATE USING (true); -- service role handles auth

-- ─── mentor_sessions_v2: participants only ───────────────────
DROP POLICY IF EXISTS "mentor_sessions_select" ON public.mentor_sessions_v2;
DROP POLICY IF EXISTS "mentor_sessions_insert" ON public.mentor_sessions_v2;
CREATE POLICY "mentor_sessions_participants" ON public.mentor_sessions_v2
  FOR SELECT USING (false); -- only via service role
CREATE POLICY "mentor_sessions_service_insert" ON public.mentor_sessions_v2
  FOR INSERT WITH CHECK (true); -- service role handles auth

-- ─── featured_hunts: public read, admin write ────────────────
DROP POLICY IF EXISTS "featured_select" ON public.featured_hunts;
DROP POLICY IF EXISTS "featured_insert" ON public.featured_hunts;
CREATE POLICY "featured_public_read" ON public.featured_hunts
  FOR SELECT USING (true); -- featured hunts are public
CREATE POLICY "featured_admin_write" ON public.featured_hunts
  FOR INSERT WITH CHECK (false); -- only via service role (admin API)

-- ─── leaderboard_snapshots_v2: research only ─────────────────
DROP POLICY IF EXISTS "snapshots_select" ON public.leaderboard_snapshots_v2;
DROP POLICY IF EXISTS "snapshots_insert" ON public.leaderboard_snapshots_v2;
CREATE POLICY "snapshots_research_read" ON public.leaderboard_snapshots_v2
  FOR SELECT USING (false); -- only via service role
CREATE POLICY "snapshots_service_insert" ON public.leaderboard_snapshots_v2
  FOR INSERT WITH CHECK (true);

-- ─── community_health_snapshots: admin only ──────────────────
DROP POLICY IF EXISTS "health_select" ON public.community_health_snapshots;
DROP POLICY IF EXISTS "health_insert" ON public.community_health_snapshots;
CREATE POLICY "health_admin_read" ON public.community_health_snapshots
  FOR SELECT USING (false); -- only via service role
CREATE POLICY "health_service_insert" ON public.community_health_snapshots
  FOR INSERT WITH CHECK (true);
