-- Migration: Add dokumen_url column to surat_pencairan table
-- Run this in Supabase SQL Editor

-- Add dokumen_url column if not exists
ALTER TABLE surat_pencairan ADD COLUMN IF NOT EXISTS dokumen_url TEXT;

-- Add comment
COMMENT ON COLUMN surat_pencairan.dokumen_url IS 'URL to the uploaded disbursement letter PDF document';

-- ============================================
-- STORAGE POLICY FOR SURAT PENCAIRAN DOCUMENTS
-- This project uses custom auth, so we need public policies
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
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Drop existing policies if they exist (to recreate with correct permissions)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- Enable public read access for documents bucket
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

-- Enable public insert access for documents bucket
CREATE POLICY "Public Insert Access" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documents');

-- Enable public update access for documents bucket
CREATE POLICY "Public Update Access" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'documents');

-- Enable public delete access for documents bucket
CREATE POLICY "Public Delete Access" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'documents');
