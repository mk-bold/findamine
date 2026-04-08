-- ══════════════════════════════════════════════════════════════
-- Migration 042: Fix user_role() infinite recursion
--
-- Root cause: user_role() queries public.users, which has an
-- RLS policy (users_admin_all) that calls user_role() → infinite
-- recursion → stack depth exceeded on EVERY anon/authenticated
-- REST API call.
--
-- Fix: Make user_role() SECURITY DEFINER so it bypasses RLS on
-- the users table (same pattern as user_id() which already works).
-- Also set search_path to prevent search_path injection attacks.
-- ══════════════════════════════════════════════════════════════

-- Fix user_role(): add SECURITY DEFINER + restrict search_path
CREATE OR REPLACE FUNCTION public.user_role()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $function$
  SELECT role FROM public.users
  WHERE auth_id = auth.uid()
  LIMIT 1;
$function$;

-- Also fix user_id() to have search_path set (security best practice)
CREATE OR REPLACE FUNCTION public.user_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $function$
  SELECT id FROM public.users WHERE auth_id = auth.uid()
$function$;
