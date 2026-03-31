-- ══════════════════════════════════════════════════════════════
-- Migration 027: Cross-align content to state/international standards
--
-- Links existing tasks to Utah SEEd standards where NGSS-aligned
-- tasks cover equivalent content. Also ensures the two remaining
-- Utah standards (5.1.1, 6.4.1) get aligned to existing tasks.
-- ══════════════════════════════════════════════════════════════

-- ─── Utah SEEd cross-alignments ──────────────────────────────
-- Utah SEEd standards closely mirror NGSS. Tasks already aligned
-- to NGSS standards can be cross-aligned to matching Utah standards.

DO $$
DECLARE
  fw_ut UUID;
  std_511 UUID;
  std_641 UUID;
  ngss_4ess22 UUID;
  ngss_msls21 UUID;
BEGIN
  SELECT id INTO fw_ut FROM public.standard_frameworks WHERE code = 'UT_SEEd';

  -- 5.1.1 (Earth features) ↔ tasks aligned to 4-ESS2-2
  SELECT id INTO std_511 FROM public.education_standards WHERE code = '5.1.1' AND framework_id = fw_ut;
  SELECT id INTO ngss_4ess22 FROM public.education_standards WHERE code = '4-ESS2-2';

  IF std_511 IS NOT NULL AND ngss_4ess22 IS NOT NULL THEN
    INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
    SELECT ta.task_id, std_511, 'secondary', 'Cross-aligned from NGSS 4-ESS2-2'
    FROM public.task_standard_alignments ta
    WHERE ta.standard_id = ngss_4ess22
    ON CONFLICT (task_id, standard_id) DO NOTHING;

    INSERT INTO public.primer_standard_alignments (primer_id, standard_id, alignment_strength, notes)
    SELECT pa.primer_id, std_511, 'secondary', 'Cross-aligned from NGSS 4-ESS2-2'
    FROM public.primer_standard_alignments pa
    WHERE pa.standard_id = ngss_4ess22
    ON CONFLICT (primer_id, standard_id) DO NOTHING;
  END IF;

  -- 6.4.1 (Environmental factors) ↔ tasks aligned to MS-LS2-1
  SELECT id INTO std_641 FROM public.education_standards WHERE code = '6.4.1' AND framework_id = fw_ut;
  SELECT id INTO ngss_msls21 FROM public.education_standards WHERE code = 'MS-LS2-1';

  IF std_641 IS NOT NULL AND ngss_msls21 IS NOT NULL THEN
    INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
    SELECT ta.task_id, std_641, 'secondary', 'Cross-aligned from NGSS MS-LS2-1'
    FROM public.task_standard_alignments ta
    WHERE ta.standard_id = ngss_msls21
    ON CONFLICT (task_id, standard_id) DO NOTHING;

    INSERT INTO public.primer_standard_alignments (primer_id, standard_id, alignment_strength, notes)
    SELECT pa.primer_id, std_641, 'secondary', 'Cross-aligned from NGSS MS-LS2-1'
    FROM public.primer_standard_alignments pa
    WHERE pa.standard_id = ngss_msls21
    ON CONFLICT (primer_id, standard_id) DO NOTHING;
  END IF;
END $$;

-- ─── Broad cross-alignments: match by subject + grade ────────
-- Utah SEEd 4.2.1 (plant/animal structures) ↔ NGSS 4-LS1-1 aligned tasks
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT ta.task_id, s2.id, 'secondary', 'Cross-aligned: equivalent Utah SEEd standard'
FROM public.task_standard_alignments ta
JOIN public.education_standards s1 ON ta.standard_id = s1.id AND s1.code = '4-LS1-1'
CROSS JOIN public.education_standards s2
JOIN public.standard_frameworks f ON s2.framework_id = f.id AND f.code = 'UT_SEEd'
WHERE s2.code = '4.2.1'
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Utah SEEd 5.2.2 (matter/energy cycling) ↔ NGSS 5-LS2-1 aligned tasks
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT ta.task_id, s2.id, 'secondary', 'Cross-aligned: equivalent Utah SEEd standard'
FROM public.task_standard_alignments ta
JOIN public.education_standards s1 ON ta.standard_id = s1.id AND s1.code = '5-LS2-1'
CROSS JOIN public.education_standards s2
JOIN public.standard_frameworks f ON s2.framework_id = f.id AND f.code = 'UT_SEEd'
WHERE s2.code = '5.2.2'
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Utah SEEd 7.3.4 (genetic variation) ↔ NGSS MS-LS4-4 aligned tasks
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT ta.task_id, s2.id, 'secondary', 'Cross-aligned: equivalent Utah SEEd standard'
FROM public.task_standard_alignments ta
JOIN public.education_standards s1 ON ta.standard_id = s1.id AND s1.code = 'MS-LS4-4'
CROSS JOIN public.education_standards s2
JOIN public.standard_frameworks f ON s2.framework_id = f.id AND f.code = 'UT_SEEd'
WHERE s2.code = '7.3.4'
ON CONFLICT (task_id, standard_id) DO NOTHING;

-- Utah SEEd 8.2.6 (human impact) ↔ NGSS MS-ESS3-3 aligned tasks
INSERT INTO public.task_standard_alignments (task_id, standard_id, alignment_strength, notes)
SELECT ta.task_id, s2.id, 'secondary', 'Cross-aligned: equivalent Utah SEEd standard'
FROM public.task_standard_alignments ta
JOIN public.education_standards s1 ON ta.standard_id = s1.id AND s1.code = 'MS-ESS3-3'
CROSS JOIN public.education_standards s2
JOIN public.standard_frameworks f ON s2.framework_id = f.id AND f.code = 'UT_SEEd'
WHERE s2.code = '8.2.6'
ON CONFLICT (task_id, standard_id) DO NOTHING;
