-- ============================================
-- LPPM Web System - Database Schema
-- PostgreSQL / Supabase (Simple Auth)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUM TYPES ====================

CREATE TYPE user_role AS ENUM ('admin', 'dosen', 'mahasiswa');
CREATE TYPE status_anggota AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE status_proposal AS ENUM ('draft', 'submitted', 'review', 'revision', 'accepted', 'rejected', 'completed');

-- ==================== CORE TABLES ====================

-- Users table (Simple Auth - username & password)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'dosen',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin table
CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    nip VARCHAR(50),
    jabatan VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dosen table
CREATE TABLE dosen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    nidn VARCHAR(20) NOT NULL,
    nip VARCHAR(50),
    fakultas VARCHAR(100),
    prodi VARCHAR(100),
    jabatan_fungsional VARCHAR(100),
    bidang_keahlian VARCHAR(255),
    email_institusi VARCHAR(255),
    no_telepon VARCHAR(20),
    alamat TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mahasiswa table
CREATE TABLE mahasiswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    nim VARCHAR(20) NOT NULL,
    fakultas VARCHAR(100),
    prodi VARCHAR(100),
    angkatan INTEGER,
    email_institusi VARCHAR(255),
    no_telepon VARCHAR(20),
    alamat TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== GRANT & PROPOSAL TABLES ====================

