-- ══════════════════════════════════════════════════════════════
-- Migration 017: Seed finds for remaining 11 hunts
-- Each hunt gets 4-6 stops with BYU/Provo GPS coordinates,
-- location-specific tasks, and clue text.
-- Uses the owner account (mark.keith@gmail.com) as created_by.
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  ns UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  u_owner UUID;

  -- Hunt IDs (must match migration 015)
  h_watershed UUID := uuid_generate_v5(ns, 'hunt-watershed');
  h_weather UUID := uuid_generate_v5(ns, 'hunt-weather');
  h_measurement UUID := uuid_generate_v5(ns, 'hunt-measurement');
  h_geometry UUID := uuid_generate_v5(ns, 'hunt-geometry');
  h_stats UUID := uuid_generate_v5(ns, 'hunt-stats');
  h_navigator UUID := uuid_generate_v5(ns, 'hunt-navigator');
  h_history UUID := uuid_generate_v5(ns, 'hunt-history');
  h_detective UUID := uuid_generate_v5(ns, 'hunt-detective');
  h_debate UUID := uuid_generate_v5(ns, 'hunt-debate');
  h_story UUID := uuid_generate_v5(ns, 'hunt-story');
  h_heritage UUID := uuid_generate_v5(ns, 'hunt-heritage');

  -- Temp vars for each hunt's finds
  loc UUID; task UUID; primer UUID;

