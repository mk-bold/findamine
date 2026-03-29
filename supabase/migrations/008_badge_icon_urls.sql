-- Set icon_url for all 42 badge types
UPDATE public.badge_types SET icon_url = '/badges/' || code || '.png';
