-- ══════════════════════════════════════════════════════
-- Migration 006: Complete database schema
-- Adds ~25 missing tables for research, gamification,
-- compliance, AI, and the full stop flow.
-- ══════════════════════════════════════════════════════

-- ── Login Attempts (security tracking) ─────────────────

CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  email TEXT,
  success BOOLEAN NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_login_attempts_user ON public.login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email, created_at DESC);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "login_attempts_admin" ON public.login_attempts
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Parent-Child Links ─────────────────────────────────

CREATE TABLE public.parent_child_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.users(id),
  child_id UUID NOT NULL REFERENCES public.users(id),
  relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('parent', 'guardian', 'teacher')),
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (parent_id, child_id)
);

ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pcl_own" ON public.parent_child_links
  FOR ALL USING (parent_id = public.user_id() OR child_id = public.user_id() OR public.user_role() IN ('admin'));

-- ── Schools / Organizations ────────────────────────────

CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT,
  state TEXT,
  address TEXT,
  dpa_signed_at TIMESTAMPTZ,
  contract_ref TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schools_select_all" ON public.schools
  FOR SELECT USING (true);

CREATE POLICY "schools_admin" ON public.schools
  FOR ALL USING (public.user_role() IN ('admin'));

-- ── User Profiles (extended) ───────────────────────────

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  favorite_subjects TEXT[] DEFAULT '{}',
  hobbies TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  fun_fact TEXT,
  bio TEXT CHECK (char_length(bio) <= 300),
  age_band TEXT CHECK (age_band IN ('primary', 'intermediate', 'teen', 'adult')),
  age_band_override TEXT CHECK (age_band_override IN ('primary', 'intermediate', 'teen', 'adult')),
  effective_band TEXT GENERATED ALWAYS AS (COALESCE(age_band_override, age_band)) STORED,
  guided_prompt_responses JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own" ON public.user_profiles
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

-- ── Personality Archetypes ─────────────────────────────

CREATE TABLE public.personality_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  traits JSONB DEFAULT '{}',
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.personality_archetypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archetypes_select_all" ON public.personality_archetypes
  FOR SELECT USING (true);

CREATE POLICY "archetypes_admin" ON public.personality_archetypes
  FOR ALL USING (public.user_role() IN ('admin'));

-- ── Player Assessments ─────────────────────────────────

CREATE TABLE public.player_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  archetype_id UUID REFERENCES public.personality_archetypes(id),
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('personality', 'growth_mindset', 'self_regulation', 'learning_style')),
  responses JSONB DEFAULT '{}',
  scores JSONB DEFAULT '{}',
  assessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_assessments_user ON public.player_assessments(user_id);

ALTER TABLE public.player_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments_own_or_staff" ON public.player_assessments
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin', 'researcher'));

-- ── Team Formation Configs ─────────────────────────────

CREATE TABLE public.team_formation_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID NOT NULL REFERENCES public.hunts(id) ON DELETE CASCADE,
  strategy TEXT NOT NULL CHECK (strategy IN (
    'random', 'personality_similar', 'personality_diverse',
    'growth_mindset_similar', 'growth_mindset_diverse',
    'performance_similar', 'performance_diverse', 'teacher_assigned'
  )),
  config JSONB DEFAULT '{}',
  min_team_size INT DEFAULT 2,
  max_team_size INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.team_formation_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tfc_hunt_owner_or_admin" ON public.team_formation_configs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.hunts h WHERE h.id = team_formation_configs.hunt_id AND h.created_by = public.user_id())
    OR public.user_role() IN ('admin')
  );

-- ── Hunt Enrollments ───────────────────────────────────

CREATE TABLE public.hunt_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  hunt_id UUID NOT NULL REFERENCES public.hunts(id),
  team_id UUID REFERENCES public.teams(id),
  enrollment_code TEXT,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'active', 'completed', 'withdrawn')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, hunt_id)
);

CREATE INDEX idx_enrollments_hunt ON public.hunt_enrollments(hunt_id);
CREATE INDEX idx_enrollments_user ON public.hunt_enrollments(user_id);

ALTER TABLE public.hunt_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_own_or_staff" ON public.hunt_enrollments
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin', 'researcher'));

-- ── User Sanctions ─────────────────────────────────────

