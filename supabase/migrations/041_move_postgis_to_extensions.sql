-- ══════════════════════════════════════════════════════════════
-- Migration 041: Move PostGIS from public → extensions schema
--
-- PostGIS in the public schema registers 645+ functions that
-- PostgREST must introspect, causing "stack depth limit exceeded"
-- on EVERY REST API call. Moving it to extensions fixes this.
--
-- Strategy:
--   1. Save locations.coordinates data as text (WKT)
--   2. Drop the geography column
--   3. Drop PostGIS from public, recreate in extensions
--   4. Restore the geography column and data
--   5. Rebuild spatial index
-- ══════════════════════════════════════════════════════════════

BEGIN;

-- Step 1: Save coordinates as WKT text in a temp column
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS coordinates_wkt TEXT;
UPDATE public.locations
  SET coordinates_wkt = ST_AsText(coordinates)
  WHERE coordinates IS NOT NULL;

-- Step 2: Drop the geography column (and its index)
DROP INDEX IF EXISTS idx_locations_coordinates;
ALTER TABLE public.locations DROP COLUMN IF EXISTS coordinates;

-- Step 3: Drop PostGIS from public, recreate in extensions
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION postgis SCHEMA extensions;

-- Step 4: Restore the geography column using extensions-schema PostGIS
ALTER TABLE public.locations
  ADD COLUMN coordinates extensions.geography(Point, 4326);

-- Restore data from WKT
UPDATE public.locations
  SET coordinates = extensions.ST_GeogFromText(coordinates_wkt)
  WHERE coordinates_wkt IS NOT NULL;

-- Drop the temporary column
ALTER TABLE public.locations DROP COLUMN IF EXISTS coordinates_wkt;

-- Step 5: Rebuild spatial index
CREATE INDEX IF NOT EXISTS idx_locations_coordinates
  ON public.locations USING GIST (coordinates);

COMMIT;