-- Master Hibah (Grant Programs)
CREATE TABLE master_hibah (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_hibah VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    jenis VARCHAR(100) NOT NULL,
    tahun_anggaran INTEGER NOT NULL,
    anggaran_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    anggaran_per_proposal DECIMAL(15,2),
    tanggal_buka DATE NOT NULL,
    tanggal_tutup DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    persyaratan TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tim (Research Teams)
CREATE TABLE tim (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_tim VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    ketua_id UUID NOT NULL REFERENCES dosen(id) ON DELETE RESTRICT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals
CREATE TABLE proposal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hibah_id UUID NOT NULL REFERENCES master_hibah(id) ON DELETE RESTRICT,
    tim_id UUID NOT NULL REFERENCES tim(id) ON DELETE RESTRICT,
    ketua_id UUID NOT NULL REFERENCES dosen(id) ON DELETE RESTRICT,
    judul VARCHAR(500) NOT NULL,
    abstrak TEXT,
    latar_belakang TEXT,
    tujuan TEXT,
    metodologi TEXT,
    luaran TEXT,
    anggaran_diajukan DECIMAL(15,2),
    anggaran_disetujui DECIMAL(15,2),
    dokumen_proposal_url TEXT,
    status_proposal status_proposal DEFAULT 'draft',
    catatan_evaluasi TEXT,
    tanggal_submit TIMESTAMPTZ,
    tanggal_review TIMESTAMPTZ,
    reviewer_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members (Anggota Tim)
CREATE TABLE anggota_tim (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tim_id UUID NOT NULL REFERENCES tim(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    peran VARCHAR(100) NOT NULL DEFAULT 'Anggota',
    status status_anggota DEFAULT 'pending',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tim_id, user_id)
);

-- ==================== DOCUMENT & DISBURSEMENT TABLES ====================

-- Documents
CREATE TABLE dokumen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposal(id) ON DELETE CASCADE,
    nama_dokumen VARCHAR(255) NOT NULL,
    jenis_dokumen VARCHAR(100),
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disbursement Letters (Surat Pencairan)
CREATE TABLE surat_pencairan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposal(id) ON DELETE RESTRICT,
    nomor_surat VARCHAR(100) UNIQUE NOT NULL,
    tanggal_surat DATE NOT NULL,
    jumlah_dana DECIMAL(15,2) NOT NULL,
    keterangan TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ANNOUNCEMENT & LOG TABLES ====================

-- Announcements
CREATE TABLE pengumuman (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul VARCHAR(255) NOT NULL,
    konten TEXT NOT NULL,
    kategori VARCHAR(50),
    is_published BOOLEAN DEFAULT FALSE,
    tanggal_publish TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE log_aktivitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    aksi VARCHAR(100) NOT NULL,
    tabel_terkait VARCHAR(50),
    record_id UUID,
    detail JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_proposal_status ON proposal(status_proposal);
CREATE INDEX idx_proposal_hibah ON proposal(hibah_id);
CREATE INDEX idx_proposal_ketua ON proposal(ketua_id);
CREATE INDEX idx_proposal_tim ON proposal(tim_id);
CREATE INDEX idx_anggota_tim_tim ON anggota_tim(tim_id);
CREATE INDEX idx_anggota_tim_user ON anggota_tim(user_id);
CREATE INDEX idx_anggota_tim_status ON anggota_tim(status);
CREATE INDEX idx_tim_ketua ON tim(ketua_id);
CREATE INDEX idx_master_hibah_active ON master_hibah(is_active);
CREATE INDEX idx_master_hibah_tahun ON master_hibah(tahun_anggaran);
CREATE INDEX idx_pengumuman_published ON pengumuman(is_published);
CREATE INDEX idx_log_aktivitas_user ON log_aktivitas(user_id);
CREATE INDEX idx_log_aktivitas_created ON log_aktivitas(created_at);

-- ==================== TRIGGERS FOR updated_at ====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_updated_at BEFORE UPDATE ON admin FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dosen_updated_at BEFORE UPDATE ON dosen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mahasiswa_updated_at BEFORE UPDATE ON mahasiswa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_master_hibah_updated_at BEFORE UPDATE ON master_hibah FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposal_updated_at BEFORE UPDATE ON proposal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anggota_tim_updated_at BEFORE UPDATE ON anggota_tim FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dokumen_updated_at BEFORE UPDATE ON dokumen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surat_pencairan_updated_at BEFORE UPDATE ON surat_pencairan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pengumuman_updated_at BEFORE UPDATE ON pengumuman FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== DISABLE RLS (Simple Auth) ====================
-- RLS dinonaktifkan karena menggunakan auth sederhana

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin DISABLE ROW LEVEL SECURITY;
ALTER TABLE dosen DISABLE ROW LEVEL SECURITY;
ALTER TABLE mahasiswa DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_hibah DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposal DISABLE ROW LEVEL SECURITY;
ALTER TABLE anggota_tim DISABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen DISABLE ROW LEVEL SECURITY;
ALTER TABLE surat_pencairan DISABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman DISABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas DISABLE ROW LEVEL SECURITY;

-- ==================== SEED DATA: ADMIN ACCOUNT ====================

INSERT INTO users (id, username, password, email, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'admin123', 'admin@lppm.ac.id', 'admin');

INSERT INTO admin (user_id, nama, nip, jabatan) VALUES
('00000000-0000-0000-0000-000000000001', 'Administrator LPPM', '199001012020011001', 'Administrator Sistem');

-- ==================== SAMPLE DATA (OPTIONAL) ====================

-- Sample Dosen
INSERT INTO users (id, username, password, email, role) VALUES
('00000000-0000-0000-0000-000000000002', 'dosen1', 'dosen123', 'dosen1@lppm.ac.id', 'dosen');

INSERT INTO dosen (user_id, nama, nidn, nip, fakultas, prodi) VALUES
('00000000-0000-0000-0000-000000000002', 'Dr. Budi Santoso, M.Kom', '0123456789', '198501012010011001', 'Fakultas Teknik', 'Teknik Informatika');

-- Sample Mahasiswa
INSERT INTO users (id, username, password, email, role) VALUES
('00000000-0000-0000-0000-000000000003', 'mahasiswa1', 'mhs123', 'mahasiswa1@lppm.ac.id', 'mahasiswa');

INSERT INTO mahasiswa (user_id, nama, nim, fakultas, prodi, angkatan) VALUES
('00000000-0000-0000-0000-000000000003', 'Andi Pratama', '2021001001', 'Fakultas Teknik', 'Teknik Informatika', 2021);

-- Sample Hibah
INSERT INTO master_hibah (nama_hibah, deskripsi, jenis, tahun_anggaran, anggaran_total, anggaran_per_proposal, tanggal_buka, tanggal_tutup, is_active, created_by) VALUES
('Hibah Penelitian Internal 2026', 'Program hibah penelitian internal untuk dosen', 'penelitian', 2026, 500000000, 50000000, '2026-01-01', '2026-03-31', true, '00000000-0000-0000-0000-000000000001'),
('Hibah Pengabdian Masyarakat 2026', 'Program pengabdian kepada masyarakat', 'pengabdian', 2026, 300000000, 30000000, '2026-01-01', '2026-03-31', true, '00000000-0000-0000-0000-000000000001');

-- Sample Pengumuman
INSERT INTO pengumuman (judul, konten, kategori, is_published, tanggal_publish, created_by) VALUES
('Pembukaan Pendaftaran Hibah Penelitian 2026', 'Dengan ini diumumkan bahwa pendaftaran hibah penelitian internal tahun 2026 telah dibuka. Silakan ajukan proposal melalui sistem.', 'hibah', true, NOW(), '00000000-0000-0000-0000-000000000001'),
('Workshop Penulisan Proposal', 'Akan diadakan workshop penulisan proposal penelitian pada tanggal 15 Januari 2026.', 'kegiatan', true, NOW(), '00000000-0000-0000-0000-000000000001');

-- ============================================
-- END OF SCHEMA
-- ============================================

-- ==================== LOGIN CREDENTIALS ====================
-- Admin:
--   Username: admin
--   Password: admin123
--
-- Dosen:
--   Username: dosen1
--   Password: dosen123
--
-- Mahasiswa:
--   Username: mahasiswa1
--   Password: mhs123
-- ============================================
