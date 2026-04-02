-- ══════════════════════════════════════════════════════════════
-- Migration 033: Cross-align expanded standards to existing content
--
-- Aligns new federal standards (031) and state standards (032)
-- to existing library tasks using subject + grade overlap.
-- Also cross-aligns state K-2 and 9-12 standards to
-- equivalent national standards.
-- ══════════════════════════════════════════════════════════════

-- ─── NGSS Physical Science + Engineering → science tasks ─────

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: science task to NGSS physical science/engineering'
FROM public.tasks t
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'science_nature'
  AND f.code = 'NGSS'
  AND s.domain IN ('Physical Science', 'Engineering')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
  AND t.tags && ARRAY['forces','push','pull','energy','waves','matter','particles','engineering','design']
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- ─── CCSS-M new operations/algebra → math tasks ─────────────

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: math task to CCSS-M operations/algebra'
FROM public.tasks t
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'math_real_world'
  AND f.code = 'CCSS_M'
  AND s.domain IN ('Operations & Algebraic Thinking', 'The Number System', 'Expressions & Equations', 'Algebra', 'Number & Operations — Fractions')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- ─── CCSS-ELA new reading/language → reading_writing tasks ──

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: reading/writing task to CCSS-ELA reading/language'
FROM public.tasks t
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'reading_writing'
  AND f.code = 'CCSS_ELA'
  AND s.domain IN ('Reading: Informational Text', 'Language')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- ─── C3 economics/civics → critical_thinking + history tasks ─

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: critical thinking to C3 economics/civics'
FROM public.tasks t
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain IN ('critical_thinking', 'history_community')
  AND f.code = 'C3'
  AND s.domain IN ('Economics', 'Civics')
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- ─── State K-2 science → NGSS K-LS1-1 aligned content ───────
-- K-2 state science standards share content with NGSS K-LS1-1

DO $$
DECLARE
  ngss_kls11 UUID;
  ngss_kess21 UUID;
  state_std UUID;
  sc TEXT;
