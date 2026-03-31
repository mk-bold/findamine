-- ══════════════════════════════════════════════════════════════
-- Migration 030: Cross-align state standards + align Phase 1 content
--
-- Step 1: Cross-align existing tasks to new state standards
--         (state standards that mirror national standards)
-- Step 2: Align reading_writing content to CCSS-ELA
-- Step 3: Align history_community content to C3
-- ══════════════════════════════════════════════════════════════

-- ─── Step 1: Cross-align state science standards ─────────────
-- Most state science standards mirror NGSS. Tasks aligned to NGSS
-- also align to the equivalent state standard.

-- States that adopted NGSS or NGSS-equivalent: CA, MA, CO (close), NY (close)
-- Tasks aligned to NGSS 4-LS1-1 also align to CA.4-LS1-1, MA.4-LS1-1, CO.SC.4.2.1, AZ.4.L1U1.7
DO $$
DECLARE
  ngss_4ls11 UUID;
  ngss_msess22 UUID;
  ngss_msls21 UUID;
  state_std UUID;
  state_codes TEXT[] := ARRAY[
    'CA.4-LS1-1', 'MA.4-LS1-1', 'CO.SC.4.2.1', 'AZ.4.L1U1.7',
    'TEKS.5.9A', 'SC.4.L.16.3', 'NY.4-PS4-2'
  ];
  sc TEXT;
