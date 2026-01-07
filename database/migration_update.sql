-- ============================================
-- LPPM Web System - Migration Script
-- Dari schema lama ke schema baru dengan tabel TIM
-- ============================================

-- ==================== STEP 1: Buat Tabel TIM ====================

CREATE TABLE tim (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_tim VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    ketua_id UUID NOT NULL REFERENCES dosen(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger untuk updated_at
CREATE TRIGGER update_tim_updated_at 
    BEFORE UPDATE ON tim 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Index
CREATE INDEX idx_tim_ketua ON tim(ketua_id);

-- Disable RLS
ALTER TABLE tim DISABLE ROW LEVEL SECURITY;


-- ==================== STEP 2: Tambah tim_id ke Proposal ====================

ALTER TABLE proposal 
ADD COLUMN tim_id UUID REFERENCES tim(id) ON DELETE RESTRICT;

-- Index
CREATE INDEX idx_proposal_tim ON proposal(tim_id);


-- ==================== STEP 3: Tambah tim_id ke Anggota Tim ====================

ALTER TABLE anggota_tim 
ADD COLUMN tim_id UUID REFERENCES tim(id) ON DELETE CASCADE;

-- Index
CREATE INDEX idx_anggota_tim_tim ON anggota_tim(tim_id);


-- ==================== STEP 4: Migrasi Data (JIKA ADA DATA) ====================
-- Jalankan bagian ini HANYA jika sudah ada data proposal dan anggota_tim

-- 4a. Buat tim untuk setiap proposal yang ada
INSERT INTO tim (nama_tim, deskripsi, ketua_id, created_at)
SELECT 
    CONCAT('Tim - ', LEFT(p.judul, 100)) as nama_tim,
    NULL as deskripsi,
    p.ketua_id,
    p.created_at
FROM proposal p;

-- 4b. Update proposal dengan tim_id
UPDATE proposal p
SET tim_id = t.id
FROM tim t
WHERE t.nama_tim = CONCAT('Tim - ', LEFT(p.judul, 100))
AND t.ketua_id = p.ketua_id;

-- 4c. Update anggota_tim dengan tim_id dari proposal
UPDATE anggota_tim at_table
SET tim_id = p.tim_id
FROM proposal p
WHERE at_table.proposal_id = p.id;


-- ==================== STEP 5: Hapus Kolom Lama & Tambah Constraint ====================
-- Jalankan SETELAH migrasi data berhasil

-- 5a. Hapus constraint unique lama
ALTER TABLE anggota_tim 
DROP CONSTRAINT IF EXISTS anggota_tim_proposal_id_user_id_key;

-- 5b. Hapus index lama
DROP INDEX IF EXISTS idx_anggota_tim_proposal;

-- 5c. Hapus kolom proposal_id dari anggota_tim
ALTER TABLE anggota_tim 
DROP COLUMN proposal_id;

-- 5d. Set tim_id NOT NULL di anggota_tim
ALTER TABLE anggota_tim 
ALTER COLUMN tim_id SET NOT NULL;

-- 5e. Tambah constraint unique baru
ALTER TABLE anggota_tim 
ADD CONSTRAINT anggota_tim_tim_id_user_id_key UNIQUE (tim_id, user_id);

-- 5f. Set tim_id NOT NULL di proposal (opsional, bisa NULL jika proposal tanpa tim)
-- ALTER TABLE proposal ALTER COLUMN tim_id SET NOT NULL;


-- ============================================
-- SELESAI
-- ============================================