BEGIN
  SELECT id INTO ngss_kls11 FROM public.education_standards WHERE code = 'K-LS1-1';
  SELECT id INTO ngss_kess21 FROM public.education_standards WHERE code = 'K-ESS2-1';

  -- K-LS1-1 equivalents
  IF ngss_kls11 IS NOT NULL THEN
    FOREACH sc IN ARRAY ARRAY['CA.K-ESS2-1', 'CA.2-LS4-1', 'NY.K-LS1-1', 'NY.2-ESS2-3',
      'SC.K.L.14.1', 'SC.2.E.7.1', 'CO.SC.K.1.1', 'CO.SC.2.3.1',
      'MA.K-LS1-1', 'MA.2-ESS2-1', 'AZ.K.L1U1.1', 'AZ.2.L2U1.8',
      'TEKS.1.6A', 'TEKS.2.10A']
    LOOP
      SELECT id INTO state_std FROM public.education_standards WHERE code = sc;
      IF state_std IS NOT NULL THEN
        INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
        SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from NGSS K-LS1-1'
        FROM public.task_standard_alignments ta
        WHERE ta.standard_id = ngss_kls11
        ON CONFLICT (task_id, standard_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- ─── State K-2 math → CCSS-M K.CC aligned content ───────────

DO $$
DECLARE
  ccss_kcca1 UUID;
  state_std UUID;
  sc TEXT;
BEGIN
  SELECT id INTO ccss_kcca1 FROM public.education_standards WHERE code = 'K.CC.A.1';

  IF ccss_kcca1 IS NOT NULL THEN
    FOREACH sc IN ARRAY ARRAY['CA.K.CC.A.1', 'NY.K.CC.A.1', 'CO.MA.K.CC.A.1',
      'MA.K.CC.A.1', 'AZ.K.CC.A.1', 'TEKS.K.2E', 'MA.K.NSO.1.1']
    LOOP
      SELECT id INTO state_std FROM public.education_standards WHERE code = sc;
      IF state_std IS NOT NULL THEN
        INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
        SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from CCSS-M K.CC.A.1'
        FROM public.task_standard_alignments ta
        WHERE ta.standard_id = ccss_kcca1
        ON CONFLICT (task_id, standard_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- ─── State 9-12 science → HS-LS2 aligned content ────────────

DO $$
DECLARE
  ngss_hsls21 UUID;
  state_std UUID;
  sc TEXT;
BEGIN
  SELECT id INTO ngss_hsls21 FROM public.education_standards WHERE code = 'HS-LS2-1';

  IF ngss_hsls21 IS NOT NULL THEN
    FOREACH sc IN ARRAY ARRAY['CA.HS-LS2-6', 'TEKS.HS.B.6A', 'NY.HS-ESS3-4',
      'SC.912.L.17.8', 'CO.SC.HS.2.1', 'MA.HS-LS4-6', 'AZ.HS.L4U1.15']
    LOOP
      SELECT id INTO state_std FROM public.education_standards WHERE code = sc;
      IF state_std IS NOT NULL THEN
        INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
        SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from NGSS HS-LS2-1'
        FROM public.task_standard_alignments ta
        WHERE ta.standard_id = ngss_hsls21
        ON CONFLICT (task_id, standard_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- ─── State K social studies → C3 aligned content ─────────────

DO $$
DECLARE
  c3_geo1k2 UUID;
  state_std UUID;
  sc TEXT;
BEGIN
  SELECT id INTO c3_geo1k2 FROM public.education_standards WHERE code = 'D2.Geo.1.K-2';

  IF c3_geo1k2 IS NOT NULL THEN
    FOREACH sc IN ARRAY ARRAY['CA.HSS.K.1', 'NY.SS.K.3', 'TEKS.K.1A',
      'SS.K.A.1.1', 'CO.SS.K.1.1', 'MA.HST.K.T1', 'AZ.K.SP1.1']
    LOOP
      SELECT id INTO state_std FROM public.education_standards WHERE code = sc;
      IF state_std IS NOT NULL THEN
        INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
        SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from C3 K-2 geography'
        FROM public.task_standard_alignments ta
        WHERE ta.standard_id = c3_geo1k2
        ON CONFLICT (task_id, standard_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- ─── Primer alignments for all new standards ─────────────────

INSERT INTO public.primer_standard_alignments (primer_id, standard_id, alignment_strength, notes)
SELECT p.id, s.id, 'supporting', 'Auto-aligned: primer supports new standard'
FROM public.primers p
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE p.is_library = true AND p.deleted_at IS NULL
  AND (
    (p.subject_domain = 'science_nature' AND f.code IN ('NGSS', 'TX_TEKS', 'CA_CCSS', 'NY_NYS', 'FL_BEST', 'CO_ACAD', 'MA_CF', 'AZ_CCRS'))
    OR (p.subject_domain = 'math_real_world' AND f.code IN ('CCSS_M', 'TX_TEKS', 'CA_CCSS', 'NY_NYS', 'FL_BEST', 'CO_ACAD', 'MA_CF', 'AZ_CCRS'))
    OR (p.subject_domain = 'reading_writing' AND f.code IN ('CCSS_ELA', 'TX_TEKS', 'CA_CCSS', 'NY_NYS', 'FL_BEST', 'CO_ACAD', 'MA_CF', 'AZ_CCRS'))
    OR (p.subject_domain IN ('history_community', 'critical_thinking') AND f.code IN ('C3', 'TX_TEKS', 'CA_CCSS', 'NY_NYS', 'FL_BEST', 'CO_ACAD', 'MA_CF', 'AZ_CCRS'))
  )
  AND s.grade_range_min <= COALESCE(p.grade_range_max, 12)
  AND s.grade_range_max >= COALESCE(p.grade_range_min, 0)
  -- Only align to new standards (not already aligned)
  AND NOT EXISTS (
    SELECT 1 FROM public.primer_standard_alignments psa
    WHERE psa.primer_id = p.id AND psa.standard_id = s.id
  )
ON CONFLICT (primer_id, standard_id) DO NOTHING;
