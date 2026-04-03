-- ══════════════════════════════════════════════════════════════
-- Migration 036: Seed personality archetypes + assessment config
--
-- Seeds the Big 5 personality dimensions and a 10-item
-- assessment questionnaire (TIPI — Ten Item Personality Inventory)
-- ══════════════════════════════════════════════════════════════

-- Seed personality archetypes (Big 5 dimensions)
INSERT INTO public.personality_archetypes (id, code, name, description, traits) VALUES
  (gen_random_uuid(), 'openness', 'Openness to Experience', 'Curious, creative, open to new ideas and experiences.', '{"dimension": "openness", "high_label": "Inventive/Curious", "low_label": "Consistent/Cautious"}'),
  (gen_random_uuid(), 'conscientiousness', 'Conscientiousness', 'Organized, dependable, disciplined, goal-oriented.', '{"dimension": "conscientiousness", "high_label": "Efficient/Organized", "low_label": "Flexible/Spontaneous"}'),
  (gen_random_uuid(), 'extraversion', 'Extraversion', 'Outgoing, energetic, enjoys social interaction.', '{"dimension": "extraversion", "high_label": "Outgoing/Energetic", "low_label": "Reserved/Reflective"}'),
  (gen_random_uuid(), 'agreeableness', 'Agreeableness', 'Cooperative, helpful, trusting of others.', '{"dimension": "agreeableness", "high_label": "Friendly/Compassionate", "low_label": "Challenging/Analytical"}'),
  (gen_random_uuid(), 'neuroticism', 'Emotional Stability', 'Calm, even-tempered, resilient under stress.', '{"dimension": "neuroticism", "high_label": "Sensitive/Nervous", "low_label": "Secure/Confident"}')
ON CONFLICT DO NOTHING;

-- Add hint_ratings table for Feature 13/14
CREATE TABLE IF NOT EXISTS public.hint_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  hint_cache_id UUID REFERENCES public.ai_hint_cache(id),
  find_id UUID REFERENCES public.finds(id),
  rating INT NOT NULL CHECK (rating IN (-1, 1)), -- thumbs down / thumbs up
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hint_ratings_cache ON public.hint_ratings(hint_cache_id);
ALTER TABLE public.hint_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hint_ratings_select" ON public.hint_ratings FOR SELECT USING (true);
CREATE POLICY "hint_ratings_insert" ON public.hint_ratings FOR INSERT WITH CHECK (true);

-- Add hunt_ratings table for Feature 20
CREATE TABLE IF NOT EXISTS public.hunt_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID NOT NULL REFERENCES public.hunts(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(hunt_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hunt_ratings_hunt ON public.hunt_ratings(hunt_id);
ALTER TABLE public.hunt_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hunt_ratings_select" ON public.hunt_ratings FOR SELECT USING (true);
CREATE POLICY "hunt_ratings_insert" ON public.hunt_ratings FOR INSERT WITH CHECK (true);

-- Add technique_reviews table for Feature 15
CREATE TABLE IF NOT EXISTS public.technique_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  find_completion_id UUID REFERENCES public.find_completions(id),
  hunt_id UUID REFERENCES public.hunts(id),
  strategies TEXT[] DEFAULT '{}',
  confidence INT CHECK (confidence BETWEEN 1 AND 3),
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.technique_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "technique_reviews_select" ON public.technique_reviews FOR SELECT USING (true);
CREATE POLICY "technique_reviews_insert" ON public.technique_reviews FOR INSERT WITH CHECK (true);

-- Add user_accommodations table for Feature 23
CREATE TABLE IF NOT EXISTS public.user_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  accommodation_type TEXT NOT NULL CHECK (accommodation_type IN (
    'extended_time', 'text_to_speech', 'simplified_language',
    'larger_touch_targets', 'reduced_visual_complexity',
    'keyboard_navigation', 'caption_video', 'dyslexia_font',
    'high_contrast', 'reduced_motion', 'word_prediction', 'speech_to_text'
  )),
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  set_by UUID REFERENCES public.users(id), -- teacher who set it
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, accommodation_type)
);

ALTER TABLE public.user_accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accommodations_select" ON public.user_accommodations FOR SELECT USING (true);
CREATE POLICY "accommodations_insert" ON public.user_accommodations FOR INSERT WITH CHECK (true);
CREATE POLICY "accommodations_update" ON public.user_accommodations FOR UPDATE USING (true);
