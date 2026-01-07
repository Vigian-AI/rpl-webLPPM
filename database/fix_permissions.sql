-- ============================================
-- Fix Permission untuk Tabel TIM
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Grant semua permission untuk tabel tim
GRANT ALL ON tim TO authenticated;
GRANT ALL ON tim TO anon;
GRANT ALL ON tim TO service_role;

-- Grant juga untuk sequence (jika ada)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Pastikan RLS disabled
ALTER TABLE tim DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Jika masih error, grant untuk semua tabel
-- ============================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
