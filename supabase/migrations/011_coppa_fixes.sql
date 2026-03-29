-- ── Migration 011: COPPA Compliance Fixes ────────────────────
-- Adds pending_consent status, fixes consent flow

-- 1. Add pending_consent to user status check constraint
-- First drop the old constraint, then add updated one
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE public.users ADD CONSTRAINT users_status_check
  CHECK (status IN ('active', 'inactive', 'suspended', 'banned', 'pending_consent'));

-- 2. Add verification_token to consent_records for COPPA email flow
ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS verification_token TEXT,
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_consent_coppa_token
  ON public.consent_records(verification_token)
  WHERE consent_type = 'parental' AND verification_token IS NOT NULL;

-- 3. Ensure parent_child_links has a verified column
ALTER TABLE public.parent_child_links
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
