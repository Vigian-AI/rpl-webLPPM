# Ringkasan Unit Test Utama - Sistem Informasi LPPM
## 20 Test Cases Paling Penting

> **Total Test Terpilih**: 20 test cases  
> **Kategori**: Autentikasi, Proposal, Tim, Hibah, Pencairan, Middleware, Database  
> **Status**: Semua ✅ Pass

---

## Daftar Test Cases Utama

### 1. Autentikasi - Login Admin Berhasil
**File**: `src/tests/lib/actions/auth.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Admin berhasil login dengan kredensial valid dan diarahkan ke `/admin`

### 2. Autentikasi - Login Dosen Berhasil  
**File**: `src/tests/lib/actions/auth.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Dosen berhasil login dan diarahkan ke `/dosen`

### 3. Autentikasi - Login Mahasiswa Berhasil
**File**: `src/tests/lib/actions/auth.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Mahasiswa berhasil login dan diarahkan ke `/mahasiswa`

### 4. Autentikasi - Registrasi Dosen dengan NIDN
**File**: `src/tests/lib/actions/auth.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Validasi registrasi dosen dengan field NIDN, fakultas, prodi

### 5. Autentikasi - Registrasi Mahasiswa dengan NIM
**File**: `src/tests/lib/actions/auth.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Validasi registrasi mahasiswa dengan field NIM, fakultas, prodi

### 6. Autentikasi - Validasi Password Minimal 6 Karakter
**File**: `src/tests/lib/actions/auth.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Password dengan panjang ≥6 diterima, <6 ditolak

### 7. Proposal - Membuat Proposal Baru
**File**: `src/tests/lib/actions/proposal.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Validasi field wajib (hibah_id, tim_id, judul) saat membuat proposal

### 8. Proposal - Submit Proposal dari Draft
**File**: `src/tests/lib/actions/proposal.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Status proposal berubah dari draft menjadi submitted

### 9. Proposal - Validasi Anggaran Tidak Melebihi Batas Hibah
**File**: `src/tests/lib/actions/proposal.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Sistem validasi anggaran proposal ≤ batas hibah yang tersedia

### 10. Tim - Membuat Tim Baru
**File**: `src/tests/lib/actions/team.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Validasi field nama_tim wajib saat membuat tim

### 11. Tim - Undang Anggota Tim
**File**: `src/tests/lib/actions/team.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Validasi input undangan (tim_id, username, peran) untuk anggota baru

### 12. Tim - Validasi Limit Maksimal 7 Anggota
**File**: `src/tests/lib/actions/team.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Undangan ditolak jika tim sudah memiliki 7 anggota

### 13. Hibah - Membuat Hibah Baru
**File**: `src/tests/lib/actions/hibah.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Validasi field wajib hibah (nama, jenis, tahun, anggaran, tanggal)

### 14. Hibah - Validasi Tanggal Tutup > Tanggal Buka
**File**: `src/tests/lib/actions/hibah.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Tanggal tutup harus setelah tanggal buka

### 15. Pencairan - Membuat Surat Pencairan
**File**: `src/tests/lib/actions/pencairan.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Validasi field wajib surat pencairan (proposal_id, nomor_surat, tanggal, jumlah_dana)

### 16. Pencairan - Generate Nomor Surat
**File**: `src/tests/lib/actions/pencairan.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Format nomor surat "SP/0001/LPPM/2024" dengan increment otomatis

### 17. Middleware - Akses Route Protected Tanpa Login
**File**: `src/tests/middleware/middleware.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Redirect ke /login untuk route protected tanpa session

### 18. Middleware - Role-Based Access Control
**File**: `src/tests/middleware/middleware.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Admin hanya bisa akses /admin, dosen hanya /dosen, mahasiswa hanya /mahasiswa

