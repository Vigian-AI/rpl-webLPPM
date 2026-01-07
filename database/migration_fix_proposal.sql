-- Migration: Fix proposal table columns
-- Run this in Supabase SQL Editor

-- Rename columns to match TypeScript types
-- First check if old columns exist and rename them

-- Rename submitted_at to tanggal_submit (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposal' AND column_name = 'submitted_at') THEN
    ALTER TABLE proposal RENAME COLUMN submitted_at TO tanggal_submit;
  END IF;
END $$;

-- Rename reviewed_at to tanggal_review (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposal' AND column_name = 'reviewed_at') THEN
    ALTER TABLE proposal RENAME COLUMN reviewed_at TO tanggal_review;
  END IF;
END $$;

-- Rename catatan_reviewer to catatan_evaluasi (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposal' AND column_name = 'catatan_reviewer') THEN
    ALTER TABLE proposal RENAME COLUMN catatan_reviewer TO catatan_evaluasi;
  END IF;
END $$;

-- Rename reviewed_by to reviewer_id (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposal' AND column_name = 'reviewed_by') THEN
    ALTER TABLE proposal RENAME COLUMN reviewed_by TO reviewer_id;
  END IF;
END $$;

-- Add tanggal_submit if not exists
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS tanggal_submit TIMESTAMPTZ;

-- Add tanggal_review if not exists
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS tanggal_review TIMESTAMPTZ;

-- Add catatan_evaluasi if not exists
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS catatan_evaluasi TEXT;

-- Add reviewer_id if not exists
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(id);

-- Add dokumen_proposal_url if not exists
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS dokumen_proposal_url TEXT;

-- Add tim_id if not exists (with temporary nullable for migration)
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS tim_id UUID REFERENCES tim(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposal_tim ON proposal(tim_id);
CREATE INDEX IF NOT EXISTS idx_proposal_status ON proposal(status_proposal);
CREATE INDEX IF NOT EXISTS idx_proposal_ketua ON proposal(ketua_id);

-- Grant permissions
GRANT ALL ON proposal TO authenticated;
GRANT ALL ON proposal TO anon;
GRANT ALL ON proposal TO service_role;
