-- ══════════════════════════════════════════════════════════════
-- Migration 024: Education standards alignment system
--
-- Tables: standard_frameworks, education_standards,
--         task_standard_alignments, primer_standard_alignments
-- Seed: US national (CCSS-M, CCSS-ELA, NGSS, C3), US state
--       (UT, TX, CA, NY, FL, CO, MA, AZ), international
--       (IB, Cambridge, England, Australia, Canada)
-- ══════════════════════════════════════════════════════════════

-- ─── Standard Frameworks ────────────────────────────────────
-- Drop and recreate to ensure correct schema (old table may exist from initial setup)

DROP TABLE IF EXISTS public.primer_standard_alignments CASCADE;
DROP TABLE IF EXISTS public.task_standard_alignments CASCADE;
DROP TABLE IF EXISTS public.education_standards CASCADE;
DROP TABLE IF EXISTS public.standards CASCADE;  -- old table name from initial schema
DROP TABLE IF EXISTS public.standard_frameworks CASCADE;
-- Drop any leftover indexes from old schema
DROP INDEX IF EXISTS public.idx_standards_framework;
DROP INDEX IF EXISTS public.idx_standards_code;
DROP INDEX IF EXISTS public.idx_standards_grade;
DROP INDEX IF EXISTS public.idx_standards_domain;

CREATE TABLE public.standard_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  abbreviation TEXT,
  organization TEXT,
  jurisdiction_country TEXT,  -- ISO 3166-1 alpha-2 (US, GB, AU, CA)
  jurisdiction_region TEXT,   -- state/province (UT, TX, CA, ON, BC)
  scope TEXT NOT NULL DEFAULT 'national' CHECK (scope IN ('national', 'state', 'international')),
  url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_frameworks_country ON public.standard_frameworks(jurisdiction_country);
CREATE INDEX idx_frameworks_code ON public.standard_frameworks(code);

ALTER TABLE public.standard_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "frameworks_select_all" ON public.standard_frameworks FOR SELECT USING (true);


-- ─── Education Standards (individual standards/elements) ─────

CREATE TABLE public.education_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES public.standard_frameworks(id),
  code TEXT NOT NULL,
  domain TEXT,
  description TEXT NOT NULL,
  grade_level TEXT,           -- single grade (e.g. '4') or band (e.g. '3-5')
  grade_range_min INT,
  grade_range_max INT,
  official_url TEXT,
  parent_standard_id UUID REFERENCES public.education_standards(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(framework_id, code)
);

CREATE INDEX IF NOT EXISTS idx_standards_framework ON public.education_standards(framework_id);
CREATE INDEX IF NOT EXISTS idx_standards_code ON public.education_standards(code);
CREATE INDEX IF NOT EXISTS idx_standards_grade ON public.education_standards(grade_range_min, grade_range_max);
CREATE INDEX IF NOT EXISTS idx_standards_domain ON public.education_standards(domain);

ALTER TABLE public.education_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "standards_select_all" ON public.education_standards FOR SELECT USING (true);


-- ─── Task ↔ Standard alignment ──────────────────────────────

CREATE TABLE public.task_standard_alignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  standard_id UUID NOT NULL REFERENCES public.education_standards(id) ON DELETE CASCADE,
  alignment_strength TEXT DEFAULT 'primary' CHECK (alignment_strength IN ('primary', 'secondary', 'supporting')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(task_id, standard_id)
);

CREATE INDEX IF NOT EXISTS idx_task_alignments_task ON public.task_standard_alignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_alignments_standard ON public.task_standard_alignments(standard_id);

ALTER TABLE public.task_standard_alignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_alignments_select_all" ON public.task_standard_alignments FOR SELECT USING (true);
CREATE POLICY "task_alignments_insert" ON public.task_standard_alignments FOR INSERT WITH CHECK (true);
CREATE POLICY "task_alignments_delete" ON public.task_standard_alignments FOR DELETE USING (true);


-- ─── Primer ↔ Standard alignment ────────────────────────────

CREATE TABLE public.primer_standard_alignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primer_id UUID NOT NULL REFERENCES public.primers(id) ON DELETE CASCADE,
  standard_id UUID NOT NULL REFERENCES public.education_standards(id) ON DELETE CASCADE,
  alignment_strength TEXT DEFAULT 'primary' CHECK (alignment_strength IN ('primary', 'secondary', 'supporting')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(primer_id, standard_id)
);

