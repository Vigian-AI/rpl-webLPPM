-- Migration: Add is_archived column to tim table
-- Run this in Supabase SQL Editor

-- Add is_archived column to tim table
ALTER TABLE tim ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tim_is_archived ON tim(is_archived);

-- Update existing teams to have is_archived = false
UPDATE tim SET is_archived = FALSE WHERE is_archived IS NULL;
