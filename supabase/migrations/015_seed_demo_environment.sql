-- ══════════════════════════════════════════════════════════════
-- Migration 015: Demo Environment Seed Data
-- Users, hunts, finds, gameplay, social, gamification
-- All on BYU campus / Provo, UT with real GPS coordinates
-- ══════════════════════════════════════════════════════════════

-- NOTE: Auth users (supabase.auth.users) must be created via the
-- Supabase dashboard or auth API. This migration creates app-level
-- user records with placeholder auth_ids. After creating auth users,
-- update the auth_id column to match.

-- ── 1. USERS (23) ────────────────────────────────────────────

-- Generate deterministic UUIDs for cross-referencing
-- Using uuid_generate_v5 with a fixed namespace for reproducibility

DO $$
DECLARE
  ns UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; -- DNS namespace
  -- Admin/Staff
  u_mark UUID;
  u_sarah UUID;
  u_james UUID;
  -- Teachers
  u_rivera UUID;
  u_nakamura UUID;
  u_adeyemi UUID;
  u_baptiste UUID;
  -- Parents
  u_linda UUID;
  u_david UUID;
  u_maria UUID;
  -- Children
  u_mia UUID;
  u_ethan UUID;
  u_zara UUID;
  u_kai UUID;
  u_lily UUID;
  u_noah UUID;
  -- Teens
  u_aiden UUID;
  u_priya UUID;
  u_diego UUID;
  u_jasmine UUID;
  -- College
  u_tyler UUID;
  u_amara UUID;
  u_ryan UUID;

  -- Hunt IDs
  h_ecology UUID;
  h_watershed UUID;
  h_weather UUID;
  h_measurement UUID;
  h_geometry UUID;
  h_stats UUID;
  h_navigator UUID;
  h_history UUID;
  h_detective UUID;
  h_debate UUID;
  h_story UUID;
  h_heritage UUID;

