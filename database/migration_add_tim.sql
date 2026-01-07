-- ============================================
-- LPPM Web System - Migration Script
-- Add Tim (Team) table and update relationships
-- ============================================

-- ==================== STEP 1: Create Tim Table ====================
-- Tabel untuk menyimpan tim penelitian yang terpisah dari proposal

CREATE TABLE IF NOT EXISTS tim (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_tim VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    ketua_id UUID NOT NULL REFERENCES dosen(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk tabel tim
CREATE INDEX IF NOT EXISTS idx_tim_ketua ON tim(ketua_id);


-- ==================== STEP 2: Add tim_id to proposal ====================
-- Menambahkan kolom tim_id ke tabel proposal

ALTER TABLE proposal 
ADD COLUMN IF NOT EXISTS tim_id UUID REFERENCES tim(id) ON DELETE RESTRICT;

-- Index untuk tim_id di proposal
CREATE INDEX IF NOT EXISTS idx_proposal_tim ON proposal(tim_id);


-- ==================== STEP 3: Modify anggota_tim table ====================
-- Mengubah referensi dari proposal_id ke tim_id

-- 3a. Tambah kolom tim_id ke anggota_tim (jika belum ada)
ALTER TABLE anggota_tim 
ADD COLUMN IF NOT EXISTS tim_id UUID REFERENCES tim(id) ON DELETE CASCADE;

-- 3b. Index untuk tim_id di anggota_tim
CREATE INDEX IF NOT EXISTS idx_anggota_tim_tim ON anggota_tim(tim_id);


-- ==================== STEP 4: Trigger for updated_at on tim ====================

CREATE OR REPLACE TRIGGER update_tim_updated_at
    BEFORE UPDATE ON tim
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ==================== STEP 5: Migration Script for Existing Data ====================
-- Jalankan script ini JIKA ada data proposal dan anggota_tim yang sudah ada
-- Script ini akan:
-- 1. Membuat tim baru untuk setiap proposal yang ada
-- 2. Memigrasikan anggota_tim ke tim baru

-- Uncomment dan jalankan jika ada data yang perlu dimigrasi:

/*
-- Membuat tim untuk setiap proposal yang ada
INSERT INTO tim (id, nama_tim, deskripsi, ketua_id, created_at, updated_at)
SELECT 
    uuid_generate_v4() as id,
    CONCAT('Tim - ', LEFT(p.judul, 50)) as nama_tim,
    NULL as deskripsi,
    p.ketua_id,
    p.created_at,
    p.updated_at
FROM proposal p
WHERE NOT EXISTS (SELECT 1 FROM tim t WHERE t.ketua_id = p.ketua_id AND t.nama_tim = CONCAT('Tim - ', LEFT(p.judul, 50)));

-- Update proposal dengan tim_id yang baru dibuat
UPDATE proposal p
SET tim_id = (
    SELECT t.id FROM tim t 
    WHERE t.nama_tim = CONCAT('Tim - ', LEFT(p.judul, 50)) 
    AND t.ketua_id = p.ketua_id
    LIMIT 1
)
WHERE p.tim_id IS NULL;

-- Update anggota_tim dengan tim_id dari proposal
UPDATE anggota_tim at
SET tim_id = p.tim_id
FROM proposal p
WHERE at.proposal_id = p.id AND at.tim_id IS NULL;
*/


-- ==================== STEP 6: Drop old column (OPTIONAL - AFTER MIGRATION) ====================
-- HANYA jalankan setelah memastikan migrasi data berhasil!
-- Ini akan menghapus kolom proposal_id dari anggota_tim

/*
-- Hapus constraint unique lama
ALTER TABLE anggota_tim DROP CONSTRAINT IF EXISTS anggota_tim_proposal_id_user_id_key;

-- Hapus index lama
DROP INDEX IF EXISTS idx_anggota_tim_proposal;

-- Hapus kolom proposal_id
ALTER TABLE anggota_tim DROP COLUMN IF EXISTS proposal_id;

-- Tambah constraint unique baru
ALTER TABLE anggota_tim ADD CONSTRAINT anggota_tim_tim_id_user_id_key UNIQUE (tim_id, user_id);

-- Ubah tim_id menjadi NOT NULL (setelah migrasi data)
ALTER TABLE anggota_tim ALTER COLUMN tim_id SET NOT NULL;

-- Ubah proposal.tim_id menjadi NOT NULL (setelah migrasi data)
ALTER TABLE proposal ALTER COLUMN tim_id SET NOT NULL;
*/


-- ==================== VERIFICATION QUERIES ====================
-- Jalankan query berikut untuk memverifikasi struktur tabel

-- Cek struktur tabel tim
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'tim';

-- Cek struktur tabel proposal (harus ada tim_id)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'proposal';

-- Cek struktur tabel anggota_tim (harus ada tim_id)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'anggota_tim';