CREATE INDEX IF NOT EXISTS idx_primer_alignments_primer ON public.primer_standard_alignments(primer_id);
CREATE INDEX IF NOT EXISTS idx_primer_alignments_standard ON public.primer_standard_alignments(standard_id);

ALTER TABLE public.primer_standard_alignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "primer_alignments_select_all" ON public.primer_standard_alignments FOR SELECT USING (true);
CREATE POLICY "primer_alignments_insert" ON public.primer_standard_alignments FOR INSERT WITH CHECK (true);
CREATE POLICY "primer_alignments_delete" ON public.primer_standard_alignments FOR DELETE USING (true);


-- ═══════════════════════════════════════════════════════════
-- SEED: Frameworks + Standards
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  fw_ccss_m UUID; fw_ccss_ela UUID; fw_ngss UUID; fw_c3 UUID;
  fw_ut_seed UUID; fw_ut_math UUID; fw_ut_ela UUID; fw_ut_ss UUID;
  fw_tx UUID; fw_ca UUID; fw_ny UUID; fw_fl UUID; fw_co UUID; fw_ma UUID; fw_az UUID;
  fw_ib_pyp UUID; fw_ib_myp UUID; fw_camb_pri UUID; fw_camb_low UUID;
  fw_eng UUID; fw_aus UUID; fw_can_bc UUID; fw_can_on UUID;
