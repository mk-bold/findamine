-- ── Migration 012: Curriculum Library Columns ────────────────
-- Adds location dependency and location type to tasks and primers
-- for filtering reusable curriculum content.

-- Tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS location_dependency TEXT NOT NULL DEFAULT 'independent'
    CHECK (location_dependency IN ('independent', 'type_dependent', 'location_specific')),
  ADD COLUMN IF NOT EXISTS location_type TEXT NOT NULL DEFAULT 'any'
    CHECK (location_type IN ('any', 'park', 'water', 'mountain', 'urban', 'farm', 'forest', 'campus', 'historic', 'trail', 'field'));

CREATE INDEX IF NOT EXISTS idx_tasks_library ON public.tasks(is_library, location_dependency, location_type)
  WHERE is_library = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_subject_grade ON public.tasks(subject_domain, grade_range_min, grade_range_max)
  WHERE is_library = true AND deleted_at IS NULL;

COMMENT ON COLUMN public.tasks.location_dependency IS
  'independent = works anywhere; type_dependent = needs a kind of place (park, water, etc.); location_specific = tied to exact GPS point';

COMMENT ON COLUMN public.tasks.location_type IS
  'For type_dependent tasks: what kind of location is required. ''any'' for independent/specific tasks.';

-- Primers
ALTER TABLE public.primers
  ADD COLUMN IF NOT EXISTS location_dependency TEXT NOT NULL DEFAULT 'independent'
    CHECK (location_dependency IN ('independent', 'type_dependent', 'location_specific')),
  ADD COLUMN IF NOT EXISTS location_type TEXT NOT NULL DEFAULT 'any'
    CHECK (location_type IN ('any', 'park', 'water', 'mountain', 'urban', 'farm', 'forest', 'campus', 'historic', 'trail', 'field'));

CREATE INDEX IF NOT EXISTS idx_primers_library ON public.primers(is_library, location_dependency, location_type)
  WHERE is_library = true AND deleted_at IS NULL;

-- Update existing seed tasks to mark as location_specific (they reference BYU/Provo)
UPDATE public.tasks SET location_dependency = 'location_specific', location_type = 'campus'
  WHERE location_dependency = 'independent' AND is_library = false AND deleted_at IS NULL;
