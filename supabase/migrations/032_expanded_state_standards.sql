-- ══════════════════════════════════════════════════════════════
-- Migration 032: Expanded state standards
--
-- Adds 7 more standards per state × 7 states = 49 new standards
-- Focus on K-2 coverage and high school (9-12)
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  fw_id UUID;
BEGIN

  -- ─── TEXAS (+7) ────────────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'TX_TEKS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'TEKS.1.6A', 'Science', 'Identify and describe different types of weather such as sunny, cloudy, rainy, and windy.', '1', 1, 1, 9),
      (fw_id, 'TEKS.2.10A', 'Science', 'Observe, describe, and sort rocks by size, shape, color, and texture.', '2', 2, 2, 10),
      (fw_id, 'TEKS.K.2E', 'Math', 'Generate a set using concrete and pictorial models that represents a number that is more than, less than, or equal to a given number.', 'K', 0, 0, 11),
      (fw_id, 'TEKS.2.4D', 'Math', 'Determine whether a number up to 40 is even or odd using models.', '2', 2, 2, 12),
      (fw_id, 'TEKS.HS.B.6A', 'Biology', 'Describe the interactions that occur among systems that perform the functions of transport, reproduction, and response in plants.', '9-12', 9, 12, 13),
      (fw_id, 'TEKS.K.1A', 'Social Studies', 'Describe the order of events by using designations of time periods such as historical and present times.', 'K', 0, 0, 14),
      (fw_id, 'TEKS.HS.WH.1A', 'World History', 'Identify major causes and describe the major effects of significant events in world history.', '9-12', 9, 12, 15)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── CALIFORNIA (+7) ──────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'CA_CCSS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'CA.K-ESS2-1', 'Science', 'Use and share observations of local weather conditions to describe patterns over time.', 'K', 0, 0, 9),
      (fw_id, 'CA.2-LS4-1', 'Science', 'Make observations of plants and animals to compare the diversity of life in different habitats.', '2', 2, 2, 10),
      (fw_id, 'CA.K.CC.A.1', 'Math', 'Count to 100 by ones and by tens.', 'K', 0, 0, 11),
      (fw_id, 'CA.1.MD.A.1', 'Math', 'Order three objects by length; compare the lengths of two objects indirectly.', '1', 1, 1, 12),
      (fw_id, 'CA.HS-LS2-6', 'Science', 'Evaluate the claims, evidence, and reasoning that the complex interactions in ecosystems maintain relatively consistent numbers of organisms.', '9-12', 9, 12, 13),
      (fw_id, 'CA.HSS.K.1', 'History-Social Science', 'Students understand that being a good citizen involves acting in certain ways.', 'K', 0, 0, 14),
      (fw_id, 'CA.HSS.11.3', 'History-Social Science', 'Students analyze the role religion played in the founding of America and its lasting moral, social, and political impacts.', '11', 11, 11, 15)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── NEW YORK (+7) ────────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'NY_NYS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'NY.K-LS1-1', 'Science', 'Use observations to describe patterns of what plants and animals need to survive.', 'K', 0, 0, 9),
      (fw_id, 'NY.2-ESS2-3', 'Science', 'Obtain information to identify where water is found on Earth and that it can be solid or liquid.', '2', 2, 2, 10),
      (fw_id, 'NY.K.CC.A.1', 'Math', 'Count to 100 by ones and by tens.', 'K', 0, 0, 11),
      (fw_id, 'NY.2.MD.A.1', 'Math', 'Measure the length of an object by selecting and using appropriate tools.', '2', 2, 2, 12),
      (fw_id, 'NY.HS-ESS3-4', 'Science', 'Evaluate or refine a technological solution that reduces impacts of human activities on natural systems.', '9-12', 9, 12, 13),
      (fw_id, 'NY.SS.K.3', 'Social Studies', 'Identify things that are needed for people to live and distinguish them from things people want.', 'K', 0, 0, 14),
      (fw_id, 'NY.SS.11.2', 'Social Studies', 'Analyze the development of American culture, its diversity, and the ways people are unified by many values, practices, and traditions.', '11', 11, 11, 15)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── FLORIDA (+7) ─────────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'FL_BEST';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'SC.K.L.14.1', 'Science', 'Recognize that living things have basic needs for survival such as food, water, air, and space.', 'K', 0, 0, 9),
      (fw_id, 'SC.2.E.7.1', 'Science', 'Compare and describe changing patterns in nature that repeat themselves, such as weather conditions and seasonal changes.', '2', 2, 2, 10),
      (fw_id, 'MA.K.NSO.1.1', 'Math', 'Given a group of up to 20 objects, count the number of objects in that group.', 'K', 0, 0, 11),
      (fw_id, 'MA.2.M.1.1', 'Math', 'Estimate and measure the length of an object to the nearest inch, foot, yard, centimeter, or meter.', '2', 2, 2, 12),
      (fw_id, 'SC.912.L.17.8', 'Science', 'Recognize the consequences of the losses of biodiversity due to catastrophic events and human activity.', '9-12', 9, 12, 13),
      (fw_id, 'SS.K.A.1.1', 'Social Studies', 'Develop an understanding of how to use and create a timeline.', 'K', 0, 0, 14),
      (fw_id, 'SS.912.A.1.1', 'Social Studies', 'Describe the importance of historiography, which includes how historical knowledge is obtained and transmitted.', '9-12', 9, 12, 15)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── COLORADO (+7) ────────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'CO_ACAD';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'CO.SC.K.1.1', 'Science', 'Use observations to describe what plants and animals need to survive.', 'K', 0, 0, 9),
      (fw_id, 'CO.SC.2.3.1', 'Science', 'Use evidence to construct an explanation for how the variations in characteristics among organisms may provide advantages.', '2', 2, 2, 10),
      (fw_id, 'CO.MA.K.CC.A.1', 'Math', 'Count to 100 by ones and by tens.', 'K', 0, 0, 11),
      (fw_id, 'CO.MA.2.MD.A.1', 'Math', 'Measure the length of an object by selecting appropriate tools.', '2', 2, 2, 12),
      (fw_id, 'CO.SC.HS.2.1', 'Science', 'Evaluate the evidence supporting claims that changes in environmental conditions may result in increases in certain traits.', '9-12', 9, 12, 13),
      (fw_id, 'CO.SS.K.1.1', 'Social Studies', 'Understand that Americans are people of diverse ethnic and cultural backgrounds united by basic shared values.', 'K', 0, 0, 14),
      (fw_id, 'CO.SS.HS.1.2', 'Social Studies', 'Analyze and evaluate the foundations, structures, and functions of the U.S. government.', '9-12', 9, 12, 15)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── MASSACHUSETTS (+7) ──────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'MA_CF';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'MA.K-LS1-1', 'Science', 'Use observations to describe patterns of what plants and animals need to survive.', 'K', 0, 0, 9),
      (fw_id, 'MA.2-ESS2-1', 'Science', 'Investigate and compare the effects of wind and water on the shape of the land.', '2', 2, 2, 10),
      (fw_id, 'MA.K.CC.A.1', 'Math', 'Count to 100 by ones and by tens.', 'K', 0, 0, 11),
      (fw_id, 'MA.2.MD.A.1', 'Math', 'Measure the length of an object by selecting and using appropriate tools.', '2', 2, 2, 12),
      (fw_id, 'MA.HS-LS4-6', 'Science', 'Create or revise a simulation to test a solution to mitigate adverse impacts of human activity on biodiversity.', '9-12', 9, 12, 13),
      (fw_id, 'MA.HST.K.T1', 'History', 'Demonstrate civic knowledge and skills by participating in community activities.', 'K', 0, 0, 14),
      (fw_id, 'MA.HST.US2.T1', 'History', 'Analyze the political, economic, and social transformations brought about by World War I.', '9-12', 9, 12, 15)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── ARIZONA (+7) ─────────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'AZ_CCRS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'AZ.K.L1U1.1', 'Science', 'Use observations to describe patterns in the natural world to answer scientific questions.', 'K', 0, 0, 9),
      (fw_id, 'AZ.2.L2U1.8', 'Science', 'Obtain, evaluate, and communicate information about how plants depend on animals for pollination or seed dispersal.', '2', 2, 2, 10),
      (fw_id, 'AZ.K.CC.A.1', 'Math', 'Count to 100 by ones and by tens.', 'K', 0, 0, 11),
      (fw_id, 'AZ.2.MD.A.1', 'Math', 'Measure the length of an object by selecting and using appropriate tools.', '2', 2, 2, 12),
      (fw_id, 'AZ.HS.L4U1.15', 'Science', 'Construct an explanation based on evidence for how natural selection leads to adaptation of populations.', '9-12', 9, 12, 13),
      (fw_id, 'AZ.K.SP1.1', 'Social Studies', 'Describe how daily life has changed over time.', 'K', 0, 0, 14),
      (fw_id, 'AZ.HS.SP2.1', 'Social Studies', 'Examine how historical events and developments were shaped by unique circumstances of time and place.', '9-12', 9, 12, 15)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

END $$;