BEGIN
  SELECT id INTO ngss_4ls11 FROM public.education_standards WHERE code = '4-LS1-1';
  SELECT id INTO ngss_msess22 FROM public.education_standards WHERE code = 'MS-ESS2-2';
  SELECT id INTO ngss_msls21 FROM public.education_standards WHERE code = 'MS-LS2-1';

  -- Cross-align 4-LS1-1 equivalent tasks to state standards
  IF ngss_4ls11 IS NOT NULL THEN
    FOREACH sc IN ARRAY ARRAY['CA.4-LS1-1', 'MA.4-LS1-1', 'CO.SC.4.2.1', 'AZ.4.L1U1.7', 'TEKS.5.9A', 'SC.4.L.16.3']
    LOOP
      SELECT id INTO state_std FROM public.education_standards WHERE code = sc;
      IF state_std IS NOT NULL THEN
        INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
        SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from NGSS 4-LS1-1'
        FROM public.task_standard_alignments ta
        WHERE ta.standard_id = ngss_4ls11
        ON CONFLICT (task_id, standard_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Cross-align MS-ESS2-2 equivalent tasks to state standards
  IF ngss_msess22 IS NOT NULL THEN
    FOREACH sc IN ARRAY ARRAY['CA.MS-ESS2-2', 'MA.MS-ESS2-2', 'SC.7.E.6.5', 'AZ.7.E1U3.8', 'CO.SC.7.3.2', 'TEKS.6.12B']
    LOOP
      SELECT id INTO state_std FROM public.education_standards WHERE code = sc;
      IF state_std IS NOT NULL THEN
        INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
        SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from NGSS MS-ESS2-2'
        FROM public.task_standard_alignments ta
        WHERE ta.standard_id = ngss_msess22
        ON CONFLICT (task_id, standard_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Cross-align MS-LS2-1 to NY.MS-LS2-1
  IF ngss_msls21 IS NOT NULL THEN
    SELECT id INTO state_std FROM public.education_standards WHERE code = 'NY.MS-LS2-1';
    IF state_std IS NOT NULL THEN
      INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
      SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from NGSS MS-LS2-1'
      FROM public.task_standard_alignments ta
      WHERE ta.standard_id = ngss_msls21
      ON CONFLICT (task_id, standard_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- ─── Step 1b: Cross-align state math standards ──────────────
-- States that adopted CCSS-M: CA, NY, MA, CO, AZ (with state-specific codes)
DO $$
DECLARE
  ccss_4mda1 UUID;
  ccss_6rpa1 UUID;
  ccss_6spa1 UUID;
  state_std UUID;
BEGIN
  SELECT id INTO ccss_4mda1 FROM public.education_standards WHERE code = '4.MD.A.1';
  SELECT id INTO ccss_6rpa1 FROM public.education_standards WHERE code = '6.RP.A.1';
  SELECT id INTO ccss_6spa1 FROM public.education_standards WHERE code = '6.SP.A.1';

  -- 4.MD.A.1 equivalents
  IF ccss_4mda1 IS NOT NULL THEN
    FOR state_std IN
      SELECT id FROM public.education_standards
      WHERE code IN ('CA.4.MD.3', 'NY.4.MD.A.1', 'MA.4.MD.A.1', 'AZ.4.MD.A.1', 'UT.3.MD.4',
                     'TEKS.4.7C', 'MA.4.GR.2.1')
    LOOP
      INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
      SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from CCSS-M measurement/data'
      FROM public.task_standard_alignments ta
      WHERE ta.standard_id = ccss_4mda1
      ON CONFLICT (task_id, standard_id) DO NOTHING;
    END LOOP;
  END IF;

  -- 6.RP.A.1 equivalents
  IF ccss_6rpa1 IS NOT NULL THEN
    FOR state_std IN
      SELECT id FROM public.education_standards
      WHERE code IN ('CA.6.RP.1', 'CO.MA.6.RP.A.1', 'AZ.6.RP.A.1', 'MA.6.RP.A.1',
                     'UT.7.RP.2', 'TEKS.7.3A', 'MA.6.AR.1.1')
    LOOP
      INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
      SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from CCSS-M ratios'
      FROM public.task_standard_alignments ta
      WHERE ta.standard_id = ccss_6rpa1
      ON CONFLICT (task_id, standard_id) DO NOTHING;
    END LOOP;
  END IF;

  -- 6.SP.A.1 equivalents
  IF ccss_6spa1 IS NOT NULL THEN
    FOR state_std IN
      SELECT id FROM public.education_standards
      WHERE code IN ('NY.6.SP.A.1', 'UT.HS.S.ID.1')
    LOOP
      INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
      SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from CCSS-M statistics'
      FROM public.task_standard_alignments ta
      WHERE ta.standard_id = ccss_6spa1
      ON CONFLICT (task_id, standard_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- ─── Step 1c: Cross-align state ELA standards ───────────────
DO $$
DECLARE
  ccss_w43 UUID;
  ccss_sl64 UUID;
  ccss_w71 UUID;
  state_std UUID;
BEGIN
  SELECT id INTO ccss_w43 FROM public.education_standards WHERE code = 'W.4.3';
  SELECT id INTO ccss_sl64 FROM public.education_standards WHERE code = 'SL.6.4';
  SELECT id INTO ccss_w71 FROM public.education_standards WHERE code = 'W.7.1';

  -- W.4.3 (narrative writing) equivalents
  IF ccss_w43 IS NOT NULL THEN
    FOR state_std IN
      SELECT id FROM public.education_standards
      WHERE code IN ('CA.W.4.3', 'NY.W.4.3', 'MA.W.4.3', 'AZ.4.W.3', 'CO.RWC.4.2',
                     'TEKS.4.11A', 'ELA.4.R.2.1', 'UT.W.3.2')
    LOOP
      INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
      SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from CCSS-ELA writing'
      FROM public.task_standard_alignments ta
      WHERE ta.standard_id = ccss_w43
      ON CONFLICT (task_id, standard_id) DO NOTHING;
    END LOOP;
  END IF;

  -- SL.6.4 (speaking/presenting) equivalents
  IF ccss_sl64 IS NOT NULL THEN
    FOR state_std IN
      SELECT id FROM public.education_standards
      WHERE code IN ('CA.SL.6.1', 'NY.SL.6.4', 'MA.SL.6.4', 'AZ.7.SL.4', 'CO.RWC.7.3',
                     'TEKS.7.8A', 'ELA.7.C.1.3', 'UT.SL.5.1')
    LOOP
      INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
      SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from CCSS-ELA speaking'
      FROM public.task_standard_alignments ta
      WHERE ta.standard_id = ccss_sl64
      ON CONFLICT (task_id, standard_id) DO NOTHING;
    END LOOP;
  END IF;

  -- W.7.1 (argumentative writing) equivalents
  IF ccss_w71 IS NOT NULL THEN
    FOR state_std IN
      SELECT id FROM public.education_standards
      WHERE code IN ('UT.W.7.1', 'UT.W.9-10.2')
    LOOP
      INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
      SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from CCSS-ELA argument writing'
      FROM public.task_standard_alignments ta
      WHERE ta.standard_id = ccss_w71
      ON CONFLICT (task_id, standard_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- ─── Step 1d: Cross-align state social studies standards ─────
DO $$
DECLARE
  c3_geo135 UUID;
  c3_his135 UUID;
  c3_d3135 UUID;
  state_std UUID;
BEGIN
  SELECT id INTO c3_geo135 FROM public.education_standards WHERE code = 'D2.Geo.1.3-5';
  SELECT id INTO c3_his135 FROM public.education_standards WHERE code = 'D2.His.1.3-5';
  SELECT id INTO c3_d3135 FROM public.education_standards WHERE code = 'D3.1.3-5';

  -- Geography equivalents
  IF c3_geo135 IS NOT NULL THEN
    FOR state_std IN
      SELECT id FROM public.education_standards
      WHERE code IN ('TEKS.5.10A', 'CA.HSS.3.4.2', 'NY.SS.5.5', 'SS.5.A.1.1',
                     'CO.SS.4.2.1', 'MA.HST.5.T2', 'AZ.4.SP2.1', 'UT.SS.4.2.1')
    LOOP
      INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
      SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from C3 geography/history'
      FROM public.task_standard_alignments ta
      WHERE ta.standard_id = c3_geo135
      ON CONFLICT (task_id, standard_id) DO NOTHING;
    END LOOP;
  END IF;

  -- History equivalents for 6-8
  FOR state_std IN
    SELECT id FROM public.education_standards
    WHERE code IN ('TEKS.8.23A', 'CA.HSS.8.12.5', 'NY.SS.7.6', 'SS.8.A.3.1',
                   'CO.SS.7.1.1', 'MA.HST.8.T4', 'AZ.7.SP3.1', 'UT.SS.8.1.1')
  LOOP
    -- Align all C3 6-8 history-aligned tasks to state 6-8 history standards
    INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
    SELECT ta.task_id, state_std, 'secondary', 'Cross-aligned from C3 history 6-8'
    FROM public.task_standard_alignments ta
    JOIN public.education_standards es ON ta.standard_id = es.id
    JOIN public.standard_frameworks sf ON es.framework_id = sf.id
    WHERE sf.code = 'C3'
      AND es.grade_range_min <= 8
      AND es.grade_range_max >= 6
      AND es.domain IN ('History', 'Geography', 'Evaluating Sources')
    ON CONFLICT (task_id, standard_id) DO NOTHING;
  END LOOP;
END $$;


-- ─── Step 2: Align reading_writing content to CCSS-ELA ──────
-- The 10 new reading_writing tasks from migration 028 should align
-- to matching CCSS-ELA writing and speaking standards.

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: reading_writing task to CCSS-ELA'
FROM public.tasks t
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'reading_writing'
  AND f.code = 'CCSS_ELA'
  AND t.challenge_type IN ('creative_writing', 'short_text') AND s.domain = 'Writing'
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: speaking task to CCSS-ELA'
FROM public.tasks t
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'reading_writing'
  AND t.challenge_type = 'audio_response' AND f.code = 'CCSS_ELA'
  AND s.domain = 'Speaking & Listening'
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;


-- ─── Step 3: Align history_community content to C3 ──────────

INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT t.id, s.id, 'secondary', 'Auto-aligned: history_community task to C3'
FROM public.tasks t
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE t.is_library = true AND t.deleted_at IS NULL
  AND t.subject_domain = 'history_community'
  AND f.code = 'C3'
  AND s.grade_range_min <= t.grade_range_max
  AND s.grade_range_max >= t.grade_range_min
ON CONFLICT (task_id, standard_id) DO NOTHING;


-- ─── Step 4: Align new primers to matching standards ────────

INSERT INTO public.primer_standard_alignments (primer_id, standard_id, alignment_strength, notes)
SELECT p.id, s.id, 'supporting', 'Auto-aligned: primer supports standard'
FROM public.primers p
CROSS JOIN public.education_standards s
JOIN public.standard_frameworks f ON s.framework_id = f.id
WHERE p.is_library = true AND p.deleted_at IS NULL
  AND (
    (p.subject_domain = 'reading_writing' AND f.code = 'CCSS_ELA')
    OR (p.subject_domain = 'history_community' AND f.code = 'C3')
  )
  AND s.grade_range_min <= COALESCE(p.grade_range_max, 12)
  AND s.grade_range_max >= COALESCE(p.grade_range_min, 0)
ON CONFLICT (primer_id, standard_id) DO NOTHING;
