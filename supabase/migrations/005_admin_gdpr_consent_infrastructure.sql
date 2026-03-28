-- ── Rosters ────────────────────────────────────────────

CREATE TABLE public.rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.users(id),
  school_id UUID,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_rosters_teacher ON public.rosters(teacher_id);

CREATE TRIGGER set_rosters_updated_at
  BEFORE UPDATE ON public.rosters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rosters_own" ON public.rosters
  FOR ALL USING (teacher_id = public.user_id() OR public.user_role() IN ('admin'));

CREATE TABLE public.roster_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roster_id UUID NOT NULL REFERENCES public.rosters(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id),
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (roster_id, student_id)
);

ALTER TABLE public.roster_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roster_entries_teacher" ON public.roster_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rosters r
      WHERE r.id = roster_entries.roster_id
      AND (r.teacher_id = public.user_id() OR public.user_role() IN ('admin'))
    )
  );

-- Now add the deferred teacher-reads-students RLS policy on users
CREATE POLICY "users_teacher_read_roster_students" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roster_entries re
      JOIN public.rosters r ON r.id = re.roster_id
      WHERE re.student_id = users.id
      AND r.teacher_id = public.user_id()
    )
  );

-- ── Consent Records ────────────────────────────────────

CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  consent_type TEXT NOT NULL CHECK (consent_type IN ('parental', 'research', 'terms', 'privacy', 'school')),
  form_version TEXT,
  granted BOOLEAN NOT NULL DEFAULT true,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  signature_name TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}',
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_consent_user ON public.consent_records(user_id);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_own" ON public.consent_records
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "consent_insert" ON public.consent_records
  FOR INSERT WITH CHECK (user_id = public.user_id() OR public.user_role() IN ('admin'));

CREATE POLICY "consent_update" ON public.consent_records
  FOR UPDATE USING (user_id = public.user_id() OR public.user_role() IN ('admin'));

-- ── Privacy Settings ───────────────────────────────────

CREATE TABLE public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id),
  granularity_tier TEXT DEFAULT 'simple' CHECK (granularity_tier IN ('simple', 'moderate', 'complex')),
  settings JSONB DEFAULT '{}',
  version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_privacy_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "privacy_own" ON public.privacy_settings
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('admin'));

-- ── GDPR: Data Export Requests ─────────────────────────

CREATE TABLE public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'downloaded', 'expired')),
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exports_own" ON public.data_export_requests
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('admin'));

-- ── GDPR: Data Deletion Requests ──────────────────────

CREATE TABLE public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  reason TEXT,
  scheduled_purge_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deletions_own_or_admin" ON public.data_deletion_requests
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('admin'));

-- ── App Events (seasonal/campaigns) ───────────────────

CREATE TABLE public.app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_app_events_updated_at
  BEFORE UPDATE ON public.app_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_active" ON public.app_events
  FOR SELECT USING (is_active = true OR public.user_role() IN ('admin'));

CREATE POLICY "events_admin" ON public.app_events
  FOR ALL USING (public.user_role() IN ('admin'));

-- ── Tutorials ──────────────────────────────────────────

CREATE TABLE public.tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  target_roles TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutorials_select_all" ON public.tutorials
  FOR SELECT USING (true);

CREATE POLICY "tutorials_admin" ON public.tutorials
  FOR ALL USING (public.user_role() IN ('admin'));

CREATE TABLE public.tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, tutorial_id)
);

ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutorial_progress_own" ON public.tutorial_progress
  FOR ALL USING (user_id = public.user_id());

-- ── Accommodations ─────────────────────────────────────

CREATE TABLE public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  accommodation_type TEXT NOT NULL CHECK (accommodation_type IN (
    'extended_time', 'text_to_speech', 'high_contrast', 'dyslexia_font',
    'reduced_motion', 'large_text', 'screen_reader', 'simplified_ui',
    'audio_descriptions', 'color_blind_mode', 'keyboard_navigation', 'other'
  )),
  settings JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_accommodations_user ON public.accommodations(user_id);

ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accommodations_own_or_staff" ON public.accommodations
  FOR ALL USING (
    user_id = public.user_id()
    OR created_by = public.user_id()
    OR public.user_role() IN ('teacher', 'parent', 'admin')
  );

-- ── Full-text search: add tsvector to hunts ────────────

ALTER TABLE public.hunts ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_hunts_search ON public.hunts USING GIN (search_vector);
