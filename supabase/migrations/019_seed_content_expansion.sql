-- ══════════════════════════════════════════════════════════════
-- Migration 019: Content expansion — 10 new hunts, 50 stops
--
-- Three content types:
--   1. Generic (independent) — works anywhere: Hunts 2, 3, 9
--   2. Area-feature (type_dependent) — needs trail/urban/water: Hunts 4, 5, 6
--   3. Location-specific — BYU/Provo GPS: Hunts 1, 7, 8, 10
--
-- Audiences: kids (2,3,9), teens (5,6,8), family (1,4,7,10)
-- All 10 challenge types represented across the set.
-- Hunt 1 (Showcase) demos every challenge type + every primer variant.
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  ns UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  u_owner UUID;

  -- Deterministic hunt IDs
  h_showcase   UUID := uuid_generate_v5(ns, 'hunt-showcase');
  h_backyard   UUID := uuid_generate_v5(ns, 'hunt-backyard-bio');
  h_math_town  UUID := uuid_generate_v5(ns, 'hunt-math-town');
  h_trail      UUID := uuid_generate_v5(ns, 'hunt-trail-tracker');
  h_urban      UUID := uuid_generate_v5(ns, 'hunt-urban-explorer');
  h_waterway   UUID := uuid_generate_v5(ns, 'hunt-waterway');
  h_art_arch   UUID := uuid_generate_v5(ns, 'hunt-art-architecture');
  h_downtown   UUID := uuid_generate_v5(ns, 'hunt-downtown-provo');
  h_young_sci  UUID := uuid_generate_v5(ns, 'hunt-young-scientist');
  h_canyon     UUID := uuid_generate_v5(ns, 'hunt-canyon-gateway');

  loc UUID; task UUID; primer UUID;

