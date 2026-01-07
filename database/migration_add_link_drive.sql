-- Migration: Add link_drive column to proposal table
-- Run this in Supabase SQL Editor

-- Add link_drive column if not exists
ALTER TABLE proposal ADD COLUMN IF NOT EXISTS link_drive TEXT;

-- Add comment
COMMENT ON COLUMN proposal.link_drive IS 'Google Drive link for proposal documents';

-- ============================================
-- STORAGE BUCKET SETUP
-- Run this in Supabase SQL Editor to create the documents bucket
-- ============================================

-- Create storage bucket for documents (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  true,
  10485760,  -- 10MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Enable public access policy for the documents bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

-- Enable authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Enable users to update their own uploads
CREATE POLICY "Users can update own uploads" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'documents' AND auth.uid()::text = owner::text);

-- Enable users to delete their own uploads
CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = owner::text);
