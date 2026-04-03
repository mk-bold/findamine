-- ══════════════════════════════════════════════════════════════
-- Migration 035: Per-stop pedagogical settings
--
-- Adds scaffolding_level and reading_check to finds table.
-- These let creators configure each stop independently.
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.finds
  ADD COLUMN IF NOT EXISTS scaffolding_level TEXT DEFAULT 'medium'
    CHECK (scaffolding_level IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS reading_check JSONB DEFAULT NULL;
    -- reading_check format: { "enabled": true, "questions": [{ "question": "...", "options": [...], "correct_answer": "..." }] }
