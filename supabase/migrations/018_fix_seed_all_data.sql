-- ══════════════════════════════════════════════════════════════
-- Migration 018: Fix — re-run all seed data (015 + 017 combined)
-- Previous migrations failed partway. This is a clean re-run.
-- ══════════════════════════════════════════════════════════════

-- Ensure FK is dropped (may or may not exist after partial 015 failure)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_id_fkey;

-- Run the full seed in a single DO block
DO $$
DECLARE
  ns UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  u_owner UUID;

  -- User IDs
  u_mark UUID; u_sarah UUID; u_james UUID;
  u_rivera UUID; u_nakamura UUID; u_adeyemi UUID; u_baptiste UUID;
  u_linda UUID; u_david UUID; u_maria UUID;
  u_mia UUID; u_ethan UUID; u_zara UUID; u_kai UUID; u_lily UUID; u_noah UUID;
  u_aiden UUID; u_priya UUID; u_diego UUID; u_jasmine UUID;
  u_tyler UUID; u_amara UUID; u_ryan UUID;

  -- Hunt IDs
  h_ecology UUID; h_watershed UUID; h_weather UUID; h_measurement UUID;
  h_geometry UUID; h_stats UUID; h_navigator UUID; h_history UUID;
  h_detective UUID; h_debate UUID; h_story UUID; h_heritage UUID;

  -- Temp vars
  loc UUID; task UUID; primer UUID;
  team_ff UUID; team_ro UUID; team_mw UUID; team_ge UUID; team_hh UUID; team_ds UUID;
  ps1 UUID; ps2 UUID; ps3 UUID; ps4 UUID; ps5 UUID;
  ps6 UUID; ps7 UUID; ps8 UUID; ps9 UUID; ps10 UUID;
  bt_first_find UUID; bt_first_hunt UUID; bt_streak3 UUID; bt_nature UUID; bt_team_captain UUID;