CREATE TABLE public.user_sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  sanction_type TEXT NOT NULL CHECK (sanction_type IN (
    'warning', 'mute_1h', 'mute_24h', 'suspension_24h',
    'suspension_72h', 'suspension_1week', 'ban_permanent'
  )),
  reason TEXT NOT NULL,
  details TEXT,
  issued_by UUID NOT NULL REFERENCES public.users(id),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sanctions_user ON public.user_sanctions(user_id);

ALTER TABLE public.user_sanctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sanctions_admin" ON public.user_sanctions
  FOR ALL USING (public.user_role() IN ('teacher', 'game_master', 'admin'));

CREATE POLICY "sanctions_own_read" ON public.user_sanctions
  FOR SELECT USING (user_id = public.user_id());

-- ── Message Moderation Events (Study 8 primary data) ───

CREATE TABLE public.message_moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.team_messages(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  team_id UUID NOT NULL REFERENCES public.teams(id),
  original_text TEXT NOT NULL,
  ai_classification TEXT CHECK (ai_classification IN ('appropriate', 'mildly_concerning', 'inappropriate', 'harmful')),
  ai_category TEXT,
  ai_confidence REAL,
  moderation_level INT NOT NULL CHECK (moderation_level BETWEEN 0 AND 3),
  intervention_shown BOOLEAN DEFAULT false,
  explanation_shown BOOLEAN DEFAULT false,
  suggested_alternative TEXT,
  user_action TEXT CHECK (user_action IN ('sent_as_is', 'rewrote', 'accepted_suggestion', 'cancelled')),
  revised_text TEXT,
  final_text TEXT,
  response_time_ms INT,
  treatment_dimension_id UUID REFERENCES public.treatment_dimensions(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mme_user ON public.message_moderation_events(user_id);
CREATE INDEX idx_mme_team ON public.message_moderation_events(team_id);
CREATE INDEX idx_mme_level ON public.message_moderation_events(moderation_level);

ALTER TABLE public.message_moderation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mme_admin" ON public.message_moderation_events
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Privacy Events (Studies 1-3) ───────────────────────

CREATE TABLE public.privacy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  event_type TEXT NOT NULL,
  page TEXT,
  old_value JSONB,
  new_value JSONB,
  duration_ms INT,
  click_count INT,
  session_id TEXT,
  norm_exposure_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_privacy_events_user ON public.privacy_events(user_id, created_at DESC);
CREATE INDEX idx_privacy_events_type ON public.privacy_events(event_type);

ALTER TABLE public.privacy_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pe_own_insert" ON public.privacy_events
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "pe_admin" ON public.privacy_events
  FOR SELECT USING (public.user_role() IN ('admin', 'researcher'));

-- ── Norm Exposures (Study 5) ───────────────────────────

CREATE TABLE public.norm_exposures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  norm_type TEXT NOT NULL CHECK (norm_type IN ('descriptive', 'injunctive', 'both')),
  content_shown TEXT NOT NULL,
  view_duration_ms INT,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_norm_user ON public.norm_exposures(user_id);

ALTER TABLE public.norm_exposures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "norm_insert_own" ON public.norm_exposures
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "norm_admin" ON public.norm_exposures
  FOR SELECT USING (public.user_role() IN ('admin', 'researcher'));

-- ── Self-Control Interventions (Study 7) ───────────────

CREATE TABLE public.self_control_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  intervention_type TEXT NOT NULL CHECK (intervention_type IN (
    'control', 'implementation_intention', 'commitment_device', 'combined'
  )),
  planned_day TEXT,
  planned_time TIME,
  lock_start_at TIMESTAMPTZ,
  lock_end_at TIMESTAMPTZ,
  override_count INT DEFAULT 0,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.self_control_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sci_own" ON public.self_control_interventions
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "sci_admin" ON public.self_control_interventions
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Points Ledger ──────────────────────────────────────

CREATE TABLE public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  amount INT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'challenge', 'hunt_complete', 'badge', 'streak', 'kudos',
    'mentor', 'bonus', 'seasonal', 'adjustment'
  )),
  source_id UUID,
  hunt_id UUID REFERENCES public.hunts(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_points_user ON public.points_ledger(user_id, created_at DESC);

ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "points_own" ON public.points_ledger
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

CREATE POLICY "points_insert_system" ON public.points_ledger
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Streaks ────────────────────────────────────────────

CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id),
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  freezes_used INT DEFAULT 0,
  freezes_available INT DEFAULT 1,
  freeze_used_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streaks_own" ON public.streaks
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('admin'));

