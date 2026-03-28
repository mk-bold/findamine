-- ── Locations (PostGIS) ─────────────────────────────────

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters REAL DEFAULT 50,
  address TEXT,
  place_id TEXT,
  location_type TEXT,
  safety_notes TEXT,
  is_library BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_locations_geo ON public.locations USING GIST (coordinates);
CREATE INDEX idx_locations_created_by ON public.locations(created_by);

CREATE TRIGGER set_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_select_public" ON public.locations
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "locations_insert_creators" ON public.locations
  FOR INSERT WITH CHECK (public.user_role() IN ('teacher', 'game_master', 'admin', 'researcher'));

CREATE POLICY "locations_update_own" ON public.locations
  FOR UPDATE USING (created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "locations_delete_own" ON public.locations
  FOR DELETE USING (created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

-- PostGIS nearby search function
CREATE OR REPLACE FUNCTION public.nearby_locations(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_m DOUBLE PRECISION DEFAULT 5000,
  max_results INT DEFAULT 50
)
RETURNS TABLE (
  id UUID, name TEXT, description TEXT,
  latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  radius_meters REAL, address TEXT, location_type TEXT,
  distance_meters DOUBLE PRECISION, created_at TIMESTAMPTZ
) AS $$
  SELECT
    l.id, l.name, l.description,
    l.latitude, l.longitude,
    l.radius_meters, l.address, l.location_type,
    ST_Distance(
      l.coordinates,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distance_meters,
    l.created_at
  FROM public.locations l
  WHERE l.deleted_at IS NULL
    AND ST_DWithin(
      l.coordinates,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_m
    )
  ORDER BY distance_meters
  LIMIT max_results
$$ LANGUAGE sql STABLE;

-- ── Tasks ──────────────────────────────────────────────

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_domain TEXT CHECK (subject_domain IN (
    'science_nature', 'math_real_world', 'geography_maps',
    'critical_thinking', 'reading_writing', 'history_community'
  )),
  challenge_type TEXT NOT NULL CHECK (challenge_type IN (
    'multiple_choice', 'numeric_entry', 'short_text', 'photo_observation',
    'sketch_draw', 'audio_response', 'sorting_ordering', 'team_debate',
    'data_collection', 'creative_writing'
  )),
  content JSONB DEFAULT '{}',
  grade_range_min INT,
  grade_range_max INT,
  difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 5),
  feedback JSONB DEFAULT '{}',
  is_library BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_subject ON public.tasks(subject_domain);
CREATE INDEX idx_tasks_type ON public.tasks(challenge_type);

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_all" ON public.tasks
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "tasks_insert_creators" ON public.tasks
  FOR INSERT WITH CHECK (public.user_role() IN ('teacher', 'game_master', 'admin', 'researcher'));

CREATE POLICY "tasks_update_own" ON public.tasks
  FOR UPDATE USING (created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "tasks_delete_own" ON public.tasks
  FOR DELETE USING (created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

-- ── Primers ────────────────────────────────────────────

CREATE TABLE public.primers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  subject_domain TEXT,
  grade_range_min INT,
  grade_range_max INT,
  is_library BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_primers_updated_at
  BEFORE UPDATE ON public.primers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.primers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "primers_select_all" ON public.primers
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "primers_insert_creators" ON public.primers
  FOR INSERT WITH CHECK (public.user_role() IN ('teacher', 'game_master', 'admin', 'researcher'));

CREATE POLICY "primers_update_own" ON public.primers
  FOR UPDATE USING (created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "primers_delete_own" ON public.primers
  FOR DELETE USING (created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

-- ── Educational Standards ──────────────────────────────

CREATE TABLE public.standard_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  jurisdiction TEXT,
  grade_range_min INT,
  grade_range_max INT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.standard_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "frameworks_select_all" ON public.standard_frameworks
  FOR SELECT USING (true);

CREATE POLICY "frameworks_admin" ON public.standard_frameworks
  FOR ALL USING (public.user_role() IN ('teacher', 'admin'));

CREATE TABLE public.standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES public.standard_frameworks(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  grade_level INT,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_standards_framework ON public.standards(framework_id);

ALTER TABLE public.standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "standards_select_all" ON public.standards
  FOR SELECT USING (true);

CREATE POLICY "standards_admin" ON public.standards
  FOR ALL USING (public.user_role() IN ('teacher', 'admin'));

-- ── Hunts ──────────────────────────────────────────────

CREATE TABLE public.hunts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT NOT NULL DEFAULT 'all'
    CHECK (target_audience IN ('kids', 'teens', 'adults', 'family', 'all')),
  play_mode TEXT NOT NULL DEFAULT 'solo'
    CHECK (play_mode IN ('solo', 'team_assigned', 'team_self_select', 'team_random', 'team_ai_smart', 'team_custom_multi_dim')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'enrollment_open', 'in_progress', 'ended')),
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  center_latitude DOUBLE PRECISION,
  center_longitude DOUBLE PRECISION,
  search_radius_km REAL,
  estimated_duration_min INT,
  grade_range_min INT,
  grade_range_max INT,
  subject_domains TEXT[] DEFAULT '{}',
  max_teams INT,
  min_team_size INT DEFAULT 1,
  max_team_size INT DEFAULT 6,
  allow_late_join BOOLEAN DEFAULT false,
  source_template_id UUID REFERENCES public.hunts(id),
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_hunts_created_by ON public.hunts(created_by);
CREATE INDEX idx_hunts_status ON public.hunts(status);
CREATE INDEX idx_hunts_template ON public.hunts(is_template) WHERE is_template = true;

CREATE TRIGGER set_hunts_updated_at
  BEFORE UPDATE ON public.hunts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.hunts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hunts_select_public" ON public.hunts
  FOR SELECT USING (
    deleted_at IS NULL AND (
      is_public = true
      OR created_by = public.user_id()
      OR public.user_role() IN ('admin', 'researcher')
    )
  );

CREATE POLICY "hunts_insert_creators" ON public.hunts
  FOR INSERT WITH CHECK (public.user_role() IN ('teacher', 'game_master', 'admin', 'researcher'));

CREATE POLICY "hunts_update_own" ON public.hunts
  FOR UPDATE USING (created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

CREATE POLICY "hunts_delete_own" ON public.hunts
  FOR DELETE USING (created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'));

-- Hunt search helper
CREATE OR REPLACE FUNCTION public.search_hunts(
  lat DOUBLE PRECISION DEFAULT NULL,
  lng DOUBLE PRECISION DEFAULT NULL,
  radius_km DOUBLE PRECISION DEFAULT 50,
  search_query TEXT DEFAULT NULL,
  audience TEXT DEFAULT NULL,
  max_results INT DEFAULT 50
)
RETURNS TABLE (
  id UUID, title TEXT, description TEXT, target_audience TEXT,
  play_mode TEXT, status TEXT, center_latitude DOUBLE PRECISION,
  center_longitude DOUBLE PRECISION, estimated_duration_min INT,
  is_template BOOLEAN, created_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
) AS $$
  SELECT
    h.id, h.title, h.description, h.target_audience,
    h.play_mode, h.status, h.center_latitude,
    h.center_longitude, h.estimated_duration_min,
    h.is_template, h.created_at,
    CASE WHEN lat IS NOT NULL AND lng IS NOT NULL AND h.center_latitude IS NOT NULL
      THEN ST_Distance(
        ST_SetSRID(ST_MakePoint(h.center_longitude, h.center_latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
      ) / 1000.0
      ELSE NULL
    END AS distance_km
  FROM public.hunts h
  WHERE h.deleted_at IS NULL
    AND h.status IN ('published', 'enrollment_open')
    AND h.is_public = true
    AND (audience IS NULL OR h.target_audience IN (audience, 'all'))
    AND (search_query IS NULL OR (
      h.title ILIKE '%' || search_query || '%'
      OR h.description ILIKE '%' || search_query || '%'
    ))
    AND (lat IS NULL OR lng IS NULL OR h.center_latitude IS NULL OR (
      ST_DWithin(
        ST_SetSRID(ST_MakePoint(h.center_longitude, h.center_latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        radius_km * 1000
      )
    ))
  ORDER BY
    CASE WHEN lat IS NOT NULL AND lng IS NOT NULL AND h.center_latitude IS NOT NULL
      THEN ST_Distance(
        ST_SetSRID(ST_MakePoint(h.center_longitude, h.center_latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
      )
      ELSE 0
    END
  LIMIT max_results
$$ LANGUAGE sql STABLE;

-- ── Finds (stops within a hunt) ────────────────────────

CREATE TABLE public.finds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID NOT NULL REFERENCES public.hunts(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id),
  task_id UUID REFERENCES public.tasks(id),
  primer_id UUID REFERENCES public.primers(id),
  sort_order INT NOT NULL DEFAULT 0,
  clue_text TEXT,
  hot_cold_enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_finds_hunt ON public.finds(hunt_id);
CREATE INDEX idx_finds_order ON public.finds(hunt_id, sort_order);

CREATE TRIGGER set_finds_updated_at
  BEFORE UPDATE ON public.finds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.finds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finds_select_via_hunt" ON public.finds
  FOR SELECT USING (
    deleted_at IS NULL AND EXISTS (
      SELECT 1 FROM public.hunts h
      WHERE h.id = finds.hunt_id AND h.deleted_at IS NULL
      AND (h.is_public = true OR h.created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'))
    )
  );

CREATE POLICY "finds_modify_hunt_owner" ON public.finds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hunts h
      WHERE h.id = finds.hunt_id
      AND (h.created_by = public.user_id() OR public.user_role() IN ('admin', 'researcher'))
    )
  );

-- ── Standard alignments ────────────────────────────────

CREATE TABLE public.task_standard_alignments (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  standard_id UUID NOT NULL REFERENCES public.standards(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, standard_id)
);

ALTER TABLE public.task_standard_alignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alignments_select_all" ON public.task_standard_alignments
  FOR SELECT USING (true);

CREATE POLICY "alignments_admin" ON public.task_standard_alignments
  FOR ALL USING (public.user_role() IN ('teacher', 'admin'));

-- ── Play sessions ──────────────────────────────────────

CREATE TABLE public.play_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID NOT NULL REFERENCES public.hunts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  team_id UUID,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  total_score INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_play_sessions_user ON public.play_sessions(user_id);
CREATE INDEX idx_play_sessions_hunt ON public.play_sessions(hunt_id);
CREATE UNIQUE INDEX idx_play_sessions_active ON public.play_sessions(hunt_id, user_id)
  WHERE status = 'active';

CREATE TRIGGER set_play_sessions_updated_at
  BEFORE UPDATE ON public.play_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.play_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "play_select_own" ON public.play_sessions
  FOR SELECT USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin', 'researcher'));

CREATE POLICY "play_insert_own" ON public.play_sessions
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "play_update_own" ON public.play_sessions
  FOR UPDATE USING (user_id = public.user_id());

-- ── Find completions ───────────────────────────────────

CREATE TABLE public.find_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_session_id UUID NOT NULL REFERENCES public.play_sessions(id) ON DELETE CASCADE,
  find_id UUID NOT NULL REFERENCES public.finds(id),
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  answer_value TEXT,
  score INT DEFAULT 0,
  hints_used INT DEFAULT 0,
  feedback TEXT,
  photo_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_completions_session ON public.find_completions(play_session_id);
CREATE INDEX idx_completions_find ON public.find_completions(find_id);

ALTER TABLE public.find_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "completions_select_own" ON public.find_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.play_sessions ps
      WHERE ps.id = find_completions.play_session_id
      AND (ps.user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin', 'researcher'))
    )
  );

CREATE POLICY "completions_insert_own" ON public.find_completions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.play_sessions ps
      WHERE ps.id = find_completions.play_session_id
      AND ps.user_id = public.user_id()
    )
  );

CREATE POLICY "completions_update_own" ON public.find_completions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.play_sessions ps
      WHERE ps.id = find_completions.play_session_id
      AND ps.user_id = public.user_id()
    )
  );

-- ── Media uploads ──────────────────────────────────────

CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes BIGINT,
  entity_type TEXT,
  entity_id UUID,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_media_entity ON public.media(entity_type, entity_id);
CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_select_all" ON public.media
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "media_insert_auth" ON public.media
  FOR INSERT WITH CHECK (uploaded_by = public.user_id());

CREATE POLICY "media_delete_own" ON public.media
  FOR DELETE USING (uploaded_by = public.user_id() OR public.user_role() IN ('admin'));
