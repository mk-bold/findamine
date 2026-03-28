-- ── Surveys ─────────────────────────────────────────────

CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
  target_roles TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "surveys_select" ON public.surveys
  FOR SELECT USING (deleted_at IS NULL AND (
    status = 'active'
    OR created_by = public.user_id()
    OR public.user_role() IN ('admin', 'researcher')
  ));

CREATE POLICY "surveys_admin" ON public.surveys
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Survey Schedules ───────────────────────────────────

CREATE TABLE public.survey_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time', 'event', 'completion', 'manual')),
  trigger_config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.survey_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_admin" ON public.survey_schedules
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Survey Deliveries ──────────────────────────────────

CREATE TABLE public.survey_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'opened', 'submitted', 'abandoned', 'expired')),
  opened_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_deliveries_user ON public.survey_deliveries(user_id, status);
CREATE INDEX idx_deliveries_survey ON public.survey_deliveries(survey_id);

ALTER TABLE public.survey_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deliveries_own" ON public.survey_deliveries
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "deliveries_update_own" ON public.survey_deliveries
  FOR UPDATE USING (user_id = public.user_id());

CREATE POLICY "deliveries_admin" ON public.survey_deliveries
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Survey Responses ───────────────────────────────────

CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.survey_deliveries(id) ON DELETE CASCADE,
  survey_id UUID NOT NULL REFERENCES public.surveys(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_responses_survey ON public.survey_responses(survey_id);
CREATE INDEX idx_responses_user ON public.survey_responses(user_id);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "responses_own" ON public.survey_responses
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "responses_insert_own" ON public.survey_responses
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "responses_admin" ON public.survey_responses
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Research Studies ───────────────────────────────────

CREATE TABLE public.treatment_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  target_sample_size INT,
  current_sample_size INT DEFAULT 0,
  eligibility_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_studies_updated_at
  BEFORE UPDATE ON public.treatment_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.treatment_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "studies_select" ON public.treatment_studies
  FOR SELECT USING (public.user_role() IN ('admin', 'researcher', 'teacher'));

CREATE POLICY "studies_admin" ON public.treatment_studies
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Treatment Dimensions ───────────────────────────────

CREATE TABLE public.treatment_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  levels TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.treatment_dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dimensions_select" ON public.treatment_dimensions
  FOR SELECT USING (public.user_role() IN ('admin', 'researcher', 'teacher'));

CREATE POLICY "dimensions_admin" ON public.treatment_dimensions
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Study-Dimension Link ───────────────────────────────

CREATE TABLE public.treatment_study_dimensions (
  study_id UUID NOT NULL REFERENCES public.treatment_studies(id) ON DELETE CASCADE,
  dimension_id UUID NOT NULL REFERENCES public.treatment_dimensions(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (study_id, dimension_id)
);

ALTER TABLE public.treatment_study_dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_dims_select" ON public.treatment_study_dimensions
  FOR SELECT USING (public.user_role() IN ('admin', 'researcher', 'teacher'));

CREATE POLICY "study_dims_admin" ON public.treatment_study_dimensions
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Dimension Assignments ──────────────────────────────

CREATE TABLE public.dimension_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  dimension_id UUID NOT NULL REFERENCES public.treatment_dimensions(id),
  level TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  assigned_by UUID REFERENCES public.users(id),
  UNIQUE (user_id, dimension_id)
);

CREATE INDEX idx_assignments_user ON public.dimension_assignments(user_id);

ALTER TABLE public.dimension_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_own" ON public.dimension_assignments
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('admin', 'researcher', 'teacher'));

CREATE POLICY "assignments_admin" ON public.dimension_assignments
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Study Enrollments ──────────────────────────────────

CREATE TABLE public.study_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES public.treatment_studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  withdrawn_at TIMESTAMPTZ,
  UNIQUE (study_id, user_id)
);

ALTER TABLE public.study_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_own" ON public.study_enrollments
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "enrollments_admin" ON public.study_enrollments
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Content Submissions ────────────────────────────────

CREATE TABLE public.content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  submission_type TEXT NOT NULL CHECK (submission_type IN ('story', 'photo', 'drawing', 'audio', 'other')),
  title TEXT,
  content JSONB DEFAULT '{}',
  media_url TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  reviewed_by UUID REFERENCES public.users(id),
  review_notes TEXT,
  hunt_id UUID REFERENCES public.hunts(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_content_user ON public.content_submissions(user_id);
CREATE INDEX idx_content_status ON public.content_submissions(review_status);

CREATE TRIGGER set_content_updated_at
  BEFORE UPDATE ON public.content_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_own" ON public.content_submissions
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

CREATE POLICY "content_insert_own" ON public.content_submissions
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "content_update_own_or_admin" ON public.content_submissions
  FOR UPDATE USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

-- ── Moderation Reports ─────────────────────────────────

CREATE TABLE public.moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('message', 'wall_post', 'content', 'user', 'shoutout')),
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by UUID REFERENCES public.users(id),
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mod_reports_status ON public.moderation_reports(status);
CREATE INDEX idx_mod_reports_entity ON public.moderation_reports(entity_type, entity_id);

CREATE TRIGGER set_mod_reports_updated_at
  BEFORE UPDATE ON public.moderation_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_auth" ON public.moderation_reports
  FOR INSERT WITH CHECK (reporter_id = public.user_id());

CREATE POLICY "reports_select_admin" ON public.moderation_reports
  FOR SELECT USING (reporter_id = public.user_id() OR public.user_role() IN ('teacher', 'game_master', 'admin'));

CREATE POLICY "reports_update_admin" ON public.moderation_reports
  FOR UPDATE USING (public.user_role() IN ('teacher', 'game_master', 'admin'));

-- ── Notifications ──────────────────────────────────────

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  entity_type TEXT,
  entity_id UUID,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (user_id = public.user_id());

CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id),
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  disabled_types TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_notif_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_prefs_own" ON public.notification_preferences
  FOR ALL USING (user_id = public.user_id());

-- ── Feedback Templates ─────────────────────────────────

CREATE TABLE public.feedback_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  template_text TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.feedback_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_templates_select" ON public.feedback_templates
  FOR SELECT USING (public.user_role() IN ('teacher', 'admin'));

CREATE POLICY "feedback_templates_admin" ON public.feedback_templates
  FOR ALL USING (public.user_role() IN ('admin'));

CREATE TABLE public.feedback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  template_id UUID REFERENCES public.feedback_templates(id),
  feedback_text TEXT NOT NULL,
  context_type TEXT,
  context_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_feedback_user ON public.feedback_history(user_id);

ALTER TABLE public.feedback_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_own" ON public.feedback_history
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

CREATE POLICY "feedback_admin_insert" ON public.feedback_history
  FOR INSERT WITH CHECK (public.user_role() IN ('teacher', 'admin') OR user_id = public.user_id());

-- ── Audit Log ──────────────────────────────────────────

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_time ON public.audit_log(created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_admin" ON public.audit_log
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Behavioral Events (L1) ─────────────────────────────

CREATE TABLE public.behavioral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_name TEXT,
  payload JSONB DEFAULT '{}',
  platform TEXT,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_events_user ON public.behavioral_events(user_id, created_at DESC);
CREATE INDEX idx_events_type ON public.behavioral_events(event_type);

ALTER TABLE public.behavioral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_insert_auth" ON public.behavioral_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "events_admin" ON public.behavioral_events
  FOR SELECT USING (public.user_role() IN ('admin', 'researcher'));
