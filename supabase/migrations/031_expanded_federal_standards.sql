-- ══════════════════════════════════════════════════════════════
-- Migration 031: Expanded federal standards
--
-- Adds ~45 new standards to national frameworks:
-- NGSS (+15), CCSS-M (+10), CCSS-ELA (+10), C3 (+10)
-- Focus on gaps: physical science, engineering, operations,
-- reading informational text, economics, civic participation
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  fw_ngss UUID;
  fw_ccss_m UUID;
  fw_ccss_ela UUID;
  fw_c3 UUID;
BEGIN
  SELECT id INTO fw_ngss FROM public.standard_frameworks WHERE code = 'NGSS';
  SELECT id INTO fw_ccss_m FROM public.standard_frameworks WHERE code = 'CCSS_M';
  SELECT id INTO fw_ccss_ela FROM public.standard_frameworks WHERE code = 'CCSS_ELA';
  SELECT id INTO fw_c3 FROM public.standard_frameworks WHERE code = 'C3';

  -- ─── NGSS: Physical Science + Engineering (+15) ────────────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    -- Physical Science
    (fw_ngss, 'K-PS2-1', 'Physical Science', 'Plan and conduct an investigation to compare the effects of different strengths or different directions of pushes and pulls on the motion of an object.', 'K', 0, 0, 21),
    (fw_ngss, '2-PS1-1', 'Physical Science', 'Plan and conduct an investigation to describe and classify different kinds of materials by their observable properties.', '2', 2, 2, 22),
    (fw_ngss, '3-PS2-1', 'Physical Science', 'Plan and conduct an investigation to provide evidence of the effects of balanced and unbalanced forces on the motion of an object.', '3', 3, 3, 23),
    (fw_ngss, '4-PS3-2', 'Physical Science', 'Make observations to provide evidence that energy can be transferred from place to place by sound, light, heat, and electric currents.', '4', 4, 4, 24),
    (fw_ngss, '4-PS4-1', 'Physical Science', 'Develop a model of waves to describe patterns in terms of amplitude and wavelength.', '4', 4, 4, 25),
    (fw_ngss, '5-PS1-3', 'Physical Science', 'Make observations and measurements to identify materials based on their properties.', '5', 5, 5, 26),
    (fw_ngss, 'MS-PS1-2', 'Physical Science', 'Analyze and interpret data on the properties of substances before and after the substances interact to determine if a chemical reaction has occurred.', '6-8', 6, 8, 27),
    (fw_ngss, 'MS-PS2-2', 'Physical Science', 'Plan an investigation to provide evidence that the change in an object''s motion depends on the sum of the forces acting on the object and the mass of the object.', '6-8', 6, 8, 28),
    (fw_ngss, 'MS-PS3-3', 'Physical Science', 'Apply scientific principles to design, construct, and test a device that either minimizes or maximizes thermal energy transfer.', '6-8', 6, 8, 29),
    (fw_ngss, 'HS-PS1-5', 'Physical Science', 'Apply scientific principles and evidence to provide an explanation about the effects of changing the temperature or concentration of reacting substances on the rate of a reaction.', '9-12', 9, 12, 30),
    -- Engineering & Technology
    (fw_ngss, '3-5-ETS1-1', 'Engineering', 'Define a simple design problem reflecting a need or a want that includes specified criteria for success and constraints on materials, time, or cost.', '3-5', 3, 5, 31),
    (fw_ngss, '3-5-ETS1-2', 'Engineering', 'Generate and compare multiple possible solutions to a problem based on how well each is likely to meet the criteria and constraints.', '3-5', 3, 5, 32),
    (fw_ngss, 'MS-ETS1-1', 'Engineering', 'Define the criteria and constraints of a design problem with sufficient precision to ensure a successful solution.', '6-8', 6, 8, 33),
    (fw_ngss, 'MS-ETS1-4', 'Engineering', 'Develop a model to generate data for iterative testing and modification of a proposed object, tool, or process.', '6-8', 6, 8, 34),
    (fw_ngss, 'HS-ETS1-3', 'Engineering', 'Evaluate a solution to a complex real-world problem based on prioritized criteria and trade-offs.', '9-12', 9, 12, 35)
  ON CONFLICT (framework_id, code) DO NOTHING;

  -- ─── CCSS-M: Operations, Algebra, Number Sense (+10) ──────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    (fw_ccss_m, 'K.OA.A.1', 'Operations & Algebraic Thinking', 'Represent addition and subtraction with objects, fingers, mental images, drawings, sounds, acting out situations, or equations.', 'K', 0, 0, 21),
    (fw_ccss_m, '1.OA.C.6', 'Operations & Algebraic Thinking', 'Add and subtract within 20, demonstrating fluency for addition and subtraction within 10.', '1', 1, 1, 22),
    (fw_ccss_m, '2.OA.B.2', 'Operations & Algebraic Thinking', 'Fluently add and subtract within 20 using mental strategies.', '2', 2, 2, 23),
    (fw_ccss_m, '3.OA.A.1', 'Operations & Algebraic Thinking', 'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7.', '3', 3, 3, 24),
    (fw_ccss_m, '4.NF.A.1', 'Number & Operations — Fractions', 'Explain why a fraction a/b is equivalent to a fraction (n×a)/(n×b) by using visual fraction models.', '4', 4, 4, 25),
    (fw_ccss_m, '5.NF.B.4', 'Number & Operations — Fractions', 'Apply and extend previous understandings of multiplication to multiply a fraction or whole number by a fraction.', '5', 5, 5, 26),
    (fw_ccss_m, '6.EE.A.2', 'Expressions & Equations', 'Write, read, and evaluate expressions in which letters stand for numbers.', '6', 6, 6, 27),
    (fw_ccss_m, '7.NS.A.1', 'The Number System', 'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers.', '7', 7, 7, 28),
    (fw_ccss_m, '8.EE.B.5', 'Expressions & Equations', 'Graph proportional relationships, interpreting the unit rate as the slope of the graph.', '8', 8, 8, 29),
    (fw_ccss_m, 'HSA.CED.A.1', 'Algebra', 'Create equations and inequalities in one variable and use them to solve problems.', '9-12', 9, 12, 30)
  ON CONFLICT (framework_id, code) DO NOTHING;

  -- ─── CCSS-ELA: Reading Informational + Language (+10) ──────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    (fw_ccss_ela, 'RI.2.1', 'Reading: Informational Text', 'Ask and answer questions about key details in a text.', '2', 2, 2, 11),
    (fw_ccss_ela, 'RI.3.1', 'Reading: Informational Text', 'Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.', '3', 3, 3, 12),
    (fw_ccss_ela, 'RI.5.7', 'Reading: Informational Text', 'Draw on information from multiple print or digital sources, demonstrating the ability to locate an answer to a question quickly.', '5', 5, 5, 13),
    (fw_ccss_ela, 'L.3.4', 'Language', 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases based on grade 3 reading and content.', '3', 3, 3, 14),
    (fw_ccss_ela, 'L.5.4', 'Language', 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases based on grade 5 reading and content.', '5', 5, 5, 15),
    (fw_ccss_ela, 'W.5.2', 'Writing', 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly.', '5', 5, 5, 16),
    (fw_ccss_ela, 'SL.4.1', 'Speaking & Listening', 'Engage effectively in a range of collaborative discussions with diverse partners on grade 4 topics and texts.', '4', 4, 4, 17),
    (fw_ccss_ela, 'RI.6.7', 'Reading: Informational Text', 'Integrate information presented in different media or formats as well as in words to develop a coherent understanding of a topic or issue.', '6', 6, 6, 18),
    (fw_ccss_ela, 'W.8.1', 'Writing', 'Write arguments to support claims with clear reasons and relevant evidence.', '8', 8, 8, 19),
    (fw_ccss_ela, 'SL.9-10.1', 'Speaking & Listening', 'Initiate and participate effectively in a range of collaborative discussions with diverse partners on grades 9-10 topics.', '9-10', 9, 10, 20)
  ON CONFLICT (framework_id, code) DO NOTHING;

  -- ─── C3: Economics, Civic Participation (+10) ──────────────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    (fw_c3, 'D2.Eco.1.K-2', 'Economics', 'Explain how scarcity necessitates decision making.', 'K-2', 0, 2, 16),
    (fw_c3, 'D2.Eco.1.3-5', 'Economics', 'Compare the benefits and costs of individual choices.', '3-5', 3, 5, 17),
    (fw_c3, 'D2.Eco.6.3-5', 'Economics', 'Explain the relationship between supply and demand in a market.', '3-5', 3, 5, 18),
    (fw_c3, 'D2.Eco.1.6-8', 'Economics', 'Explain how economic decisions affect the well-being of individuals, businesses, and society.', '6-8', 6, 8, 19),
    (fw_c3, 'D2.Civ.2.3-5', 'Civics', 'Explain how a democracy relies on people''s responsible participation and draw implications for how individuals should participate.', '3-5', 3, 5, 20),
    (fw_c3, 'D2.Civ.6.6-8', 'Civics', 'Describe the roles of political, civil, and economic organizations in shaping people''s lives.', '6-8', 6, 8, 21),
    (fw_c3, 'D2.Geo.3.3-5', 'Geography', 'Use maps of different scales to describe the locations of cultural and environmental characteristics.', '3-5', 3, 5, 22),
    (fw_c3, 'D2.Geo.8.6-8', 'Geography', 'Analyze how relationships between humans and environments extend or contract spatial patterns of settlement and movement.', '6-8', 6, 8, 23),
    (fw_c3, 'D2.Eco.3.9-12', 'Economics', 'Analyze the ways in which incentives influence what is produced and distributed in a market system.', '9-12', 9, 12, 24),
    (fw_c3, 'D2.Civ.3.9-12', 'Civics', 'Analyze the impact of constitutions, laws, treaties, and international agreements on the maintenance of national and international order.', '9-12', 9, 12, 25)
  ON CONFLICT (framework_id, code) DO NOTHING;

END $$;