BEGIN

  -- ─── US National Frameworks ────────────────────────────

  INSERT INTO public.standard_frameworks (id, code, name, abbreviation, organization, jurisdiction_country, scope, url, sort_order) VALUES
    (gen_random_uuid(), 'CCSS_M', 'Common Core State Standards — Mathematics', 'CCSS-M', 'NGA / CCSSO', 'US', 'national', 'http://www.corestandards.org/Math/', 1)
  RETURNING id INTO fw_ccss_m;

  INSERT INTO public.standard_frameworks (id, code, name, abbreviation, organization, jurisdiction_country, scope, url, sort_order) VALUES
    (gen_random_uuid(), 'CCSS_ELA', 'Common Core State Standards — English Language Arts', 'CCSS-ELA', 'NGA / CCSSO', 'US', 'national', 'http://www.corestandards.org/ELA-Literacy/', 2)
  RETURNING id INTO fw_ccss_ela;

  INSERT INTO public.standard_frameworks (id, code, name, abbreviation, organization, jurisdiction_country, scope, url, sort_order) VALUES
    (gen_random_uuid(), 'NGSS', 'Next Generation Science Standards', 'NGSS', 'NSTA / Achieve', 'US', 'national', 'https://www.nextgenscience.org/', 3)
  RETURNING id INTO fw_ngss;

  INSERT INTO public.standard_frameworks (id, code, name, abbreviation, organization, jurisdiction_country, scope, url, sort_order) VALUES
    (gen_random_uuid(), 'C3', 'College, Career, and Civic Life (C3) Framework for Social Studies', 'C3', 'NCSS', 'US', 'national', 'https://www.socialstudies.org/c3', 4)
  RETURNING id INTO fw_c3;


  -- ─── US State Frameworks ───────────────────────────────

  INSERT INTO public.standard_frameworks (id, code, name, abbreviation, organization, jurisdiction_country, jurisdiction_region, scope, url, sort_order) VALUES
    (gen_random_uuid(), 'UT_SEEd', 'Utah Science and Engineering Education (SEEd) Standards', 'Utah SEEd', 'Utah State Board of Education', 'US', 'UT', 'state', 'https://www.schools.utah.gov/curr/science', 10)
  RETURNING id INTO fw_ut_seed;

  INSERT INTO public.standard_frameworks (id, code, name, abbreviation, organization, jurisdiction_country, jurisdiction_region, scope, url, sort_order) VALUES
    (gen_random_uuid(), 'UT_MATH', 'Utah Core Standards — Mathematics', 'Utah Math', 'Utah State Board of Education', 'US', 'UT', 'state', 'https://www.schools.utah.gov/curr/math', 11)
  RETURNING id INTO fw_ut_math;

  INSERT INTO public.standard_frameworks (id, code, name, abbreviation, organization, jurisdiction_country, jurisdiction_region, scope, url, sort_order) VALUES
    (gen_random_uuid(), 'UT_ELA', 'Utah Core Standards — English Language Arts', 'Utah ELA', 'Utah State Board of Education', 'US', 'UT', 'state', 'https://www.schools.utah.gov/curr/ela', 12)
  RETURNING id INTO fw_ut_ela;

  INSERT INTO public.standard_frameworks (id, code, name, abbreviation, organization, jurisdiction_country, jurisdiction_region, scope, url, sort_order) VALUES
    (gen_random_uuid(), 'UT_SS', 'Utah Core Standards — Social Studies', 'Utah Social Studies', 'Utah State Board of Education', 'US', 'UT', 'state', 'https://www.schools.utah.gov/curr/socialstudies', 13)
  RETURNING id INTO fw_ut_ss;

  INSERT INTO public.standard_frameworks (code, name, abbreviation, organization, jurisdiction_country, jurisdiction_region, scope, url, sort_order) VALUES
    ('TX_TEKS', 'Texas Essential Knowledge and Skills', 'TEKS', 'Texas Education Agency', 'US', 'TX', 'state', 'https://tea.texas.gov/academics/curriculum-standards/teks', 14),
    ('CA_CCSS', 'California Common Core State Standards', 'CA CCSS', 'California Dept of Education', 'US', 'CA', 'state', 'https://www.cde.ca.gov/be/st/ss/', 15),
    ('NY_NYS', 'New York State Learning Standards', 'NYSLS', 'NY State Education Dept', 'US', 'NY', 'state', 'https://www.nysed.gov/curriculum-instruction', 16),
    ('FL_BEST', 'Florida B.E.S.T. Standards', 'FL BEST', 'Florida Dept of Education', 'US', 'FL', 'state', 'https://www.fldoe.org/academics/standards/', 17),
    ('CO_ACAD', 'Colorado Academic Standards', 'CAS', 'Colorado Dept of Education', 'US', 'CO', 'state', 'https://www.cde.state.co.us/standardsandinstruction/standards', 18),
    ('MA_CF', 'Massachusetts Curriculum Frameworks', 'MA Frameworks', 'MA Dept of Elementary and Secondary Education', 'US', 'MA', 'state', 'https://www.doe.mass.edu/frameworks/', 19),
    ('AZ_CCRS', 'Arizona College and Career Ready Standards', 'AZ CCRS', 'Arizona Dept of Education', 'US', 'AZ', 'state', 'https://www.azed.gov/standards-practices/', 20);


  -- ─── International Frameworks ──────────────────────────

  INSERT INTO public.standard_frameworks (code, name, abbreviation, organization, jurisdiction_country, scope, url, sort_order) VALUES
    ('IB_PYP', 'International Baccalaureate Primary Years Programme', 'IB PYP', 'IB', NULL, 'international', 'https://www.ibo.org/programmes/primary-years-programme/curriculum/', 50),
    ('IB_MYP', 'International Baccalaureate Middle Years Programme', 'IB MYP', 'IB', NULL, 'international', 'https://www.ibo.org/programmes/middle-years-programme/curriculum/', 51),
    ('CAMB_PRI', 'Cambridge Primary', 'Cambridge Primary', 'Cambridge Assessment International Education', 'GB', 'international', 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/', 52),
    ('CAMB_LOW', 'Cambridge Lower Secondary', 'Cambridge Lower Secondary', 'Cambridge Assessment International Education', 'GB', 'international', 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-lower-secondary/', 53),
    ('ENG_NC', 'National Curriculum (England)', 'NC England', 'UK Gov / DfE', 'GB', 'international', 'https://www.gov.uk/government/collections/national-curriculum', 54),
    ('AUS_ACARA', 'Australian Curriculum', 'ACARA', 'ACARA', 'AU', 'international', 'https://www.australiancurriculum.edu.au/', 55),
    ('CAN_BC', 'British Columbia Curriculum', 'BC Curriculum', 'BC Ministry of Education', 'CA', 'international', 'https://curriculum.gov.bc.ca/', 56),
    ('CAN_ON', 'Ontario Curriculum', 'Ontario', 'Ontario Ministry of Education', 'CA', 'international', 'https://www.dcp.edu.gov.on.ca/en/curriculum', 57);


  -- ─── CCSS-M Standards ─────────────────────────────────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    (fw_ccss_m, 'K.CC.A.1', 'Counting & Cardinality', 'Count to 100 by ones and by tens.', 'K', 0, 0, 1),
    (fw_ccss_m, 'K.CC.B.4', 'Counting & Cardinality', 'Understand the relationship between numbers and quantities; connect counting to cardinality.', 'K', 0, 0, 2),
    (fw_ccss_m, '1.MD.A.1', 'Measurement & Data', 'Order three objects by length; compare lengths of two objects using a third object.', '1', 1, 1, 3),
    (fw_ccss_m, '2.MD.A.1', 'Measurement & Data', 'Measure the length of an object by selecting and using appropriate tools.', '2', 2, 2, 4),
    (fw_ccss_m, '2.G.A.1', 'Geometry', 'Recognize and draw shapes having specified attributes, such as a given number of angles.', '2', 2, 2, 5),
    (fw_ccss_m, '3.MD.B.4', 'Measurement & Data', 'Generate measurement data by measuring lengths using rulers to the nearest quarter inch.', '3', 3, 3, 6),
    (fw_ccss_m, '3.NF.A.1', 'Number & Operations — Fractions', 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.', '3', 3, 3, 7),
    (fw_ccss_m, '4.MD.A.1', 'Measurement & Data', 'Know relative sizes of measurement units; express larger unit in terms of smaller; record equivalents.', '4', 4, 4, 8),
    (fw_ccss_m, '4.MD.A.2', 'Measurement & Data', 'Use the four operations to solve word problems involving distances, intervals of time, liquid volumes, masses of objects, and money.', '4', 4, 4, 9),
    (fw_ccss_m, '4.G.A.1', 'Geometry', 'Draw and identify lines and angles, classify shapes by properties of their lines and angles.', '4', 4, 4, 10),
    (fw_ccss_m, '5.G.A.1', 'Geometry', 'Use a pair of perpendicular number lines to define a coordinate system.', '5', 5, 5, 11),
    (fw_ccss_m, '5.MD.C.3', 'Measurement & Data', 'Recognize volume as an attribute of solid figures and understand concepts of volume measurement.', '5', 5, 5, 12),
    (fw_ccss_m, '6.RP.A.1', 'Ratios & Proportional Relationships', 'Understand the concept of a ratio and use ratio language to describe a ratio relationship.', '6', 6, 6, 13),
    (fw_ccss_m, '6.SP.A.1', 'Statistics & Probability', 'Recognize a statistical question as one that anticipates variability in the data.', '6', 6, 6, 14),
    (fw_ccss_m, '6.G.A.1', 'Geometry', 'Find the area of right triangles, other triangles, special quadrilaterals, and polygons.', '6', 6, 6, 15),
    (fw_ccss_m, '7.RP.A.2', 'Ratios & Proportional Relationships', 'Recognize and represent proportional relationships between quantities.', '7', 7, 7, 16),
    (fw_ccss_m, '7.SP.C.5', 'Statistics & Probability', 'Understand that the probability of a chance event is a number between 0 and 1.', '7', 7, 7, 17),
    (fw_ccss_m, '8.G.B.7', 'Geometry', 'Apply the Pythagorean Theorem to determine unknown side lengths.', '8', 8, 8, 18),
    (fw_ccss_m, 'HSN.Q.A.1', 'Quantities', 'Use units as a way to understand problems and to guide the solution of multi-step problems.', '9-12', 9, 12, 19),
    (fw_ccss_m, 'HSS.ID.A.1', 'Statistics & Probability', 'Represent data with plots on the real number line (dot plots, histograms, box plots).', '9-12', 9, 12, 20);


  -- ─── CCSS-ELA Standards ───────────────────────────────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    (fw_ccss_ela, 'W.2.3', 'Writing', 'Write narratives in which they recount a well-elaborated event, include details, and provide closure.', '2', 2, 2, 1),
    (fw_ccss_ela, 'W.3.2', 'Writing', 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly.', '3', 3, 3, 2),
    (fw_ccss_ela, 'W.4.3', 'Writing', 'Write narratives to develop real or imagined experiences using effective technique, descriptive details, and clear event sequences.', '4', 4, 4, 3),
    (fw_ccss_ela, 'SL.3.1', 'Speaking & Listening', 'Engage effectively in a range of collaborative discussions with diverse partners on grade 3 topics.', '3', 3, 3, 4),
    (fw_ccss_ela, 'SL.5.1', 'Speaking & Listening', 'Engage effectively in a range of collaborative discussions with diverse partners on grade 5 topics.', '5', 5, 5, 5),
    (fw_ccss_ela, 'SL.6.4', 'Speaking & Listening', 'Present claims and findings, sequencing ideas logically and using pertinent descriptions, facts, and details.', '6', 6, 6, 6),
    (fw_ccss_ela, 'W.6.1', 'Writing', 'Write arguments to support claims with clear reasons and relevant evidence.', '6', 6, 6, 7),
    (fw_ccss_ela, 'RI.4.7', 'Reading: Informational Text', 'Interpret information presented visually, orally, or quantitatively and explain how it contributes to understanding.', '4', 4, 4, 8),
    (fw_ccss_ela, 'W.7.1', 'Writing', 'Write arguments to support claims with clear reasons and relevant evidence.', '7', 7, 7, 9),
    (fw_ccss_ela, 'W.9-10.2', 'Writing', 'Write informative/explanatory texts to examine and convey complex ideas, concepts, and information.', '9-10', 9, 10, 10);


  -- ─── NGSS Standards ───────────────────────────────────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    (fw_ngss, 'K-LS1-1', 'Life Science', 'Use observations to describe patterns of what plants and animals need to survive.', 'K', 0, 0, 1),
    (fw_ngss, 'K-ESS2-1', 'Earth & Space Science', 'Use and share observations of local weather conditions to describe patterns over time.', 'K', 0, 0, 2),
    (fw_ngss, '2-LS4-1', 'Life Science', 'Make observations of plants and animals to compare diversity of life in different habitats.', '2', 2, 2, 3),
    (fw_ngss, '2-ESS2-3', 'Earth & Space Science', 'Obtain information to identify where water is found on Earth and that it can be solid or liquid.', '2', 2, 2, 4),
    (fw_ngss, '3-LS4-3', 'Life Science', 'Construct an argument with evidence that in a particular habitat some organisms can survive well and some cannot.', '3', 3, 3, 5),
    (fw_ngss, '3-ESS2-1', 'Earth & Space Science', 'Represent data in tables and graphical displays to describe typical weather conditions expected during a particular season.', '3', 3, 3, 6),
    (fw_ngss, '4-LS1-1', 'Life Science', 'Construct an argument that plants and animals have internal and external structures that function to support survival, growth, behavior, and reproduction.', '4', 4, 4, 7),
    (fw_ngss, '4-ESS2-1', 'Earth & Space Science', 'Make observations and/or measurements to identify the effects of weathering or the rate of erosion.', '4', 4, 4, 8),
    (fw_ngss, '4-ESS2-2', 'Earth & Space Science', 'Analyze and interpret data from maps to describe patterns of Earth''s features.', '4', 4, 4, 9),
    (fw_ngss, '5-PS1-1', 'Physical Science', 'Develop a model to describe that matter is made of particles too small to be seen.', '5', 5, 5, 10),
    (fw_ngss, '5-LS2-1', 'Life Science', 'Develop a model to describe the movement of matter among plants, animals, decomposers, and the environment.', '5', 5, 5, 11),
    (fw_ngss, '5-ESS2-1', 'Earth & Space Science', 'Develop a model using an example to describe ways the geosphere, biosphere, hydrosphere, and/or atmosphere interact.', '5', 5, 5, 12),
    (fw_ngss, 'MS-LS2-1', 'Life Science', 'Analyze and interpret data to provide evidence for the effects of resource availability on organisms in an ecosystem.', '6-8', 6, 8, 13),
    (fw_ngss, 'MS-LS2-3', 'Life Science', 'Develop a model to describe the cycling of matter and flow of energy among living and nonliving parts of an ecosystem.', '6-8', 6, 8, 14),
    (fw_ngss, 'MS-ESS2-2', 'Earth & Space Science', 'Construct an explanation based on evidence for how geoscience processes have changed Earth''s surface.', '6-8', 6, 8, 15),
    (fw_ngss, 'MS-ESS3-3', 'Earth & Space Science', 'Apply scientific principles to design a method for monitoring and minimizing a human impact on the environment.', '6-8', 6, 8, 16),
    (fw_ngss, 'MS-LS4-4', 'Life Science', 'Construct an explanation based on evidence that describes how genetic variations of traits in a population increase some individuals'' probability of surviving.', '6-8', 6, 8, 17),
    (fw_ngss, 'HS-LS2-1', 'Life Science', 'Use mathematical and/or computational representations to support explanations of factors that affect carrying capacity.', '9-12', 9, 12, 18),
    (fw_ngss, 'HS-ESS2-5', 'Earth & Space Science', 'Plan and conduct an investigation of the properties of water and its effects on Earth materials and surface processes.', '9-12', 9, 12, 19),
    (fw_ngss, 'HS-LS2-6', 'Life Science', 'Evaluate claims, evidence, and reasoning that the complex interactions in ecosystems maintain relatively consistent numbers and types of organisms.', '9-12', 9, 12, 20);


  -- ─── C3 Social Studies Standards ──────────────────────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    (fw_c3, 'D2.Geo.1.K-2', 'Geography', 'Construct maps of familiar areas.', 'K-2', 0, 2, 1),
    (fw_c3, 'D2.Geo.1.3-5', 'Geography', 'Construct maps and other representations of places.', '3-5', 3, 5, 2),
    (fw_c3, 'D2.Geo.2.3-5', 'Geography', 'Use maps, satellite images, photographs, and other representations to explain spatial patterns.', '3-5', 3, 5, 3),
    (fw_c3, 'D2.Geo.4.3-5', 'Geography', 'Explain how culture influences the way people modify and adapt to their environment.', '3-5', 3, 5, 4),
    (fw_c3, 'D2.Geo.2.6-8', 'Geography', 'Use maps, satellite images, photographs, and other representations to explain relationships between locations of places and regions.', '6-8', 6, 8, 5),
    (fw_c3, 'D2.Geo.5.6-8', 'Geography', 'Analyze the combinations of cultural and environmental characteristics that make places unique.', '6-8', 6, 8, 6),
    (fw_c3, 'D2.Geo.7.6-8', 'Geography', 'Explain how changes in transportation and communication technology influence the spatial connections among human settlements.', '6-8', 6, 8, 7),
    (fw_c3, 'D2.His.1.3-5', 'History', 'Create and use a chronological sequence of related events to compare developments that happened at the same time.', '3-5', 3, 5, 8),
    (fw_c3, 'D2.His.3.3-5', 'History', 'Generate questions about individuals and groups who have shaped a significant historical change.', '3-5', 3, 5, 9),
    (fw_c3, 'D2.His.1.6-8', 'History', 'Analyze connections among events and developments in broader historical contexts.', '6-8', 6, 8, 10),
    (fw_c3, 'D2.Civ.7.3-5', 'Civics', 'Apply civic virtues when participating in community settings.', '3-5', 3, 5, 11),
    (fw_c3, 'D3.1.3-5', 'Evaluating Sources', 'Gather relevant information from multiple sources while using the origin, structure, and context to guide selection.', '3-5', 3, 5, 12),
    (fw_c3, 'D3.1.6-8', 'Evaluating Sources', 'Gather relevant information from multiple sources while using the origin, authority, structure, context, and corroborative value of the sources to guide the selection.', '6-8', 6, 8, 13),
    (fw_c3, 'D2.Geo.6.9-12', 'Geography', 'Evaluate the impact of human settlement activities on the environmental and cultural characteristics of specific places and regions.', '9-12', 9, 12, 14),
    (fw_c3, 'D2.His.14.9-12', 'History', 'Analyze multiple and complex causes and effects of events in the past.', '9-12', 9, 12, 15);


  -- ─── Utah SEEd Standards (representative) ─────────────

  INSERT INTO public.education_standards (framework_id, code, domain, description, grade_level, grade_range_min, grade_range_max, sort_order) VALUES
    (fw_ut_seed, '3.1.1', 'Strand 3.1', 'Plan and carry out an investigation to determine the effects of balanced and unbalanced forces.', '3', 3, 3, 1),
    (fw_ut_seed, '4.1.1', 'Strand 4.1', 'Use a model to describe that light reflecting from objects enters the eye, causing the objects to be seen.', '4', 4, 4, 2),
    (fw_ut_seed, '4.2.1', 'Strand 4.2', 'Construct an argument that plants and animals have internal and external structures that support survival.', '4', 4, 4, 3),
    (fw_ut_seed, '5.1.1', 'Strand 5.1', 'Analyze and interpret data to describe patterns of Earth''s features.', '5', 5, 5, 4),
    (fw_ut_seed, '5.2.2', 'Strand 5.2', 'Develop a model to describe the cycling of matter and energy among living and nonliving parts of an ecosystem.', '5', 5, 5, 5),
    (fw_ut_seed, '6.4.1', 'Strand 6.4', 'Construct an argument based on evidence about the environmental factors that affect organisms.', '6', 6, 6, 6),
    (fw_ut_seed, '7.3.4', 'Strand 7.3', 'Construct an explanation based on evidence that describes how genetic variations of traits increase probability of survival.', '7', 7, 7, 7),
    (fw_ut_seed, '8.2.6', 'Strand 8.2', 'Apply scientific principles to design a method for monitoring and minimizing a human impact on the environment.', '8', 8, 8, 8);

END $$;
