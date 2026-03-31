-- ══════════════════════════════════════════════════════════════
-- Migration 021: Enrich existing library content with metadata
--
-- Adds difficulty_rating, tags, themes, learning_objectives,
-- and estimated_minutes to all existing library tasks and primers.
-- ══════════════════════════════════════════════════════════════

-- ─── Tasks: Set difficulty_rating from difficulty_level ──────
-- Map difficulty_level (1-5) to difficulty_rating (1-10): level * 2

UPDATE public.tasks SET difficulty_rating = LEAST(difficulty_level * 2, 10)
WHERE is_library = true AND difficulty_rating IS NULL AND difficulty_level IS NOT NULL;

-- Default any remaining library tasks without difficulty_rating to 5
UPDATE public.tasks SET difficulty_rating = 5
WHERE is_library = true AND difficulty_rating IS NULL;

-- ─── Tasks: Set tags based on subject_domain + challenge_type ──

UPDATE public.tasks SET tags = ARRAY['ecology', 'organisms', 'observation']
WHERE is_library = true AND subject_domain = 'science_nature' AND tags = '{}';

UPDATE public.tasks SET tags = ARRAY['measurement', 'estimation', 'calculation']
WHERE is_library = true AND subject_domain = 'math_real_world' AND tags = '{}';

UPDATE public.tasks SET tags = ARRAY['maps', 'navigation', 'orientation']
WHERE is_library = true AND subject_domain = 'geography_maps' AND tags = '{}';

UPDATE public.tasks SET tags = ARRAY['analysis', 'reasoning', 'evaluation']
WHERE is_library = true AND subject_domain = 'critical_thinking' AND tags = '{}';

UPDATE public.tasks SET tags = ARRAY['writing', 'communication', 'expression']
WHERE is_library = true AND subject_domain = 'reading_writing' AND tags = '{}';

UPDATE public.tasks SET tags = ARRAY['heritage', 'community', 'culture']
WHERE is_library = true AND subject_domain = 'history_community' AND tags = '{}';

-- ─── Tasks: Set themes based on location_type ──────────────

UPDATE public.tasks SET themes = ARRAY['nature_detective']
WHERE is_library = true AND location_type IN ('park', 'forest', 'trail', 'water', 'mountain') AND themes = '{}';

UPDATE public.tasks SET themes = ARRAY['urban_explorer']
WHERE is_library = true AND location_type IN ('urban', 'historic') AND themes = '{}';

UPDATE public.tasks SET themes = ARRAY['campus_quest']
WHERE is_library = true AND location_type = 'campus' AND themes = '{}';

UPDATE public.tasks SET themes = ARRAY['field_scientist']
WHERE is_library = true AND location_type IN ('farm', 'field') AND themes = '{}';

UPDATE public.tasks SET themes = ARRAY['explorer']
WHERE is_library = true AND location_type = 'any' AND themes = '{}';

-- ─── Tasks: Set estimated_minutes by challenge_type ────────

UPDATE public.tasks SET estimated_minutes = 3
WHERE is_library = true AND challenge_type = 'multiple_choice' AND estimated_minutes = 5;

UPDATE public.tasks SET estimated_minutes = 4
WHERE is_library = true AND challenge_type IN ('numeric_entry', 'short_text') AND estimated_minutes = 5;

UPDATE public.tasks SET estimated_minutes = 7
WHERE is_library = true AND challenge_type IN ('photo_observation', 'sorting_ordering');

UPDATE public.tasks SET estimated_minutes = 8
WHERE is_library = true AND challenge_type IN ('sketch_draw', 'data_collection', 'creative_writing');

UPDATE public.tasks SET estimated_minutes = 5
WHERE is_library = true AND challenge_type IN ('audio_response', 'team_debate');

-- ─── Tasks: Set learning_objectives from title keywords ────

UPDATE public.tasks SET learning_objectives = ARRAY['Identify and classify natural organisms']
WHERE is_library = true AND subject_domain = 'science_nature'
  AND learning_objectives = '{}' AND title ILIKE '%identif%';

UPDATE public.tasks SET learning_objectives = ARRAY['Apply mathematical concepts to real-world observations']
WHERE is_library = true AND subject_domain = 'math_real_world'
  AND learning_objectives = '{}';

UPDATE public.tasks SET learning_objectives = ARRAY['Develop scientific observation and recording skills']
WHERE is_library = true AND subject_domain = 'science_nature'
  AND learning_objectives = '{}';

UPDATE public.tasks SET learning_objectives = ARRAY['Analyze and evaluate information critically']
WHERE is_library = true AND subject_domain = 'critical_thinking'
  AND learning_objectives = '{}';

UPDATE public.tasks SET learning_objectives = ARRAY['Practice creative and analytical writing']
WHERE is_library = true AND subject_domain = 'reading_writing'
  AND learning_objectives = '{}';

UPDATE public.tasks SET learning_objectives = ARRAY['Understand geographic and spatial concepts']
WHERE is_library = true AND subject_domain = 'geography_maps'
  AND learning_objectives = '{}';

UPDATE public.tasks SET learning_objectives = ARRAY['Connect with local history and community']
WHERE is_library = true AND subject_domain = 'history_community'
  AND learning_objectives = '{}';


-- ─── Primers: Set difficulty_rating ─────────────────────────

UPDATE public.primers SET difficulty_rating = 5
WHERE is_library = true AND difficulty_rating IS NULL;

-- ─── Primers: Set tags to match subject_domain ─────────────

UPDATE public.primers SET tags = ARRAY['ecology', 'organisms', 'environment']
WHERE is_library = true AND subject_domain = 'science_nature' AND tags = '{}';

UPDATE public.primers SET tags = ARRAY['math', 'numbers', 'measurement']
WHERE is_library = true AND subject_domain = 'math_real_world' AND tags = '{}';

UPDATE public.primers SET tags = ARRAY['geography', 'maps', 'location']
WHERE is_library = true AND subject_domain = 'geography_maps' AND tags = '{}';

UPDATE public.primers SET tags = ARRAY['thinking', 'reasoning', 'analysis']
WHERE is_library = true AND subject_domain = 'critical_thinking' AND tags = '{}';

UPDATE public.primers SET tags = ARRAY['reading', 'writing', 'language']
WHERE is_library = true AND subject_domain = 'reading_writing' AND tags = '{}';

UPDATE public.primers SET tags = ARRAY['history', 'community', 'heritage']
WHERE is_library = true AND subject_domain = 'history_community' AND tags = '{}';

-- ─── Primers: Set themes ────────────────────────────────────

UPDATE public.primers SET themes = ARRAY['nature_detective']
WHERE is_library = true AND location_type IN ('park', 'forest', 'trail', 'water', 'mountain') AND themes = '{}';

UPDATE public.primers SET themes = ARRAY['urban_explorer']
WHERE is_library = true AND location_type IN ('urban', 'historic') AND themes = '{}';

UPDATE public.primers SET themes = ARRAY['campus_quest']
WHERE is_library = true AND location_type = 'campus' AND themes = '{}';

UPDATE public.primers SET themes = ARRAY['explorer']
WHERE is_library = true AND (location_type = 'any' OR location_type IS NULL) AND themes = '{}';

-- ─── Primers: Set learning_objectives ───────────────────────

UPDATE public.primers SET learning_objectives = ARRAY['Review foundational concepts before the challenge']
WHERE is_library = true AND learning_objectives = '{}';
