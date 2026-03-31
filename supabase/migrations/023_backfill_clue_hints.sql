-- ══════════════════════════════════════════════════════════════
-- Migration 023: Backfill clue_hints on existing finds
--
-- Adds 3 progressive hints to every find that has clue_text.
-- Hints are derived from the associated location name and type.
-- Generic hints for finds without specific location data.
-- ══════════════════════════════════════════════════════════════

-- Add clue hints to all finds that have clue_text but no clue_hints
UPDATE public.finds
SET clue_hints = jsonb_build_array(
  'Look around for landmarks mentioned in the clue. The answer is in the details.',
  CASE
    WHEN locations.location_type = 'campus' THEN 'You are looking for something on campus. Check building names and signs nearby.'
    WHEN locations.location_type = 'water' THEN 'Head toward the nearest body of water. The location is close to the water''s edge.'
    WHEN locations.location_type = 'trail' THEN 'Follow the trail and look for a distinctive feature or marker.'
    WHEN locations.location_type = 'historic' THEN 'Look for an older building or monument. Check for plaques or historical markers.'
    WHEN locations.location_type = 'urban' THEN 'Look at the storefronts and street signs. The location is on this block.'
    WHEN locations.location_type = 'park' THEN 'You are heading to a spot in the park. Look for a clearing or gathering area.'
    ELSE 'Re-read the clue carefully. One detail tells you exactly where to go.'
  END,
  'You are very close! The location is called "' || COALESCE(locations.name, 'your destination') || '". Look for it within 50 meters of you.'
)
FROM public.locations
WHERE finds.location_id = locations.id
  AND finds.clue_text IS NOT NULL
  AND finds.deleted_at IS NULL
  AND (finds.clue_hints IS NULL OR finds.clue_hints = '[]'::jsonb);