BEGIN
  -- Look up real owner
  SELECT id INTO u_owner FROM public.users WHERE email = 'mark.keith@gmail.com' LIMIT 1;

  -- Generate deterministic UUIDs
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

  -- Fallback owner if not found
  IF u_owner IS NULL THEN
    u_owner := u_mark;
  END IF;

  -- ══════════════════════════════════════════════════════
  -- USERS (23)
  -- ══════════════════════════════════════════════════════
  INSERT INTO public.users (id, auth_id, email, display_name, role, status, date_of_birth) VALUES
  (u_mark, u_mark, 'seed_mark@findamine.app', 'Dr. Mark Keith', 'admin', 'active', NULL),
  (u_sarah, u_sarah, 'seed_sarah@findamine.app', 'Sarah Chen', 'researcher', 'active', NULL),
  (u_james, u_james, 'seed_james@findamine.app', 'James Whitfield', 'hunt_creator', 'active', NULL),
  (u_rivera, u_rivera, 'seed_rivera@findamine.app', 'Ms. Rivera', 'teacher', 'active', NULL),
  (u_nakamura, u_nakamura, 'seed_nakamura@findamine.app', 'Mr. Nakamura', 'teacher', 'active', NULL),
  (u_adeyemi, u_adeyemi, 'seed_adeyemi@findamine.app', 'Dr. Adeyemi', 'teacher', 'active', NULL),
  (u_baptiste, u_baptiste, 'seed_baptiste@findamine.app', 'Prof. Baptiste', 'teacher', 'active', NULL),
  (u_linda, u_linda, 'seed_linda@findamine.app', 'Linda Park', 'parent', 'active', NULL),
  (u_david, u_david, 'seed_david@findamine.app', 'David Okafor', 'parent', 'active', NULL),
  (u_maria, u_maria, 'seed_maria@findamine.app', 'Maria Santos', 'parent', 'active', NULL),
  (u_mia, u_mia, 'seed_mia@child.findamine.app', 'Mia P.', 'child', 'active', '2018-03-15'),
  (u_ethan, u_ethan, 'seed_ethan@child.findamine.app', 'Ethan P.', 'child', 'active', '2015-07-22'),
  (u_zara, u_zara, 'seed_zara@child.findamine.app', 'Zara O.', 'child', 'active', '2017-01-10'),
  (u_kai, u_kai, 'seed_kai@child.findamine.app', 'Kai N.', 'child', 'active', '2016-09-05'),
  (u_lily, u_lily, 'seed_lily@child.findamine.app', 'Lily C.', 'child', 'active', '2018-05-20'),
  (u_noah, u_noah, 'seed_noah@child.findamine.app', 'Noah S.', 'child', 'active', '2014-11-30'),
  (u_aiden, u_aiden, 'seed_aiden@findamine.app', 'Aiden R.', 'teen', 'active', '2012-04-12'),
  (u_priya, u_priya, 'seed_priya@findamine.app', 'Priya S.', 'teen', 'active', '2011-08-25'),
  (u_diego, u_diego, 'seed_diego@findamine.app', 'Diego M.', 'teen', 'active', '2010-12-03'),
  (u_jasmine, u_jasmine, 'seed_jasmine@findamine.app', 'Jasmine L.', 'teen', 'active', '2009-06-18'),
  (u_tyler, u_tyler, 'seed_tyler@findamine.app', 'Tyler H.', 'parent', 'active', '2004-02-28'),
  (u_amara, u_amara, 'seed_amara@findamine.app', 'Amara J.', 'parent', 'active', '2003-10-14'),
  (u_ryan, u_ryan, 'seed_ryan@findamine.app', 'Ryan C.', 'parent', 'active', '2004-07-07')
  ON CONFLICT (id) DO NOTHING;

  -- ══════════════════════════════════════════════════════
  -- HUNTS (12) — just 3 representative hunts to keep this manageable
  -- ══════════════════════════════════════════════════════
  INSERT INTO public.hunts (id, title, description, target_audience, play_mode, status, is_public, identity_mode, center_latitude, center_longitude, search_radius_km, estimated_duration_min, grade_range_min, grade_range_max, subject_domains, created_by) VALUES
  (h_ecology, 'BYU Campus Ecology Walk', 'Discover the ecosystems hiding in plain sight on BYU campus.', 'kids', 'team_assigned', 'published', true, 'codename_assigned', 40.2490, -111.6500, 1.0, 45, 2, 6, ARRAY['science_nature'], COALESCE(u_owner, u_mark)),
  (h_watershed, 'Provo River Watershed Discovery', 'Follow the Provo River and learn how water shapes the land.', 'teens', 'solo', 'published', true, 'real_name', 40.2410, -111.6615, 2.0, 60, 5, 9, ARRAY['science_nature'], COALESCE(u_owner, u_mark)),
  (h_weather, 'Weather & Atmosphere Lab', 'Use your senses to become a weather observer.', 'teens', 'team_self_select', 'in_progress', true, 'codename_chosen', 40.2490, -111.6490, 0.8, 40, 6, 10, ARRAY['science_nature'], COALESCE(u_owner, u_mark)),
  (h_measurement, 'Measurement Mania', 'Use estimation and clever math to measure the world.', 'kids', 'team_assigned', 'published', true, 'codename_assigned', 40.2500, -111.6500, 1.0, 35, 2, 5, ARRAY['math_real_world'], COALESCE(u_owner, u_mark)),
  (h_geometry, 'Geometry Everywhere', 'Shapes are hiding all around you. Find, measure, and sketch them.', 'teens', 'solo', 'published', true, 'codename_assigned', 40.2485, -111.6495, 0.8, 40, 4, 8, ARRAY['math_real_world'], COALESCE(u_owner, u_mark)),
  (h_stats, 'Statistics in the Wild', 'Collect real data and use statistics to find patterns.', 'adults', 'solo', 'draft', false, 'real_name', 40.2490, -111.6500, 1.0, 50, 8, 12, ARRAY['math_real_world'], COALESCE(u_owner, u_mark)),
  (h_navigator, 'Campus Navigator Challenge', 'Test your navigation skills across BYU campus.', 'kids', 'team_random', 'published', true, 'codename_assigned', 40.2490, -111.6500, 1.2, 40, 2, 6, ARRAY['geography_maps'], COALESCE(u_owner, u_mark)),
  (h_history, 'Provo City History Trail', 'Walk through time in downtown Provo.', 'teens', 'solo', 'published', true, 'codename_chosen', 40.2340, -111.6575, 1.5, 50, 5, 9, ARRAY['history_community','geography_maps'], COALESCE(u_owner, u_mark)),
  (h_detective, 'Observation Detective', 'Train your eyes to see what others miss.', 'kids', 'solo', 'published', true, 'codename_assigned', 40.2490, -111.6500, 0.8, 30, 2, 6, ARRAY['critical_thinking'], COALESCE(u_owner, u_mark)),
  (h_debate, 'Debate & Decide', 'Explore real community issues and practice making decisions.', 'adults', 'team_self_select', 'in_progress', false, 'real_name', 40.2490, -111.6500, 1.0, 55, 8, 12, ARRAY['critical_thinking'], COALESCE(u_owner, u_mark)),
  (h_story, 'Story Walk: The Discovery Trail', 'Read story segments, predict what happens next, and write your own adventure.', 'kids', 'solo', 'published', true, 'codename_assigned', 40.2490, -111.6510, 0.6, 30, 2, 5, ARRAY['reading_writing'], COALESCE(u_owner, u_mark)),
  (h_heritage, 'BYU Heritage Walk', 'Explore the history and architecture of BYU campus.', 'teens', 'team_assigned', 'published', true, 'codename_chosen', 40.2490, -111.6500, 1.0, 50, 5, 9, ARRAY['history_community'], COALESCE(u_owner, u_mark))
  ON CONFLICT (id) DO NOTHING;

  -- ══════════════════════════════════════════════════════
  -- ECOLOGY WALK FINDS (5 stops — representative sample)
  -- ══════════════════════════════════════════════════════
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Botany Pond', 40.2485, -111.6512, ST_SetSRID(ST_MakePoint(-111.6512, 40.2485), 4326)::geography, 30, 'water', COALESCE(u_owner, u_mark));
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Campus Ecosystems', '{"text":"Even a university campus is an ecosystem! Buildings, parking lots, lawns, gardens, and ponds each create different habitats.","items":["Lawns: managed habitat","Gardens: planted for pollinators","Trees: habitat for birds and squirrels","Water features: aquatic organisms"]}', 'science_nature', false, 'location_specific', 'water', COALESCE(u_owner, u_mark));
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Botany Pond Species Count', 'science_nature', 'numeric_entry', '{"question":"How many different plant species can you count around Botany Pond? Look at ground level, mid-height, and tree canopy.","unit":"species","hints":["Look for at least 3 types of trees","Check the water edge for aquatic plants","Don''t forget grasses"]}', 2, 6, 2, false, 'location_specific', 'water', COALESCE(u_owner, u_mark));
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_ecology, loc, task, primer, 0, 'Find the hidden oasis on campus — a small body of water near where humanities students study.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Benson Building Garden', 40.2478, -111.6504, ST_SetSRID(ST_MakePoint(-111.6504, 40.2478), 4326)::geography, 40, 'farm', COALESCE(u_owner, u_mark));
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Benson Garden Soil Test', 'science_nature', 'multiple_choice', '{"question":"Pick up a handful of soil from the Benson teaching garden. What type is it?","options":["Sandy","Clay","Loam","Silty"],"correct_answer":"Loam","hints":["Garden soil is usually amended for growing","Loam is the ideal type"]}', 2, 6, 2, false, 'location_specific', 'farm', COALESCE(u_owner, u_mark));
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_ecology, loc, task, 1, 'Head to the building where future farmers learn their craft.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Bean Life Science Museum', 40.2495, -111.6507, ST_SetSRID(ST_MakePoint(-111.6507, 40.2495), 4326)::geography, 35, 'campus', COALESCE(u_owner, u_mark));
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Desert Plant Adaptations', 'science_nature', 'photo_observation', '{"question":"Find a plant adapted to Utah''s dry climate. Take a photo and describe 2 features that help it survive with less water.","hints":["Thick waxy leaves conserve water","Small leaves reduce surface area"]}', 2, 6, 2, false, 'location_specific', 'campus', COALESCE(u_owner, u_mark));
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_ecology, loc, task, 2, 'This museum celebrates creatures great and small.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Heritage Halls Quad', 40.2523, -111.6481, ST_SetSRID(ST_MakePoint(-111.6481, 40.2523), 4326)::geography, 50, 'park', COALESCE(u_owner, u_mark));
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Quad Tree Survey', 'science_nature', 'data_collection', '{"question":"Count every tree in this quad. Classify each as deciduous or evergreen. What is the ratio?","hints":["Deciduous: broad flat leaves","Evergreen: needles or scales"]}', 2, 6, 2, false, 'location_specific', 'park', COALESCE(u_owner, u_mark));
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_ecology, loc, task, 3, 'Walk to where first-year students live. A forest of trees awaits.');

  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Duck Pond', 40.2510, -111.6520, ST_SetSRID(ST_MakePoint(-111.6520, 40.2510), 4326)::geography, 40, 'water', COALESCE(u_owner, u_mark));
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Food Webs', '{"text":"A food web shows how energy moves through an ecosystem. Every living thing is connected.","items":["Producers: algae, pond plants","Primary consumers: ducks, insects","Secondary consumers: birds of prey","Decomposers: bacteria, fungi"]}', 'science_nature', false, 'location_specific', 'water', COALESCE(u_owner, u_mark));
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Duck Pond Food Web', 'science_nature', 'sketch_draw', '{"question":"Observe the duck pond for 3 minutes. Sketch a food web showing at least 4 organisms. Draw arrows from food source to consumer.","hints":["Ducks eat plants and insects","Insects eat algae","Trees provide habitat for birds"]}', 3, 6, 3, false, 'location_specific', 'water', COALESCE(u_owner, u_mark));
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_ecology, loc, task, primer, 4, 'Your final stop has feathered residents who call BYU home year-round.');

  -- ══════════════════════════════════════════════════════
  -- TEAMS (6)
  -- ══════════════════════════════════════════════════════
  team_ff := gen_random_uuid(); team_ro := gen_random_uuid();
  team_mw := gen_random_uuid(); team_ge := gen_random_uuid();
  team_hh := gen_random_uuid(); team_ds := gen_random_uuid();

  INSERT INTO public.teams (id, hunt_id, name, status, max_size) VALUES
  (team_ff, h_ecology, 'Forest Falcons', 'active', 4),
  (team_ro, h_ecology, 'River Otters', 'active', 4),
  (team_mw, h_measurement, 'Math Wizards', 'active', 4),
  (team_ge, h_navigator, 'Geo Explorers', 'active', 4),
  (team_hh, h_heritage, 'History Hawks', 'active', 4),
  (team_ds, h_debate, 'Debate Squad', 'active', 4)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.team_members (team_id, user_id, role, status) VALUES
  (team_ff, u_mia, 'captain', 'active'), (team_ff, u_zara, 'member', 'active'), (team_ff, u_kai, 'member', 'active'),
  (team_ro, u_ethan, 'captain', 'active'), (team_ro, u_lily, 'member', 'active'), (team_ro, u_noah, 'member', 'active'),
  (team_mw, u_mia, 'member', 'active'), (team_mw, u_ethan, 'captain', 'active'), (team_mw, u_zara, 'member', 'active'),
  (team_ge, u_kai, 'captain', 'active'), (team_ge, u_lily, 'member', 'active'), (team_ge, u_noah, 'member', 'active'),
  (team_hh, u_priya, 'captain', 'active'), (team_hh, u_diego, 'member', 'active'), (team_hh, u_jasmine, 'member', 'active'),
  (team_ds, u_tyler, 'captain', 'active'), (team_ds, u_amara, 'member', 'active'), (team_ds, u_ryan, 'member', 'active')
  ON CONFLICT DO NOTHING;

  -- ══════════════════════════════════════════════════════
  -- PLAY SESSIONS + SCORES
  -- ══════════════════════════════════════════════════════
  ps1 := gen_random_uuid(); ps2 := gen_random_uuid(); ps3 := gen_random_uuid();
  ps4 := gen_random_uuid(); ps5 := gen_random_uuid(); ps6 := gen_random_uuid();

  INSERT INTO public.play_sessions (id, hunt_id, user_id, status, total_score, codename, started_at, completed_at) VALUES
  (ps1, h_ecology, u_mia, 'completed', 78, 'Swift Otter', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '42 min'),
  (ps2, h_ecology, u_ethan, 'completed', 85, 'Bold Eagle', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '38 min'),
  (ps3, h_ecology, u_kai, 'completed', 68, 'Ember Hawk', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '50 min'),
  (ps4, h_ecology, u_noah, 'completed', 81, 'Crystal Lynx', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '40 min'),
  (ps5, h_measurement, u_mia, 'completed', 72, 'Swift Otter', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '35 min'),
  (ps6, h_measurement, u_zara, 'completed', 75, 'Cosmic Fox', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '33 min')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.points_ledger (user_id, amount, source_type, description, hunt_id) VALUES
  (u_mia, 78, 'hunt_complete', 'Completed Ecology Walk', h_ecology),
  (u_mia, 72, 'hunt_complete', 'Completed Measurement Mania', h_measurement),
  (u_ethan, 85, 'hunt_complete', 'Completed Ecology Walk', h_ecology),
  (u_zara, 75, 'hunt_complete', 'Completed Measurement Mania', h_measurement),
  (u_kai, 68, 'hunt_complete', 'Completed Ecology Walk', h_ecology),
  (u_noah, 81, 'hunt_complete', 'Completed Ecology Walk', h_ecology)
  ON CONFLICT DO NOTHING;

  -- ══════════════════════════════════════════════════════
  -- SOCIAL
  -- ══════════════════════════════════════════════════════
  INSERT INTO public.kudos (sender_id, receiver_id, message) VALUES
  (u_ethan, u_mia, 'Great job finding all those plant species!'),
  (u_mia, u_zara, 'You are so good at measurement challenges!'),
  (u_kai, u_ethan, 'Nice teamwork on the ecology walk!'),
  (u_noah, u_kai, 'Your navigation skills are awesome!')
  ON CONFLICT DO NOTHING;

  -- ══════════════════════════════════════════════════════
  -- GAMIFICATION
  -- ══════════════════════════════════════════════════════
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date, streak_start_date) VALUES
  (u_ethan, 5, 7, CURRENT_DATE - 1, CURRENT_DATE - 5),
  (u_mia, 3, 4, CURRENT_DATE - 1, CURRENT_DATE - 3)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT id INTO bt_first_find FROM public.badge_types WHERE code = 'FIRST_FIND' LIMIT 1;
  SELECT id INTO bt_first_hunt FROM public.badge_types WHERE code = 'FIRST_HUNT' LIMIT 1;
  SELECT id INTO bt_streak3 FROM public.badge_types WHERE code = 'STREAK_3' LIMIT 1;

  IF bt_first_find IS NOT NULL THEN
    INSERT INTO public.user_badges (user_id, badge_type_id, hunt_id) VALUES
    (u_mia, bt_first_find, h_ecology), (u_ethan, bt_first_find, h_ecology),
    (u_zara, bt_first_find, h_measurement), (u_kai, bt_first_find, h_ecology),
    (u_noah, bt_first_find, h_ecology)
    ON CONFLICT DO NOTHING;
  END IF;

  IF bt_first_hunt IS NOT NULL THEN
    INSERT INTO public.user_badges (user_id, badge_type_id, hunt_id) VALUES
    (u_mia, bt_first_hunt, h_ecology), (u_ethan, bt_first_hunt, h_ecology),
    (u_zara, bt_first_hunt, h_measurement), (u_kai, bt_first_hunt, h_ecology),
    (u_noah, bt_first_hunt, h_ecology)
    ON CONFLICT DO NOTHING;
  END IF;

  IF bt_streak3 IS NOT NULL THEN
    INSERT INTO public.user_badges (user_id, badge_type_id) VALUES
    (u_ethan, bt_streak3), (u_mia, bt_streak3)
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.user_tiers (user_id, tier, total_points) VALUES
  (u_mia, 1, 150), (u_ethan, 2, 573), (u_zara, 1, 75),
  (u_kai, 1, 133), (u_noah, 1, 81)
  ON CONFLICT (user_id) DO NOTHING;

END $$;

-- Re-add FK (NOT VALID so it doesn't check seed rows)
ALTER TABLE public.users
  ADD CONSTRAINT users_auth_id_fkey
  FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;
