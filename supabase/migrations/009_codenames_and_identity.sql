-- ── Migration 009: Codenames & Leaderboard Identity ──────────────
-- Adds a hunt-level setting for how players appear on leaderboards,
-- a codename column on play_sessions, and a pre-seeded codename pool.

-- 1. Add identity_mode to hunts
ALTER TABLE public.hunts
  ADD COLUMN identity_mode TEXT NOT NULL DEFAULT 'codename_assigned'
    CHECK (identity_mode IN ('codename_assigned', 'codename_chosen', 'real_name'));

COMMENT ON COLUMN public.hunts.identity_mode IS
  'How players appear on leaderboards: codename_assigned (random from pool), codename_chosen (player picks), real_name (display_name)';

-- 2. Add codename to play_sessions
ALTER TABLE public.play_sessions
  ADD COLUMN codename TEXT;

CREATE INDEX idx_play_sessions_codename ON public.play_sessions(hunt_id, codename);

-- 3. Create codename pool table
CREATE TABLE public.codename_pool (
  id SERIAL PRIMARY KEY,
  adjective TEXT NOT NULL,
  animal TEXT NOT NULL,
  codename TEXT GENERATED ALWAYS AS (adjective || ' ' || animal) STORED,
  UNIQUE (adjective, animal)
);

ALTER TABLE public.codename_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "codename_pool_read_all" ON public.codename_pool FOR SELECT USING (true);

