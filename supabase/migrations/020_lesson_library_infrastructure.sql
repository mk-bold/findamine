-- ══════════════════════════════════════════════════════════════
-- Migration 020: Lesson library infrastructure
--
-- Enriches tasks and primers with orchestration metadata,
-- adds clue hints to finds, splits hint tracking, creates
-- pairing_history for tracking what works, and adds hunt
-- orchestration columns.
-- ══════════════════════════════════════════════════════════════

-- ─── A1. Enrich tasks ───────────────────────────────────────

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS difficulty_rating INT CHECK (difficulty_rating BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS themes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_minutes INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS prerequisite_concepts TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_tasks_tags ON public.tasks USING GIN(tags)
  WHERE is_library = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_themes ON public.tasks USING GIN(themes)
  WHERE is_library = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_difficulty ON public.tasks(difficulty_rating)
  WHERE is_library = true AND deleted_at IS NULL;


-- ─── A2. Enrich primers ─────────────────────────────────────

ALTER TABLE public.primers
  ADD COLUMN IF NOT EXISTS difficulty_rating INT CHECK (difficulty_rating BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS themes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_minutes INT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS primer_reveals_location BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_primers_tags ON public.primers USING GIN(tags)
  WHERE is_library = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_primers_themes ON public.primers USING GIN(themes)
  WHERE is_library = true AND deleted_at IS NULL;


-- ─── A3. Add clue_hints to finds ────────────────────────────

ALTER TABLE public.finds
  ADD COLUMN IF NOT EXISTS clue_hints JSONB DEFAULT '[]';


-- ─── A4. Split hint tracking on find_completions ────────────

ALTER TABLE public.find_completions
  ADD COLUMN IF NOT EXISTS clue_hints_used INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS challenge_hints_used INT DEFAULT 0;


-- ─── A5. Pairing history association table ───────────────────

CREATE TABLE IF NOT EXISTS public.pairing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primer_id UUID REFERENCES public.primers(id),
  task_id UUID REFERENCES public.tasks(id),
  hunt_id UUID REFERENCES public.hunts(id),
  find_id UUID REFERENCES public.finds(id),
  location_type TEXT,
  -- Aggregated performance
  times_used INT DEFAULT 1,
  avg_score REAL,
  avg_completion_seconds INT,
  avg_hints_used REAL,
  completion_rate REAL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pairing_lookup ON public.pairing_history(primer_id, task_id);
CREATE INDEX IF NOT EXISTS idx_pairing_task ON public.pairing_history(task_id);
CREATE INDEX IF NOT EXISTS idx_pairing_primer ON public.pairing_history(primer_id);

ALTER TABLE public.pairing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pairing_history_select" ON public.pairing_history
  FOR SELECT USING (true);

CREATE POLICY "pairing_history_insert" ON public.pairing_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "pairing_history_update" ON public.pairing_history
  FOR UPDATE USING (true);


-- ─── A6. Hunt orchestration columns ─────────────────────────

ALTER TABLE public.hunts
  ADD COLUMN IF NOT EXISTS theme TEXT,
  ADD COLUMN IF NOT EXISTS theme_narrative TEXT,
  ADD COLUMN IF NOT EXISTS difficulty_progression TEXT DEFAULT 'mixed'
    CHECK (difficulty_progression IN ('ascending', 'descending', 'mixed', 'plateau'));