BEGIN
  SELECT id INTO u_owner FROM public.users WHERE email = 'mark.keith@gmail.com' LIMIT 1;
  IF u_owner IS NULL THEN
    SELECT id INTO u_owner FROM public.users WHERE role = 'admin' LIMIT 1;
  END IF;

  -- ═══════════════════════════════════════════════════════════════
  -- INSERT ALL 10 HUNTS
  -- ═══════════════════════════════════════════════════════════════

  INSERT INTO public.hunts (id, title, description, target_audience, play_mode, identity_mode, status, is_public, is_template, center_latitude, center_longitude, estimated_duration_min, grade_range_min, grade_range_max, subject_domains, created_by) VALUES
    (h_showcase, 'Ultimate Challenge Showcase', 'Experience every challenge type in one epic BYU campus hunt. Multiple choice, photo observation, measurement, sketching, creative writing, and data collection — this hunt has it all.', 'family', 'team_self_select', 'codename_chosen', 'published', true, true, 40.2490, -111.6500, 60, 3, 10, ARRAY['science_nature','math_real_world','reading_writing','critical_thinking','history_community'], u_owner),
    (h_backyard, 'Backyard Biologist', 'Discover the hidden world of nature right under your feet! Count bugs, sort leaves, identify clouds, and explore colors — no special location needed.', 'kids', 'solo', 'codename_assigned', 'published', true, true, NULL, NULL, 35, 2, 5, ARRAY['science_nature'], u_owner),
    (h_math_town, 'Math Around Town', 'Math is hiding everywhere! Find shapes, measure distances, spot patterns, and estimate counts in any neighborhood. Team up and explore!', 'kids', 'team_assigned', 'codename_assigned', 'published', true, true, NULL, NULL, 40, 2, 6, ARRAY['math_real_world'], u_owner),
    (h_trail, 'Trail Tracker', 'Become a trail scientist! Map the path, investigate erosion, measure elevation, track wildlife signs, and reflect on your journey. Works on any hiking trail.', 'family', 'solo', 'codename_assigned', 'published', true, true, NULL, NULL, 50, 3, 8, ARRAY['science_nature','geography_maps'], u_owner),
    (h_urban, 'Urban Explorer', 'See your city through new eyes. Analyze street grids, date buildings by style, audit accessibility, map businesses, and debate urban design. Works in any downtown area.', 'teens', 'team_self_select', 'codename_chosen', 'published', true, true, NULL, NULL, 45, 6, 10, ARRAY['geography_maps','history_community','critical_thinking'], u_owner),
    (h_waterway, 'Waterway Investigators', 'Become a water scientist! Measure flow speed, assess water quality, search for aquatic life, and map the waterway cross-section. Works at any stream, river, or lake shore.', 'teens', 'solo', 'real_name', 'published', true, true, NULL, NULL, 40, 5, 10, ARRAY['science_nature'], u_owner),
    (h_art_arch, 'BYU Art & Architecture Walk', 'Explore BYU campus through the lens of art and architecture. From the Museum of Art to the oldest building on campus, discover the stories buildings tell.', 'family', 'solo', 'codename_assigned', 'published', true, true, 40.2490, -111.6510, 50, 3, 10, ARRAY['history_community','reading_writing'], u_owner),
    (h_downtown, 'Provo Downtown Discovery', 'Explore the heart of Provo! Date historic buildings, investigate the library, count pedestrians, and narrate a walking tour of Center Street.', 'teens', 'team_self_select', 'codename_chosen', 'published', true, true, 40.2338, -111.6585, 45, 6, 10, ARRAY['history_community','critical_thinking','geography_maps'], u_owner),
    (h_young_sci, 'Young Scientist Field Lab', 'Your first science adventure! Study shadows, touch textures, count things in nature, and give a weather report. Perfect for little explorers at any outdoor space.', 'kids', 'solo', 'codename_assigned', 'published', true, true, NULL, NULL, 30, 1, 4, ARRAY['science_nature','math_real_world'], u_owner),
    (h_canyon, 'Canyon Gateway Quest', 'Explore where the city meets the mountains at Rock Canyon. Study geology, sketch canyon layers, collect elevation data, debate development, and write to future visitors.', 'family', 'team_self_select', 'codename_chosen', 'published', true, true, 40.2580, -111.6320, 55, 3, 10, ARRAY['science_nature','geography_maps','history_community'], u_owner)
  ON CONFLICT (id) DO NOTHING;


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 1: Ultimate Challenge Showcase (6 stops)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: multiple_choice + primer {text, items}
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Brigham Square Fountain', 40.2497, -111.6493, ST_SetSRID(ST_MakePoint(-111.6493, 40.2497), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Campus Compass', '{"text":"Brigham Square is the heart of BYU campus. The fountain sits at the intersection of major walkways, making it a natural meeting point. Compass roses and cardinal directions help us orient ourselves in any environment.","items":["North: toward the mountains","South: toward Provo city center","East: toward the Marriott Center","West: toward the HBLL Library"]}', 'geography_maps', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Cardinal Directions at the Fountain', 'geography_maps', 'multiple_choice', '{"question":"Stand at the Brigham Square fountain and face the mountains. Which cardinal direction are you facing?","options":["North","South","East","West"],"correct_answer":"East","hints":["The Wasatch Mountains are east of campus","The sun rises over the mountains in the morning","BYU campus sits in a valley west of the mountains"]}', 3, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_showcase, loc, task, primer, 0, 'Find the place where water leaps into the air at the center of everything. Stand where paths from every direction converge.');

  -- Stop 2: photo_observation + primer {text, image_url}
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Museum of Art Plaza', 40.2480, -111.6538, ST_SetSRID(ST_MakePoint(-111.6538, 40.2480), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Public Art and Meaning', '{"text":"The BYU Museum of Art is one of the largest university art museums in the western United States. Public sculptures outside the building are accessible to everyone, inviting observation and reflection.","image_url":"/seed/moa-exterior.jpg"}', 'history_community', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Sculpture Observation', 'history_community', 'photo_observation', '{"question":"Find one outdoor sculpture near the Museum of Art. Take a photo from the angle you find most interesting. What emotion or idea do you think the artist wanted to convey? Describe in 2-3 sentences.","hints":["Look at the sculpture from different angles","Consider the material — bronze, stone, steel?","Think about why it was placed in this specific location","There is no wrong answer — art is subjective"]}', 3, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_showcase, loc, task, primer, 1, 'Walk west toward the building that holds thousands of years of human creativity. Outside its doors, art stands in the open air for all to see.');

  -- Stop 3: numeric_entry + primer {text, video_url}
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Centennial Carillon (Bell Tower)', 40.2502, -111.6488, ST_SetSRID(ST_MakePoint(-111.6488, 40.2502), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Measuring Tall Structures', '{"text":"Engineers and surveyors measure tall structures using trigonometry, but you can estimate height using shadows or proportions. The BYU Bell Tower (Centennial Carillon) was built in 1975 to celebrate BYU''s 100th anniversary.","video_url":"/seed/shadow-measurement.mp4"}', 'math_real_world', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Bell Tower Height Estimation', 'math_real_world', 'numeric_entry', '{"question":"Estimate the height of the Bell Tower in meters. Method: measure your own shadow and the tower''s shadow. Use the proportion: Tower Height = (Your Height x Tower Shadow) / Your Shadow.","unit":"meters","hints":["Your shadow and the tower''s shadow exist at the same sun angle","Measure shadows from the base of the object","If no shadow is visible, use the stack-yourself method — how many of your heights would fit?","The actual height is between 15 and 25 meters"]}', 3, 10, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_showcase, loc, task, primer, 2, 'Listen! On the hour, music rings out from a tower that celebrated a century. Your shadow and its shadow share a secret — the same angle of sunlight.');

  -- Stop 4: sketch_draw + primer {text} only
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Botany Pond', 40.2485, -111.6512, ST_SetSRID(ST_MakePoint(-111.6512, 40.2485), 4326)::geography, 30, 'water', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Scientific Sketching', '{"text":"Scientific illustration is the art of drawing what you observe in nature. Unlike artistic drawing, scientific sketching prioritizes accuracy over beauty. Label key features, include a scale reference, and draw exactly what you see — not what you think it should look like."}', 'science_nature', false, 'location_specific', 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Scientific Sketch at Botany Pond', 'science_nature', 'sketch_draw', '{"question":"Choose one plant or organism at Botany Pond. Create a scientific sketch with at least 5 labeled parts. Include something for scale (your finger, a coin, a ruler). The goal is accuracy, not artistic beauty.","hints":["Start with the overall shape, then add details","Use thin lines for delicate features, thick for outlines","Label parts with lines pointing to each feature","Include scale reference: leaf is approximately 4 cm long"]}', 3, 10, 2, false, 'location_specific', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_showcase, loc, task, primer, 3, 'Return to the hidden pond near the humanities buildings. An artist-scientist lives inside you — it is time to let them draw.');

  -- Stop 5: creative_writing + primer {text, items}
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Karl G. Maeser Building', 40.2495, -111.6490, ST_SetSRID(ST_MakePoint(-111.6490, 40.2495), 4326)::geography, 35, 'historic', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'The Story of a Building', '{"text":"The Karl G. Maeser Building is the oldest building on BYU campus, completed in 1911. Karl Maeser was BYU''s first principal, hired by Brigham Young himself. Buildings that survive for over a century accumulate layers of human stories.","items":["Built: 1911","Named for: Karl G. Maeser (1828-1901)","Style: Neoclassical Revival","Originally housed: all university functions"]}', 'history_community', false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Time Travel Diary Entry', 'reading_writing', 'creative_writing', '{"question":"You are a student arriving at BYU on the first day it opened in 1875. Write a diary entry (5-8 sentences) describing what you see, hear, and feel. Use details from the building and your surroundings — but imagine them over 100 years ago. What is different? What might be the same?","hints":["No cars, phones, or electric lights in 1875","The mountains would look the same","Imagine the sounds: horses, wind, few voices","What would you be excited or nervous about?"]}', 3, 10, 3, false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_showcase, loc, task, primer, 4, 'Find the oldest building on campus — it bears the name of the man who shaped this university''s character. Stand where thousands of students have stood for over a century.');

  -- Stop 6: data_collection + primer {text, items, image_url, video_url}
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'LaVell Edwards Stadium South Plaza', 40.2572, -111.6545, ST_SetSRID(ST_MakePoint(-111.6545, 40.2572), 4326)::geography, 50, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Data Science in Sports', '{"text":"Sports stadiums generate enormous amounts of data: attendance, ticket sales, crowd flow, weather impact, energy usage, and noise levels. Data scientists use these numbers to improve the experience for fans and optimize operations.","items":["Stadium capacity: ~63,470","First game: 1964","Elevation: ~1,460 meters (4,800 feet)","The Y on the mountain is 380 feet tall"],"image_url":"/seed/lavell-edwards-aerial.jpg","video_url":"/seed/stadium-data-intro.mp4"}', 'math_real_world', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Stadium Area Survey', 'math_real_world', 'data_collection', '{"question":"Conduct a 5-minute traffic and environment survey of the stadium area. Record: (1) number of people passing in 5 min, (2) number of vehicles visible, (3) estimated temperature, (4) wind description, (5) number of visible trash cans, (6) noise level 1-5. Then calculate: if your 5-min pedestrian count held steady for 1 hour, how many people would pass?","hints":["Multiply 5-min count by 12 for hourly estimate","Game days would have dramatically different numbers","Note the current time — it affects traffic","Include yourself in the people count!"]}', 3, 10, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_showcase, loc, task, primer, 5, 'Your final challenge awaits at the home of the Cougars — where tens of thousands gather on game day. Today, you are the data scientist studying this place.');


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 2: Backyard Biologist (5 stops, generic, kids)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Bug Census
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Ground Patch', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'What Is an Ecosystem?', '{"text":"An ecosystem is all the living things (plants, animals, bugs) and non-living things (rocks, water, air) in one area, all working together. Even a tiny patch of ground is an ecosystem with hundreds of creatures you never noticed!","items":["Producers: plants that make food from sunlight","Consumers: animals that eat plants or other animals","Decomposers: tiny creatures that break down dead things","Everything is connected!"]}', 'science_nature', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Bug Census', 'science_nature', 'data_collection', '{"question":"Find a patch of ground about the size of a book. Get low and look closely for 2 minutes. How many different tiny creatures can you count? Record each type: ant, beetle, spider, worm, other.","hints":["Lift a small rock or leaf gently — look underneath","Tiny creatures hide in cracks and under things","Count types, not individual bugs","Put everything back when you are done!"]}', 2, 5, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_backyard, loc, task, primer, 0, 'Look down at the ground beneath your feet. A whole civilization lives there — you just need to get closer.', false);

  -- Stop 2: Leaf Detective
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Tree Area', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Leaf Shapes and Sizes', '{"text":"Leaves come in hundreds of shapes and sizes. Scientists sort them into groups: simple leaves have one blade, compound leaves have many small leaflets. The shape of a leaf tells you how the plant captures sunlight and handles wind and rain."}', 'science_nature', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Leaf Detective', 'science_nature', 'sorting_ordering', '{"question":"Collect 5 different fallen leaves from the ground (do NOT pick living leaves). Sort them from smallest to largest. Now sort them by shape: round, pointy, long-and-thin, or lobed (with bumps).","items":["Round leaves","Pointy or triangular leaves","Long and thin leaves","Lobed leaves (wavy edges)"],"hints":["Only pick up leaves already on the ground","Compare by laying them side by side","Notice the veins — are they parallel or branching?","Sketch your lineup if you can"]}', 2, 5, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_backyard, loc, task, primer, 1, 'Trees are writing you messages — they drop them on the ground every day. Collect five different ones.', false);

  -- Stop 3: Cloud Shapes
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Open Sky View', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Cloud Families', '{"text":"Clouds are sorted into families by their shape and height. Cumulus clouds are puffy like cotton balls. Stratus clouds are flat and cover the sky like a blanket. Cirrus clouds are thin and wispy, very high up. Knowing cloud types helps predict weather!","items":["Cumulus: fair weather, puffy","Stratus: overcast, flat","Cirrus: high altitude, wispy","Cumulonimbus: thunderstorms, very tall"]}', 'science_nature', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Cloud Identification', 'science_nature', 'multiple_choice', '{"question":"Look up at the sky right now. What type of clouds do you see?","options":["Fluffy cotton-ball clouds (cumulus)","A flat gray blanket (stratus)","Thin wispy streaks high up (cirrus)","Big dark towers (cumulonimbus)","No clouds — clear blue sky!"],"correct_answer":"","hints":["Cumulus clouds look like popcorn or cotton balls","Stratus clouds are flat and cover the whole sky","Cirrus clouds are very high and look like hair","No clouds is a perfectly valid answer!"]}', 2, 5, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_backyard, loc, task, primer, 2, 'Now look UP. The sky is a giant canvas and the clouds are today''s painting. What kind of painting is it?', false);

  -- Stop 4: Sound Safari
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Quiet Spot', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'The Science of Sound', '{"text":"Sound is vibrations traveling through the air. Animals use sound to communicate, find food, and avoid danger. Scientists who study sounds in nature are called bioacousticians. When you close your eyes and listen, you become one too!"}', 'science_nature', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Sound Safari', 'science_nature', 'numeric_entry', '{"question":"Close your eyes for 30 seconds and count every different sound you hear. How many different sounds total?","unit":"sounds","hints":["Listen for birds, wind, insects, people, machines","Each DIFFERENT sound counts once","Really focus — you will hear more the longer you listen","Sounds far away count too!"]}', 2, 5, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_backyard, loc, task, primer, 3, 'Freeze! Close your eyes and open your ears. The world around you is a symphony you never noticed before.', false);

  -- Stop 5: Nature's Colors
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Colorful Area', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Why Are Things Colorful?', '{"text":"Colors in nature serve a purpose. Bright flowers attract pollinators. Green leaves capture sunlight. Warning colors (red, yellow, black) tell predators to stay away. Camouflage colors help animals hide. Every color you see is a survival strategy!"}', 'science_nature', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Nature Color Hunt', 'science_nature', 'photo_observation', '{"question":"Find 5 different NATURAL colors around you (not from buildings or cars). Take a photo showing all 5. Name each color and what natural thing it belongs to.","hints":["Look for greens in leaves, browns in bark, blues in sky","Flowers often have unexpected colors","Rocks and soil come in many colors","Insect wings can be surprisingly colorful"]}', 2, 5, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_backyard, loc, task, primer, 4, 'Artists buy paint in stores, but nature paints for free. Find five of nature''s best colors and capture them.', false);


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 3: Math Around Town (5 stops, generic, kids)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Shape Scavenger
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Built Environment', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Shapes Are Everywhere', '{"text":"Geometry is the math of shapes. Architects, engineers, and artists all use shapes to build the world around you. A circle is strong (wheels, pipes). A triangle is stable (roofs, bridges). A rectangle is efficient (windows, doors). Every shape was chosen for a reason!"}', 'math_real_world', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Shape Scavenger Hunt', 'math_real_world', 'data_collection', '{"question":"Find one example each of: a circle, a triangle, a rectangle, and a square in the world around you. Record where you found each one. BONUS: find a hexagon or an oval!","hints":["Circles: wheels, signs, clocks, manholes","Triangles: rooftops, signs, support braces","Rectangles: windows, doors, bricks","Squares: tiles, some signs, paving stones"]}', 2, 6, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_math_town, loc, task, primer, 0, 'Math is hiding in plain sight everywhere you look. Shapes are the building blocks of everything humans have built.', false);

  -- Stop 2: Step Counter
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Walkable Path', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Your Body Is a Ruler', '{"text":"Before rulers and measuring tapes existed, people measured with their bodies. A foot was literally the length of a foot. A yard was the distance from nose to fingertip. Your stride (one big step) is a reliable unit you always have with you!","items":["Kid step: about 0.5 meters","Adult step: about 0.75 meters","1 meter = about 3.3 feet","1 kilometer = about 1,300 kid steps"]}', 'math_real_world', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Step Counter Measurement', 'math_real_world', 'numeric_entry', '{"question":"Walk in a straight line from one landmark to another (about 20-30 big steps). Count your steps carefully. Now measure ONE step with your feet or hands. Multiply: steps x step length = total distance. How far did you walk in meters?","unit":"meters","hints":["One big kid step is about 0.5-0.6 meters","One adult step is about 0.7-0.8 meters","Count carefully — no skipping numbers!","Multiply: 25 steps x 0.6 m = 15 meters"]}', 2, 6, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_math_town, loc, task, primer, 1, 'Your legs are a measuring tool! Every step you take is a unit of measurement waiting to be used.', false);

  -- Stop 3: Pattern Finder
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Patterned Surface', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Patterns in Math', '{"text":"A pattern is anything that repeats in a predictable way. Math loves patterns because once you find the rule, you can predict what comes next. Patterns appear in nature (sunflower seeds, honeycombs) and in human design (tiles, bricks, fabrics)."}', 'math_real_world', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Pattern Finder', 'math_real_world', 'photo_observation', '{"question":"Find a repeating pattern in your surroundings (bricks, tiles, fence posts, tree branches). Take a photo. Describe the pattern: what is the basic unit that repeats? How many times does it repeat in your photo?","hints":["Bricks alternate in rows","Fence posts repeat at equal intervals","Windows on buildings create grid patterns","Even nature has patterns — leaf arrangements, bark texture"]}', 2, 6, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_math_town, loc, task, primer, 2, 'Patterns are math''s way of being beautiful. Look at walls, floors, fences, and nature — something is repeating.', false);

  -- Stop 4: Estimation Station
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Area with Many Objects', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'The Power of Estimation', '{"text":"Estimation means making a smart guess. Scientists, engineers, and chefs all estimate before they measure exactly. The trick: count a small group, then multiply to estimate the total. This is called sampling — and it is how scientists count everything from stars to fish!"}', 'math_real_world', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Estimation Station', 'math_real_world', 'numeric_entry', '{"question":"Find a group of many similar objects (leaves on a branch, bricks in a wall section, blades of grass in your hand). Estimate the total count WITHOUT counting every single one. Method: count a small section, then multiply. How many total?","unit":"objects","hints":["Count 10, see what fraction of the total that is","For a wall: count bricks in one row, count rows, multiply","For grass: count a pinch, estimate how many pinches in a handful","Your estimate does not need to be perfect — just reasonable"]}', 2, 6, 2, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_math_town, loc, task, primer, 3, 'Too many to count? A smart mathematician never counts everything — they count a piece and multiply.', false);

  -- Stop 5: Symmetry Spotter
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Symmetrical Object Area', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'What Is Symmetry?', '{"text":"Symmetry means one half is a mirror image of the other. A butterfly has symmetry. Your face has (almost) symmetry. Buildings are often designed with symmetry because it looks balanced and pleasing. Symmetry is one of the most important ideas in math, art, and nature."}', 'math_real_world', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Symmetry Spotter', 'math_real_world', 'sketch_draw', '{"question":"Find something that has symmetry (one half mirrors the other). Sketch it and draw the line of symmetry. Does it have 1 line of symmetry, 2, or more? Can you find something with NO symmetry?","hints":["Building fronts often have vertical symmetry","Leaves often have one line of symmetry","A circle has infinite lines of symmetry","Trees are roughly symmetrical but not exactly"]}', 2, 6, 2, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_math_town, loc, task, primer, 4, 'The world loves balance. Find something where the left side is a mirror of the right (or the top mirrors the bottom).', false);


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 4: Trail Tracker (5 stops, type_dependent: trail, family)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Trail Map Maker
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Trail Starting Point', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'trail', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'The Art of Mapmaking', '{"text":"Maps are one of humanity''s oldest tools. Before GPS, explorers drew maps by walking the land and recording what they saw. A good trail map includes: the path, landmarks, distances, and a compass arrow. Today you become the cartographer.","items":["Bird''s-eye view: draw as if looking down from above","Include a North arrow","Mark landmarks that would help others navigate","Estimate distances in steps or meters"]}', 'geography_maps', true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Trail Map Maker', 'geography_maps', 'sketch_draw', '{"question":"Sketch a map of the first 200 meters of this trail. Include: the trail path, any forks or intersections, landmarks (big rocks, trees, signs), and a compass arrow showing North. Add a scale estimate.","hints":["Use a bird''s-eye view (looking down from above)","North is usually toward the mountains in Utah","Include distances: 50 steps to the first tree","Mark anything that would help someone else follow the map"]}', 3, 8, 2, true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_trail, loc, task, primer, 0, 'Every great adventure begins with a map. Before you explore, become the cartographer. Draw what you see from above.', false);

  -- Stop 2: Erosion Investigator
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Trail Erosion Point', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'trail', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Erosion: Earth in Motion', '{"text":"Erosion is the wearing away of earth by water, wind, ice, or gravity. Trails are especially vulnerable because foot traffic removes vegetation that normally holds soil in place. Trail builders use switchbacks, water bars, and rock steps to fight erosion."}', 'science_nature', true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Erosion Investigator', 'science_nature', 'photo_observation', '{"question":"Find a spot on the trail where erosion is visible (exposed roots, washed-out ruts, loose gravel, water channels). Take a photo. Explain: what type of erosion caused this (water, wind, foot traffic)? How could it be repaired?","hints":["Water erosion: channels, undercut edges, smooth exposed rock","Foot traffic erosion: widened trail, shortcut paths","Root exposure means soil has washed away","Switchbacks and water bars prevent trail erosion"]}', 3, 8, 2, true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_trail, loc, task, primer, 1, 'The trail is under attack! Water, wind, and human feet are slowly wearing it away. Find the battlefield.', false);

  -- Stop 3: Elevation Challenge
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Trail Incline Section', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'trail', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Understanding Elevation', '{"text":"Elevation is your height above sea level. As you hike uphill, you gain elevation and the air gets slightly thinner. Your body works harder because gravity is pulling you back down. Measuring elevation change helps you understand how hard a hike really is."}', 'science_nature', true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Elevation Estimation', 'science_nature', 'numeric_entry', '{"question":"Walk 100 steps along the trail. Did you go uphill, downhill, or stay level? Estimate the elevation change in meters. Method: for every 10 steps of noticeable incline, you gain roughly 2-3 meters of elevation.","unit":"meters","hints":["Flat trail: 0 meters change","Gentle slope: 1-2 meters per 100 steps","Moderate slope: 3-5 meters per 100 steps","If you use a phone altimeter, compare to your estimate"]}', 3, 8, 2, true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_trail, loc, task, primer, 2, 'Feel the burn in your legs? That is gravity telling you about elevation. Count 100 steps and measure the mountain''s rise.', false);

  -- Stop 4: Wildlife Sign Tracker
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Trail Wildlife Area', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'trail', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Reading Animal Signs', '{"text":"Animals are experts at staying hidden, but they always leave evidence behind. Tracks, scat (droppings), nests, webs, burrows, chew marks, feathers, and fur are all signs that animals use this area. Wildlife biologists use these signs to study animals without disturbing them.","items":["Tracks: look in soft dirt or mud","Scat: tells you what the animal ate","Nests: birds, rodents, and insects all build homes","Chew marks: deer strip bark, rodents gnaw wood"]}', 'science_nature', true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Wildlife Sign Tracker', 'science_nature', 'data_collection', '{"question":"Without seeing actual animals, find 3 signs that animals use this trail area. Record: (1) what you found, (2) what animal you think left it, (3) how recent it seems. Signs include: tracks, scat, nests, webs, burrows, chew marks, feathers, fur.","hints":["Look at soft dirt or mud for tracks","Spider webs across the trail mean few recent hikers","Bird nests may be in nearby branches","Bark stripped from trees could be deer, elk, or porcupine"]}', 3, 8, 2, true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_trail, loc, task, primer, 3, 'Animals were here before you — they left evidence behind. Become a detective and find three clues.', false);

  -- Stop 5: Trail Reflection
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Trail Rest Spot', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'trail', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Trails Connect Us', '{"text":"Trails are more than paths through nature. They connect communities, provide exercise, support mental health, and give us access to wild places. But trails also impact the environment — they fragment habitats and introduce erosion. The best trails balance human access with ecological protection."}', 'science_nature', true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Trail Reflection Writing', 'reading_writing', 'creative_writing', '{"question":"Find a comfortable spot. Sit for 2 minutes observing the trail and surroundings. Write a haiku (5-7-5 syllables) about this trail, then write 3 sentences explaining why trails are important for people AND for nature.","hints":["Haiku: Line 1 = 5 syllables, Line 2 = 7, Line 3 = 5","Trails connect people to nature","Trails can also fragment habitat for animals","Think about who else has walked this path before you"]}', 3, 8, 2, true, 'type_dependent', 'trail', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_trail, loc, task, primer, 4, 'Rest your feet and wake your mind. The end of this trail is also a beginning — write what this place means to you.', false);


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 5: Urban Explorer (5 stops, type_dependent: urban, teens)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Street Grid Analysis
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Street Corner', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'urban', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'City Planning 101', '{"text":"Cities are designed, not random. Urban planners decide where streets go, how wide they are, and what gets built where. Grid layouts (like Salt Lake City) are efficient for navigation. Radial layouts (like Paris) create dramatic views. Organic layouts (like Boston) evolved from old footpaths.","items":["Grid: easy to navigate, efficient land use","Radial: dramatic center, scenic boulevards","Organic: winding streets, historic character","Most cities mix all three patterns"]}', 'geography_maps', true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Street Grid Analysis', 'geography_maps', 'sketch_draw', '{"question":"Sketch a map of the block you are on. Show: streets, sidewalks, crosswalks, buildings (just outlines), and any public spaces. Is the layout a grid, radial, or organic (curved/irregular)? Label the street names if visible.","hints":["Grid: streets cross at right angles","Radial: streets fan out from a center point","Organic: curved streets, no pattern — often older cities","Note one-way streets, dead ends, or pedestrian-only zones"]}', 6, 10, 2, true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_urban, loc, task, primer, 0, 'Cities are puzzles designed on purpose. Stand at any corner and the pattern reveals itself. Draw what the planners drew.', false);

  -- Stop 2: Building Age Detective
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Mixed-Age Block', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'urban', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Reading Building Ages', '{"text":"Buildings tell their age through materials, style, and details. Older buildings use more stone and ornate decoration. Mid-century buildings tend to be boxy and concrete. Modern buildings feature glass, steel, and energy-efficient design. Learning to read these clues is like being an architectural archaeologist."}', 'history_community', true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Building Age Detective', 'history_community', 'sorting_ordering', '{"question":"Find 4 different buildings visible from where you stand. Estimate each building''s age and sort them oldest to newest. Record your evidence for each estimate.","items":["Pre-1940: ornate details, stone/brick, tall narrow windows","1940-1970: simple/boxy, concrete, minimal decoration","1970-2000: mixed materials, some glass, functional","2000+: lots of glass, steel, modern design, energy-efficient features"],"hints":["Look for cornerstone dates on old buildings","Newer buildings have larger windows — glass technology improved","Brick style changes over decades","Renovation can make old buildings look newer"]}', 6, 10, 3, true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_urban, loc, task, primer, 1, 'Buildings age, just like people. But unlike people, their wrinkles tell you exactly when they were born. Find four and sort them by age.', false);

  -- Stop 3: Accessibility Audit
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Sidewalk Block', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'urban', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Universal Design', '{"text":"Universal design means creating spaces that work for EVERYONE — people in wheelchairs, parents with strollers, people with vision or hearing differences, elderly residents. The ADA (Americans with Disabilities Act) requires public spaces to be accessible, but many places still fall short.","items":["Curb ramps: sloped transitions from sidewalk to street","Tactile paving: bumpy tiles that guide visually impaired people","Audio signals: beeping crosswalk signals","Wide doorways: minimum 32 inches for wheelchair access"]}', 'critical_thinking', true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Accessibility Audit', 'critical_thinking', 'data_collection', '{"question":"Rate this block for accessibility. Check: (1) sidewalk condition 1-5, (2) curb ramps present? Y/N, (3) crosswalk signals with audio? Y/N, (4) wheelchair-accessible building entrances? count, (5) tactile paving present? Y/N. Overall rating 1-10. What is the biggest improvement needed?","hints":["A good sidewalk is smooth, wide, and unobstructed","Curb ramps are sloped transitions from sidewalk to street","Audio signals beep for visually impaired pedestrians","Accessible entrances have ramps or are at ground level"]}', 6, 10, 3, true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_urban, loc, task, primer, 2, 'Not everyone experiences a city the same way. Close your eyes, imagine you are in a wheelchair, or picture navigating without sight. How well does this place serve everyone?', false);

  -- Stop 4: Business Ecosystem
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Commercial Block', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'urban', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Economic Geography', '{"text":"Every business chooses its location carefully. Restaurants cluster near foot traffic. Banks need visibility and parking. Specialty stores follow their customers. The mix of businesses on a block tells you who lives nearby, how much money they spend, and what the neighborhood values."}', 'critical_thinking', true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Business Ecosystem Analysis', 'critical_thinking', 'short_text', '{"question":"List every business or institution you can see from this spot. Classify each as: Essential (food, health, banking), Service (repair, beauty, fitness), Retail (clothing, electronics), Food/Drink (restaurants, cafes), or Other. What does the mix tell you about this neighborhood?","correct_answer":null,"hints":["The types of businesses reflect who lives nearby","Lots of restaurants = destination area or young population","Essential services = residential neighborhood","Vacancies tell a story too — what left and why?"]}', 6, 10, 3, true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_urban, loc, task, primer, 3, 'Every business on this block chose to be HERE and not somewhere else. What drew them? What does the mix tell you about the people who live nearby?', false);

  -- Stop 5: Urban Design Debate
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Street with Traffic', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'urban', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Cars vs People', '{"text":"For 100 years, cities were designed around cars. Wide roads, parking lots, drive-throughs. Now many cities are reclaiming streets for people: bike lanes, wider sidewalks, outdoor dining, pedestrian plazas. This shift creates heated debate between convenience and livability.","items":["Pro-car: convenience, accessibility for disabled, commercial delivery","Pro-pedestrian: safety, health, environment, community","Many cities are experimenting with car-free zones","There is no one right answer — it depends on context"]}', 'critical_thinking', true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Urban Design Debate', 'critical_thinking', 'team_debate', '{"question":"Your team must debate: Should this block have MORE or FEWER cars? Person 1 argues for more car access (parking, drive-throughs, wider roads). Person 2 argues for less (pedestrian zones, bike lanes, outdoor dining). Person 3 is the judge. Each side gets 2 minutes. The judge decides based on evidence from what you see around you.","hints":["Consider: safety, noise, pollution, convenience, accessibility","What do local businesses need — foot traffic or parking?","European cities are removing cars from centers","Some people depend on cars due to disability or distance"]}', 6, 10, 3, true, 'type_dependent', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_urban, loc, task, primer, 4, 'Cars or people — who should this street belong to? Your team must take sides and argue with evidence you can see right here.', false);


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 6: Waterway Investigators (4 stops, type_dependent: water, teens)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Flow Dynamics
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Flowing Water', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'water', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Water Flow Science', '{"text":"Water always flows downhill, but its speed varies with slope, channel width, roughness, and volume. Scientists measure flow in cubic meters per second. Faster flow means more erosion power. Slower flow means more sediment deposition. Understanding flow helps predict floods and manage water resources."}', 'science_nature', true, 'type_dependent', 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Flow Speed Measurement', 'science_nature', 'numeric_entry', '{"question":"Measure the water flow speed. Drop a floating object (leaf or twig) and time it over a 5-meter stretch. Calculate speed (distance / time). Do it 3 times and calculate the average. Why might your three measurements differ?","unit":"m/s average","hints":["Mark start and end points clearly","Use a lightweight natural object (leaf, twig)","Average = sum of all three / 3","Variation comes from turbulence, wind, and eddies"]}', 5, 10, 2, true, 'type_dependent', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_waterway, loc, task, primer, 0, 'Moving water is never truly constant. Measure it three times to learn why scientists always repeat experiments.', false);

  -- Stop 2: Water Quality Report Card
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Water Body Edge', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'water', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Water Quality Indicators', '{"text":"You do not need a chemistry lab to assess water quality. Visual and sensory observations tell scientists a lot. Clear water with many species is healthy. Green, smelly water with few species is stressed. The banks, color, clarity, and biodiversity are all diagnostic clues.","items":["Clarity: can you see the bottom?","Color: clear is healthy, green means algae","Odor: healthy water has little smell","Biodiversity: more species = healthier ecosystem"]}', 'science_nature', true, 'type_dependent', 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Water Quality Report Card', 'science_nature', 'data_collection', '{"question":"Give this water body a quality report card. Rate each 1-5: (1) Clarity — can you see the bottom?, (2) Color — is it clear, green, brown?, (3) Odor — any smell?, (4) Bank condition — is the shore eroded, healthy, or concrete?, (5) Biodiversity — how many different species can you spot in 3 minutes? Calculate the total score out of 25.","hints":["Clear water scores 5 for clarity","Green water suggests algae — lower score","No odor is healthy — sulfur smell is bad","More species = healthier ecosystem"]}', 5, 10, 3, true, 'type_dependent', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_waterway, loc, task, primer, 1, 'Every body of water has a health score. You are the doctor — run the tests and write the diagnosis.', false);

  -- Stop 3: Macro-invertebrate Search
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Rocky Water Edge', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'water', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Indicator Species', '{"text":"Some creatures can only survive in clean water. Scientists call these indicator species. Mayfly and stonefly larvae need clean, oxygen-rich water. Worms and midge larvae tolerate pollution. By finding out who lives in the water, you can judge its health without any chemistry equipment."}', 'science_nature', true, 'type_dependent', 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Macro-invertebrate Search', 'science_nature', 'photo_observation', '{"question":"Gently turn over 3 rocks at the water''s edge and look for aquatic macro-invertebrates (insects you can see without a microscope). Take a photo of what you find. Mayfly and stonefly larvae indicate clean water. Worms and midge larvae tolerate pollution. What did you find?","hints":["Put rocks back exactly where you found them","Mayfly larvae: 3 tails, flattened body","Stonefly larvae: 2 tails, visible antennae","Worms and leeches: no legs, soft body"]}', 5, 10, 3, true, 'type_dependent', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_waterway, loc, task, primer, 2, 'The tiniest creatures tell the biggest truth about water quality. Look under the rocks — the evidence is hiding.', false);

  -- Stop 4: Watershed Mapping
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Waterway Cross-Section View', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'water', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Cross-Section Diagrams', '{"text":"A cross-section is a side-view slice through a landscape. Scientists use cross-sections to show what you cannot see from above: the shape of a riverbed, the layers of soil, and how vegetation changes from water to dry land. It is like cutting a piece of cake and looking at the layers."}', 'geography_maps', true, 'type_dependent', 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Waterway Cross-Section', 'geography_maps', 'sketch_draw', '{"question":"Sketch a cross-section diagram of the waterway from bank to bank. Show: water level, bank angles (steep or gentle), vegetation zones (water plants, bank plants, upland plants), and any structures (bridges, pipes, walls). Label everything.","hints":["Cross-section = a slice view, as if you cut the landscape in half","Show the water as a blue area in the center","Banks may be different on each side","Include approximate measurements"]}', 5, 10, 3, true, 'type_dependent', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_waterway, loc, task, primer, 3, 'Imagine you could slice this waterway like a piece of cake and look at the layers. That cross-section reveals more than the surface.', false);


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 7: BYU Art & Architecture Walk (6 stops, location-specific, family)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Museum of Art Design
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Museum of Art Entrance', 40.2478, -111.6540, ST_SetSRID(ST_MakePoint(-111.6540, 40.2478), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Form Follows Function', '{"text":"Architects design buildings to match their purpose. A museum needs large open spaces for art, controlled lighting, and a welcoming entrance. The exterior signals what is inside. Compare a museum to a library or a gymnasium — each looks different because each serves a different function."}', 'history_community', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Museum Design Analysis', 'history_community', 'short_text', '{"question":"Examine the Museum of Art building from the outside. What design features tell you this is a museum rather than a classroom building or gym? Describe at least 3 specific architectural choices the designer made and why.","correct_answer":null,"hints":["Look at the entrance — how does it welcome visitors?","Consider the windows — how much natural light enters?","Notice the scale — is it human-sized or monumental?","Compare it mentally to a building with a different purpose"]}', 3, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_art_arch, loc, task, primer, 0, 'Begin at the building designed to hold beauty. Its very walls were shaped to serve art — what clues can you read from the outside?');

  -- Stop 2: Cougar Statue
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Bronze Cougar Statue', 40.2505, -111.6490, ST_SetSRID(ST_MakePoint(-111.6490, 40.2505), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Public Sculpture Engineering', '{"text":"A life-size bronze animal sculpture weighs hundreds of kilograms. It must withstand wind, rain, snow, and curious students for decades. The sculptor works with engineers to design an internal armature (skeleton), a secure base, and weather-resistant patina. Art and engineering are inseparable."}', 'history_community', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Cougar Statue Photography', 'history_community', 'photo_observation', '{"question":"Take a photo of the Cougar statue from the most dramatic angle you can find. Then answer: What engineering holds this heavy bronze in place? Look at the base, the pose, and how weight is distributed.","hints":["Get low for a powerful upward angle","Notice where the statue''s weight rests — which legs bear the load?","The base distributes hundreds of kilograms into the ground","Look for bolts or mounting hardware hidden in the design"]}', 3, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_art_arch, loc, task, primer, 1, 'Seek the fierce guardian of campus, frozen forever in bronze mid-stride. Get close — what holds this heavy beast in place?');

  -- Stop 3: HBLL Library
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Harold B. Lee Library South Face', 40.2487, -111.6495, ST_SetSRID(ST_MakePoint(-111.6495, 40.2487), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Counting and Estimation in Architecture', '{"text":"Architects use repeated elements (windows, columns, panels) to create rhythm and visual order. Counting these elements and multiplying is the same sampling technique scientists use to estimate populations. One row times the number of rows equals the total."}', 'math_real_world', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Window Count Estimation', 'math_real_world', 'numeric_entry', '{"question":"Estimate how many individual windows are on the south face of the HBLL Library. Count one section carefully, then multiply by the number of sections. Show your method.","unit":"windows","hints":["Count windows in one column first","Then count how many columns across","Multiply: windows per column x number of columns","Some sections may have different patterns — adjust"]}', 3, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_art_arch, loc, task, primer, 2, 'Face the south side of the largest library on campus. Those repeating windows are a math problem waiting to be solved.');

  -- Stop 4: Maeser Building Postcard
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Maeser Building Front Steps', 40.2496, -111.6491, ST_SetSRID(ST_MakePoint(-111.6491, 40.2496), 4326)::geography, 30, 'historic', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Campus in the 1920s', '{"text":"In the 1920s, BYU had about 2,500 students (today: 30,000+). The campus was a few buildings surrounded by farms. Students walked or rode horses. There were no computers, no phones, and classes were lit by early electric bulbs. The Maeser Building was the center of everything.","items":["1920 enrollment: ~2,500","No cars on campus","Library was inside Maeser Building","Tuition: about $25 per semester"]}', 'history_community', false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, '1920s Postcard Home', 'reading_writing', 'creative_writing', '{"question":"Write a postcard home as if you are a student in 1920, describing this building and campus life. Include what you see (adapt the real building to 1920s context), what classes are like, and one thing you miss about home. Keep it to 5-7 sentences.","hints":["No smartphones, WiFi, or modern technology","The mountains and sky would look the same","Imagine the sounds: no car traffic, maybe a bell","Tuition was about $25 — what would that mean to your family?"]}', 3, 10, 3, false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_art_arch, loc, task, primer, 3, 'Stand on the steps of the oldest building. Close your eyes and rewind 100 years. What would you write home about?');

  -- Stop 5: Hinckley Alumni Center
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Gordon B. Hinckley Alumni Center', 40.2475, -111.6530, ST_SetSRID(ST_MakePoint(-111.6530, 40.2475), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Architectural Styles', '{"text":"Architecture has distinct styles, like fashion for buildings. Georgian: symmetrical, brick, many windows. Neoclassical: columns, pediments, grand entrances. Brutalist: raw concrete, massive, fortress-like. Modern: glass, steel, clean lines. Each style reflects the era''s values and technology.","items":["Georgian: symmetry and proportion","Neoclassical: Greek/Roman inspired columns","Brutalist: exposed concrete, bold geometry","Modern: glass curtain walls, minimal ornament"]}', 'history_community', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Architectural Style ID', 'history_community', 'multiple_choice', '{"question":"Look at the Hinckley Alumni Center. Which architectural style best describes it?","options":["Georgian (symmetrical, brick, many windows)","Modern (glass, steel, clean lines)","Neoclassical (columns, grand pediment)","Brutalist (raw concrete, fortress-like)"],"correct_answer":"Modern","hints":["Look at the primary materials — concrete? glass? brick?","Count the decorative elements — many or minimal?","Is the building symmetrical or asymmetrical?","Think about when it was likely built"]}', 3, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_art_arch, loc, task, primer, 4, 'Find the building where alumni gather. Its style tells you about the era it was built — can you name the architectural language it speaks?');

  -- Stop 6: Engineering Building Geometry
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Clyde Engineering Building', 40.2492, -111.6470, ST_SetSRID(ST_MakePoint(-111.6470, 40.2492), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Geometry in Construction', '{"text":"Every building is a collection of geometric shapes. Engineers choose shapes for their structural properties: triangles are incredibly strong (that is why bridges use them), arches distribute weight, and rectangles are efficient for rooms and windows. Can you find all the shapes hiding in a building?"}', 'math_real_world', false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Building Face Geometry', 'math_real_world', 'sketch_draw', '{"question":"Sketch the front face of the Engineering Building and identify every geometric shape you can find: rectangles, squares, triangles, circles, arches, trapezoids. Label each shape. How many different types did you find?","hints":["Windows are usually rectangles","Doorways may have arches at the top","Look at the roofline — triangular?","Support structures often use triangles for strength"]}', 3, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_art_arch, loc, task, primer, 5, 'Engineers build with shapes. Find the building where future engineers learn and decode every geometric form hiding in its facade.');


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 8: Provo Downtown Discovery (5 stops, location-specific, teens)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Provo City Library
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo City Library', 40.2327, -111.6577, ST_SetSRID(ST_MakePoint(-111.6577, 40.2327), 4326)::geography, 40, 'urban', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Libraries as Community Hubs', '{"text":"Modern libraries are far more than book warehouses. They are community centers offering computer access, meeting rooms, children''s programs, job training, maker spaces, and social services. In many neighborhoods, the library is the most important public building.","items":["Free internet access for everyone","Children''s story time and homework help","Community meeting rooms","Career services and job search help"]}', 'history_community', false, 'location_specific', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Library Services Discovery', 'history_community', 'short_text', '{"question":"What public services does the Provo City Library offer besides lending books? Read the signs, check the entrance area, and list at least 5 different services or programs you can identify.","correct_answer":null,"hints":["Look for bulletin boards and posters","Check for computer labs or tech access","Are there meeting rooms or event spaces?","Look for children''s, teen, and adult program signs"]}', 6, 10, 2, false, 'location_specific', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_downtown, loc, task, primer, 0, 'Start at the building that gives away knowledge for free. But books are just the beginning — discover what else hides inside.');

  -- Stop 2: Center Street Historic Block
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Center Street Historic Block', 40.2340, -111.6585, ST_SetSRID(ST_MakePoint(-111.6585, 40.2340), 4326)::geography, 50, 'historic', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Dating Buildings by Style', '{"text":"Every decade leaves architectural fingerprints. Pre-1900 buildings feature ornate stonework and tall narrow windows. Mid-century buildings are boxy and functional. Modern buildings use glass and steel. Downtown Provo has buildings spanning 150 years — a timeline you can read from the sidewalk."}', 'history_community', false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Building Age Sorting', 'history_community', 'sorting_ordering', '{"question":"Find 4 buildings on this block and sort them oldest to newest. Record your evidence for each age estimate: materials, style, window types, signage.","items":["Pre-1900: ornate stone, tall narrow windows","1900-1950: brick, simple ornament, awnings","1950-1990: concrete, minimal decoration, flat roof","1990+: mixed modern materials, large glass, steel"],"hints":["Look for cornerstone dates carved into old buildings","Newer buildings have larger windows — glass technology improved","Brick patterns change over decades","Renovation can make old buildings look newer — look at the bones"]}', 6, 10, 3, false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_downtown, loc, task, primer, 1, 'Walk Center Street and read the buildings like a timeline. Stone, brick, concrete, glass — each material marks a different era.');

  -- Stop 3: Provo Tabernacle / Temple site
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo City Center Temple (former Tabernacle)', 40.2355, -111.6590, ST_SetSRID(ST_MakePoint(-111.6590, 40.2355), 4326)::geography, 45, 'historic', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Loss and Renewal', '{"text":"The Provo Tabernacle was built in 1898 and served the community for over a century. In December 2010, a fire destroyed most of the interior. Rather than demolish it, the remaining walls were preserved and a new temple was built inside the historic shell. This is a powerful example of adaptive reuse — giving old structures new life."}', 'history_community', false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Two Perspectives on Change', 'reading_writing', 'creative_writing', '{"question":"The original Provo Tabernacle burned in 2010 and was rebuilt as a temple. Write 4 sentences from two perspectives: Person A mourns the loss of the historic building they loved. Person B celebrates the beautiful new structure that rose from the ashes. 2 sentences each.","hints":["Person A: focus on memories, history, community gatherings","Person B: focus on beauty, renewal, honoring the past","Both perspectives are valid and real","Think about what was preserved vs what was lost"]}', 6, 10, 3, false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_downtown, loc, task, primer, 2, 'Find the building that died in fire and was reborn. Two stories live here — the one that burned and the one that rose. Give voice to both.');

  -- Stop 4: Downtown Commercial Area
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Center Street Commercial Zone', 40.2345, -111.6570, ST_SetSRID(ST_MakePoint(-111.6570, 40.2345), 4326)::geography, 50, 'urban', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Pedestrian Activity Analysis', '{"text":"Urban planners measure foot traffic to understand how a neighborhood functions. High pedestrian counts mean the area is vibrant and economically healthy. Low counts may signal problems: unsafe crossings, boring storefronts, or poor transit access. Every person walking by is a data point."}', 'critical_thinking', false, 'location_specific', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Pedestrian Activity Count', 'critical_thinking', 'data_collection', '{"question":"Conduct a 5-minute pedestrian count. Record: (1) total people passing, (2) direction of travel (toward/away from Center St), (3) alone or in groups, (4) estimated age range (kid/teen/adult/senior). What does foot traffic tell you about this area''s vitality?","hints":["Stand in one spot with a clear view","Tally marks are faster than writing numbers","Note the time — lunch hour is different from 3pm","Compare both sides of the street"]}', 6, 10, 3, false, 'location_specific', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_downtown, loc, task, primer, 3, 'Find a busy corner and become invisible. Count the humans flowing past — each one is a data point telling the story of this neighborhood.');

  -- Stop 5: Center Street View (Audio Tour)
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Center Street Mountain Viewpoint', 40.2340, -111.6560, ST_SetSRID(ST_MakePoint(-111.6560, 40.2340), 4326)::geography, 40, 'urban', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'The Art of the Audio Tour', '{"text":"Audio tours bring places alive for visitors. The best audio narrations describe what the listener can see, add historical context they cannot see, and create a sense of place through vivid language. You are about to become a tour guide — speak as if your listener is standing right where you are.","items":["Describe what is visible: buildings, mountains, streets","Add context: why was Provo settled here?","Use present tense: This street leads toward...","Keep it under 60 seconds — concise is better"]}', 'geography_maps', false, 'location_specific', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Walking Tour Audio Narration', 'geography_maps', 'audio_response', '{"question":"Record a 60-second audio tour narration for a visitor: describe the view from Center Street looking east toward the mountains. Name at least 2 landmarks you can see, explain why Provo was settled in this valley, and tell the listener one thing they should not miss.","hints":["Start with: Welcome to Center Street in downtown Provo...","Name specific mountains or peaks if you can identify them","Provo was settled in 1849 because of fresh water, fertile soil, and mountain shelter","End with a recommendation: Before you leave, make sure to see..."]}', 6, 10, 3, false, 'location_specific', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_downtown, loc, task, primer, 4, 'Your final stop is where the street meets the sky. Face east toward the mountains and become the voice of this place — record your audio tour.');


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 9: Young Scientist Field Lab (4 stops, generic, kids)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Shadow Scientists
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Sunny Spot', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Shadows and Light', '{"text":"A shadow happens when something blocks light. The sun is a giant light source in the sky. When you stand outside, your body blocks some sunlight and creates a dark shape on the ground — your shadow! Shadows change during the day because the sun moves across the sky.","items":["Morning: long shadows pointing west","Noon: short shadows right under you","Afternoon: long shadows pointing east","Your shadow is always opposite the sun"]}', 'science_nature', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Shadow Scientist', 'science_nature', 'sketch_draw', '{"question":"Find your shadow. Stand still and look at it. Now point to where the sun is. Draw a picture showing YOU, your SHADOW, and the SUN with an arrow. Which direction does your shadow point — toward the sun or away from it?","hints":["Your shadow always points AWAY from the sun","In the morning, shadows point west","In the afternoon, shadows point east","At noon, your shadow is very short"]}', 1, 4, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_young_sci, loc, task, primer, 0, 'There is someone following you everywhere — but they are flat and dark and silent. Find them and figure out where they come from!', false);

  -- Stop 2: Texture Touch Test
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Textured Area', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Using Your Senses', '{"text":"Scientists use all five senses to observe the world: sight, hearing, touch, smell, and taste (but we only taste safe things!). Today we focus on TOUCH. Your fingertips have thousands of tiny sensors that tell your brain about texture, temperature, and shape. Using touch makes you a better observer."}', 'science_nature', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Texture Touch Test', 'science_nature', 'data_collection', '{"question":"Find 5 different textures you can safely touch. For each, record: (1) what it is, (2) one word to describe how it feels (rough, smooth, bumpy, soft, hard, squishy, fuzzy). Which is the roughest? Which is the smoothest?","hints":["Tree bark: usually rough","A leaf: smooth on top, bumpy underneath?","A rock: could be smooth OR rough","A flower petal: very soft and smooth"]}', 1, 4, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_young_sci, loc, task, primer, 1, 'Close your eyes and let your fingers be your eyes. The world feels different from how it looks!', false);

  -- Stop 3: Counting Nature
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Area with Natural Objects', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Scientists Count Everything', '{"text":"How many? That is one of the most important questions in science. How many stars? How many fish in the ocean? How many ants in a colony? Counting helps us understand the world. Even counting simple things like rocks or flowers teaches us to observe carefully and record accurately."}', 'math_real_world', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Nature Counter', 'math_real_world', 'numeric_entry', '{"question":"Pick one type of thing you can see a lot of (dandelions, ants, rocks, clouds). Count ALL of them you can see right now. Write the number. Is it more than 10? More than 50? More than 100?","unit":"count","hints":["Pick something you can see many of","Count carefully — point to each one","If there are too many, count groups of 10","It is OK to estimate for really big numbers"]}', 1, 4, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_young_sci, loc, task, primer, 2, 'How many? That is the most important question a scientist asks. Pick one thing and count every single one.', false);

  -- Stop 4: Weather Reporter
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, is_library, created_by) VALUES
    (loc, 'Any Open Area', 0, 0, ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography, 50, 'any', true, u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Be a Weather Reporter!', '{"text":"Weather reporters observe the sky, feel the air, and use instruments to measure temperature, wind, and moisture. But your senses are instruments too! You can feel wind on your skin, see cloud types, notice if the air feels dry or humid, and estimate if it will rain. Time for your first weather broadcast!"}', 'science_nature', true, 'independent', 'any', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Weather Broadcast', 'science_nature', 'audio_response', '{"question":"Pretend you are a TV weather reporter! Record yourself giving a weather report. Include: Is it sunny or cloudy? Is it warm or cold? Is it windy or calm? What does the sky look like? Will it rain today? Use your best reporter voice!","hints":["Start with: Good morning! Here is today''s weather report!","Describe what you SEE in the sky","Say how the air FEELS on your skin","Make a prediction: will the weather change?"]}', 1, 4, 1, true, 'independent', 'any', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text, hot_cold_enabled) VALUES
    (h_young_sci, loc, task, primer, 3, 'BREAKING NEWS! A young scientist is reporting live from the field! Step up to the microphone and tell the world about today''s weather.', false);


  -- ═══════════════════════════════════════════════════════════════
  -- HUNT 10: Canyon Gateway Quest (5 stops, location-specific, family)
  -- ═══════════════════════════════════════════════════════════════

  -- Stop 1: Rock Canyon Trailhead
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Rock Canyon Park Trailhead', 40.2620, -111.6280, ST_SetSRID(ST_MakePoint(-111.6280, 40.2620), 4326)::geography, 50, 'trail', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Wasatch Front Geology', '{"text":"The mountains east of Provo are part of the Wasatch Range, made primarily of limestone deposited in an ancient sea 300 million years ago. Tectonic forces lifted these rocks thousands of meters above sea level. Rock Canyon cuts through these layers, exposing geology you can touch with your hands.","items":["Rock type: primarily Paleozoic limestone","Age: ~300 million years old","The Wasatch Fault runs along the mountain front","Utah Lake was once much larger (Lake Bonneville)"]}', 'science_nature', false, 'location_specific', 'trail', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Canyon Rock Identification', 'science_nature', 'multiple_choice', '{"question":"Look at the canyon walls and any exposed rock near the trailhead. What type of rock makes up most of the canyon?","options":["Limestone (gray, layered, may have fossils)","Sandstone (red/tan, grainy, crumbles)","Granite (speckled, very hard, igneous)","Quartzite (very hard, glassy, metamorphic)"],"correct_answer":"Limestone (gray, layered, may have fossils)","hints":["Limestone is usually gray and shows horizontal layers","Sandstone feels gritty and is often reddish","Granite has visible crystals of different colors","Look for layers — sedimentary rocks show them clearly"]}', 3, 10, 2, false, 'location_specific', 'trail', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_canyon, loc, task, primer, 0, 'Begin where the city ends and the mountains begin. These canyon walls are 300 million years old — can you read their story?');

  -- Stop 2: Canyon Mouth Viewpoint
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Rock Canyon Mouth Viewpoint', 40.2640, -111.6260, ST_SetSRID(ST_MakePoint(-111.6260, 40.2640), 4326)::geography, 60, 'mountain', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Reading Rock Layers', '{"text":"Sedimentary rocks form in horizontal layers, like pages in a book. The oldest layers are at the bottom, the youngest at the top. When you see tilted or folded layers, tectonic forces bent them after they formed. A cross-section diagram helps scientists record what they see in cliff faces and canyon walls."}', 'science_nature', false, 'location_specific', 'mountain', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Canyon Cross-Section Sketch', 'science_nature', 'sketch_draw', '{"question":"Sketch a cross-section of the canyon showing: rock layers (are they horizontal or tilted?), vegetation zones from creek to ridge, and the creek at the bottom. Label at least 4 features. Use arrows to show where water flows.","hints":["Look for color changes in the rock — each color may be a different layer","Trees grow differently on north-facing vs south-facing slopes","The creek runs along the lowest point","Include approximate heights and widths"]}', 3, 10, 2, false, 'location_specific', 'mountain', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_canyon, loc, task, primer, 1, 'Walk deeper until you can see both canyon walls rising above you. The layers in the rock are pages in a 300-million-year-old book.');

  -- Stop 3: Trail Environmental Transect
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Rock Canyon Trail (first 200m)', 40.2650, -111.6250, ST_SetSRID(ST_MakePoint(-111.6250, 40.2650), 4326)::geography, 40, 'trail', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Environmental Transects', '{"text":"A transect is a line through an environment where scientists record changes at regular intervals. As you walk into a canyon, conditions change: temperature drops, humidity rises, vegetation shifts from grassland to forest. Recording these changes at set distances creates a dataset that reveals how environments work."}', 'science_nature', false, 'location_specific', 'trail', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Canyon Elevation Transect', 'science_nature', 'data_collection', '{"question":"At three points (trailhead, 50 steps in, 100 steps in), record: (1) temperature estimate (warmer/same/cooler), (2) wind (strong/moderate/calm), (3) dominant vegetation type (grass/shrubs/trees), (4) soil type (bare rock/gravel/dirt/organic). How do conditions change as you enter the canyon?","hints":["Canyons tend to be cooler and more sheltered from wind","Vegetation may get denser with more shade and moisture","Soil type reflects erosion and water flow","Take notes at each point before moving to the next"]}', 3, 10, 2, false, 'location_specific', 'trail', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_canyon, loc, task, primer, 2, 'Walk 100 steps into the canyon and feel the world change around you. The air, the plants, the soil — everything shifts as the walls rise.');

  -- Stop 4: Canyon Edge Development Debate
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Rock Canyon Residential Edge', 40.2610, -111.6300, ST_SetSRID(ST_MakePoint(-111.6300, 40.2610), 4326)::geography, 50, 'urban', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Development vs Conservation', '{"text":"Where should cities stop and nature begin? This question has no easy answer. Housing developers see open land as potential homes for growing families. Conservationists see habitat, flood protection, and recreation. The edge of Rock Canyon is one of many places where this tension plays out in real time.","items":["Pro-development: housing shortage, tax revenue, jobs","Pro-conservation: habitat, recreation, flood protection, beauty","Wildfire risk increases when homes are near canyons","Compromise: development with setbacks and natural buffers"]}', 'critical_thinking', false, 'location_specific', 'urban', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Canyon Development Debate', 'critical_thinking', 'team_debate', '{"question":"Should housing developments be allowed closer to the canyon entrance? One person argues YES (we need more homes, people want to live near nature). Another argues NO (wildfire risk, habitat destruction, flood danger). A third person judges. Each side gets 2 minutes. Use evidence from what you can see around you.","hints":["Look at how close the nearest houses are to the canyon","Consider wildfire risk — dry vegetation + wind + homes","Think about who benefits and who loses","Is there a compromise that could work?"]}', 3, 10, 3, false, 'location_specific', 'urban', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_canyon, loc, task, primer, 3, 'Turn around and face the city. See where homes crowd against the wild? That line is a debate frozen in concrete and soil. Your team must take sides.');

  -- Stop 5: Dear Future Visitor Letter
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Rock Canyon Park Interpretive Area', 40.2605, -111.6310, ST_SetSRID(ST_MakePoint(-111.6310, 40.2605), 4326)::geography, 45, 'park', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'Place-Based Writing', '{"text":"The best writing about places comes from being IN the place. When you write about a location while standing in it, your senses feed your words: the smell of sage, the sound of wind through the canyon, the feel of gritty limestone. This is place-based writing — and it is more vivid than anything written from memory."}', 'reading_writing', false, 'location_specific', 'park', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Dear Future Visitor Letter', 'reading_writing', 'creative_writing', '{"question":"Write a Dear Future Visitor letter (5 sentences) with advice for someone visiting Rock Canyon for the first time. Include: one scientific observation about the canyon, one safety tip, and one reason this place matters. Write it as if you are hiding the letter under a rock for them to find.","hints":["Start with: Dear Future Visitor...","Include something specific you observed today","Safety: stay on trail, bring water, watch for wildlife","Why does this canyon matter to Provo?"]}', 3, 10, 2, false, 'location_specific', 'park', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_canyon, loc, task, primer, 4, 'Your final stop is where the adventure ends. Leave something behind — not litter, but words. Write a letter that a future explorer might find.');


END $$;