### 19. Database - Query User by Username
**File**: `src/tests/lib/supabase/queries.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Fetch user berdasarkan username dengan case-insensitive

### 20. Business Logic - Transisi Status Proposal
**File**: `src/tests/business/proposal-logic.test.ts`  
**Status**: ✅ Pass  
**Deskripsi**: Validasi transisi status dari draft→submitted, review→accepted/rejected

---

## 📊 Ringkasan

| Kategori | Jumlah Test |
|----------|-------------|
| **Autentikasi** | 6 |
| **Proposal** | 3 |
| **Tim** | 3 |
| **Hibah** | 2 |
| **Pencairan** | 2 |
| **Middleware** | 2 |
| **Database** | 1 |
| **Business Logic** | 1 |
| **TOTAL** | **20** |

---

## 📋 Tabel Lengkap Test Cases

| No | Test Case | Kategori | Status | Deskripsi Singkat |
|----|-----------|----------|--------|-------------------|
| 1 | Login Admin Berhasil | Autentikasi | ✅ Pass | Admin login valid → redirect `/admin` |
| 2 | Login Dosen Berhasil | Autentikasi | ✅ Pass | Dosen login valid → redirect `/dosen` |
| 3 | Login Mahasiswa Berhasil | Autentikasi | ✅ Pass | Mahasiswa login valid → redirect `/mahasiswa` |
| 4 | Registrasi Dosen dengan NIDN | Autentikasi | ✅ Pass | Validasi NIDN, fakultas, prodi |
| 5 | Registrasi Mahasiswa dengan NIM | Autentikasi | ✅ Pass | Validasi NIM, fakultas, prodi |
| 6 | Validasi Password Minimal 6 Karakter | Autentikasi | ✅ Pass | Password ≥6 diterima, <6 ditolak |
| 7 | Membuat Proposal Baru | Proposal | ✅ Pass | Validasi field wajib: hibah_id, tim_id, judul |
| 8 | Submit Proposal dari Draft | Proposal | ✅ Pass | Status: draft → submitted |
| 9 | Validasi Anggaran Tidak Melebihi Batas Hibah | Proposal | ✅ Pass | Anggaran proposal ≤ batas hibah |
| 10 | Membuat Tim Baru | Tim | ✅ Pass | Validasi nama_tim wajib |
| 11 | Undang Anggota Tim | Tim | ✅ Pass | Validasi tim_id, username, peran |
| 12 | Validasi Limit Maksimal 7 Anggota | Tim | ✅ Pass | Undangan ditolak jika >7 anggota |
| 13 | Membuat Hibah Baru | Hibah | ✅ Pass | Validasi nama, jenis, tahun, anggaran, tanggal |
| 14 | Validasi Tanggal Tutup > Tanggal Buka | Hibah | ✅ Pass | Tanggal tutup setelah tanggal buka |
| 15 | Membuat Surat Pencairan | Pencairan | ✅ Pass | Validasi proposal_id, nomor_surat, tanggal, jumlah_dana |
| 16 | Generate Nomor Surat | Pencairan | ✅ Pass | Format "SP/0001/LPPM/2024" auto-increment |
| 17 | Akses Route Protected Tanpa Login | Middleware | ✅ Pass | Redirect ke /login tanpa session |
| 18 | Role-Based Access Control | Middleware | ✅ Pass | Admin→/admin, Dosen→/dosen, Mahasiswa→/mahasiswa |
| 19 | Query User by Username | Database | ✅ Pass | Fetch user case-insensitive |
| 20 | Transisi Status Proposal | Business Logic | ✅ Pass | draft→submitted, review→accepted/rejected |

---

## 🎯 Fokus Test Cases

Test cases ini dipilih karena mencakup fungsi-fungsi kritis sistem:

✅ **Login & Registrasi** - Pintu masuk utama sistem  
✅ **Membuat & Mengelola Proposal** - Core business process  
✅ **Manajemen Tim** - Kolaborasi penelitian  
✅ **Program Hibah** - Sumber dana penelitian  
✅ **Pencairan Dana** - Proses keuangan  
✅ **Keamanan & Akses** - Middleware autentikasi  
✅ **Integritas Data** - Query database & business logic  

---

**Generated**: January 17, 2026  
**Project**: Sistem Informasi LPPM - Research & Community Service