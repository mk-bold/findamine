-- ══════════════════════════════════════════════════════════════
-- Migration 025: Align existing library content to standards
--
-- Maps library tasks to NGSS, CCSS-M, CCSS-ELA, C3 standards
-- by matching subject_domain and grade ranges.
-- Uses tag-based heuristics for initial alignment.
-- ══════════════════════════════════════════════════════════════

-- ─── Science tasks → NGSS standards ─────────────────────────

-- K-2 science tasks → K-LS1-1 (organisms survive) and 2-LS4-1 (habitats)
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: science + K-2 grade overlap'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.grade_range_min <= 2
  AND s.code = 'K-LS1-1'
ON CONFLICT (task_id, standard_id) DO NOTHING;

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: science + K-2 habitats'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.grade_range_min <= 2
  AND s.code = '2-LS4-1'
  AND t.tags && ARRAY['habitats','organisms','ecology']
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- 3-5 science tasks → 4-LS1-1 (plant/animal structures) and 4-ESS2-1 (weathering/erosion)
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: science + 3-5 life science'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.grade_range_min >= 3 AND t.grade_range_max <= 5
  AND s.code = '4-LS1-1'
  AND t.tags && ARRAY['plants','botany','organisms','life_science','ecology']
ON CONFLICT (task_id, standard_id) DO NOTHING;

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: science + 3-5 earth science'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.grade_range_min >= 3 AND t.grade_range_max <= 5
  AND s.code = '4-ESS2-1'
  AND t.tags && ARRAY['erosion','weathering','earth_science','geology','water_cycle']
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- 3-5 weather tasks → 3-ESS2-1
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: weather + 3-5'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.tags && ARRAY['weather','climate','atmosphere']
  AND t.grade_range_min >= 3 AND t.grade_range_max <= 5
  AND s.code = '3-ESS2-1'
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- 6-8 science tasks → MS-LS2-1 (ecosystems) and MS-LS2-3 (energy flow)
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: science + 6-8 ecosystems'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.grade_range_min >= 6 AND t.grade_range_max <= 8
  AND s.code IN ('MS-LS2-1', 'MS-LS2-3')
  AND t.tags && ARRAY['ecosystems','food_web','ecology','energy','energy_flow']
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- 6-8 adaptation tasks → MS-LS4-4
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: adaptation + 6-8'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.tags && ARRAY['adaptation','evolution','natural_selection']
  AND s.code = 'MS-LS4-4'
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- 9-12 science → HS-LS2-1 and HS-LS2-6
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: science + 9-12'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.grade_range_min >= 9
  AND s.code IN ('HS-LS2-1', 'HS-LS2-6')
  AND t.tags && ARRAY['biodiversity','ecosystems','ecology']
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Geology tasks → HS-ESS2-5 or MS-ESS2-2
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: geology'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND t.tags && ARRAY['rocks','geology','rock_cycle']
  AND s.code IN ('MS-ESS2-2', 'HS-ESS2-5')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;


-- ─── Math tasks → CCSS-M standards ──────────────────────────

-- K-2 counting → K.CC.A.1, K.CC.B.4
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: counting + K-2'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'math_real_world'
  AND t.grade_range_min <= 2
  AND t.tags && ARRAY['counting','groups','skip_counting']
  AND s.code IN ('K.CC.A.1', 'K.CC.B.4')
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Measurement tasks → grade-appropriate MD standards
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: measurement'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'math_real_world'
  AND t.tags && ARRAY['measurement','estimation','area','perimeter']
  AND s.domain = 'Measurement & Data'
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Geometry tasks → G standards
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: geometry'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'math_real_world'
  AND t.tags && ARRAY['geometry','angles','shapes']
  AND s.domain = 'Geometry'
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Fraction tasks → 3.NF.A.1
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: fractions'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'math_real_world'
  AND t.tags && ARRAY['fractions','parts','whole']
  AND s.code = '3.NF.A.1'
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Ratio/proportion tasks → 6.RP.A.1, 7.RP.A.2
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: ratios'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'math_real_world'
  AND t.tags && ARRAY['ratio','proportion','scale','percentages']
  AND s.code IN ('6.RP.A.1', '7.RP.A.2')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Statistics tasks → 6.SP.A.1, HSS.ID.A.1
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: statistics'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'math_real_world'
  AND t.tags && ARRAY['statistics','mean','median','mode','probability','data']
  AND s.code IN ('6.SP.A.1', '7.SP.C.5', 'HSS.ID.A.1')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;


-- ─── Geography tasks → C3 standards ─────────────────────────

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: geography + maps'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'geography_maps'
  AND t.tags && ARRAY['maps','navigation','cartography','bird_eye','spatial']
  AND s.code IN ('D2.Geo.1.K-2', 'D2.Geo.1.3-5', 'D2.Geo.2.3-5', 'D2.Geo.2.6-8')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- GPS/coordinates → 5.G.A.1 (coordinate system)
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: GPS coordinates + geometry'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'geography_maps'
  AND t.tags && ARRAY['gps','coordinates','latitude','longitude']
  AND s.code = '5.G.A.1'
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Land use / migration → C3 geography 6-8, 9-12
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: human geography'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'geography_maps'
  AND t.tags && ARRAY['land_use','urban_geography','migration','demographics']
  AND s.code IN ('D2.Geo.5.6-8', 'D2.Geo.7.6-8', 'D2.Geo.6.9-12')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;


-- ─── Writing/speaking tasks → CCSS-ELA ──────────────────────

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: writing tasks'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.challenge_type IN ('creative_writing', 'short_text')
  AND s.domain = 'Writing'
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: speaking tasks'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.challenge_type IN ('audio_response', 'team_debate')
  AND s.domain = 'Speaking & Listening'
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;


-- ─── Critical thinking tasks → C3 evaluating sources ────────

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'primary', 'Auto-aligned: critical thinking + evidence'
FROM public.tasks t
CROSS JOIN public.education_standards s
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'critical_thinking'
  AND t.tags && ARRAY['evidence','reasoning','claims','cer','analysis']
  AND s.code IN ('D3.1.3-5', 'D3.1.6-8')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;


-- ─── Primer alignments (mirror task alignments by subject) ──

-- Align primers the same way: match by subject_domain and grade overlap
INSERT INTO public.primer_standard_alignments (primer_id, standard_id, alignment_strength, notes)
SELECT p.id, s.id, 'supporting', 'Auto-aligned: primer supports standard concepts'
FROM public.primers p
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE p.is_library = true AND p.deleted_at IS NULL
  AND (
    (p.subject_domain = 'science_nature' AND f.code = 'NGSS')
    OR (p.subject_domain = 'math_real_world' AND f.code = 'CCSS_M')
    OR (p.subject_domain = 'geography_maps' AND f.code = 'C3')
    OR (p.subject_domain = 'reading_writing' AND f.code = 'CCSS_ELA')
    OR (p.subject_domain = 'critical_thinking' AND f.code = 'C3')
    OR (p.subject_domain = 'history_community' AND f.code = 'C3')
  )
  AND s.grade_range_min <= COALESCE(p.grade_range_max, 12)
  AND s.grade_range_max >= COALESCE(p.grade_range_min, 0)
ON CONFLICT (primer_id, standard_id) DO NOTHING;
