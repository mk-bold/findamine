-- ══════════════════════════════════════════════════════════════
-- Migration 029: Seed state standards
--
-- Adds 8 representative standards per state for 7 states:
-- TX, CA, NY, FL, CO, MA, AZ
-- Plus 12 standards for UT_MATH, UT_ELA, UT_SS
-- Total: 68 new standards
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  fw_id UUID;
BEGIN

  -- ─── TEXAS (TX_TEKS) ──────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'TX_TEKS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'TEKS.5.9A', 'Science', 'Observe the way organisms live and survive in their ecosystem by interacting with the living and nonliving components.', '5', 5, 5, 1),
      (fw_id, 'TEKS.6.12B', 'Science', 'Identify the main functions of the systems of the human organism, including the circulatory, respiratory, skeletal, muscular, digestive, and nervous systems.', '6', 6, 6, 2),
      (fw_id, 'TEKS.4.7C', 'Math', 'Determine the approximate measures of angles in degrees using a protractor.', '4', 4, 4, 3),
      (fw_id, 'TEKS.7.3A', 'Math', 'Add, subtract, multiply, and divide rational numbers fluently.', '7', 7, 7, 4),
      (fw_id, 'TEKS.4.11A', 'ELA', 'Plan a first draft by selecting a genre appropriate for a particular topic, purpose, and audience.', '4', 4, 4, 5),
      (fw_id, 'TEKS.7.8A', 'ELA', 'Write a clear thesis statement and organize ideas logically in a multi-paragraph composition.', '7', 7, 7, 6),
      (fw_id, 'TEKS.5.10A', 'Social Studies', 'Identify the impact of various issues and events on life in the United States, including urbanization and industrialization.', '5', 5, 5, 7),
      (fw_id, 'TEKS.8.23A', 'Social Studies', 'Identify and analyze the causes and effects of events prior to and during the American Revolution.', '8', 8, 8, 8)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── CALIFORNIA (CA_CCSS) ─────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'CA_CCSS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'CA.4-LS1-1', 'Science', 'Construct an argument that plants and animals have internal and external structures that function to support survival.', '4', 4, 4, 1),
      (fw_id, 'CA.MS-ESS2-2', 'Science', 'Construct an explanation based on evidence for how geoscience processes have changed Earth''s surface.', '6-8', 6, 8, 2),
      (fw_id, 'CA.4.MD.3', 'Math', 'Apply the area and perimeter formulas for rectangles in real-world and mathematical problems.', '4', 4, 4, 3),
      (fw_id, 'CA.6.RP.1', 'Math', 'Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.', '6', 6, 6, 4),
      (fw_id, 'CA.W.4.3', 'ELA', 'Write narratives to develop real or imagined experiences using effective technique, descriptive details, and clear sequences.', '4', 4, 4, 5),
      (fw_id, 'CA.SL.6.1', 'ELA', 'Engage effectively in a range of collaborative discussions with diverse partners on grade 6 topics.', '6', 6, 6, 6),
      (fw_id, 'CA.HSS.3.4.2', 'History-Social Science', 'Discuss the importance of public virtue and the role of citizens in a free society.', '3', 3, 3, 7),
      (fw_id, 'CA.HSS.8.12.5', 'History-Social Science', 'Examine the location and effects of urbanization, renewed immigration, and industrialization.', '8', 8, 8, 8)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── NEW YORK (NY_NYS) ────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'NY_NYS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'NY.4-PS4-2', 'Science', 'Develop a model to describe that light reflecting from objects and entering the eye allows objects to be seen.', '4', 4, 4, 1),
      (fw_id, 'NY.MS-LS2-1', 'Science', 'Analyze and interpret data to provide evidence for the effects of resource availability on organisms and populations.', '6-8', 6, 8, 2),
      (fw_id, 'NY.4.MD.A.1', 'Math', 'Know relative sizes of measurement units within one system of units.', '4', 4, 4, 3),
      (fw_id, 'NY.6.SP.A.1', 'Math', 'Recognize a statistical question as one that anticipates variability in the data related to the question.', '6', 6, 6, 4),
      (fw_id, 'NY.W.4.3', 'ELA', 'Write narratives to develop real or imagined experiences or events using effective technique.', '4', 4, 4, 5),
      (fw_id, 'NY.SL.6.4', 'ELA', 'Present claims and findings, sequencing ideas logically and using pertinent descriptions.', '6', 6, 6, 6),
      (fw_id, 'NY.SS.5.5', 'Social Studies', 'Explain how communities, nations, and regions relate to one another through trade and the exchange of ideas.', '5', 5, 5, 7),
      (fw_id, 'NY.SS.7.6', 'Social Studies', 'Examine the rights and responsibilities of citizens and the role of government in a democratic society.', '7', 7, 7, 8)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── FLORIDA (FL_BEST) ────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'FL_BEST';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'SC.4.L.16.3', 'Science', 'Recognize that animal behaviors may be shaped by heredity and learning.', '4', 4, 4, 1),
      (fw_id, 'SC.7.E.6.5', 'Science', 'Explore the scientific theory of plate tectonics by describing how the movement of plates causes changes to Earth''s surface.', '7', 7, 7, 2),
      (fw_id, 'MA.4.GR.2.1', 'Math', 'Solve perimeter and area mathematical and real-world problems using models of rectangles.', '4', 4, 4, 3),
      (fw_id, 'MA.6.AR.1.1', 'Math', 'Given a mathematical or real-world context, translate written descriptions into algebraic expressions.', '6', 6, 6, 4),
      (fw_id, 'ELA.4.R.2.1', 'ELA', 'Explain how relevant details support the central idea in informational texts.', '4', 4, 4, 5),
      (fw_id, 'ELA.7.C.1.3', 'ELA', 'Write and support a claim using logical reasoning, relevant evidence from sources, and a conclusion.', '7', 7, 7, 6),
      (fw_id, 'SS.5.A.1.1', 'Social Studies', 'Use primary and secondary sources to understand history.', '5', 5, 5, 7),
      (fw_id, 'SS.8.A.3.1', 'Social Studies', 'Explain the consequences of the French and Indian War in British policies for the American colonies.', '8', 8, 8, 8)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── COLORADO (CO_ACAD) ───────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'CO_ACAD';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'CO.SC.4.2.1', 'Science', 'Use evidence to construct an explanation for how the variations in characteristics among individuals within the same species may provide advantages.', '4', 4, 4, 1),
      (fw_id, 'CO.SC.7.3.2', 'Science', 'Construct a scientific explanation based on evidence for how environmental and genetic factors influence the growth of organisms.', '7', 7, 7, 2),
      (fw_id, 'CO.MA.4.NBT.B.5', 'Math', 'Multiply a whole number of up to four digits by a one-digit number using place value strategies.', '4', 4, 4, 3),
      (fw_id, 'CO.MA.6.RP.A.1', 'Math', 'Understand the concept of a ratio and use ratio language.', '6', 6, 6, 4),
      (fw_id, 'CO.RWC.4.2', 'ELA', 'Write informative/explanatory texts to examine a topic and convey ideas clearly.', '4', 4, 4, 5),
      (fw_id, 'CO.RWC.7.3', 'ELA', 'Produce clear and coherent writing appropriate to task, purpose, and audience.', '7', 7, 7, 6),
      (fw_id, 'CO.SS.4.2.1', 'Social Studies', 'Describe the historical development and geographic context of communities in Colorado.', '4', 4, 4, 7),
      (fw_id, 'CO.SS.7.1.1', 'Social Studies', 'Analyze the relationship between rights and responsibilities of citizenship.', '7', 7, 7, 8)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── MASSACHUSETTS (MA_CF) ────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'MA_CF';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'MA.4-LS1-1', 'Science', 'Construct an argument that plants and animals have internal and external structures that support survival, growth, behavior, and reproduction.', '4', 4, 4, 1),
      (fw_id, 'MA.MS-ESS2-2', 'Science', 'Construct an explanation based on evidence for how geoscience processes have changed Earth''s surface at varying time and spatial scales.', '6-8', 6, 8, 2),
      (fw_id, 'MA.4.MD.A.1', 'Math', 'Know relative sizes of measurement units within one system of units.', '4', 4, 4, 3),
      (fw_id, 'MA.6.RP.A.1', 'Math', 'Understand the concept of a ratio and use ratio language to describe a ratio relationship.', '6', 6, 6, 4),
      (fw_id, 'MA.W.4.3', 'ELA', 'Write narratives to develop real or imagined experiences or events using effective technique.', '4', 4, 4, 5),
      (fw_id, 'MA.SL.6.4', 'ELA', 'Present claims and findings, sequencing ideas logically and using descriptions, facts, and details.', '6', 6, 6, 6),
      (fw_id, 'MA.HST.5.T2', 'History', 'Explain the reasons for the establishment of settlements and colonies in North America.', '5', 5, 5, 7),
      (fw_id, 'MA.HST.8.T4', 'History', 'Analyze the causes and consequences of the American Revolution.', '8', 8, 8, 8)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── ARIZONA (AZ_CCRS) ───────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'AZ_CCRS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'AZ.4.L1U1.7', 'Science', 'Construct an argument with evidence that animals and plants have internal and external structures that support their survival.', '4', 4, 4, 1),
      (fw_id, 'AZ.7.E1U3.8', 'Science', 'Construct a scientific explanation for how the uneven distribution of Earth''s mineral, energy, and groundwater resources results from geological processes.', '7', 7, 7, 2),
      (fw_id, 'AZ.4.MD.A.1', 'Math', 'Know relative sizes of measurement units within one system of units.', '4', 4, 4, 3),
      (fw_id, 'AZ.6.RP.A.1', 'Math', 'Understand the concept of a ratio and use ratio language.', '6', 6, 6, 4),
      (fw_id, 'AZ.4.W.3', 'ELA', 'Write narratives to develop real or imagined experiences or events.', '4', 4, 4, 5),
      (fw_id, 'AZ.7.SL.4', 'ELA', 'Present claims and findings, emphasizing salient points in a focused, coherent manner.', '7', 7, 7, 6),
      (fw_id, 'AZ.4.SP2.1', 'Social Studies', 'Use evidence to develop a claim about the past.', '4', 4, 4, 7),
      (fw_id, 'AZ.7.SP3.1', 'Social Studies', 'Examine how and why communities, societies, and cultures develop and interact.', '7', 7, 7, 8)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── UTAH MATH (UT_MATH) ──────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'UT_MATH';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'UT.3.MD.4', 'Measurement & Data', 'Generate measurement data by measuring lengths using rulers marked with halves and fourths of an inch.', '3', 3, 3, 1),
      (fw_id, 'UT.5.G.1', 'Geometry', 'Use a pair of perpendicular number lines to define a coordinate system.', '5', 5, 5, 2),
      (fw_id, 'UT.7.RP.2', 'Ratios & Proportional Relationships', 'Recognize and represent proportional relationships between quantities.', '7', 7, 7, 3),
      (fw_id, 'UT.HS.S.ID.1', 'Statistics & Probability', 'Represent data with plots on the real number line.', '9-12', 9, 12, 4)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── UTAH ELA (UT_ELA) ────────────────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'UT_ELA';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'UT.W.3.2', 'Writing', 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly.', '3', 3, 3, 1),
      (fw_id, 'UT.SL.5.1', 'Speaking & Listening', 'Engage effectively in a range of collaborative discussions.', '5', 5, 5, 2),
      (fw_id, 'UT.W.7.1', 'Writing', 'Write arguments to support claims with clear reasons and relevant evidence.', '7', 7, 7, 3),
      (fw_id, 'UT.W.9-10.2', 'Writing', 'Write informative/explanatory texts to examine and convey complex ideas.', '9-10', 9, 10, 4)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

  -- ─── UTAH SOCIAL STUDIES (UT_SS) ──────────────────────────
  SELECT id INTO fw_id FROM public.standard_frameworks WHERE code = 'UT_SS';
  IF fw_id IS NOT NULL THEN
    INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
      (fw_id, 'UT.SS.4.2.1', 'Geography', 'Identify and describe the physical geography of Utah, including major landforms, bodies of water, and climate.', '4', 4, 4, 1),
      (fw_id, 'UT.SS.6.4.1', 'World History', 'Examine the geographic, political, economic, and social structures of early civilizations.', '6', 6, 6, 2),
      (fw_id, 'UT.SS.8.1.1', 'US History', 'Assess the causes and consequences of westward expansion.', '8', 8, 8, 3),
      (fw_id, 'UT.SS.HS.1', 'Civic Ideals', 'Evaluate the principles of the United States Constitution and their application in governance.', '9-12', 9, 12, 4)
    ON CONFLICT (framework_id, code) DO NOTHING;
  END IF;

END $$;
