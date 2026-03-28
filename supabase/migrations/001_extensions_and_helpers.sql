-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── Updated-at trigger ─────────────────────────────────
-- Reusable trigger function for auto-updating updated_at columns

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Users table ────────────────────────────────────────

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'child'
    CHECK (role IN ('child', 'teen', 'parent', 'teacher', 'game_master', 'admin', 'researcher')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
  date_of_birth DATE,
  school_id UUID,
  parent_id UUID REFERENCES public.users(id),
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_parent_id ON public.users(parent_id);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS helper functions ───────────────────────────────
-- These allow readable RLS policies across all tables.
-- Must be created AFTER the users table.

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_id()
RETURNS UUID AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── RLS policies for users ─────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth_id = auth.uid());

-- Users can update their own row
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth_id = auth.uid());

-- Admins and researchers have full access
CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- Parents can read their children
CREATE POLICY "users_parent_read_children" ON public.users
  FOR SELECT USING (parent_id = public.user_id());

-- Teachers can read students in their rosters (added when roster table exists)
-- Service role bypasses RLS for API routes that need cross-user access
