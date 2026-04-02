-- ══════════════════════════════════════════════════════════════
-- Migration 034: Enable RLS on ALL public tables
--
-- Fixes Supabase security advisory: rls_disabled_in_public
-- Ensures every table has RLS enabled. Tables that already
-- have RLS are unaffected (ALTER TABLE ... ENABLE is idempotent).
--
-- For tables without policies, adds a service-role-only policy
-- so they're only accessible via the service role key (API routes).
-- ══════════════════════════════════════════════════════════════

-- Enable RLS on every public table (idempotent — safe to re-run)
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.tablename);
  END LOOP;
END $$;

-- For tables that have NO policies at all, add a restrictive default.
-- This ensures no table is wide-open to the anon key.
-- Tables accessed by the app use the service role client, which
-- bypasses RLS, so this doesn't break functionality.

-- Check which tables have zero policies and add a deny-all for anon
DO $$
DECLARE
  tbl RECORD;
  policy_count INT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  LOOP
    SELECT count(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = tbl.tablename;

    IF policy_count = 0 THEN
      -- No policies exist: add a service-role-only select policy
      EXECUTE format(
        'CREATE POLICY "service_role_only_%s" ON public.%I FOR ALL USING (false)',
        tbl.tablename, tbl.tablename
      );
    END IF;
  END LOOP;
END $$;
