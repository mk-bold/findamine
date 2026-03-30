-- ── Migration 016: Rename game_master → hunt_creator ─────────
-- Updates the role name in constraints and existing data.

-- 1. Update any existing users with game_master role
UPDATE public.users SET role = 'hunt_creator' WHERE role = 'game_master';

-- 2. Drop and recreate the role check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('child', 'teen', 'parent', 'teacher', 'hunt_creator', 'admin', 'researcher'));

-- 3. Update the user_role() helper function if it exists
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.users
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

-- 4. Update RLS policies that reference 'game_master'
-- (Most policies use the user_role() function, so they'll pick up the new value automatically.
--  But some hardcode the role name in policy definitions.)

-- Hunts policies
DROP POLICY IF EXISTS "hunts_insert_creators" ON public.hunts;
CREATE POLICY "hunts_insert_creators" ON public.hunts
  FOR INSERT WITH CHECK (public.user_role() IN ('teacher', 'hunt_creator', 'admin', 'researcher'));

DROP POLICY IF EXISTS "hunts_update_creators" ON public.hunts;
CREATE POLICY "hunts_update_creators" ON public.hunts
  FOR UPDATE USING (
    created_by = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR public.user_role() IN ('admin', 'researcher')
  );

DROP POLICY IF EXISTS "hunts_delete_creators" ON public.hunts;
CREATE POLICY "hunts_delete_creators" ON public.hunts
  FOR DELETE USING (
    created_by = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR public.user_role() IN ('admin', 'researcher')
  );

-- 5. Also update the seed user role
UPDATE public.users SET role = 'hunt_creator'
  WHERE email = 'seed_james@findamine.app' AND role = 'game_master';