BEGIN
  -- Generate user UUIDs
  u_mark := uuid_generate_v5(ns, 'seed-mark-keith');
  u_sarah := uuid_generate_v5(ns, 'seed-sarah-chen');
  u_james := uuid_generate_v5(ns, 'seed-james-whitfield');
  u_rivera := uuid_generate_v5(ns, 'seed-ms-rivera');
  u_nakamura := uuid_generate_v5(ns, 'seed-mr-nakamura');
  u_adeyemi := uuid_generate_v5(ns, 'seed-dr-adeyemi');
  u_baptiste := uuid_generate_v5(ns, 'seed-prof-baptiste');
  u_linda := uuid_generate_v5(ns, 'seed-linda-park');
  u_david := uuid_generate_v5(ns, 'seed-david-okafor');
  u_maria := uuid_generate_v5(ns, 'seed-maria-santos');
  u_mia := uuid_generate_v5(ns, 'seed-mia-park');
  u_ethan := uuid_generate_v5(ns, 'seed-ethan-park');
  u_zara := uuid_generate_v5(ns, 'seed-zara-okafor');
  u_kai := uuid_generate_v5(ns, 'seed-kai-nakamura');
  u_lily := uuid_generate_v5(ns, 'seed-lily-chen');
  u_noah := uuid_generate_v5(ns, 'seed-noah-santos');
  u_aiden := uuid_generate_v5(ns, 'seed-aiden-reeves');
  u_priya := uuid_generate_v5(ns, 'seed-priya-sharma');
  u_diego := uuid_generate_v5(ns, 'seed-diego-morales');
  u_jasmine := uuid_generate_v5(ns, 'seed-jasmine-lee');
  u_tyler := uuid_generate_v5(ns, 'seed-tyler-hampton');
  u_amara := uuid_generate_v5(ns, 'seed-amara-johnson');
  u_ryan := uuid_generate_v5(ns, 'seed-ryan-cho');

  -- Generate hunt UUIDs
  h_ecology := uuid_generate_v5(ns, 'hunt-ecology');
  h_watershed := uuid_generate_v5(ns, 'hunt-watershed');
  h_weather := uuid_generate_v5(ns, 'hunt-weather');
  h_measurement := uuid_generate_v5(ns, 'hunt-measurement');
  h_geometry := uuid_generate_v5(ns, 'hunt-geometry');
  h_stats := uuid_generate_v5(ns, 'hunt-stats');
  h_navigator := uuid_generate_v5(ns, 'hunt-navigator');
  h_history := uuid_generate_v5(ns, 'hunt-history');
  h_detective := uuid_generate_v5(ns, 'hunt-detective');
  h_debate := uuid_generate_v5(ns, 'hunt-debate');
  h_story := uuid_generate_v5(ns, 'hunt-story');
  h_heritage := uuid_generate_v5(ns, 'hunt-heritage');

  -- ── Insert Users ───────────────────────────────────────
  -- auth_id is set to the user's own id as placeholder
  -- Update after creating Supabase Auth users

  INSERT INTO public.users (id, auth_id, email, display_name, role, status, date_of_birth) VALUES
  -- Admin/Staff
  (u_mark, u_mark, 'seed_mark@findamine.app', 'Dr. Mark Keith', 'admin', 'active', NULL),
  (u_sarah, u_sarah, 'seed_sarah@findamine.app', 'Sarah Chen', 'researcher', 'active', NULL),
  (u_james, u_james, 'seed_james@findamine.app', 'James Whitfield', 'game_master', 'active', NULL),
  -- Teachers
  (u_rivera, u_rivera, 'seed_rivera@findamine.app', 'Ms. Rivera', 'teacher', 'active', NULL),
  (u_nakamura, u_nakamura, 'seed_nakamura@findamine.app', 'Mr. Nakamura', 'teacher', 'active', NULL),
  (u_adeyemi, u_adeyemi, 'seed_adeyemi@findamine.app', 'Dr. Adeyemi', 'teacher', 'active', NULL),
  (u_baptiste, u_baptiste, 'seed_baptiste@findamine.app', 'Prof. Baptiste', 'teacher', 'active', NULL),
  -- Parents
  (u_linda, u_linda, 'seed_linda@findamine.app', 'Linda Park', 'parent', 'active', NULL),
  (u_david, u_david, 'seed_david@findamine.app', 'David Okafor', 'parent', 'active', NULL),
  (u_maria, u_maria, 'seed_maria@findamine.app', 'Maria Santos', 'parent', 'active', NULL),
  -- Children (pre-consented for demo)
  (u_mia, u_mia, 'seed_mia@child.findamine.app', 'Mia P.', 'child', 'active', '2018-03-15'),
  (u_ethan, u_ethan, 'seed_ethan@child.findamine.app', 'Ethan P.', 'child', 'active', '2015-07-22'),
  (u_zara, u_zara, 'seed_zara@child.findamine.app', 'Zara O.', 'child', 'active', '2017-01-10'),
  (u_kai, u_kai, 'seed_kai@child.findamine.app', 'Kai N.', 'child', 'active', '2016-09-05'),
  (u_lily, u_lily, 'seed_lily@child.findamine.app', 'Lily C.', 'child', 'active', '2018-05-20'),
  (u_noah, u_noah, 'seed_noah@child.findamine.app', 'Noah S.', 'child', 'active', '2014-11-30'),
  -- Teens
  (u_aiden, u_aiden, 'seed_aiden@findamine.app', 'Aiden R.', 'teen', 'active', '2012-04-12'),
  (u_priya, u_priya, 'seed_priya@findamine.app', 'Priya S.', 'teen', 'active', '2011-08-25'),
  (u_diego, u_diego, 'seed_diego@findamine.app', 'Diego M.', 'teen', 'active', '2010-12-03'),
  (u_jasmine, u_jasmine, 'seed_jasmine@findamine.app', 'Jasmine L.', 'teen', 'active', '2009-06-18'),
  -- College
  (u_tyler, u_tyler, 'seed_tyler@findamine.app', 'Tyler H.', 'parent', 'active', '2004-02-28'),
  (u_amara, u_amara, 'seed_amara@findamine.app', 'Amara J.', 'parent', 'active', '2003-10-14'),
  (u_ryan, u_ryan, 'seed_ryan@findamine.app', 'Ryan C.', 'parent', 'active', '2004-07-07')
  ON CONFLICT (id) DO NOTHING;

  -- ── Parent-child links ─────────────────────────────────
  INSERT INTO public.parent_child_links (parent_id, child_id, relationship_type, verified) VALUES
  (u_linda, u_mia, 'parent', true),
  (u_linda, u_ethan, 'parent', true),
  (u_david, u_zara, 'parent', true),
  (u_maria, u_noah, 'parent', true),
  (u_maria, u_aiden, 'parent', true)
  ON CONFLICT DO NOTHING;

  -- ── Consent records for children ───────────────────────
  INSERT INTO public.consent_records (user_id, child_id, consent_type, form_version, granted, verified_at) VALUES
  (u_linda, u_mia, 'parental', '1.0', true, NOW() - INTERVAL '30 days'),
  (u_linda, u_ethan, 'parental', '1.0', true, NOW() - INTERVAL '30 days'),
  (u_david, u_zara, 'parental', '1.0', true, NOW() - INTERVAL '28 days'),
  (u_maria, u_noah, 'parental', '1.0', true, NOW() - INTERVAL '25 days')
  ON CONFLICT DO NOTHING;

  -- ── User profiles (age bands) ──────────────────────────
  INSERT INTO public.user_profiles (user_id, effective_band) VALUES
  (u_mia, 'primary'), (u_ethan, 'intermediate'), (u_zara, 'primary'),
  (u_kai, 'intermediate'), (u_lily, 'primary'), (u_noah, 'intermediate'),
  (u_aiden, 'teen'), (u_priya, 'teen'), (u_diego, 'teen'), (u_jasmine, 'teen'),
  (u_tyler, 'adult'), (u_amara, 'adult'), (u_ryan, 'adult'),
  (u_rivera, 'adult'), (u_nakamura, 'adult'), (u_adeyemi, 'adult'), (u_baptiste, 'adult'),
  (u_linda, 'adult'), (u_david, 'adult'), (u_maria, 'adult'),
  (u_mark, 'adult'), (u_sarah, 'adult'), (u_james, 'adult')
  ON CONFLICT (user_id) DO NOTHING;

  -- ── 2. HUNTS (12) ──────────────────────────────────────────

  INSERT INTO public.hunts (id, title, description, target_audience, play_mode, status, is_public, identity_mode, center_latitude, center_longitude, search_radius_km, estimated_duration_min, grade_range_min, grade_range_max, subject_domains, created_by) VALUES
  (h_ecology, 'BYU Campus Ecology Walk', 'Discover the ecosystems hiding in plain sight on BYU campus. Observe trees, count species, and learn how nature thrives in an urban environment.', 'kids', 'team_assigned', 'published', true, 'codename_assigned', 40.2490, -111.6500, 1.0, 45, 2, 6, ARRAY['science_nature'], u_rivera),
  (h_watershed, 'Provo River Watershed Discovery', 'Follow the Provo River and learn how water shapes the land. Measure flow, find erosion patterns, and discover aquatic life.', 'teens', 'solo', 'published', true, 'real_name', 40.2410, -111.6615, 2.0, 60, 5, 9, ARRAY['science_nature'], u_nakamura),
  (h_weather, 'Weather & Atmosphere Lab', 'Use your senses and simple tools to become a weather observer. Identify clouds, measure shadows, and predict the forecast.', 'teens', 'team_self_select', 'in_progress', true, 'codename_chosen', 40.2490, -111.6490, 0.8, 40, 6, 10, ARRAY['science_nature'], u_adeyemi),
  (h_measurement, 'Measurement Mania', 'How tall is that tree? How far is that building? Use estimation, body measurements, and clever math to measure the world.', 'kids', 'team_assigned', 'published', true, 'codename_assigned', 40.2500, -111.6500, 1.0, 35, 2, 5, ARRAY['math_real_world'], u_rivera),
  (h_geometry, 'Geometry Everywhere', 'Shapes are hiding all around you — in buildings, nature, and sidewalks. Find them, measure them, and sketch them.', 'teens', 'solo', 'published', true, 'codename_assigned', 40.2485, -111.6495, 0.8, 40, 4, 8, ARRAY['math_real_world'], u_nakamura),
  (h_stats, 'Statistics in the Wild', 'Collect real data from the world around you and use statistics to find patterns and tell stories.', 'adults', 'solo', 'draft', false, 'real_name', 40.2490, -111.6500, 1.0, 50, 8, 12, ARRAY['math_real_world'], u_baptiste),
  (h_navigator, 'Campus Navigator Challenge', 'Can you find your way using only a compass, landmarks, and your wits? Test your navigation skills across BYU campus.', 'kids', 'team_random', 'published', true, 'codename_assigned', 40.2490, -111.6500, 1.2, 40, 2, 6, ARRAY['geography_maps'], u_rivera),
  (h_history, 'Provo City History Trail', 'Walk through time in downtown Provo. Discover the stories of buildings, streets, and the people who shaped this community.', 'teens', 'solo', 'published', true, 'codename_chosen', 40.2340, -111.6575, 1.5, 50, 5, 9, ARRAY['history_community','geography_maps'], u_nakamura),
  (h_detective, 'Observation Detective', 'Train your eyes to see what others miss. Find hidden clues, decode patterns, and solve mysteries using only your powers of observation.', 'kids', 'solo', 'published', true, 'codename_assigned', 40.2490, -111.6500, 0.8, 30, 2, 6, ARRAY['critical_thinking'], u_rivera),
  (h_debate, 'Debate & Decide', 'Explore real community issues, gather evidence, argue different perspectives, and practice making decisions with incomplete information.', 'adults', 'team_self_select', 'in_progress', false, 'real_name', 40.2490, -111.6500, 1.0, 55, 8, 12, ARRAY['critical_thinking'], u_adeyemi),
  (h_story, 'Story Walk: The Discovery Trail', 'Read story segments at each stop, predict what happens next, and write your own adventure along the way.', 'kids', 'solo', 'published', true, 'codename_assigned', 40.2490, -111.6510, 0.6, 30, 2, 5, ARRAY['reading_writing'], u_rivera),
  (h_heritage, 'BYU Heritage Walk', 'Explore the history and architecture of BYU campus. From founding stories to modern landmarks, every building has a tale.', 'teens', 'team_assigned', 'published', true, 'codename_chosen', 40.2490, -111.6500, 1.0, 50, 5, 9, ARRAY['history_community'], u_adeyemi)
  ON CONFLICT (id) DO NOTHING;

  -- ── 3. LOCATIONS, TASKS, PRIMERS, FINDS ────────────────────
  -- Create 5 stops for the Ecology Walk as a representative example
  -- (Full 60 finds would be very long — this creates the pattern)

  -- Ecology Walk locations
  DECLARE
    loc_botany UUID; loc_benson UUID; loc_bean UUID; loc_quad UUID; loc_pond UUID;
    task_e1 UUID; task_e2 UUID; task_e3 UUID; task_e4 UUID; task_e5 UUID;
    primer_e1 UUID; primer_e2 UUID;
  BEGIN
    loc_botany := gen_random_uuid();
    loc_benson := gen_random_uuid();
    loc_bean := gen_random_uuid();
    loc_quad := gen_random_uuid();
    loc_pond := gen_random_uuid();

    INSERT INTO public.locations (id, name, description, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc_botany, 'Botany Pond', 'Small pond near the JFSB surrounded by diverse vegetation', 40.2485, -111.6512, ST_SetSRID(ST_MakePoint(-111.6512, 40.2485), 4326)::geography, 30, 'water', u_rivera),
    (loc_benson, 'Benson Building Garden', 'Agriculture building with teaching gardens', 40.2478, -111.6504, ST_SetSRID(ST_MakePoint(-111.6504, 40.2478), 4326)::geography, 40, 'farm', u_rivera),
    (loc_bean, 'Bean Life Science Museum', 'Natural history museum with outdoor specimens', 40.2495, -111.6507, ST_SetSRID(ST_MakePoint(-111.6507, 40.2495), 4326)::geography, 35, 'campus', u_rivera),
    (loc_quad, 'Heritage Halls Quad', 'Open grassy area with mature trees', 40.2523, -111.6481, ST_SetSRID(ST_MakePoint(-111.6481, 40.2523), 4326)::geography, 50, 'park', u_rivera),
    (loc_pond, 'Duck Pond Area', 'Campus pond with waterfowl and surrounding vegetation', 40.2510, -111.6520, ST_SetSRID(ST_MakePoint(-111.6520, 40.2510), 4326)::geography, 40, 'water', u_rivera);

    -- Ecology Walk tasks (location-specific)
    task_e1 := gen_random_uuid();
    task_e2 := gen_random_uuid();
    task_e3 := gen_random_uuid();
    task_e4 := gen_random_uuid();
    task_e5 := gen_random_uuid();

    INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task_e1, 'Botany Pond Species Count', 'science_nature', 'numeric_entry', '{"question":"How many different plant species can you count around the edges of Botany Pond? Look at ground level, mid-height, and tree canopy. Count each species once.","unit":"species","correct_answer":"12","hints":["Look for at least 3 types of trees","Check the water''s edge for aquatic plants","Don''t forget grasses — they count as species","Look for mosses and ferns too"]}', 2, 6, 2, false, 'location_specific', 'water', u_rivera),
    (task_e2, 'Benson Garden Soil Test', 'science_nature', 'multiple_choice', '{"question":"Pick up a handful of soil from the Benson teaching garden. Squeeze it. What type of soil is it?","options":["Sandy (falls apart, gritty)","Clay (holds together, sticky, shiny when rubbed)","Loam (crumbly, dark, holds together loosely)","Silty (smooth like flour)"],"correct_answer":"Loam (crumbly, dark, holds together loosely)","hints":["Garden soil is usually amended to be good for growing","Loam is the ideal garden soil type","Feel for grittiness (sand) vs smoothness (clay)","Dark color means lots of organic matter"]}', 2, 6, 2, false, 'location_specific', 'farm', u_rivera),
    (task_e3, 'Bean Museum Outdoor Specimens', 'science_nature', 'photo_observation', '{"question":"Outside the Bean Museum, find a plant that has adapted to Utah''s dry climate. Take a photo. Describe 2 features that help it survive with less water.","hints":["Look for thick or waxy leaves (less water loss)","Small or needle-like leaves reduce surface area","Some plants have deep roots or water-storing stems","Gray or silver color reflects sunlight and reduces heat"]}', 2, 6, 2, false, 'location_specific', 'campus', u_rivera),
    (task_e4, 'Quad Tree Survey', 'science_nature', 'data_collection', '{"question":"In the Heritage Halls quad, count every tree. Classify each as deciduous (loses leaves in fall) or evergreen (keeps leaves year-round). What is the ratio?","hints":["Deciduous: broad flat leaves (maple, oak, elm)","Evergreen: needles or scales (pine, spruce, juniper)","Some trees might be tricky — look at leaf attachment","Record your count: deciduous = ?, evergreen = ?"]}', 2, 6, 2, false, 'location_specific', 'park', u_rivera),
    (task_e5, 'Duck Pond Food Web', 'science_nature', 'sketch_draw', '{"question":"Observe the duck pond ecosystem for 3 minutes. Then sketch a food web showing at least 4 organisms you observed or have evidence of. Draw arrows from food source to consumer.","hints":["Ducks eat plants, insects, and bread crumbs (if people feed them)","Insects eat algae and decomposing plants","Fish (if present) eat insects and algae","Trees provide habitat for birds and insects"]}', 3, 6, 3, false, 'location_specific', 'water', u_rivera);

    -- Ecology Walk primers
    primer_e1 := gen_random_uuid();
    primer_e2 := gen_random_uuid();

    INSERT INTO public.primers (id, title, content, subject_domain, grade_range_min, grade_range_max, is_library, location_dependency, location_type, created_by) VALUES
    (primer_e1, 'Campus Ecosystems', '{"text":"Even a university campus is an ecosystem! Buildings, parking lots, lawns, gardens, and ponds each create different habitats. The plants and animals that live here have adapted to life alongside thousands of students. Watch carefully — you might spot birds, squirrels, insects, and plants you''ve never noticed before.","items":["Lawns: managed habitat for ground-dwelling insects","Gardens: planted habitat attracting pollinators","Trees: habitat for birds, squirrels, and insects","Water features: habitat for aquatic organisms and waterfowl"]}', 'science_nature', 2, 6, false, 'location_specific', 'campus', u_rivera),
    (primer_e2, 'Food Webs', '{"text":"A food web shows how energy moves through an ecosystem. Every living thing is connected: plants capture sunlight, herbivores eat plants, predators eat herbivores, and decomposers break everything down. At the duck pond, you''ll see several parts of the food web in action!","items":["Producers: algae, pond plants, grass","Primary consumers: ducks, insects, snails","Secondary consumers: birds of prey, fish","Decomposers: bacteria, fungi in the pond mud"]}', 'science_nature', 2, 6, false, 'location_specific', 'water', u_rivera);

    -- Ecology Walk finds (5 stops)
    INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_ecology, loc_botany, task_e1, primer_e1, 0, 'Find the hidden oasis on campus — a small body of water surrounded by green, near where humanities students study.', true),
    (h_ecology, loc_benson, task_e2, NULL, 1, 'Head to the building where future farmers learn their craft. Its gardens hold the secret to healthy soil.', true),
    (h_ecology, loc_bean, task_e3, NULL, 2, 'This museum is full of life — both inside and out. Look for the building that celebrates creatures great and small.', true),
    (h_ecology, loc_quad, task_e4, NULL, 3, 'Walk to where first-year students live. In the green space between the buildings, a forest of trees awaits your survey.', true),
    (h_ecology, loc_pond, task_e5, primer_e2, 4, 'Your final stop has feathered residents who call BYU home year-round. Find the place where ducks paddle and students relax.', true);
  END;

  -- ── 4. TEAMS (6) ───────────────────────────────────────────

  DECLARE
    team_ff UUID; team_ro UUID; team_mw UUID; team_ge UUID; team_hh UUID; team_ds UUID;
  BEGIN
    team_ff := gen_random_uuid();
    team_ro := gen_random_uuid();
    team_mw := gen_random_uuid();
    team_ge := gen_random_uuid();
    team_hh := gen_random_uuid();
    team_ds := gen_random_uuid();

    INSERT INTO public.teams (id, hunt_id, name, status, max_size) VALUES
    (team_ff, h_ecology, 'Forest Falcons', 'active', 4),
    (team_ro, h_ecology, 'River Otters', 'active', 4),
    (team_mw, h_measurement, 'Math Wizards', 'active', 4),
    (team_ge, h_navigator, 'Geo Explorers', 'active', 4),
    (team_hh, h_heritage, 'History Hawks', 'active', 4),
    (team_ds, h_debate, 'Debate Squad', 'active', 4)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.team_members (team_id, user_id, role, status) VALUES
    -- Forest Falcons
    (team_ff, u_mia, 'captain', 'active'),
    (team_ff, u_zara, 'member', 'active'),
    (team_ff, u_kai, 'member', 'active'),
    -- River Otters
    (team_ro, u_ethan, 'captain', 'active'),
    (team_ro, u_lily, 'member', 'active'),
    (team_ro, u_noah, 'member', 'active'),
    -- Math Wizards
    (team_mw, u_mia, 'member', 'active'),
    (team_mw, u_ethan, 'captain', 'active'),
    (team_mw, u_zara, 'member', 'active'),
    -- Geo Explorers
    (team_ge, u_kai, 'captain', 'active'),
    (team_ge, u_lily, 'member', 'active'),
    (team_ge, u_noah, 'member', 'active'),
    -- History Hawks
    (team_hh, u_priya, 'captain', 'active'),
    (team_hh, u_diego, 'member', 'active'),
    (team_hh, u_jasmine, 'member', 'active'),
    -- Debate Squad
    (team_ds, u_tyler, 'captain', 'active'),
    (team_ds, u_amara, 'member', 'active'),
    (team_ds, u_ryan, 'member', 'active')
    ON CONFLICT DO NOTHING;
  END;

  -- ── 5. PLAY SESSIONS & SCORES ──────────────────────────────

  DECLARE
    ps1 UUID; ps2 UUID; ps3 UUID; ps4 UUID; ps5 UUID;
    ps6 UUID; ps7 UUID; ps8 UUID; ps9 UUID; ps10 UUID;
  BEGIN
    ps1 := gen_random_uuid();
    ps2 := gen_random_uuid();
    ps3 := gen_random_uuid();
    ps4 := gen_random_uuid();
    ps5 := gen_random_uuid();
    ps6 := gen_random_uuid();
    ps7 := gen_random_uuid();
    ps8 := gen_random_uuid();
    ps9 := gen_random_uuid();
    ps10 := gen_random_uuid();

    INSERT INTO public.play_sessions (id, hunt_id, user_id, status, total_score, codename, started_at, completed_at) VALUES
    -- Ecology Walk completions
    (ps1, h_ecology, u_mia, 'completed', 78, 'Swift Otter', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '42 minutes'),
    (ps2, h_ecology, u_ethan, 'completed', 85, 'Bold Eagle', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '38 minutes'),
    (ps3, h_ecology, u_kai, 'completed', 68, 'Ember Hawk', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '50 minutes'),
    (ps4, h_ecology, u_noah, 'completed', 81, 'Crystal Lynx', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '40 minutes'),
    -- Measurement Mania
    (ps5, h_measurement, u_mia, 'completed', 72, 'Swift Otter', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '35 minutes'),
    (ps6, h_measurement, u_zara, 'completed', 75, 'Cosmic Fox', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '33 minutes'),
    -- Navigator
    (ps7, h_navigator, u_ethan, 'completed', 88, 'Bold Eagle', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '36 minutes'),
    (ps8, h_navigator, u_kai, 'completed', 65, 'Ember Hawk', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '45 minutes'),
    -- Heritage Walk (teens — real names)
    (ps9, h_heritage, u_priya, 'completed', 91, NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '48 minutes'),
    (ps10, h_heritage, u_diego, 'completed', 65, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '52 minutes')
    ON CONFLICT DO NOTHING;

    -- Points ledger
    INSERT INTO public.points_ledger (user_id, amount, source_type, description, hunt_id) VALUES
    (u_mia, 78, 'hunt_completion', 'Completed BYU Campus Ecology Walk', h_ecology),
    (u_mia, 72, 'hunt_completion', 'Completed Measurement Mania', h_measurement),
    (u_ethan, 85, 'hunt_completion', 'Completed BYU Campus Ecology Walk', h_ecology),
    (u_ethan, 88, 'hunt_completion', 'Completed Campus Navigator Challenge', h_navigator),
    (u_zara, 75, 'hunt_completion', 'Completed Measurement Mania', h_measurement),
    (u_kai, 68, 'hunt_completion', 'Completed BYU Campus Ecology Walk', h_ecology),
    (u_kai, 65, 'hunt_completion', 'Completed Campus Navigator Challenge', h_navigator),
    (u_noah, 81, 'hunt_completion', 'Completed BYU Campus Ecology Walk', h_ecology),
    (u_priya, 91, 'hunt_completion', 'Completed BYU Heritage Walk', h_heritage),
    (u_diego, 65, 'hunt_completion', 'Completed BYU Heritage Walk', h_heritage)
    ON CONFLICT DO NOTHING;
  END;

  -- ── 6. LEADERBOARD SNAPSHOTS (14 days × 4 active hunts) ───

  -- Create daily snapshots for the ecology walk (most active hunt)
  FOR i IN 0..13 LOOP
    INSERT INTO public.leaderboard_snapshots (hunt_id, snapshot_type, period, summary_stats, snapshot_at) VALUES
    (h_ecology, 'periodic', 'daily', jsonb_build_object(
      'total_participants', LEAST(4, i / 3 + 1),
      'avg_score', 75 + (random() * 10)::int,
      'median_score', 78,
      'completion_rate', LEAST(1.0, (i + 1)::float / 14),
      'top_3', jsonb_build_array(
        jsonb_build_object('codename', 'Bold Eagle', 'score', 85),
        jsonb_build_object('codename', 'Crystal Lynx', 'score', 81),
        jsonb_build_object('codename', 'Swift Otter', 'score', 78)
      )
    ), NOW() - (13 - i) * INTERVAL '1 day');
  END LOOP;

  -- Snapshots for other active hunts
  FOR i IN 0..13 LOOP
    INSERT INTO public.leaderboard_snapshots (hunt_id, snapshot_type, period, summary_stats, snapshot_at) VALUES
    (h_measurement, 'periodic', 'daily', jsonb_build_object(
      'total_participants', LEAST(2, i / 5 + 1),
      'avg_score', 73,
      'completion_rate', LEAST(1.0, (i + 1)::float / 14)
    ), NOW() - (13 - i) * INTERVAL '1 day'),
    (h_navigator, 'periodic', 'daily', jsonb_build_object(
      'total_participants', LEAST(2, i / 4 + 1),
      'avg_score', 76,
      'completion_rate', LEAST(1.0, (i + 1)::float / 14)
    ), NOW() - (13 - i) * INTERVAL '1 day'),
    (h_heritage, 'periodic', 'daily', jsonb_build_object(
      'total_participants', LEAST(2, i / 6 + 1),
      'avg_score', 78,
      'completion_rate', LEAST(1.0, (i + 1)::float / 14)
    ), NOW() - (13 - i) * INTERVAL '1 day');
  END LOOP;

  -- ── 7. SOCIAL DATA ─────────────────────────────────────────

  -- Friend connections
  INSERT INTO public.friendships (requester_id, addressee_id, status) VALUES
  (u_mia, u_zara, 'accepted'),
  (u_ethan, u_noah, 'accepted'),
  (u_ethan, u_kai, 'accepted'),
  (u_kai, u_lily, 'accepted'),
  (u_priya, u_diego, 'accepted'),
  (u_priya, u_jasmine, 'accepted'),
  (u_tyler, u_amara, 'accepted'),
  (u_tyler, u_ryan, 'accepted'),
  (u_mia, u_lily, 'pending'),
  (u_noah, u_kai, 'pending'),
  (u_diego, u_jasmine, 'pending')
  ON CONFLICT DO NOTHING;

  -- Kudos
  INSERT INTO public.kudos (sender_id, receiver_id, message) VALUES
  (u_ethan, u_mia, 'Great job finding all those plant species!'),
  (u_mia, u_zara, 'You''re so good at measurement challenges!'),
  (u_kai, u_ethan, 'Nice teamwork on the ecology walk!'),
  (u_noah, u_kai, 'Your navigation skills are awesome!'),
  (u_priya, u_diego, 'Loved your analysis of the heritage buildings.'),
  (u_rivera, u_mia, 'Excellent observation skills, Mia!'),
  (u_rivera, u_ethan, 'Your ecology walk score was impressive!'),
  (u_nakamura, u_priya, 'Outstanding work on the heritage walk.'),
  (u_zara, u_mia, 'Thanks for helping me with the soil test!'),
  (u_lily, u_noah, 'You''re a great team leader!')
  ON CONFLICT DO NOTHING;

  -- ── 8. GAMIFICATION ────────────────────────────────────────

  -- Streaks
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date, streak_start_date) VALUES
  (u_ethan, 5, 7, CURRENT_DATE - 1, CURRENT_DATE - 5),
  (u_mia, 3, 4, CURRENT_DATE - 1, CURRENT_DATE - 3),
  (u_priya, 4, 4, CURRENT_DATE, CURRENT_DATE - 4),
  (u_kai, 2, 3, CURRENT_DATE - 2, CURRENT_DATE - 3),
  (u_noah, 1, 2, CURRENT_DATE - 3, CURRENT_DATE - 3)
  ON CONFLICT (user_id) DO NOTHING;

  -- Badge awards
  DECLARE
    bt_first_find UUID;
    bt_first_hunt UUID;
    bt_streak3 UUID;
    bt_distance1k UUID;
    bt_nature UUID;
    bt_kind UUID;
    bt_team_captain UUID;
  BEGIN
    SELECT id INTO bt_first_find FROM public.badge_types WHERE code = 'FIRST_FIND' LIMIT 1;
    SELECT id INTO bt_first_hunt FROM public.badge_types WHERE code = 'FIRST_HUNT' LIMIT 1;
    SELECT id INTO bt_streak3 FROM public.badge_types WHERE code = 'STREAK_3' LIMIT 1;
    SELECT id INTO bt_distance1k FROM public.badge_types WHERE code = 'DISTANCE_1K' LIMIT 1;
    SELECT id INTO bt_nature FROM public.badge_types WHERE code = 'NATURE_HUNT' LIMIT 1;
    SELECT id INTO bt_kind FROM public.badge_types WHERE code = 'KIND_COMMENTER' LIMIT 1;
    SELECT id INTO bt_team_captain FROM public.badge_types WHERE code = 'TEAM_CAPTAIN' LIMIT 1;

    IF bt_first_find IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_type_id, hunt_id) VALUES
      (u_mia, bt_first_find, h_ecology),
      (u_ethan, bt_first_find, h_ecology),
      (u_zara, bt_first_find, h_measurement),
      (u_kai, bt_first_find, h_ecology),
      (u_noah, bt_first_find, h_ecology),
      (u_priya, bt_first_find, h_heritage),
      (u_diego, bt_first_find, h_heritage)
      ON CONFLICT DO NOTHING;
    END IF;

    IF bt_first_hunt IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_type_id, hunt_id) VALUES
      (u_mia, bt_first_hunt, h_ecology),
      (u_ethan, bt_first_hunt, h_ecology),
      (u_zara, bt_first_hunt, h_measurement),
      (u_kai, bt_first_hunt, h_ecology),
      (u_noah, bt_first_hunt, h_ecology),
      (u_priya, bt_first_hunt, h_heritage),
      (u_diego, bt_first_hunt, h_heritage)
      ON CONFLICT DO NOTHING;
    END IF;

    IF bt_streak3 IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_type_id) VALUES
      (u_ethan, bt_streak3),
      (u_mia, bt_streak3),
      (u_priya, bt_streak3)
      ON CONFLICT DO NOTHING;
    END IF;

    IF bt_nature IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_type_id, hunt_id) VALUES
      (u_mia, bt_nature, h_ecology),
      (u_ethan, bt_nature, h_ecology),
      (u_kai, bt_nature, h_ecology),
      (u_noah, bt_nature, h_ecology)
      ON CONFLICT DO NOTHING;
    END IF;

    IF bt_team_captain IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_type_id) VALUES
      (u_mia, bt_team_captain),
      (u_ethan, bt_team_captain),
      (u_priya, bt_team_captain)
      ON CONFLICT DO NOTHING;
    END IF;
  END;

  -- Tier assignments
  INSERT INTO public.user_tiers (user_id, tier, total_points) VALUES
  (u_mia, 1, 150),
  (u_ethan, 2, 573),
  (u_zara, 1, 75),
  (u_kai, 1, 133),
  (u_noah, 1, 81),
  (u_priya, 1, 91),
  (u_diego, 1, 65)
  ON CONFLICT (user_id) DO NOTHING;

END $$;