-- 4. Seed 1000 codenames (adjective + animal combos)
-- 50 adjectives x 20 animals = 1000 unique combos
INSERT INTO public.codename_pool (adjective, animal) VALUES
-- Swift + animals
('Swift','Falcon'),('Swift','Otter'),('Swift','Jaguar'),('Swift','Hawk'),('Swift','Dolphin'),
('Swift','Fox'),('Swift','Lynx'),('Swift','Eagle'),('Swift','Gazelle'),('Swift','Cheetah'),
('Swift','Puma'),('Swift','Heron'),('Swift','Salmon'),('Swift','Marten'),('Swift','Osprey'),
('Swift','Viper'),('Swift','Mantis'),('Swift','Ibis'),('Swift','Cobra'),('Swift','Raven'),
-- Bold + animals
('Bold','Falcon'),('Bold','Otter'),('Bold','Jaguar'),('Bold','Hawk'),('Bold','Dolphin'),
('Bold','Fox'),('Bold','Lynx'),('Bold','Eagle'),('Bold','Gazelle'),('Bold','Cheetah'),
('Bold','Puma'),('Bold','Heron'),('Bold','Salmon'),('Bold','Marten'),('Bold','Osprey'),
('Bold','Viper'),('Bold','Mantis'),('Bold','Ibis'),('Bold','Cobra'),('Bold','Raven'),
-- Brave + animals
('Brave','Falcon'),('Brave','Otter'),('Brave','Jaguar'),('Brave','Hawk'),('Brave','Dolphin'),
('Brave','Fox'),('Brave','Lynx'),('Brave','Eagle'),('Brave','Gazelle'),('Brave','Cheetah'),
('Brave','Puma'),('Brave','Heron'),('Brave','Salmon'),('Brave','Marten'),('Brave','Osprey'),
('Brave','Viper'),('Brave','Mantis'),('Brave','Ibis'),('Brave','Cobra'),('Brave','Raven'),
-- Clever + animals
('Clever','Falcon'),('Clever','Otter'),('Clever','Jaguar'),('Clever','Hawk'),('Clever','Dolphin'),
('Clever','Fox'),('Clever','Lynx'),('Clever','Eagle'),('Clever','Gazelle'),('Clever','Cheetah'),
('Clever','Puma'),('Clever','Heron'),('Clever','Salmon'),('Clever','Marten'),('Clever','Osprey'),
('Clever','Viper'),('Clever','Mantis'),('Clever','Ibis'),('Clever','Cobra'),('Clever','Raven'),
-- Cosmic + animals
('Cosmic','Falcon'),('Cosmic','Otter'),('Cosmic','Jaguar'),('Cosmic','Hawk'),('Cosmic','Dolphin'),
('Cosmic','Fox'),('Cosmic','Lynx'),('Cosmic','Eagle'),('Cosmic','Gazelle'),('Cosmic','Cheetah'),
('Cosmic','Puma'),('Cosmic','Heron'),('Cosmic','Salmon'),('Cosmic','Marten'),('Cosmic','Osprey'),
('Cosmic','Viper'),('Cosmic','Mantis'),('Cosmic','Ibis'),('Cosmic','Cobra'),('Cosmic','Raven'),
-- Crimson + animals
('Crimson','Falcon'),('Crimson','Otter'),('Crimson','Jaguar'),('Crimson','Hawk'),('Crimson','Dolphin'),
('Crimson','Fox'),('Crimson','Lynx'),('Crimson','Eagle'),('Crimson','Gazelle'),('Crimson','Cheetah'),
('Crimson','Puma'),('Crimson','Heron'),('Crimson','Salmon'),('Crimson','Marten'),('Crimson','Osprey'),
('Crimson','Viper'),('Crimson','Mantis'),('Crimson','Ibis'),('Crimson','Cobra'),('Crimson','Raven'),
-- Crystal + animals
('Crystal','Falcon'),('Crystal','Otter'),('Crystal','Jaguar'),('Crystal','Hawk'),('Crystal','Dolphin'),
('Crystal','Fox'),('Crystal','Lynx'),('Crystal','Eagle'),('Crystal','Gazelle'),('Crystal','Cheetah'),
('Crystal','Puma'),('Crystal','Heron'),('Crystal','Salmon'),('Crystal','Marten'),('Crystal','Osprey'),
('Crystal','Viper'),('Crystal','Mantis'),('Crystal','Ibis'),('Crystal','Cobra'),('Crystal','Raven'),
-- Daring + animals
('Daring','Falcon'),('Daring','Otter'),('Daring','Jaguar'),('Daring','Hawk'),('Daring','Dolphin'),
('Daring','Fox'),('Daring','Lynx'),('Daring','Eagle'),('Daring','Gazelle'),('Daring','Cheetah'),
('Daring','Puma'),('Daring','Heron'),('Daring','Salmon'),('Daring','Marten'),('Daring','Osprey'),
('Daring','Viper'),('Daring','Mantis'),('Daring','Ibis'),('Daring','Cobra'),('Daring','Raven'),
-- Electric + animals
('Electric','Falcon'),('Electric','Otter'),('Electric','Jaguar'),('Electric','Hawk'),('Electric','Dolphin'),
('Electric','Fox'),('Electric','Lynx'),('Electric','Eagle'),('Electric','Gazelle'),('Electric','Cheetah'),
('Electric','Puma'),('Electric','Heron'),('Electric','Salmon'),('Electric','Marten'),('Electric','Osprey'),
('Electric','Viper'),('Electric','Mantis'),('Electric','Ibis'),('Electric','Cobra'),('Electric','Raven'),
-- Ember + animals
('Ember','Falcon'),('Ember','Otter'),('Ember','Jaguar'),('Ember','Hawk'),('Ember','Dolphin'),
('Ember','Fox'),('Ember','Lynx'),('Ember','Eagle'),('Ember','Gazelle'),('Ember','Cheetah'),
('Ember','Puma'),('Ember','Heron'),('Ember','Salmon'),('Ember','Marten'),('Ember','Osprey'),
('Ember','Viper'),('Ember','Mantis'),('Ember','Ibis'),('Ember','Cobra'),('Ember','Raven'),
-- Fierce + animals
('Fierce','Falcon'),('Fierce','Otter'),('Fierce','Jaguar'),('Fierce','Hawk'),('Fierce','Dolphin'),
('Fierce','Fox'),('Fierce','Lynx'),('Fierce','Eagle'),('Fierce','Gazelle'),('Fierce','Cheetah'),
('Fierce','Puma'),('Fierce','Heron'),('Fierce','Salmon'),('Fierce','Marten'),('Fierce','Osprey'),
('Fierce','Viper'),('Fierce','Mantis'),('Fierce','Ibis'),('Fierce','Cobra'),('Fierce','Raven'),
-- Frosty + animals
('Frosty','Falcon'),('Frosty','Otter'),('Frosty','Jaguar'),('Frosty','Hawk'),('Frosty','Dolphin'),
('Frosty','Fox'),('Frosty','Lynx'),('Frosty','Eagle'),('Frosty','Gazelle'),('Frosty','Cheetah'),
('Frosty','Puma'),('Frosty','Heron'),('Frosty','Salmon'),('Frosty','Marten'),('Frosty','Osprey'),
('Frosty','Viper'),('Frosty','Mantis'),('Frosty','Ibis'),('Frosty','Cobra'),('Frosty','Raven'),
-- Gentle + animals
('Gentle','Falcon'),('Gentle','Otter'),('Gentle','Jaguar'),('Gentle','Hawk'),('Gentle','Dolphin'),
('Gentle','Fox'),('Gentle','Lynx'),('Gentle','Eagle'),('Gentle','Gazelle'),('Gentle','Cheetah'),
('Gentle','Puma'),('Gentle','Heron'),('Gentle','Salmon'),('Gentle','Marten'),('Gentle','Osprey'),
('Gentle','Viper'),('Gentle','Mantis'),('Gentle','Ibis'),('Gentle','Cobra'),('Gentle','Raven'),
-- Golden + animals
('Golden','Falcon'),('Golden','Otter'),('Golden','Jaguar'),('Golden','Hawk'),('Golden','Dolphin'),
('Golden','Fox'),('Golden','Lynx'),('Golden','Eagle'),('Golden','Gazelle'),('Golden','Cheetah'),
('Golden','Puma'),('Golden','Heron'),('Golden','Salmon'),('Golden','Marten'),('Golden','Osprey'),
('Golden','Viper'),('Golden','Mantis'),('Golden','Ibis'),('Golden','Cobra'),('Golden','Raven'),
-- Hidden + animals
('Hidden','Falcon'),('Hidden','Otter'),('Hidden','Jaguar'),('Hidden','Hawk'),('Hidden','Dolphin'),
('Hidden','Fox'),('Hidden','Lynx'),('Hidden','Eagle'),('Hidden','Gazelle'),('Hidden','Cheetah'),
('Hidden','Puma'),('Hidden','Heron'),('Hidden','Salmon'),('Hidden','Marten'),('Hidden','Osprey'),
('Hidden','Viper'),('Hidden','Mantis'),('Hidden','Ibis'),('Hidden','Cobra'),('Hidden','Raven'),
-- Iron + animals
('Iron','Falcon'),('Iron','Otter'),('Iron','Jaguar'),('Iron','Hawk'),('Iron','Dolphin'),
('Iron','Fox'),('Iron','Lynx'),('Iron','Eagle'),('Iron','Gazelle'),('Iron','Cheetah'),
('Iron','Puma'),('Iron','Heron'),('Iron','Salmon'),('Iron','Marten'),('Iron','Osprey'),
('Iron','Viper'),('Iron','Mantis'),('Iron','Ibis'),('Iron','Cobra'),('Iron','Raven'),
-- Lucky + animals
('Lucky','Falcon'),('Lucky','Otter'),('Lucky','Jaguar'),('Lucky','Hawk'),('Lucky','Dolphin'),
('Lucky','Fox'),('Lucky','Lynx'),('Lucky','Eagle'),('Lucky','Gazelle'),('Lucky','Cheetah'),
('Lucky','Puma'),('Lucky','Heron'),('Lucky','Salmon'),('Lucky','Marten'),('Lucky','Osprey'),
('Lucky','Viper'),('Lucky','Mantis'),('Lucky','Ibis'),('Lucky','Cobra'),('Lucky','Raven'),
-- Lunar + animals
('Lunar','Falcon'),('Lunar','Otter'),('Lunar','Jaguar'),('Lunar','Hawk'),('Lunar','Dolphin'),
('Lunar','Fox'),('Lunar','Lynx'),('Lunar','Eagle'),('Lunar','Gazelle'),('Lunar','Cheetah'),
('Lunar','Puma'),('Lunar','Heron'),('Lunar','Salmon'),('Lunar','Marten'),('Lunar','Osprey'),
('Lunar','Viper'),('Lunar','Mantis'),('Lunar','Ibis'),('Lunar','Cobra'),('Lunar','Raven'),
-- Maple + animals
('Maple','Falcon'),('Maple','Otter'),('Maple','Jaguar'),('Maple','Hawk'),('Maple','Dolphin'),
('Maple','Fox'),('Maple','Lynx'),('Maple','Eagle'),('Maple','Gazelle'),('Maple','Cheetah'),
('Maple','Puma'),('Maple','Heron'),('Maple','Salmon'),('Maple','Marten'),('Maple','Osprey'),
('Maple','Viper'),('Maple','Mantis'),('Maple','Ibis'),('Maple','Cobra'),('Maple','Raven'),
-- Mighty + animals
('Mighty','Falcon'),('Mighty','Otter'),('Mighty','Jaguar'),('Mighty','Hawk'),('Mighty','Dolphin'),
('Mighty','Fox'),('Mighty','Lynx'),('Mighty','Eagle'),('Mighty','Gazelle'),('Mighty','Cheetah'),
('Mighty','Puma'),('Mighty','Heron'),('Mighty','Salmon'),('Mighty','Marten'),('Mighty','Osprey'),
('Mighty','Viper'),('Mighty','Mantis'),('Mighty','Ibis'),('Mighty','Cobra'),('Mighty','Raven'),
-- Misty + animals
('Misty','Falcon'),('Misty','Otter'),('Misty','Jaguar'),('Misty','Hawk'),('Misty','Dolphin'),
('Misty','Fox'),('Misty','Lynx'),('Misty','Eagle'),('Misty','Gazelle'),('Misty','Cheetah'),
('Misty','Puma'),('Misty','Heron'),('Misty','Salmon'),('Misty','Marten'),('Misty','Osprey'),
('Misty','Viper'),('Misty','Mantis'),('Misty','Ibis'),('Misty','Cobra'),('Misty','Raven'),
-- Neon + animals
('Neon','Falcon'),('Neon','Otter'),('Neon','Jaguar'),('Neon','Hawk'),('Neon','Dolphin'),
('Neon','Fox'),('Neon','Lynx'),('Neon','Eagle'),('Neon','Gazelle'),('Neon','Cheetah'),
('Neon','Puma'),('Neon','Heron'),('Neon','Salmon'),('Neon','Marten'),('Neon','Osprey'),
('Neon','Viper'),('Neon','Mantis'),('Neon','Ibis'),('Neon','Cobra'),('Neon','Raven'),
-- Noble + animals
('Noble','Falcon'),('Noble','Otter'),('Noble','Jaguar'),('Noble','Hawk'),('Noble','Dolphin'),
('Noble','Fox'),('Noble','Lynx'),('Noble','Eagle'),('Noble','Gazelle'),('Noble','Cheetah'),
('Noble','Puma'),('Noble','Heron'),('Noble','Salmon'),('Noble','Marten'),('Noble','Osprey'),
('Noble','Viper'),('Noble','Mantis'),('Noble','Ibis'),('Noble','Cobra'),('Noble','Raven'),
-- Phantom + animals
('Phantom','Falcon'),('Phantom','Otter'),('Phantom','Jaguar'),('Phantom','Hawk'),('Phantom','Dolphin'),
('Phantom','Fox'),('Phantom','Lynx'),('Phantom','Eagle'),('Phantom','Gazelle'),('Phantom','Cheetah'),
('Phantom','Puma'),('Phantom','Heron'),('Phantom','Salmon'),('Phantom','Marten'),('Phantom','Osprey'),
('Phantom','Viper'),('Phantom','Mantis'),('Phantom','Ibis'),('Phantom','Cobra'),('Phantom','Raven'),
-- Polar + animals
('Polar','Falcon'),('Polar','Otter'),('Polar','Jaguar'),('Polar','Hawk'),('Polar','Dolphin'),
('Polar','Fox'),('Polar','Lynx'),('Polar','Eagle'),('Polar','Gazelle'),('Polar','Cheetah'),
('Polar','Puma'),('Polar','Heron'),('Polar','Salmon'),('Polar','Marten'),('Polar','Osprey'),
('Polar','Viper'),('Polar','Mantis'),('Polar','Ibis'),('Polar','Cobra'),('Polar','Raven'),
-- Prism + animals
('Prism','Falcon'),('Prism','Otter'),('Prism','Jaguar'),('Prism','Hawk'),('Prism','Dolphin'),
('Prism','Fox'),('Prism','Lynx'),('Prism','Eagle'),('Prism','Gazelle'),('Prism','Cheetah'),
('Prism','Puma'),('Prism','Heron'),('Prism','Salmon'),('Prism','Marten'),('Prism','Osprey'),
('Prism','Viper'),('Prism','Mantis'),('Prism','Ibis'),('Prism','Cobra'),('Prism','Raven'),
-- Quick + animals
('Quick','Falcon'),('Quick','Otter'),('Quick','Jaguar'),('Quick','Hawk'),('Quick','Dolphin'),
('Quick','Fox'),('Quick','Lynx'),('Quick','Eagle'),('Quick','Gazelle'),('Quick','Cheetah'),
('Quick','Puma'),('Quick','Heron'),('Quick','Salmon'),('Quick','Marten'),('Quick','Osprey'),
('Quick','Viper'),('Quick','Mantis'),('Quick','Ibis'),('Quick','Cobra'),('Quick','Raven'),
-- Radiant + animals
('Radiant','Falcon'),('Radiant','Otter'),('Radiant','Jaguar'),('Radiant','Hawk'),('Radiant','Dolphin'),
('Radiant','Fox'),('Radiant','Lynx'),('Radiant','Eagle'),('Radiant','Gazelle'),('Radiant','Cheetah'),
('Radiant','Puma'),('Radiant','Heron'),('Radiant','Salmon'),('Radiant','Marten'),('Radiant','Osprey'),
('Radiant','Viper'),('Radiant','Mantis'),('Radiant','Ibis'),('Radiant','Cobra'),('Radiant','Raven'),
-- Rogue + animals
('Rogue','Falcon'),('Rogue','Otter'),('Rogue','Jaguar'),('Rogue','Hawk'),('Rogue','Dolphin'),
('Rogue','Fox'),('Rogue','Lynx'),('Rogue','Eagle'),('Rogue','Gazelle'),('Rogue','Cheetah'),
('Rogue','Puma'),('Rogue','Heron'),('Rogue','Salmon'),('Rogue','Marten'),('Rogue','Osprey'),
('Rogue','Viper'),('Rogue','Mantis'),('Rogue','Ibis'),('Rogue','Cobra'),('Rogue','Raven'),
-- Rustic + animals
('Rustic','Falcon'),('Rustic','Otter'),('Rustic','Jaguar'),('Rustic','Hawk'),('Rustic','Dolphin'),
('Rustic','Fox'),('Rustic','Lynx'),('Rustic','Eagle'),('Rustic','Gazelle'),('Rustic','Cheetah'),
('Rustic','Puma'),('Rustic','Heron'),('Rustic','Salmon'),('Rustic','Marten'),('Rustic','Osprey'),
('Rustic','Viper'),('Rustic','Mantis'),('Rustic','Ibis'),('Rustic','Cobra'),('Rustic','Raven'),
-- Shadow + animals
('Shadow','Falcon'),('Shadow','Otter'),('Shadow','Jaguar'),('Shadow','Hawk'),('Shadow','Dolphin'),
('Shadow','Fox'),('Shadow','Lynx'),('Shadow','Eagle'),('Shadow','Gazelle'),('Shadow','Cheetah'),
('Shadow','Puma'),('Shadow','Heron'),('Shadow','Salmon'),('Shadow','Marten'),('Shadow','Osprey'),
('Shadow','Viper'),('Shadow','Mantis'),('Shadow','Ibis'),('Shadow','Cobra'),('Shadow','Raven'),
-- Silent + animals
('Silent','Falcon'),('Silent','Otter'),('Silent','Jaguar'),('Silent','Hawk'),('Silent','Dolphin'),
('Silent','Fox'),('Silent','Lynx'),('Silent','Eagle'),('Silent','Gazelle'),('Silent','Cheetah'),
('Silent','Puma'),('Silent','Heron'),('Silent','Salmon'),('Silent','Marten'),('Silent','Osprey'),
('Silent','Viper'),('Silent','Mantis'),('Silent','Ibis'),('Silent','Cobra'),('Silent','Raven'),
-- Silver + animals
('Silver','Falcon'),('Silver','Otter'),('Silver','Jaguar'),('Silver','Hawk'),('Silver','Dolphin'),
('Silver','Fox'),('Silver','Lynx'),('Silver','Eagle'),('Silver','Gazelle'),('Silver','Cheetah'),
('Silver','Puma'),('Silver','Heron'),('Silver','Salmon'),('Silver','Marten'),('Silver','Osprey'),
('Silver','Viper'),('Silver','Mantis'),('Silver','Ibis'),('Silver','Cobra'),('Silver','Raven'),
-- Solar + animals
('Solar','Falcon'),('Solar','Otter'),('Solar','Jaguar'),('Solar','Hawk'),('Solar','Dolphin'),
('Solar','Fox'),('Solar','Lynx'),('Solar','Eagle'),('Solar','Gazelle'),('Solar','Cheetah'),
('Solar','Puma'),('Solar','Heron'),('Solar','Salmon'),('Solar','Marten'),('Solar','Osprey'),
('Solar','Viper'),('Solar','Mantis'),('Solar','Ibis'),('Solar','Cobra'),('Solar','Raven'),
-- Sonic + animals
('Sonic','Falcon'),('Sonic','Otter'),('Sonic','Jaguar'),('Sonic','Hawk'),('Sonic','Dolphin'),
('Sonic','Fox'),('Sonic','Lynx'),('Sonic','Eagle'),('Sonic','Gazelle'),('Sonic','Cheetah'),
('Sonic','Puma'),('Sonic','Heron'),('Sonic','Salmon'),('Sonic','Marten'),('Sonic','Osprey'),
('Sonic','Viper'),('Sonic','Mantis'),('Sonic','Ibis'),('Sonic','Cobra'),('Sonic','Raven'),
-- Steady + animals
('Steady','Falcon'),('Steady','Otter'),('Steady','Jaguar'),('Steady','Hawk'),('Steady','Dolphin'),
('Steady','Fox'),('Steady','Lynx'),('Steady','Eagle'),('Steady','Gazelle'),('Steady','Cheetah'),
('Steady','Puma'),('Steady','Heron'),('Steady','Salmon'),('Steady','Marten'),('Steady','Osprey'),
('Steady','Viper'),('Steady','Mantis'),('Steady','Ibis'),('Steady','Cobra'),('Steady','Raven'),
-- Stellar + animals
('Stellar','Falcon'),('Stellar','Otter'),('Stellar','Jaguar'),('Stellar','Hawk'),('Stellar','Dolphin'),
('Stellar','Fox'),('Stellar','Lynx'),('Stellar','Eagle'),('Stellar','Gazelle'),('Stellar','Cheetah'),
('Stellar','Puma'),('Stellar','Heron'),('Stellar','Salmon'),('Stellar','Marten'),('Stellar','Osprey'),
('Stellar','Viper'),('Stellar','Mantis'),('Stellar','Ibis'),('Stellar','Cobra'),('Stellar','Raven'),
-- Storm + animals
('Storm','Falcon'),('Storm','Otter'),('Storm','Jaguar'),('Storm','Hawk'),('Storm','Dolphin'),
('Storm','Fox'),('Storm','Lynx'),('Storm','Eagle'),('Storm','Gazelle'),('Storm','Cheetah'),
('Storm','Puma'),('Storm','Heron'),('Storm','Salmon'),('Storm','Marten'),('Storm','Osprey'),
('Storm','Viper'),('Storm','Mantis'),('Storm','Ibis'),('Storm','Cobra'),('Storm','Raven'),
-- Tidal + animals
('Tidal','Falcon'),('Tidal','Otter'),('Tidal','Jaguar'),('Tidal','Hawk'),('Tidal','Dolphin'),
('Tidal','Fox'),('Tidal','Lynx'),('Tidal','Eagle'),('Tidal','Gazelle'),('Tidal','Cheetah'),
('Tidal','Puma'),('Tidal','Heron'),('Tidal','Salmon'),('Tidal','Marten'),('Tidal','Osprey'),
('Tidal','Viper'),('Tidal','Mantis'),('Tidal','Ibis'),('Tidal','Cobra'),('Tidal','Raven'),
-- Topaz + animals
('Topaz','Falcon'),('Topaz','Otter'),('Topaz','Jaguar'),('Topaz','Hawk'),('Topaz','Dolphin'),
('Topaz','Fox'),('Topaz','Lynx'),('Topaz','Eagle'),('Topaz','Gazelle'),('Topaz','Cheetah'),
('Topaz','Puma'),('Topaz','Heron'),('Topaz','Salmon'),('Topaz','Marten'),('Topaz','Osprey'),
('Topaz','Viper'),('Topaz','Mantis'),('Topaz','Ibis'),('Topaz','Cobra'),('Topaz','Raven'),
-- Verdant + animals
('Verdant','Falcon'),('Verdant','Otter'),('Verdant','Jaguar'),('Verdant','Hawk'),('Verdant','Dolphin'),
('Verdant','Fox'),('Verdant','Lynx'),('Verdant','Eagle'),('Verdant','Gazelle'),('Verdant','Cheetah'),
('Verdant','Puma'),('Verdant','Heron'),('Verdant','Salmon'),('Verdant','Marten'),('Verdant','Osprey'),
('Verdant','Viper'),('Verdant','Mantis'),('Verdant','Ibis'),('Verdant','Cobra'),('Verdant','Raven'),
-- Wild + animals
('Wild','Falcon'),('Wild','Otter'),('Wild','Jaguar'),('Wild','Hawk'),('Wild','Dolphin'),
('Wild','Fox'),('Wild','Lynx'),('Wild','Eagle'),('Wild','Gazelle'),('Wild','Cheetah'),
('Wild','Puma'),('Wild','Heron'),('Wild','Salmon'),('Wild','Marten'),('Wild','Osprey'),
('Wild','Viper'),('Wild','Mantis'),('Wild','Ibis'),('Wild','Cobra'),('Wild','Raven'),
-- Zen + animals
('Zen','Falcon'),('Zen','Otter'),('Zen','Jaguar'),('Zen','Hawk'),('Zen','Dolphin'),
('Zen','Fox'),('Zen','Lynx'),('Zen','Eagle'),('Zen','Gazelle'),('Zen','Cheetah'),
('Zen','Puma'),('Zen','Heron'),('Zen','Salmon'),('Zen','Marten'),('Zen','Osprey'),
('Zen','Viper'),('Zen','Mantis'),('Zen','Ibis'),('Zen','Cobra'),('Zen','Raven'),
-- Amber + animals
('Amber','Falcon'),('Amber','Otter'),('Amber','Jaguar'),('Amber','Hawk'),('Amber','Dolphin'),
('Amber','Fox'),('Amber','Lynx'),('Amber','Eagle'),('Amber','Gazelle'),('Amber','Cheetah'),
('Amber','Puma'),('Amber','Heron'),('Amber','Salmon'),('Amber','Marten'),('Amber','Osprey'),
('Amber','Viper'),('Amber','Mantis'),('Amber','Ibis'),('Amber','Cobra'),('Amber','Raven'),
-- Azure + animals
('Azure','Falcon'),('Azure','Otter'),('Azure','Jaguar'),('Azure','Hawk'),('Azure','Dolphin'),
('Azure','Fox'),('Azure','Lynx'),('Azure','Eagle'),('Azure','Gazelle'),('Azure','Cheetah'),
('Azure','Puma'),('Azure','Heron'),('Azure','Salmon'),('Azure','Marten'),('Azure','Osprey'),
('Azure','Viper'),('Azure','Mantis'),('Azure','Ibis'),('Azure','Cobra'),('Azure','Raven'),
-- Blazing + animals
('Blazing','Falcon'),('Blazing','Otter'),('Blazing','Jaguar'),('Blazing','Hawk'),('Blazing','Dolphin'),
('Blazing','Fox'),('Blazing','Lynx'),('Blazing','Eagle'),('Blazing','Gazelle'),('Blazing','Cheetah'),
('Blazing','Puma'),('Blazing','Heron'),('Blazing','Salmon'),('Blazing','Marten'),('Blazing','Osprey'),
('Blazing','Viper'),('Blazing','Mantis'),('Blazing','Ibis'),('Blazing','Cobra'),('Blazing','Raven');

-- 5. Function to assign a random codename not yet used in this hunt
CREATE OR REPLACE FUNCTION public.assign_random_codename(p_hunt_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_codename TEXT;
BEGIN
  SELECT cp.codename INTO v_codename
  FROM public.codename_pool cp
  WHERE cp.codename NOT IN (
    SELECT ps.codename
    FROM public.play_sessions ps
    WHERE ps.hunt_id = p_hunt_id
      AND ps.codename IS NOT NULL
  )
  ORDER BY random()
  LIMIT 1;

  -- Fallback if all 1000 are used (very unlikely)
  IF v_codename IS NULL THEN
    v_codename := 'Explorer ' || floor(random() * 9000 + 1000)::int;
  END IF;

  RETURN v_codename;
END;
$$;