-- ── User Tiers ─────────────────────────────────────────

CREATE TABLE public.user_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id),
  tier INT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 4),
  total_points INT DEFAULT 0,
  promoted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_tiers_updated_at
  BEFORE UPDATE ON public.user_tiers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tiers_select_all" ON public.user_tiers
  FOR SELECT USING (true);

CREATE POLICY "tiers_admin" ON public.user_tiers
  FOR ALL USING (public.user_role() IN ('admin'));

-- ── Find Photos ────────────────────────────────────────

CREATE TABLE public.find_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  completion_id UUID NOT NULL REFERENCES public.find_completions(id) ON DELETE CASCADE,
  storage_ref TEXT,
  local_only BOOLEAN DEFAULT false,
  caption TEXT CHECK (char_length(caption) <= 200),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_find_photos_completion ON public.find_photos(completion_id);

ALTER TABLE public.find_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_own" ON public.find_photos
  FOR ALL USING (uploaded_by = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

-- ── User Milestones ────────────────────────────────────

CREATE TABLE public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  milestone_type TEXT NOT NULL CHECK (milestone_type IN (
    'first_hunt_started', 'first_hunt_completed', 'first_team_joined',
    'first_badge_earned', 'first_kudos_sent', 'first_content_created',
    'first_mentor_session', 'onboarding_completed', 'profile_completed',
    'privacy_reviewed', 'assessment_completed'
  )),
  achieved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, milestone_type)
);

ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestones_own" ON public.user_milestones
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin', 'researcher'));

-- ── Survey Questions (item-level) ──────────────────────

CREATE TABLE public.survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'likert_5', 'likert_7', 'multiple_choice', 'free_text',
    'slider', 'ranking', 'matrix'
  )),
  options JSONB DEFAULT '[]',
  scale_config JSONB DEFAULT '{}',
  reverse_coded BOOLEAN DEFAULT false,
  subscale TEXT,
  sort_order INT DEFAULT 0,
  skip_logic JSONB,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sq_survey ON public.survey_questions(survey_id, sort_order);

ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sq_select" ON public.survey_questions
  FOR SELECT USING (true);

CREATE POLICY "sq_admin" ON public.survey_questions
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Feedback Log ───────────────────────────────────────

CREATE TABLE public.feedback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  template_id UUID REFERENCES public.feedback_templates(id),
  feedback_text TEXT NOT NULL,
  trigger_type TEXT CHECK (trigger_type IN (
    'answer_submitted', 'hint_requested', 'badge_earned',
    'streak_achieved', 'session_ended', 'moderation_flagged'
  )),
  context_type TEXT,
  context_id UUID,
  generated_by TEXT CHECK (generated_by IN ('template', 'ai', 'hybrid')),
  ai_model TEXT,
  learner_rating INT CHECK (learner_rating BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_fl_user ON public.feedback_log(user_id, created_at DESC);

ALTER TABLE public.feedback_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fl_own" ON public.feedback_log
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

CREATE POLICY "fl_insert" ON public.feedback_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── AI Hint Cache ──────────────────────────────────────

CREATE TABLE public.ai_hint_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id),
  hint_level INT NOT NULL CHECK (hint_level BETWEEN 1 AND 4),
  age_band TEXT CHECK (age_band IN ('primary', 'intermediate', 'teen', 'adult')),
  hint_text TEXT NOT NULL,
  ai_model TEXT,
  usage_count INT DEFAULT 0,
  avg_rating REAL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_hints_task ON public.ai_hint_cache(task_id, hint_level, age_band);

ALTER TABLE public.ai_hint_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hints_select_all" ON public.ai_hint_cache
  FOR SELECT USING (status = 'active');

CREATE POLICY "hints_admin" ON public.ai_hint_cache
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Mentor Sessions ────────────────────────────────────

CREATE TABLE public.mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id),
  mentor_user_id UUID NOT NULL REFERENCES public.users(id),
  mentee_user_id UUID NOT NULL REFERENCES public.users(id),
  find_id UUID REFERENCES public.finds(id),
  help_type TEXT NOT NULL CHECK (help_type IN ('hint', 'feedback', 'explanation', 'peer_review')),
  content TEXT,
  mentee_improved BOOLEAN,
  given_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mentor_team ON public.mentor_sessions(team_id);

ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mentor_team_member" ON public.mentor_sessions
  FOR ALL USING (
    mentor_user_id = public.user_id()
    OR mentee_user_id = public.user_id()
    OR public.user_role() IN ('teacher', 'admin', 'researcher')
  );