BEGIN
  SELECT id INTO u_owner FROM public.users WHERE email = 'mark.keith@gmail.com' LIMIT 1;
  IF u_owner IS NULL THEN
    SELECT id INTO u_owner FROM public.users WHERE role = 'admin' LIMIT 1;
  END IF;

  -- ═══════════════════════════════════════════════════════
  -- HUNT 2: Provo River Watershed Discovery (6 stops)
  -- ═══════════════════════════════════════════════════════

  -- Stop 1: River Trail North
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo River Trail - North Access', 40.2440, -111.6620, ST_SetSRID(ST_MakePoint(-111.6620, 40.2440), 4326)::geography, 40, 'water', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'The Water Cycle in Action', '{"text":"The Provo River begins as snowmelt in the Uinta Mountains and flows through Utah Valley before reaching Utah Lake. Along the way it carves canyons, feeds wetlands, and supports agriculture. Every drop you see started as snow thousands of meters above you.","items":["Provo River length: ~110 km","Watershed area: ~1,700 sq km","Primary use: irrigation, municipal water, recreation"]}', 'science_nature', false, 'location_specific', 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'River Flow Measurement', 'science_nature', 'numeric_entry', '{"question":"Drop a leaf into the Provo River. Time how long it takes to travel 5 meters downstream. Calculate the flow speed in meters per second (speed = distance ÷ time).","unit":"m/s","correct_answer":"0.5","hints":["Mark 5 meters along the bank","Use a lightweight leaf or twig","Time from release to the 5m mark","Typical river flow: 0.3-1.5 m/s"]}', 5, 9, 2, false, 'location_specific', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_watershed, loc, task, primer, 0, 'Begin where the river trail meets the road, near where students jog alongside water that started as mountain snow.');

  -- Stop 2: River Bend
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo River - Meander Bend', 40.2420, -111.6615, ST_SetSRID(ST_MakePoint(-111.6615, 40.2420), 4326)::geography, 35, 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Erosion vs Deposition', 'science_nature', 'photo_observation', '{"question":"At this river bend, find the outside curve (erosion) and inside curve (deposition). Take a photo showing both. Which bank is steeper? Where is sediment accumulating?","hints":["Outside of curve: fast water, steep bank, erosion","Inside of curve: slow water, gentle slope, sand/gravel deposited","Look for exposed roots on the eroded bank","The river is slowly moving sideways over time"]}', 5, 9, 2, false, 'location_specific', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_watershed, loc, task, 1, 'Walk downstream until the river curves. The outside of the bend tells one story; the inside tells another.');

  -- Stop 3: Riparian Zone
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo River - Riparian Zone', 40.2400, -111.6610, ST_SetSRID(ST_MakePoint(-111.6610, 40.2400), 4326)::geography, 40, 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Riparian Plant Survey', 'science_nature', 'data_collection', '{"question":"Walk 10 meters perpendicular from the river bank. Record the plants at 0m (water edge), 5m, and 10m. How does vegetation change as you move away from water? Count species at each distance.","hints":["Water edge: willows, rushes, sedges","5 meters: transitional shrubs and grasses","10 meters: upland grasses and weeds","More moisture-loving plants grow closer to water"]}', 5, 9, 3, false, 'location_specific', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_watershed, loc, task, 2, 'Where the green ribbon of riverside plants meets the drier upland, you will find how water shapes the living world.');

  -- Stop 4: Bridge Crossing
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo River Trail Bridge', 40.2390, -111.6605, ST_SetSRID(ST_MakePoint(-111.6605, 40.2390), 4326)::geography, 30, 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Water Clarity Assessment', 'science_nature', 'numeric_entry', '{"question":"From the bridge, look down into the water. How deep can you see the bottom clearly (in centimeters)? Rate the water clarity: Clear (>100cm), Moderate (30-100cm), or Turbid (<30cm).","unit":"cm","hints":["Look for the deepest point where you can still see rocks","Shallow areas near the bank are easier to measure","Recent rain reduces clarity","Clear water suggests healthy ecosystem"]}', 5, 9, 2, false, 'location_specific', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_watershed, loc, task, 3, 'Find the crossing where you can look down into the river without getting wet. What secrets does the water reveal?');

  -- Stop 5: Wetland Area
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo River Wetland Margin', 40.2380, -111.6610, ST_SetSRID(ST_MakePoint(-111.6610, 40.2380), 4326)::geography, 45, 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Aquatic Life Survey', 'science_nature', 'data_collection', '{"question":"Spend 3 minutes observing the water and its edges. Record every living thing: fish, insects, birds, amphibians, plants, algae. Classify each as fully aquatic, semi-aquatic, or terrestrial visitor.","hints":["Watch the water surface for insects and ripples","Check under rocks at the water edge for larvae","Listen for frogs or bird calls","Algae on rocks counts as aquatic life"]}', 5, 9, 3, false, 'location_specific', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_watershed, loc, task, 4, 'Where the river slows and spreads, life gathers at the water''s edge. This marshy margin is nature''s nursery.');

  -- Stop 6: Utah Lake Overlook
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Utah Lake Viewpoint', 40.2200, -111.7230, ST_SetSRID(ST_MakePoint(-111.7230, 40.2200), 4326)::geography, 60, 'field', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Watershed Big Picture', 'science_nature', 'creative_writing', '{"question":"You can see Utah Lake — where the Provo River ends its journey. Write a paragraph tracing a single water droplet from the Uinta Mountains, through Provo Canyon, past every stop on this hunt, and into the lake. Include at least 3 things the droplet encounters along the way.","hints":["Start at snowmelt in the mountains","Pass through Provo Canyon (erosion, rocks)","Flow through the city (bridges, trails, people)","Enter the lake (mixing, evaporation, cycle continues)"]}', 5, 9, 3, false, 'location_specific', 'field', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_watershed, loc, task, 5, 'Your final stop overlooks the end of the river''s journey — a vast body of water where mountains and valley meet.');

  -- ═══════════════════════════════════════════════════════
  -- HUNT 3: Weather & Atmosphere Lab (4 stops)
  -- ═══════════════════════════════════════════════════════

  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Eyring Science Center Plaza', 40.2493, -111.6478, ST_SetSRID(ST_MakePoint(-111.6478, 40.2493), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, created_by) VALUES
    (primer, 'Cloud Types Quick Guide', '{"text":"Clouds form when water vapor condenses on tiny particles in the atmosphere. The shape and height of clouds tell you about current and future weather.","items":["Cirrus (high, wispy): weather change in 24h","Cumulus (puffy, white): fair weather","Stratus (flat, gray): overcast, light rain possible","Cumulonimbus (tall, dark): thunderstorms"]}', 'science_nature', false, 'location_specific', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Cloud ID at Eyring', 'science_nature', 'multiple_choice', '{"question":"Look at the sky above the Eyring Science Center. What type of clouds dominate right now?","options":["Cumulus (puffy cotton balls)","Stratus (flat gray blanket)","Cirrus (thin wispy streaks)","Cumulonimbus (tall dark towers)","Clear sky — no clouds"],"correct_answer":"","hints":["Cumulus: individual fluffy clouds with flat bottoms","Stratus: continuous layer, no gaps","Cirrus: very high, look like brush strokes","Clear sky still counts as an observation!"]}', 6, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_weather, loc, task, primer, 0, 'Start at the building where physicists study the forces of the universe. Today, you study the forces in the sky above it.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Brigham Square Sundial Area', 40.2497, -111.6493, ST_SetSRID(ST_MakePoint(-111.6493, 40.2497), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Shadow and Sun Angle', 'science_nature', 'numeric_entry', '{"question":"Find a vertical post or pole near the fountain. Measure its shadow length and the object''s height. Calculate the ratio. What does this tell you about the sun''s angle in the sky?","unit":"ratio","hints":["Shadow length ÷ object height = ratio","Ratio < 1 means sun is high (near noon)","Ratio > 1 means sun is low (morning or evening)","This ratio changes throughout the day and across seasons"]}', 6, 10, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_weather, loc, task, 1, 'Head to the heart of campus where water dances. Your own shadow holds the key to understanding the sun''s position.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Open Field (South)', 40.2470, -111.6510, ST_SetSRID(ST_MakePoint(-111.6510, 40.2470), 4326)::geography, 50, 'field', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Wind Speed and Direction', 'science_nature', 'data_collection', '{"question":"Stand in the open field. Determine wind direction (face the wind — it blows FROM that direction). Estimate speed using the Beaufort scale: 0=calm, 1=smoke drifts, 2=feel on face, 3=leaves move, 4=small branches move, 5=small trees sway. Record direction and Beaufort number.","hints":["Face into the wind to determine direction","Look at flags, leaves, or hair for speed clues","Beaufort 3 is a typical light breeze","Record: ''Wind from NW, Beaufort 3''"]}', 6, 10, 2, false, 'location_specific', 'field', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_weather, loc, task, 2, 'Find the widest open space on this part of campus — where nothing blocks the wind and you can see the whole sky.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'HBLL Library Steps', 40.2487, -111.6495, ST_SetSRID(ST_MakePoint(-111.6495, 40.2487), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Weather Forecast Challenge', 'science_nature', 'short_text', '{"question":"Using ONLY your observations today (clouds, wind, temperature, humidity), predict the weather for the next 6 hours. Write your forecast and explain your reasoning using at least 3 pieces of evidence.","correct_answer":null,"hints":["Cloud type predicts precipitation likelihood","Wind direction indicates where weather is coming from","Falling pressure (you might feel it) means change coming","Compare your forecast to the actual weather tonight!"]}', 6, 10, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_weather, loc, task, 3, 'End at the building that holds more knowledge than anywhere on campus. Now use YOUR knowledge to predict the future — of the weather, at least.');

  -- ═══════════════════════════════════════════════════════
  -- HUNT 4: Measurement Mania (5 stops)
  -- ═══════════════════════════════════════════════════════

  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Talmage Building Entrance', 40.2489, -111.6485, ST_SetSRID(ST_MakePoint(-111.6485, 40.2489), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, created_by) VALUES
    (primer, 'Estimation Tricks', '{"text":"Good estimators use benchmarks — things they already know the size of. Your hand span is about 15-20 cm. One big step is about 0.7 meters. A standard door is about 2 meters tall. Use these to estimate anything!","items":["Hand span: ~18 cm","Arm span ≈ your height","One step: ~0.7 m","A door: ~2 m tall","A car: ~4.5 m long"]}', 'math_real_world', false, 'location_specific', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Column Height Challenge', 'math_real_world', 'numeric_entry', '{"question":"The Talmage Building has columns at the entrance. Estimate the height of one column in meters. Method: stand next to it, estimate how many of your heights fit, then multiply. (Your height × number of you = column height).","unit":"meters","hints":["Stand as close as possible to compare","Count carefully — is it 2× your height? 3×?","Average 10-year-old is about 1.4 m","Average adult is about 1.7 m"]}', 2, 5, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_measurement, loc, task, primer, 0, 'Find the building with tall pillars at its entrance — a place where math and science students gather. How tall are those pillars?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Brigham Square Fountain', 40.2497, -111.6493, ST_SetSRID(ST_MakePoint(-111.6493, 40.2497), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Fountain Perimeter Walk', 'math_real_world', 'numeric_entry', '{"question":"Walk around the edge of the Brigham Square fountain, counting your steps. Convert to meters (1 step ≈ 0.7m for adults, 0.5m for kids). What is the fountain''s approximate perimeter?","unit":"meters","hints":["Walk at a consistent pace","Count each step carefully","Multiply: steps × step length = perimeter","Compare to objects you know — is it bigger than a basketball court?"]}', 2, 5, 1, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_measurement, loc, task, 1, 'Walk to the campus center where water splashes and students meet. How far is it around the edge?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'LaVell Edwards Stadium (exterior)', 40.2573, -111.6545, ST_SetSRID(ST_MakePoint(-111.6545, 40.2573), 4326)::geography, 60, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Stadium Distance Estimation', 'math_real_world', 'numeric_entry', '{"question":"Stand near the stadium and estimate the distance across the football field (end zone to end zone) in meters. A standard American football field is about 91 meters (100 yards). Can you estimate this without walking it?","unit":"meters","correct_answer":"91","hints":["100 yards = 91.44 meters","The whole field including end zones is 120 yards (110 m)","Can you see the far end zone from here?","Use something you know the size of as a reference"]}', 2, 5, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_measurement, loc, task, 2, 'Head to where Cougars roar on autumn Saturdays. This massive structure holds a field with very specific measurements.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Walkway (between JFSB and SWKT)', 40.2475, -111.6490, ST_SetSRID(ST_MakePoint(-111.6490, 40.2475), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Walking Speed Test', 'math_real_world', 'numeric_entry', '{"question":"Mark a distance of 20 meters (about 28 steps). Time yourself walking it at normal pace. Calculate your walking speed: speed = 20 ÷ time (in seconds). Then convert to km/h by multiplying by 3.6.","unit":"km/h","hints":["Average walking speed: 4-5 km/h","20 meters at normal pace: about 15 seconds","Speed in m/s × 3.6 = speed in km/h","Try it again running — how much faster?"]}', 2, 5, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_measurement, loc, task, 3, 'Find a long straight walkway between two tall buildings. This is your race track for measuring speed.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'HBLL Library Front', 40.2487, -111.6495, ST_SetSRID(ST_MakePoint(-111.6495, 40.2487), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Window Counting Multiplication', 'math_real_world', 'numeric_entry', '{"question":"Look at the library building front. Count the windows in one row. Count how many rows of windows there are. Multiply to estimate the total number of windows on this side of the building.","unit":"windows","hints":["Count one row carefully","Count the number of rows (floors)","Total = windows per row × number of rows","This is faster than counting every window individually!"]}', 2, 5, 1, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_measurement, loc, task, 4, 'End at the building with the most books on campus. Its face is covered with a grid pattern perfect for multiplication.');

  -- ═══════════════════════════════════════════════════════
  -- HUNTS 5-12: Abbreviated — 4 stops each
  -- (Following same pattern: location, task, find)
  -- ═══════════════════════════════════════════════════════

  -- HUNT 5: Geometry Everywhere (4 stops)
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Harris Fine Arts Center', 40.2472, -111.6519, ST_SetSRID(ST_MakePoint(-111.6519, 40.2472), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Shape Scavenger at Harris', 'math_real_world', 'data_collection', '{"question":"Find at least 8 different geometric shapes in the Harris Fine Arts Center''s exterior architecture. For each: name the shape, where you found it, and estimate one dimension.","hints":["Look at windows, doors, roof lines, decorative elements","Arches are partial circles","Many buildings have triangular roof peaks","Don''t forget 3D shapes: cylinders (columns), rectangular prisms"]}', 4, 8, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_geometry, loc, task, 0, 'Where art meets architecture, geometry hides in every line. Find the building dedicated to fine arts and look closely at its face.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Talmage Building Steps', 40.2489, -111.6485, ST_SetSRID(ST_MakePoint(-111.6485, 40.2489), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Angle Measurement on Steps', 'math_real_world', 'numeric_entry', '{"question":"The Talmage Building has steps. Estimate the angle of the staircase slope in degrees. Method: if the steps go up 1 meter over a horizontal distance of 2 meters, the angle is about 27°. Measure the rise and run of 5 steps.","unit":"degrees","hints":["Measure the height (rise) and depth (run) of one step","Angle = arctan(rise ÷ run)","Most stairs are between 25° and 40°","Steeper = harder to climb"]}', 4, 8, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_geometry, loc, task, 1, 'Return to the pillared building. This time, look DOWN — the steps beneath your feet hide angles waiting to be measured.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Brick Walkway', 40.2485, -111.6500, ST_SetSRID(ST_MakePoint(-111.6500, 40.2485), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Tessellation Pattern Analysis', 'math_real_world', 'photo_observation', '{"question":"Find a brick or tile pattern on the walkway. Take a photo. Is this a tessellation (shapes fit together with no gaps)? What shapes make up the pattern? Could you extend it infinitely?","hints":["A tessellation covers a surface with no gaps and no overlaps","Rectangles, triangles, and hexagons tessellate","Look for the repeating unit (the smallest piece that repeats)","Some patterns look like tessellations but have small gaps"]}', 4, 8, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_geometry, loc, task, 2, 'Look down at the ground you walk on every day. The pattern beneath your feet follows a mathematical rule.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Museum of Art Exterior', 40.2480, -111.6538, ST_SetSRID(ST_MakePoint(-111.6538, 40.2480), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Symmetry in Architecture', 'math_real_world', 'sketch_draw', '{"question":"Sketch the front of the Museum of Art building. Draw a line of symmetry if one exists. Is the building perfectly symmetrical? Identify where symmetry breaks (if it does).","hints":["Line symmetry: one half mirrors the other","Check windows, doors, and decorative elements","Many buildings are NEARLY symmetrical but not perfect","Draw both halves and compare carefully"]}', 4, 8, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_geometry, loc, task, 3, 'Your final stop celebrates art and beauty. Does this building have the beauty of mathematical balance?');

  -- HUNT 6: Statistics in the Wild (4 stops)
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'SWKT (Wilkinson Center) Entrance', 40.2480, -111.6480, ST_SetSRID(ST_MakePoint(-111.6480, 40.2480), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Foot Traffic Data Collection', 'math_real_world', 'data_collection', '{"question":"Count people entering and exiting the Wilkinson Center for exactly 3 minutes. Record: entering vs exiting, walking vs running, alone vs in groups. Calculate the net flow rate (entries - exits per minute).","hints":["Use tally marks for fast counting","Separate columns for each category","Net flow: positive = filling up, negative = emptying","Time of day dramatically affects the data"]}', 8, 12, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_stats, loc, task, 0, 'The busiest door on campus — where students eat, shop, and socialize. Count the human river flowing in and out.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Parking Lot', 40.2510, -111.6480, ST_SetSRID(ST_MakePoint(-111.6480, 40.2510), 4326)::geography, 50, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Vehicle Color Distribution', 'math_real_world', 'data_collection', '{"question":"Survey 30 vehicles in this parking lot. Record the color of each. Create a frequency table. What is the mode (most common color)? Calculate the percentage for the top 3 colors. Does your sample match national statistics (white, black, and silver are typically the most common)?","hints":["Use tally marks by color category","Mode = most frequent value","Percentage = (count ÷ 30) × 100","National data: ~25% white, ~20% black, ~15% silver"]}', 8, 12, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_stats, loc, task, 1, 'Head to where metal boxes on wheels sit in rows. Your sample of 30 will reveal a color distribution.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Quad (Central)', 40.2490, -111.6500, ST_SetSRID(ST_MakePoint(-111.6500, 40.2490), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Backpack Weight Survey', 'math_real_world', 'data_collection', '{"question":"Ask 10 passing students to estimate their backpack weight in kg (or lift theirs and estimate). Record all 10 values. Calculate: mean, median, range, and standard deviation. Does the data look normal (bell-shaped)?","hints":["Mean = sum of all values ÷ 10","Median = middle value when sorted","Range = highest - lowest","Standard deviation: typical distance from the mean"]}', 8, 12, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_stats, loc, task, 2, 'The center of campus is a crossroads of students carrying the weight of knowledge — literally. Survey their loads.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Brigham Square (fountain)', 40.2497, -111.6493, ST_SetSRID(ST_MakePoint(-111.6493, 40.2497), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Correlation Investigation', 'math_real_world', 'short_text', '{"question":"Observe the area for 5 minutes and find two variables that seem correlated (they increase or decrease together). Example: temperature and number of people sitting outside. Describe the correlation, whether it''s positive or negative, and whether you think it''s causal or coincidental.","correct_answer":null,"hints":["Positive correlation: both go up together","Negative correlation: one goes up, the other goes down","Correlation ≠ causation","Look for patterns in behavior, weather, traffic, clothing"]}', 8, 12, 4, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_stats, loc, task, 3, 'End where you can see it all — the campus heartbeat. Find two things that dance together, rising and falling in sync.');

  -- HUNT 7: Campus Navigator Challenge (5 stops)
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'JFSB North Entrance', 40.2470, -111.6492, ST_SetSRID(ST_MakePoint(-111.6492, 40.2470), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, created_by) VALUES
    (primer, 'Finding North Without a Phone', '{"text":"You can find north without any tools! In the Northern Hemisphere at midday, the sun is roughly south, so shadows point north. Satellite dishes often point south. Moss tends to grow on the north side of trees (but this isn''t always reliable). And if you know which way campus buildings face, you can use them as reference.","items":["Sun at noon = roughly south","Shadows at noon point roughly north","Satellite dishes often face south","Use known buildings as compass reference"]}', 'geography_maps', false, 'location_specific', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Find North Challenge', 'geography_maps', 'multiple_choice', '{"question":"Without using your phone, determine which direction is NORTH from the JFSB entrance. How did you figure it out?","options":["Used shadow direction","Used sun position","Used satellite dish direction","Used a known building orientation","Used moss on trees"],"correct_answer":"","hints":["At midday, sun is south → shadows point north","BYU campus is roughly oriented N-S","The mountains (Wasatch) are to the EAST","Look for any shadow from a vertical object"]}', 2, 6, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_navigator, loc, task, primer, 0, 'Start at the building where languages and humanities are taught. Before you can navigate, you must find TRUE NORTH.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Eyring Science Center', 40.2493, -111.6478, ST_SetSRID(ST_MakePoint(-111.6478, 40.2493), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Compass Bearing Walk', 'geography_maps', 'short_text', '{"question":"Walk exactly 50 steps NORTHEAST from this building. Where did you end up? Describe your location using compass directions relative to 3 visible landmarks.","correct_answer":null,"hints":["Northeast is between North and East (45°)","Count steps carefully","Describe: ''I am ___ meters south of ___''","Use at least 3 landmarks in your description"]}', 2, 6, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_navigator, loc, task, 1, 'Head east and slightly north to where scientists study matter and energy. Then walk 50 steps into the unknown.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'HBLL Library (West Side)', 40.2487, -111.6500, ST_SetSRID(ST_MakePoint(-111.6500, 40.2487), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Map Your Campus Walk', 'geography_maps', 'sketch_draw', '{"question":"Draw a map of the route you have walked so far in this hunt. Include: starting point, each stop with a label, path direction arrows, a compass rose, and estimated distances between stops.","hints":["Start with the overall shape of your route","Mark each building/stop you visited","Add a compass rose (N/S/E/W) in the corner","Estimate distances between stops in meters"]}', 2, 6, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_navigator, loc, task, 2, 'Navigate to the building that holds more maps and books than any other on campus. Time to make YOUR OWN map.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Helaman Halls (north)', 40.2523, -111.6481, ST_SetSRID(ST_MakePoint(-111.6481, 40.2523), 4326)::geography, 50, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Landmark Direction Challenge', 'geography_maps', 'data_collection', '{"question":"From this spot, identify 6 visible landmarks. For each, record: name, compass direction (N, NE, E, SE, S, SW, W, NW), and estimated distance. Then rank them from closest to farthest.","hints":["Use the mountains (east) as your compass reference","Include buildings, trees, and natural features","Closer objects appear larger and more detailed","Sort your list by estimated distance"]}', 2, 6, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_navigator, loc, task, 3, 'Head north to where first-year students call home. From high ground, you can see landmarks in every direction.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Brigham Square (return)', 40.2497, -111.6493, ST_SetSRID(ST_MakePoint(-111.6493, 40.2497), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'GPS Coordinate Recording', 'geography_maps', 'numeric_entry', '{"question":"Using your phone, record your exact GPS coordinates (latitude and longitude) at this spot. The latitude of BYU campus is approximately 40.25°N. How close is your reading?","unit":"latitude","correct_answer":"40.2497","hints":["Open your phone''s compass or maps app","Latitude is the first number (north-south)","Longitude is the second (east-west, negative in Utah)","4 decimal places = accurate to ~11 meters"]}', 2, 6, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_navigator, loc, task, 4, 'Return to the campus center where you began. Your final task: pinpoint your exact location on planet Earth.');

  -- HUNT 8: Provo City History Trail (4 stops)
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo City Center Temple', 40.2340, -111.6580, ST_SetSRID(ST_MakePoint(-111.6580, 40.2340), 4326)::geography, 50, 'historic', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Temple History Investigation', 'history_community', 'short_text', '{"question":"The Provo City Center Temple was originally the Provo Tabernacle, built in the 1800s. It burned in 2010 and was rebuilt as a temple. Find evidence of both the old and new in the building''s exterior. What survived the fire? What is new?","correct_answer":null,"hints":["The exterior walls are original (survived the fire)","The interior is completely rebuilt","Look for the contrast between old stone and new elements","The spire is new — the original didn''t have one"]}', 5, 9, 2, false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_history, loc, task, 0, 'Begin at the building that rose from ashes — a pioneer-era structure that was reborn after flames nearly claimed it forever.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Pioneer Park', 40.2330, -111.6560, ST_SetSRID(ST_MakePoint(-111.6560, 40.2330), 4326)::geography, 45, 'park', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Pioneer Park Timeline', 'history_community', 'sorting_ordering', '{"question":"Based on what you can observe and any plaques or markers, put these events in chronological order for Provo.","items":["Native peoples inhabited Utah Valley","Mormon pioneers arrived in 1849","The tabernacle was built (1880s)","Railroad reached Provo","BYU was founded (1875)","Provo became a city"],"hints":["Indigenous peoples were here for thousands of years","Pioneers arrived in the late 1840s","The railroad connected Utah to the rest of the US in 1869","BYU''s founding (1875) came before the tabernacle (1885)"]}', 5, 9, 2, false, 'location_specific', 'park', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_history, loc, task, 1, 'Walk to the park named for the first non-native settlers. The ground here holds stories from before Utah was a state.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Provo Public Library', 40.2350, -111.6570, ST_SetSRID(ST_MakePoint(-111.6570, 40.2350), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Community Services Analysis', 'history_community', 'data_collection', '{"question":"The library is a community hub. From this location, identify every community service you can see or know is within a 5-minute walk: library, schools, parks, transit, medical, religious buildings, businesses. List at least 8 and categorize each.","hints":["The library itself is an educational service","Look for signs indicating other services","Churches, schools, and government buildings serve the community","Consider both visible and nearby services"]}', 5, 9, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_history, loc, task, 2, 'Find the building where anyone can borrow knowledge for free — a cornerstone of community life since the early days.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Kiwanis Park', 40.2335, -111.6580, ST_SetSRID(ST_MakePoint(-111.6580, 40.2335), 4326)::geography, 45, 'park', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Then and Now Comparison', 'history_community', 'creative_writing', '{"question":"Stand in this park and imagine this exact spot 150 years ago. Write 3-4 sentences describing what you think it looked like in the 1870s. Then write 3-4 sentences about what it might look like 50 years from now. What evidence at the current location informs your guesses?","hints":["1870s: no paved roads, few buildings, agricultural land","Native plants and open space would have dominated","50 years from now: consider population growth, technology","Old trees might have been here for 100+ years already"]}', 5, 9, 3, false, 'location_specific', 'park', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_history, loc, task, 3, 'End at the park named for a service club that builds communities. Stand here and travel through time — past and future.');

  -- HUNT 9: Observation Detective (4 stops)
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'JFSB South Garden', 40.2462, -111.6495, ST_SetSRID(ST_MakePoint(-111.6495, 40.2462), 4326)::geography, 30, 'park', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'What Changed Recently?', 'critical_thinking', 'short_text', '{"question":"Something at this garden has changed in the last few days or weeks. Find 3 pieces of evidence of recent change and explain what you think happened. Look for: fresh dirt, new plantings, trimmed branches, litter, construction, or wear patterns.","correct_answer":null,"hints":["Fresh-cut edges on plants = recent trimming","Dark wet soil = recently watered or dug","New mulch has a different color than old mulch","Footprints in soil show recent foot traffic"]}', 2, 6, 2, false, 'location_specific', 'park', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_detective, loc, task, 0, 'Find the small garden near the language building. Something here has changed recently — can you spot the evidence?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Sidewalk Junction', 40.2485, -111.6498, ST_SetSRID(ST_MakePoint(-111.6498, 40.2485), 4326)::geography, 25, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, '30-Second Memory Challenge', 'critical_thinking', 'numeric_entry', '{"question":"Close your eyes for 10 seconds. Open them and look around for exactly 30 seconds. Close your eyes again. How many distinct objects can you remember? Count them carefully, then open your eyes and check — how many did you miss?","unit":"objects remembered","hints":["Try to look systematically: left to right, near to far","Group objects by category: natural, built, moving, still","Colors and shapes are easier to remember","Most people remember 7-12 objects in 30 seconds"]}', 2, 6, 1, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_detective, loc, task, 1, 'Where sidewalks cross, stand still and test your observation memory. How much can you capture in 30 seconds?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Benson Building (Agriculture)', 40.2478, -111.6504, ST_SetSRID(ST_MakePoint(-111.6504, 40.2478), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Mystery Object Investigation', 'critical_thinking', 'short_text', '{"question":"Find an object on or near this building whose purpose is not immediately obvious (a vent, bracket, sensor, marking, pipe, or utility box). Describe it in detail. What do you think its purpose is? What evidence supports your guess?","correct_answer":null,"hints":["Look for small metal boxes, pipes, or sensors","Color-coded markings often indicate utilities","Vents and grates serve heating/cooling purposes","Brackets may hold signs, lights, or cables that were removed"]}', 2, 6, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_detective, loc, task, 2, 'The agriculture building hides mysterious objects in plain sight. Can you find something no one else notices?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Brigham Square (detective finale)', 40.2497, -111.6493, ST_SetSRID(ST_MakePoint(-111.6493, 40.2497), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Two Truths and a Lie', 'critical_thinking', 'creative_writing', '{"question":"Write 3 statements about Brigham Square. Two must be TRUE observations you can verify right now. One must be a believable but FALSE statement. Make the lie hard to detect! Share with your team and see if they can spot it.","hints":["Base all three on real, observable things","Make the lie plausible — close to truth","Use specific details to make truths convincing","The best lies include real details with one wrong element"]}', 2, 6, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_detective, loc, task, 3, 'Return to the center of campus for your final detective challenge. Can you fool your teammates with a convincing lie?');

  -- HUNT 10: Debate & Decide (4 stops) — abbreviated
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Green Space vs Parking', 40.2505, -111.6485, ST_SetSRID(ST_MakePoint(-111.6485, 40.2505), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Green Space vs Parking Debate', 'critical_thinking', 'team_debate', '{"question":"Should this campus have more green space or more parking? Each team member argues a different stakeholder perspective: student driver, campus sustainability officer, facilities manager, student without a car. Use evidence from what you observe here.","hints":["Consider environmental benefits of green space","Consider accessibility needs for parking","What data would help decide?","Is there a compromise solution?"]}', 8, 12, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_debate, loc, task, 0, 'Stand where concrete meets grass. This boundary represents one of the biggest debates on any campus.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'SWKT Food Court Area', 40.2480, -111.6480, ST_SetSRID(ST_MakePoint(-111.6480, 40.2480), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Food Waste Ethics', 'critical_thinking', 'audio_response', '{"question":"Record a 60-second argument about food waste on campus. Should the university mandate composting? Ban single-use containers? Give leftover food to shelters? Pick one position and argue for it with evidence you can observe.","hints":["Look for evidence: trash cans, recycling bins, compostable items","Consider cost, convenience, and environmental impact","Who is affected by each policy?","What are the tradeoffs?"]}', 8, 12, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_debate, loc, task, 1, 'Where thousands of meals are consumed daily, waste is inevitable. But is it acceptable? Record your argument.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Accessibility Test Route', 40.2475, -111.6495, ST_SetSRID(ST_MakePoint(-111.6495, 40.2475), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Accessibility Audit Debate', 'critical_thinking', 'team_debate', '{"question":"Walk this area as if you were using a wheelchair. Rate accessibility 1-10. Then debate: should the university spend $1M on accessibility upgrades here, or on scholarships for students with disabilities? There is no right answer — argue your position.","hints":["Check path widths, ramps, door access","Consider curb cuts and surface smoothness","Both options help students with disabilities","This is about prioritization, not right vs wrong"]}', 8, 12, 4, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_debate, loc, task, 2, 'Try to navigate this area differently. When resources are limited, how should a university prioritize accessibility?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'HBLL Library (debate finale)', 40.2487, -111.6495, ST_SetSRID(ST_MakePoint(-111.6495, 40.2487), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'AI in Education Debate', 'critical_thinking', 'creative_writing', '{"question":"In 200 words, argue for or against this statement: ''AI tutoring should replace 50% of in-person lecture time at universities.'' Use at least 3 pieces of evidence or reasoning. Consider: learning outcomes, social connection, cost, accessibility, and equity.","hints":["Consider what lectures do well vs what AI does well","Think about students who learn differently","Cost savings could fund other programs","Social connection matters for college experience"]}', 8, 12, 4, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_debate, loc, task, 3, 'End at the house of knowledge. The biggest debate in education today: can AI teach as well as humans?');

  -- HUNT 11: Story Walk (4 stops)
  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Campus Garden Path', 40.2488, -111.6515, ST_SetSRID(ST_MakePoint(-111.6515, 40.2488), 4326)::geography, 30, 'park', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Story Starter: The Discovery', 'reading_writing', 'creative_writing', '{"question":"Write the opening paragraph (3-5 sentences) of a story that begins RIGHT HERE. Your character discovers something unexpected in this garden. Use real details you can see — the actual plants, paths, and sounds — to make your setting vivid.","hints":["Start with your character doing something ordinary","Include at least 2 sensory details (sight, sound, smell)","End with the discovery that hooks the reader","Real details make fiction feel authentic"]}', 2, 5, 2, false, 'location_specific', 'park', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_story, loc, task, 0, 'Your story begins on a winding path where flowers grow and secrets hide. What will your character discover here?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Bean Museum Steps', 40.2495, -111.6507, ST_SetSRID(ST_MakePoint(-111.6507, 40.2495), 4326)::geography, 30, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Character Dialogue', 'reading_writing', 'creative_writing', '{"question":"Your character has reached the museum. Write a dialogue (4-6 lines of speech) between your character and someone they meet here. The conversation should reveal a clue about the mystery from Stop 1.","hints":["Use quotation marks for speech","Each character should sound different","The clue should be subtle — not giving everything away","Include at least one action beat (she frowned, he looked away)"]}', 2, 5, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_story, loc, task, 1, 'Your character follows a lead to the building full of preserved creatures. Someone here knows something...');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Botany Pond (story)', 40.2485, -111.6512, ST_SetSRID(ST_MakePoint(-111.6512, 40.2485), 4326)::geography, 30, 'water', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Sensory Description Scene', 'reading_writing', 'creative_writing', '{"question":"Your character reaches the pond — a key location in the mystery. Write a descriptive paragraph using ALL 5 senses. What do they see, hear, smell, touch, and taste (even if it is just the air)? The description should build suspense.","hints":["See: water reflections, plants, sky, movement","Hear: water sounds, birds, wind, distant voices","Smell: water, vegetation, earth","Touch: temperature, breeze, texture of nearby surfaces","Taste: describe the quality of the air"]}', 2, 5, 2, false, 'location_specific', 'water', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_story, loc, task, 2, 'The trail leads to water — a still, quiet place where your character must use all their senses to find the next clue.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'HBLL Library (story finale)', 40.2487, -111.6495, ST_SetSRID(ST_MakePoint(-111.6495, 40.2487), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Story Ending', 'reading_writing', 'creative_writing', '{"question":"Write the ending of your story (4-6 sentences). Your character solves the mystery inside the library. The solution should connect to something real about this building. End with a satisfying last sentence that echoes the opening.","hints":["Good endings resolve the mystery","The solution should make sense given the clues","Echo the opening for a satisfying feeling","Your last sentence is the most important one"]}', 2, 5, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_story, loc, task, 3, 'Every story ends where knowledge lives. Your character enters the library to solve the mystery once and for all.');

  -- HUNT 12: BYU Heritage Walk (5 stops)
  loc := gen_random_uuid(); task := gen_random_uuid(); primer := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Karl G. Maeser Building', 40.2495, -111.6490, ST_SetSRID(ST_MakePoint(-111.6490, 40.2495), 4326)::geography, 35, 'historic', u_owner);
  INSERT INTO public.primers (id, title, content, subject_domain, is_library, location_dependency, location_type, created_by) VALUES
    (primer, 'BYU Founding Story', '{"text":"BYU was founded in 1875 by Brigham Young as Brigham Young Academy. Karl G. Maeser was its first principal. The school started with just 29 students in a small building. Today BYU has over 33,000 students and is one of the largest private universities in the United States.","items":["Founded: 1875","First principal: Karl G. Maeser","Original enrollment: 29 students","Current enrollment: ~33,000"]}', 'history_community', false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Maeser Building Architecture', 'history_community', 'photo_observation', '{"question":"The Maeser Building is one of the oldest on campus. Take a photo showing architectural details that reveal its age. Find 3 features that distinguish it from modern campus buildings.","hints":["Look at the stone/brick material and craftsmanship","Window shapes and sizes differ from modern buildings","Ornamental details were more common in older architecture","The building''s proportions and scale tell a story"]}', 5, 9, 2, false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, primer_id, sort_order, clue_text) VALUES
    (h_heritage, loc, task, primer, 0, 'Begin at the building named for BYU''s first principal — a man who shaped the university''s values for generations.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'ASB (Abraham Smoot Building)', 40.2492, -111.6488, ST_SetSRID(ST_MakePoint(-111.6488, 40.2492), 4326)::geography, 35, 'historic', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Building Name Origins', 'history_community', 'short_text', '{"question":"This building is named after Abraham O. Smoot — the first mayor of Provo and a BYU benefactor. Why do you think universities name buildings after people? What criteria should be used? Look for other named buildings nearby and note what the honorees have in common.","correct_answer":null,"hints":["Buildings are often named after donors, founders, or leaders","Look for patterns: are they all from the same era?","Consider: should naming criteria change over time?","Some universities have renamed buildings — why?"]}', 5, 9, 3, false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_heritage, loc, task, 1, 'Next door, another building carries a name from Provo''s early days. Who was this person, and why does their name still stand?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Brigham Square (Karl Maeser Statue)', 40.2497, -111.6493, ST_SetSRID(ST_MakePoint(-111.6493, 40.2497), 4326)::geography, 25, 'historic', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Statue Analysis', 'history_community', 'data_collection', '{"question":"Examine the Karl Maeser statue. Record: material, approximate height, pose/posture, facial expression, clothing era, any inscriptions, and condition. What message does the sculptor want to convey? What does the placement location tell you about how the university values this person?","hints":["The material (bronze, stone, etc.) affects durability and cost","Pose conveys authority, warmth, action, or contemplation","Placement in the campus center suggests high importance","Read any plaque or inscription carefully"]}', 5, 9, 2, false, 'location_specific', 'historic', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_heritage, loc, task, 2, 'At the very center of campus, a figure in metal stands watch. What story does this statue tell about BYU''s values?');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'HBLL Library (heritage)', 40.2487, -111.6495, ST_SetSRID(ST_MakePoint(-111.6495, 40.2487), 4326)::geography, 35, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Modern vs Historic Comparison', 'history_community', 'team_debate', '{"question":"Compare the library (modern) with the Maeser Building (historic). As a team, debate: which building will be more valued by the university 100 years from now? Consider: architectural merit, historical significance, functionality, and emotional connection. Each team member argues a different position.","hints":["Historic buildings carry irreplaceable stories","Modern buildings serve current needs better","Some buildings gain value with age; others don''t","Consider: what makes a building worth preserving?"]}', 5, 9, 3, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_heritage, loc, task, 3, 'Old and new stand side by side on campus. At the modern library, debate which buildings will matter most in the next century.');

  loc := gen_random_uuid(); task := gen_random_uuid();
  INSERT INTO public.locations (id, name, latitude, longitude, coordinates, radius_meters, location_type, created_by) VALUES
    (loc, 'Museum of Art (heritage)', 40.2480, -111.6538, ST_SetSRID(ST_MakePoint(-111.6538, 40.2480), 4326)::geography, 40, 'campus', u_owner);
  INSERT INTO public.tasks (id, title, subject_domain, challenge_type, content, grade_range_min, grade_range_max, difficulty_level, is_library, location_dependency, location_type, created_by) VALUES
    (task, 'Heritage Timeline', 'history_community', 'sorting_ordering', '{"question":"Based on your observations today, put these BYU milestones in chronological order.","items":["Karl Maeser appointed as principal","Maeser Building constructed","BYU moved to current campus location","Library (HBLL) built","Museum of Art opened","Football stadium expanded"],"hints":["Maeser was appointed in 1876","The campus moved in the early 1900s","Most modern buildings are post-1960s","The museum is one of the newer major buildings"]}', 5, 9, 2, false, 'location_specific', 'campus', u_owner);
  INSERT INTO public.finds (hunt_id, location_id, task_id, sort_order, clue_text) VALUES
    (h_heritage, loc, task, 4, 'End at the building that celebrates visual history. Put everything you learned today in order — from BYU''s birth to the present.');

END $$;