-- ── Answer Feedback ────────────────────────────────────

CREATE TABLE public.answer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  completion_id UUID NOT NULL REFERENCES public.find_completions(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('correct', 'incorrect', 'partial')),
  main_message TEXT NOT NULL,
  explanation TEXT,
  next_steps TEXT,
  generated_by TEXT CHECK (generated_by IN ('template', 'ai', 'hybrid')),
  ai_model TEXT,
  tone TEXT DEFAULT 'growth_mindset',
  learner_rating INT CHECK (learner_rating BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_af_completion ON public.answer_feedback(completion_id);

ALTER TABLE public.answer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "af_own" ON public.answer_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.find_completions fc
      JOIN public.play_sessions ps ON ps.id = fc.play_session_id
      WHERE fc.id = answer_feedback.completion_id AND ps.user_id = public.user_id()
    )
    OR public.user_role() IN ('teacher', 'admin')
  );

CREATE POLICY "af_insert" ON public.answer_feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Seasonal Event Hunts (join table) ──────────────────

CREATE TABLE public.seasonal_event_hunts (
  event_id UUID NOT NULL REFERENCES public.app_events(id) ON DELETE CASCADE,
  hunt_id UUID NOT NULL REFERENCES public.hunts(id) ON DELETE CASCADE,
  bonus_multiplier REAL DEFAULT 1.0,
  PRIMARY KEY (event_id, hunt_id)
);

ALTER TABLE public.seasonal_event_hunts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seh_select_all" ON public.seasonal_event_hunts
  FOR SELECT USING (true);

CREATE POLICY "seh_admin" ON public.seasonal_event_hunts
  FOR ALL USING (public.user_role() IN ('admin'));

-- ── Leaderboard Snapshots ──────────────────────────────

CREATE TABLE public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID REFERENCES public.hunts(id),
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('baseline', 'periodic', 'post_intervention', 'endline')),
  period TEXT DEFAULT 'weekly',
  summary_stats JSONB DEFAULT '{}',
  snapshot_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ls_select_all" ON public.leaderboard_snapshots
  FOR SELECT USING (true);

CREATE POLICY "ls_admin" ON public.leaderboard_snapshots
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Terms & Policy Acceptances ─────────────────────────

CREATE TABLE public.terms_policy_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('terms_of_use', 'privacy_policy', 'research_consent', 'cookie_policy')),
  document_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  UNIQUE (user_id, document_type, document_version)
);

ALTER TABLE public.terms_policy_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tpa_own" ON public.terms_policy_acceptances
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('admin'));

-- ── Data Deletion Audit ────────────────────────────────

CREATE TABLE public.data_deletion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deletion_request_id UUID REFERENCES public.data_deletion_requests(id),
  user_id UUID NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('research_only', 'full_account')),
  tables_affected TEXT[] DEFAULT '{}',
  rows_deleted INT DEFAULT 0,
  summary JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.data_deletion_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dda_admin" ON public.data_deletion_audit
  FOR ALL USING (public.user_role() IN ('admin'));

-- ── Research Frameworks (reference data) ───────────────

CREATE TABLE public.research_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  source_citation TEXT,
  elements JSONB DEFAULT '[]',
  used_in_app BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.research_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rf_select_all" ON public.research_frameworks
  FOR SELECT USING (true);

CREATE POLICY "rf_admin" ON public.research_frameworks
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Research Citations ─────────────────────────────────

CREATE TABLE public.research_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authors TEXT NOT NULL,
  year INT NOT NULL,
  title TEXT NOT NULL,
  journal TEXT,
  doi TEXT,
  url TEXT,
  key_finding TEXT,
  used_in TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.research_citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rc_select_all" ON public.research_citations
  FOR SELECT USING (true);

CREATE POLICY "rc_admin" ON public.research_citations
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Regulations (compliance reference) ─────────────────

CREATE TABLE public.regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  jurisdiction_type TEXT CHECK (jurisdiction_type IN ('federal', 'state', 'international', 'supranational')),
  description TEXT,
  url TEXT,
  enforcing_authority TEXT,
  max_fine TEXT,
  elements JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reg_select_all" ON public.regulations
  FOR SELECT USING (true);

CREATE POLICY "reg_admin" ON public.regulations
  FOR ALL USING (public.user_role() IN ('admin'));
