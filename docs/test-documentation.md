# Dokumentasi Lengkap Pengujian Unit Test
## Sistem Informasi LPPM - 236 Test Cases

> **Total Test**: 236 test cases  
> **Test Files**: 12 files  
> **Coverage**: Server Actions, Business Logic, Database, Middleware

---

##  Daftar Isi

1. [Server Actions - Autentikasi (18 tests)](#1-server-actions---autentikasi)
2. [Server Actions - Proposal (23 tests)](#2-server-actions---proposal)
3. [Server Actions - Tim (23 tests)](#3-server-actions---tim)
4. [Server Actions - Hibah (19 tests)](#4-server-actions---hibah)
5. [Server Actions - Pencairan (20 tests)](#5-server-actions---pencairan)
6. [Server Actions - Admin (16 tests)](#6-server-actions---admin)
7. [Business Logic - Proposal (18 tests)](#7-business-logic---proposal)
8. [Business Logic - Hibah (16 tests)](#8-business-logic---hibah)
9. [Business Logic - Pencairan (17 tests)](#9-business-logic---pencairan)
10. [Middleware (21 tests)](#10-middleware)
11. [Database Queries (23 tests)](#11-database-queries)
12. [Database Types (22 tests)](#12-database-types)

---

## 1. Server Actions - Autentikasi
**File**: `src/tests/lib/actions/auth.test.ts`  
**Total**: 18 tests  
**Modul**: Autentikasi dan Otorisasi

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| User mengisi form login dengan username dan password | Form login kosong | Input username dan password tervalidasi sebagai field wajib | ✅ Pass |
| User mengisi username pada form login | Field username kosong | Username berisi string tidak kosong | ✅ Pass |
| User mengisi password pada form login | Field password kosong | Password berisi string tidak kosong | ✅ Pass |
| User submit berbagai format kredensial valid | Form login siap menerima input | Semua format kredensial (username, email, dengan underscore/dot) diterima | ✅ Pass |
| Dosen registrasi dengan NIDN | Form registrasi kosong | Input registrasi dosen tervalidasi dengan field nama, NIDN, fakultas, prodi | ✅ Pass |
| Mahasiswa registrasi dengan NIM | Form registrasi kosong | Input registrasi mahasiswa tervalidasi dengan field nama, NIM, fakultas, prodi | ✅ Pass |
| Admin registrasi dengan NIP | Form registrasi kosong | Input registrasi admin tervalidasi dengan field nama dan NIP | ✅ Pass |
| System validasi semua role yang diizinkan | Role undefined | Tiga role (admin, dosen, mahasiswa) tervalidasi sebagai role yang valid | ✅ Pass |
| User input email dengan format valid | Email field kosong | Email format valid (user@domain.tld) lolos validasi regex | ✅ Pass |
| User input email dengan format invalid | Email field kosong | Email invalid (tanpa @, tanpa domain) ditolak oleh regex | ✅ Pass |
| User input password minimal 6 karakter | Password field kosong | Password dengan panjang ≥6 diterima | ✅ Pass |
| User input password < 6 karakter | Password field kosong | Password pendek ditolak validasi | ✅ Pass |
| Admin berhasil login | User role = admin | Redirect ke path `/admin` | ✅ Pass |
| Dosen berhasil login | User role = dosen | Redirect ke path `/dosen` | ✅ Pass |
| Mahasiswa berhasil login | User role = mahasiswa | Redirect ke path `/mahasiswa` | ✅ Pass |
| System set session cookie | Login berhasil | Cookie session berlaku selama 7 hari (604800 detik) | ✅ Pass |
| System set session cookie name | Session dibuat | Nama cookie adalah `lppm_session` | ✅ Pass |
| System parse JSON session dari cookie | Cookie berisi session JSON | Data session (userId, role, nama) ter-parse dengan benar | ✅ Pass |

---

## 2. Server Actions - Proposal
**File**: `src/tests/lib/actions/proposal.test.ts`  
**Total**: 23 tests  
**Modul**: Manajemen Proposal Penelitian

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| User membuat proposal baru | Form proposal kosong | Field wajib (hibah_id, tim_id, judul) tervalidasi | ✅ Pass |
| User mengisi form proposal lengkap | Form proposal kosong | Semua field opsional (abstrak, latar_belakang, tujuan, metodologi, luaran, anggaran, link_drive) tersimpan | ✅ Pass |
| User submit proposal dengan field opsional kosong | Form proposal hanya field wajib | Field opsional kosong (empty string) diterima system | ✅ Pass |
| System validasi semua status proposal | Status undefined | 7 status valid dikenali: draft, submitted, review, revision, accepted, rejected, completed | ✅ Pass |
| User submit proposal dari draft | Status = draft | Status berubah menjadi submitted | ✅ Pass |
| Admin review proposal yang submitted | Status = submitted | Status berubah menjadi review | ✅ Pass |
| Reviewer terima proposal | Status = review | Status berubah menjadi accepted | ✅ Pass |
| Reviewer tolak proposal | Status = review | Status berubah menjadi rejected | ✅ Pass |
| Reviewer minta revisi | Status = review | Status berubah menjadi revision | ✅ Pass |
| Dosen selesaikan proposal yang diterima | Status = accepted | Status berubah menjadi completed | ✅ Pass |
| System load data proposal dari database | Database berisi proposal | Semua field proposal (id, hibah_id, tim_id, ketua_id, judul, status, timestamps) ter-load | ✅ Pass |
| User input anggaran positif | Anggaran = 0 | Anggaran > 0 tervalidasi | ✅ Pass |
| User input anggaran negatif atau nol | Anggaran input | Anggaran ≤ 0 ditolak | ✅ Pass |
| System format anggaran ke Rupiah | Anggaran = 50000000 | Tampilan: "Rp 50.000.000" | ✅ Pass |
| User cek anggaran tidak melebihi batas hibah | Anggaran diajukan, batas hibah tersedia | System validasi anggaran ≤ batas hibah | ✅ Pass |
| User input link Google Drive valid | Link field kosong | Link dengan format `drive.google.com` atau `docs.google.com` diterima | ✅ Pass |
| User input link bukan Google Drive | Link field kosong | Link non-Google Drive ditolak | ✅ Pass |
| System cek judul tidak boleh kosong | Judul field kosong | Judul kosong atau hanya spasi ditolak | ✅ Pass |
| System hitung jumlah proposal per hibah | Database berisi beberapa proposal | Count proposal per hibah_id akurat | ✅ Pass |
| System filter proposal berdasarkan status | Database berisi proposal berbagai status | Proposal ter-filter sesuai status yang dipilih | ✅ Pass |
| Dosen filter proposal miliknya | Database berisi proposal berbagai ketua | Proposal ter-filter berdasarkan ketua_id | ✅ Pass |
| System sort proposal by tanggal submit | Database berisi proposal berbagai tanggal | Proposal tersort descending (terbaru di atas) | ✅ Pass |
| System validasi proposal hanya bisa dibuat saat hibah aktif | Hibah status = active/closed | Proposal hanya bisa dibuat untuk hibah yang active | ✅ Pass |

---

## 3. Server Actions - Tim
**File**: `src/tests/lib/actions/team.test.ts`  
**Total**: 23 tests  
**Modul**: Manajemen Tim Penelitian

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| Dosen membuat tim baru | Form tim kosong | Field wajib nama_tim tervalidasi | ✅ Pass |
| Dosen membuat tim dengan deskripsi | Form tim kosong | Field opsional deskripsi tersimpan | ✅ Pass |
| Dosen membuat tim tanpa deskripsi | Form tim kosong | Deskripsi kosong (empty string) diterima | ✅ Pass |
| Dosen undang anggota ke tim | Tim belum ada anggota | Input undangan (tim_id, username, peran) tervalidasi | ✅ Pass |
| System validasi peran anggota tim | Peran undefined | 3 peran valid: Ketua, Asisten Dosen, Asisten Peneliti | ✅ Pass |
| System validasi semua status keanggotaan | Status undefined | 3 status valid: pending, accepted, rejected | ✅ Pass |
| Anggota terima undangan | Status = pending | Status berubah menjadi accepted | ✅ Pass |
| Anggota tolak undangan | Status = pending | Status berubah menjadi rejected | ✅ Pass |
| Ketua undang anggota ke-7 | Tim memiliki 6 anggota | Undangan diterima (belum mencapai limit) | ✅ Pass |
| Ketua undang anggota ke-8 | Tim sudah 7 anggota (maksimal) | Undangan ditolak (mencapai limit) | ✅ Pass |
| System load data tim dari database | Database berisi tim | Semua field tim (id, nama_tim, deskripsi, ketua_id, is_archived, timestamps) ter-load | ✅ Pass |
| System load data anggota tim dari database | Database berisi anggota | Semua field anggota (id, tim_id, user_id, peran, status, invited_at, responded_at) ter-load | ✅ Pass |
| User filter tim aktif | Database berisi tim aktif dan arsip | Tim dengan is_archived=false ter-filter | ✅ Pass |
| User filter tim arsip | Database berisi tim aktif dan arsip | Tim dengan is_archived=true ter-filter | ✅ Pass |
| Dosen arsipkan tim | Tim is_archived=false | is_archived berubah menjadi true | ✅ Pass |
| Dosen restore tim dari arsip | Tim is_archived=true | is_archived berubah menjadi false | ✅ Pass |
| System cek ketua harus dosen | User role bukan dosen | Validasi gagal, hanya dosen bisa jadi ketua | ✅ Pass |
| System cek duplikasi anggota | Anggota sudah ada di tim | Undangan ditolak (user_id sudah terdaftar di tim) | ✅ Pass |
| System hitung jumlah anggota accepted | Tim memiliki anggota pending dan accepted | Count hanya menghitung anggota dengan status=accepted | ✅ Pass |
| System filter anggota berdasarkan peran | Tim memiliki berbagai peran | Anggota ter-filter sesuai peran (Asisten Dosen, Asisten Peneliti) | ✅ Pass |
| Dosen update nama tim | Tim sudah tersimpan | nama_tim berubah sesuai input baru | ✅ Pass |
| Dosen update deskripsi tim | Tim sudah tersimpan | deskripsi berubah sesuai input baru | ✅ Pass |
| System validasi tim tidak boleh tanpa ketua | Data tim tidak lengkap | ketua_id wajib diisi (foreign key ke dosen) | ✅ Pass |

---

## 4. Server Actions - Hibah
**File**: `src/tests/lib/actions/hibah.test.ts`  
**Total**: 19 tests  
**Modul**: Manajemen Program Hibah

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| Admin membuat hibah baru | Form hibah kosong | Field wajib (nama_hibah, jenis, tahun_anggaran, anggaran_total, tanggal_buka, tanggal_tutup) tervalidasi | ✅ Pass |
| Admin membuat hibah dengan field opsional | Form hibah kosong | Field opsional (deskripsi, anggaran_per_proposal, persyaratan) tersimpan | ✅ Pass |
| System load data hibah dari database | Database berisi hibah | Semua field hibah ter-load lengkap (id, nama, jenis, anggaran, tanggal, is_active, created_by, timestamps) | ✅ Pass |
| System validasi tanggal tutup > tanggal buka | Input tanggal tidak valid | Tanggal tutup harus setelah tanggal buka | ✅ Pass |
| System deteksi tanggal invalid (tutup < buka) | Input tanggal salah | Validasi gagal, tanggal tidak logis | ✅ Pass |
| System format tanggal ke ISO | Tanggal = Date object | Format YYYY-MM-DD | ✅ Pass |
| System filter hibah yang sedang aktif | Database berisi berbagai hibah | Hibah dengan is_active=true DAN tanggal_buka ≤ today ≤ tanggal_tutup ter-filter | ✅ Pass |
| System filter hibah yang nonaktif | Database berisi hibah | Hibah dengan is_active=false ter-filter | ✅ Pass |
| System validasi anggaran total positif | Anggaran input | Anggaran_total > 0 tervalidasi | ✅ Pass |
| System validasi anggaran per proposal ≤ total | Input anggaran proposal > total | Validasi gagal, anggaran_per_proposal tidak boleh > anggaran_total | ✅ Pass |
| System validasi anggaran per proposal positif | Anggaran input | Anggaran_per_proposal > 0 tervalidasi | ✅ Pass |
| System format anggaran ke Rupiah | Anggaran = 1000000000 | Tampilan: "Rp 1.000.000.000" | ✅ Pass |
| Admin validasi tahun anggaran 4 digit | Input tahun = 2024 | Tahun berisi 4 digit integer | ✅ Pass |
| System validasi tahun anggaran tidak boleh masa lalu | Input tahun < tahun sekarang | Tahun anggaran harus ≥ tahun sekarang | ✅ Pass |
| System hitung jumlah hibah aktif | Database berisi berbagai hibah | Count hibah dengan is_active=true dan dalam periode tanggal | ✅ Pass |
| System filter hibah berdasarkan jenis | Database berisi berbagai jenis | Hibah ter-filter sesuai jenis (Penelitian Dasar, Pengabdian Masyarakat, dll) | ✅ Pass |
| Admin nonaktifkan hibah | Hibah is_active=true | is_active berubah menjadi false | ✅ Pass |
| Admin aktifkan hibah | Hibah is_active=false | is_active berubah menjadi true | ✅ Pass |
| System sort hibah by tahun anggaran | Database berisi hibah berbagai tahun | Hibah tersort descending (tahun terbaru di atas) | ✅ Pass |

---

## 5. Server Actions - Pencairan
**File**: `src/tests/lib/actions/pencairan.test.ts`  
**Total**: 20 tests  
**Modul**: Pencairan Dana Penelitian

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| Admin membuat surat pencairan baru | Form surat kosong | Field wajib (proposal_id, nomor_surat, tanggal_surat, jumlah_dana) tervalidasi | ✅ Pass |
| Admin membuat surat dengan keterangan | Form surat kosong | Field opsional keterangan tersimpan | ✅ Pass |
| System load data surat pencairan dari database | Database berisi surat | Semua field surat (id, proposal_id, nomor_surat, tanggal_surat, jumlah_dana, keterangan, dokumen_url, created_by, timestamps) ter-load | ✅ Pass |
| System generate nomor surat dengan format benar | Counter = 1, tahun = 2024 | Nomor surat: "SP/0001/LPPM/2024" | ✅ Pass |
| System increment nomor surat | Counter = 1 s/d 1000 | Nomor: 0001, 0002, 0010, 0100, 1000 (dengan padding 4 digit) | ✅ Pass |
| System generate nomor surat untuk tahun baru | Tahun berubah 2024→2025→2026 | Nomor surat mengandung tahun yang benar | ✅ Pass |
| Admin input jumlah dana positif | Dana = 0 | Jumlah_dana > 0 tervalidasi | ✅ Pass |
| Admin input jumlah dana negatif atau nol | Dana input | Jumlah_dana ≤ 0 ditolak | ✅ Pass |
| System format jumlah dana ke Rupiah | Dana = 50000000 | Tampilan: "Rp 50.000.000" | ✅ Pass |
| System hitung total dana yang sudah dicairkan | Database berisi 3 pencairan | Total = sum(jumlah_dana semua pencairan) | ✅ Pass |
| System handle array kosong pada perhitungan total | Database tidak ada pencairan | Total = 0 | ✅ Pass |
| System handle null value pada jumlah dana | Database berisi pencairan dengan nilai null | Total mengabaikan nilai null (treat as 0) | ✅ Pass |
| System validasi format tanggal surat | Input tanggal = Date | Format YYYY-MM-DD tervalidasi | ✅ Pass |
| System validasi tanggal surat tidak boleh masa depan | Tanggal surat > today | Validasi gagal | ✅ Pass |
| System filter pencairan berdasarkan proposal | Database berisi berbagai pencairan | Pencairan ter-filter sesuai proposal_id | ✅ Pass |
| System sort pencairan by tanggal surat | Database berisi pencairan berbagai tanggal | Pencairan tersort descending (terbaru di atas) | ✅ Pass |
| System validasi nomor surat unique | Nomor surat sudah ada | Insert ditolak (UNIQUE constraint) | ✅ Pass |
| System validasi pencairan hanya untuk proposal accepted | Proposal status ≠ accepted | Pencairan ditolak, status harus accepted atau completed | ✅ Pass |
| System hitung sisa anggaran proposal | Anggaran disetujui - total pencairan | Sisa = anggaran_disetujui - sum(jumlah_dana) | ✅ Pass |
| System validasi jumlah dana ≤ sisa anggaran | Dana diminta > sisa | Validasi gagal, tidak boleh melebihi sisa anggaran | ✅ Pass |

---

## 6. Server Actions - Admin
**File**: `src/tests/lib/actions/admin.test.ts`  
**Total**: 16 tests  
**Modul**: Fungsi Administrasi dan Dashboard Admin

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| Admin load statistik dashboard | Database berisi data | AdminStats memiliki 6 field: totalProposals, pendingReview, acceptedProposals, rejectedProposals, activeHibah, totalDisbursed | ✅ Pass |
| System validasi semua nilai statistik non-negatif | Stats dengan nilai 0 | Semua field ≥ 0 | ✅ Pass |
| Admin load data proposal terbaru | Database berisi proposal | RecentProposal memiliki field: id, judul, ketua, status, tanggal | ✅ Pass |
| Admin load info hibah aktif | Database berisi hibah | ActiveHibahInfo memiliki field: id, nama, totalProposal, tanggalTutup | ✅ Pass |
| System hitung jumlah pending review | Database berisi proposal berbagai status | Count proposal dengan status=submitted OR review | ✅ Pass |
| System hitung acceptance rate | Total=100, accepted=60 | Rate = (60/100)*100 = 60% | ✅ Pass |
| System hitung rejection rate | Total=100, rejected=20 | Rate = (20/100)*100 = 20% | ✅ Pass |
| System handle division by zero pada rate | Total=0, accepted=0 | Rate = 0 (tidak error) | ✅ Pass |
| System transformasi data proposal ke RecentProposal | Raw data dari DB | Data ter-mapping: id, judul, ketua (dari join), status, tanggal | ✅ Pass |
| System handle proposal tanpa ketua | Ketua = null | ketua="Unknown" (fallback) | ✅ Pass |
| System filter hibah yang sedang aktif berdasarkan tanggal | Database berisi berbagai hibah, today=2024-03-15 | Filter is_active=true AND tanggal_buka ≤ today ≤ tanggal_tutup | ✅ Pass |
| System hitung total dana yang sudah dicairkan | Database berisi 3 pencairan: 50jt, 75jt, 100jt | Total = 225jt | ✅ Pass |
| System format angka besar ke Rupiah | Total = 1.500.000.000 | Tampilan: "Rp 1.500.000.000" | ✅ Pass |
| System return warna badge sesuai status proposal | Status = draft/submitted/review/accepted/rejected | Warna: gray/blue/yellow/green/red | ✅ Pass |
| System limit hasil query recent proposals | Database berisi 10 proposal, limit=5 | Return 5 proposal pertama | ✅ Pass |
| System gunakan default limit jika tidak dispesifikasikan | Database berisi proposal, limit undefined | Default limit = 5 | ✅ Pass |

---

## 7. Business Logic - Proposal
**File**: `src/tests/business/proposal-logic.test.ts`  
**Total**: 18 tests  
**Modul**: Logika Bisnis Proposal Penelitian

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| System cek transisi draft→submitted | Status=draft | Transisi valid=true | ✅ Pass |
| System cek transisi review ke multiple states | Status=review | Transisi valid ke: revision, accepted, rejected | ✅ Pass |
| System cek transisi mundur tidak diizinkan | Status=submitted | Transisi ke draft invalid=false | ✅ Pass |
| System cek transisi dari status terminal | Status=rejected atau completed | Tidak ada transisi valid (array kosong) | ✅ Pass |
| System ambil next statuses yang valid | Status=draft | Next statuses = ['submitted'] | ✅ Pass |
| System hitung total anggaran dari item | 3 item: 10jt, 5jt, 3jt | Total = 18jt | ✅ Pass |
| System validasi anggaran dalam batas | Request=50jt, max=100jt | Valid=true | ✅ Pass |
| System validasi anggaran melebihi batas | Request=100jt+1, max=100jt | Valid=false | ✅ Pass |
| System hitung breakdown anggaran per kategori | Item dengan kategori sama | Total per kategori tergabung (Peralatan: 13jt) | ✅ Pass |
| System validasi minimal anggota tim | Tim: 1 accepted | Invalid (minimal 2) | ✅ Pass |
| System validasi maksimal anggota tim | Tim: 10 anggota | Valid (maksimal 10) | ✅ Pass |
| System validasi minimal 1 mahasiswa di tim | Tim: 2 dosen, 0 mahasiswa | Invalid (minimal 1 mahasiswa) | ✅ Pass |
| System validasi maksimal 3 dosen di tim | Tim: 4 dosen | Invalid (maksimal 3 dosen) | ✅ Pass |
| System cek kelengkapan proposal untuk submit | Field wajib terisi | canSubmit=true | ✅ Pass |
| System cek proposal tidak lengkap | Judul kosong | canSubmit=false | ✅ Pass |
| System hitung skor review dari 5 kriteria | Kriteria: 8,9,7,8,9 (total 41) | Skor = 41/50 * 100 = 82% | ✅ Pass |
| System tentukan status berdasarkan skor | Skor ≥80 | Status=accepted | ✅ Pass |
| System tentukan status revisi | Skor 60-79 | Status=revision | ✅ Pass |

---

## 8. Business Logic - Hibah
**File**: `src/tests/business/hibah-logic.test.ts`  
**Total**: 16 tests  
**Modul**: Logika Bisnis Program Hibah

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| System cek hibah sedang dibuka | is_active=true, today dalam rentang buka-tutup | Status=active | ✅ Pass |
| System cek hibah belum dibuka | is_active=true, today < tanggal_buka | Status=upcoming | ✅ Pass |
| System cek hibah sudah tutup | is_active=true, today > tanggal_tutup | Status=closed | ✅ Pass |
| System cek hibah dinonaktifkan admin | is_active=false (meskipun tanggal valid) | Status=inactive | ✅ Pass |
| System cek proposal bisa disubmit | Status hibah=active | canSubmitProposal=true | ✅ Pass |
| System hitung sisa anggaran tersedia | Total=1M, terpakai=300jt | Sisa=700jt | ✅ Pass |
| System hitung maksimal proposal bisa didanai | Sisa=700jt, per_proposal=100jt | Max proposals = 7 | ✅ Pass |
| System cek anggaran bisa dialokasikan | Request=50jt, per_proposal=100jt, sisa=700jt | canAllocate=true | ✅ Pass |
| System cek anggaran melebihi batas per proposal | Request=150jt, per_proposal=100jt | canAllocate=false | ✅ Pass |
| System hitung persentase utilisasi anggaran | Total=1M, terpakai=300jt | Utilisasi = 30% | ✅ Pass |
| System validasi nama hibah tidak boleh kosong | Nama kosong atau spasi saja | Valid=false | ✅ Pass |
| System validasi tanggal range valid | Buka=2024-01-01, Tutup=2024-06-30 | Valid=true (tutup > buka) | ✅ Pass |
| System validasi tanggal range invalid | Buka > Tutup | Valid=false | ✅ Pass |
| System validasi semua field wajib terisi | Ada field wajib kosong | Valid=false | ✅ Pass |
| System filter hibah by tahun anggaran | Database: hibah 2023, 2024, 2025 | Filter tahun=2024 return hibah tahun 2024 saja | ✅ Pass |
| System sort hibah by tanggal_buka | Database: berbagai tanggal buka | Sort descending (terbaru di atas) | ✅ Pass |

---

## 9. Business Logic - Pencairan
**File**: `src/tests/business/pencairan-logic.test.ts`  
**Total**: 17 tests  
**Modul**: Logika Bisnis Pencairan Dana

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| System validasi proposal harus status accepted | Proposal status=draft | canCreatePencairan=false | ✅ Pass |
| System izinkan pencairan untuk proposal accepted | Proposal status=accepted | canCreatePencairan=true | ✅ Pass |
| System hitung sisa anggaran proposal | Disetujui=100jt, pencairan=30jt | Sisa=70jt | ✅ Pass |
| System validasi jumlah dana ≤ sisa anggaran | Request=50jt, sisa=70jt | Valid=true | ✅ Pass |
| System tolak jumlah dana > sisa | Request=80jt, sisa=70jt | Valid=false | ✅ Pass |
| System validasi jumlah dana positif | Dana=50jt | Valid=true (>0) | ✅ Pass |
| System tolak jumlah dana negatif atau nol | Dana=0 atau <0 | Valid=false | ✅ Pass |
| System generate nomor surat dengan format benar | Counter=1, tahun=2024 | Nomor="SP/0001/LPPM/2024" | ✅ Pass |
| System parse nomor surat yang ada | Nomor="SP/0042/LPPM/2024" | Parsed number=42 | ✅ Pass |
| System increment nomor surat | Nomor terakhir=0042 | Nomor baru=0043 | ✅ Pass |
| System reset counter untuk tahun baru | Tahun berubah 2024→2025 | Nomor reset ke 0001 | ✅ Pass |
| System hitung total pencairan per proposal | 3 pencairan: 30jt, 40jt, 30jt | Total=100jt | ✅ Pass |
| System hitung persentase pencairan | Total pencairan=75jt, anggaran=100jt | Persentase=75% | ✅ Pass |
| System cek apakah proposal sudah fully disbursed | Pencairan=100jt, anggaran=100jt | fullyDisbursed=true | ✅ Pass |
| System cek proposal belum fully disbursed | Pencairan=75jt, anggaran=100jt | fullyDisbursed=false | ✅ Pass |
| System validasi tanggal surat tidak boleh masa depan | Tanggal > today | Valid=false | ✅ Pass |
| System sort pencairan by tanggal | Database: berbagai tanggal | Sort descending (terbaru di atas) | ✅ Pass |

---

## 10. Middleware
**File**: `src/tests/middleware/middleware.test.ts`  
**Total**: 21 tests  
**Modul**: Middleware Autentikasi dan Otorisasi

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| User akses route publik tanpa login | Session tidak ada | Akses diizinkan (route: /, /login, /register) | ✅ Pass |
| User akses route protected tanpa login | Session tidak ada | Redirect ke /login | ✅ Pass |
| Admin akses /admin | Session role=admin | Akses diizinkan | ✅ Pass |
| Dosen akses /admin | Session role=dosen | Redirect ke /unauthorized (forbidden) | ✅ Pass |
| Mahasiswa akses /admin | Session role=mahasiswa | Redirect ke /unauthorized | ✅ Pass |
| Dosen akses /dosen | Session role=dosen | Akses diizinkan | ✅ Pass |
| Admin akses /dosen | Session role=admin | Redirect ke /unauthorized | ✅ Pass |
| Mahasiswa akses /dosen | Session role=mahasiswa | Redirect ke /unauthorized | ✅ Pass |
| Mahasiswa akses /mahasiswa | Session role=mahasiswa | Akses diizinkan | ✅ Pass |
| Admin akses /mahasiswa | Session role=admin | Redirect ke /unauthorized | ✅ Pass |
| Dosen akses /mahasiswa | Session role=dosen | Redirect ke /unauthorized | ✅ Pass |
| User sudah login akses /login | Session ada | Redirect ke dashboard sesuai role | ✅ Pass |
| User sudah login akses /register | Session ada | Redirect ke dashboard sesuai role | ✅ Pass |
| User akses /unauthorized dengan session valid | Session ada | Akses diizinkan (halaman error bisa diakses) | ✅ Pass |
| System parse session dari cookie | Cookie berisi session JSON | Session data ter-parse: userId, role, nama | ✅ Pass |
| System handle cookie tidak ada | Cookie=undefined | Session=null | ✅ Pass |
| System handle JSON invalid di cookie | Cookie berisi string bukan JSON | Session=null (fallback) | ✅ Pass |
| System apply middleware pada semua route | Request ke berbagai path | Middleware dieksekusi untuk setiap request | ✅ Pass |
| System bypass middleware untuk static files | Request ke /_next/static/* | Middleware skip (tidak dieksekusi) | ✅ Pass |
| System bypass middleware untuk API routes tertentu | Request ke /api/public | Middleware skip | ✅ Pass |
| System log unauthorized access attempt | User akses route forbidden | Log event dicatat (username, route, timestamp) | ✅ Pass |

---

## 11. Database Queries
**File**: `src/tests/lib/supabase/queries.test.ts`  
**Total**: 23 tests  
**Modul**: Query Database Supabase

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| System query user by username | Database berisi user | User ter-fetch berdasarkan username (case-insensitive) | ✅ Pass |
| System query user by email | Database berisi user | User ter-fetch berdasarkan email | ✅ Pass |
| System query user by id | Database berisi user | User ter-fetch dengan detail profile (dosen/mahasiswa/admin join) | ✅ Pass |
| System insert user baru | Database siap | User baru tersimpan dengan role yang sesuai | ✅ Pass |
| System update user profile | User sudah ada | Data profile ter-update (nama, fakultas, prodi, dll) | ✅ Pass |
| System query proposals by ketua | Database berisi proposals | Proposals ter-filter berdasarkan ketua_id | ✅ Pass |
| System query proposals by hibah | Database berisi proposals | Proposals ter-filter berdasarkan hibah_id | ✅ Pass |
| System query proposals with join | Database berisi proposals | Data proposal dengan relasi tim, hibah, ketua ter-fetch | ✅ Pass |
| System insert proposal baru | Database siap | Proposal tersimpan dengan status=draft | ✅ Pass |
| System update proposal status | Proposal sudah ada | Status proposal ter-update | ✅ Pass |
| System query tim by ketua | Database berisi tim | Tim ter-filter berdasarkan ketua_id | ✅ Pass |
| System query anggota tim by tim_id | Database berisi anggota | Anggota ter-fetch dengan status dan peran | ✅ Pass |
| System insert anggota tim | Database siap | Anggota baru tersimpan dengan status=pending | ✅ Pass |
| System update status anggota | Anggota status=pending | Status berubah ke accepted/rejected, responded_at ter-set | ✅ Pass |
| System query hibah aktif | Database berisi hibah | Hibah dengan is_active=true dan dalam periode ter-fetch | ✅ Pass |
| System insert hibah baru | Database siap | Hibah tersimpan dengan created_by=admin_id | ✅ Pass |
| System query pencairan by proposal | Database berisi pencairan | Pencairan ter-filter berdasarkan proposal_id | ✅ Pass |
| System insert surat pencairan | Database siap | Surat tersimpan dengan nomor_surat unique | ✅ Pass |
| System query sum pencairan by proposal | Database berisi pencairan | Total jumlah_dana ter-hitung | ✅ Pass |
| System query count proposals by status | Database berisi proposals | Count ter-group berdasarkan status_proposal | ✅ Pass |
| System query proposals with pagination | Database berisi banyak proposal | Proposals ter-fetch dengan limit dan offset | ✅ Pass |
| System full-text search proposal by judul | Database berisi proposals | Proposals ter-filter berdasarkan keyword di judul | ✅ Pass |
| System handle database error gracefully | Query error (constraint violation) | Error ter-catch dan return error message | ✅ Pass |

---

## 12. Database Types
**File**: `src/tests/types/database.types.test.ts`  
**Total**: 22 tests  
**Modul**: Validasi Tipe Data Database

| Aksi Aktor | Kondisi Awal System | Kondisi Akhir System | Status |
|------------|---------------------|----------------------|--------|
| System validasi type User | Object user dibuat | Semua field User (id, username, email, password, role, is_active, timestamps) sesuai type | ✅ Pass |
| System validasi enum UserRole | Role ditetapkan | Role hanya bisa: admin, dosen, mahasiswa | ✅ Pass |
| System validasi type Dosen | Object dosen dibuat | Semua field Dosen (user_id, nama, nidn, nip, fakultas, prodi, jabatan_fungsional, dll) sesuai type | ✅ Pass |
| System validasi type Mahasiswa | Object mahasiswa dibuat | Semua field Mahasiswa (user_id, nama, nim, fakultas, prodi, angkatan) sesuai type | ✅ Pass |
| System validasi type Admin | Object admin dibuat | Semua field Admin (user_id, nama, nip, jabatan) sesuai type | ✅ Pass |
| System validasi type Tim | Object tim dibuat | Semua field Tim (nama_tim, ketua_id, is_archived) sesuai type | ✅ Pass |
| System validasi type AnggotaTim | Object anggota dibuat | Semua field AnggotaTim (tim_id, user_id, peran, status) sesuai type | ✅ Pass |
| System validasi enum StatusAnggota | Status ditetapkan | Status hanya bisa: pending, accepted, rejected | ✅ Pass |
| System validasi type MasterHibah | Object hibah dibuat | Semua field MasterHibah (nama, jenis, tahun_anggaran, anggaran, tanggal, is_active) sesuai type | ✅ Pass |
| System validasi type Proposal | Object proposal dibuat | Semua field Proposal (hibah_id, tim_id, ketua_id, judul, abstrak, anggaran, status) sesuai type | ✅ Pass |
| System validasi enum StatusProposal | Status ditetapkan | Status hanya bisa: draft, submitted, review, revision, accepted, rejected, completed | ✅ Pass |
| System validasi type SuratPencairan | Object surat dibuat | Semua field SuratPencairan (proposal_id, nomor_surat, tanggal_surat, jumlah_dana) sesuai type | ✅ Pass |
| System validasi type Dokumen | Object dokumen dibuat | Semua field Dokumen (proposal_id, nama_dokumen, jenis_dokumen, file_url) sesuai type | ✅ Pass |
| System validasi type Pengumuman | Object pengumuman dibuat | Semua field Pengumuman (judul, konten, kategori, is_published) sesuai type | ✅ Pass |
| System validasi type LogAktivitas | Object log dibuat | Semua field LogAktivitas (user_id, aksi, tabel_terkait, record_id, detail, ip_address) sesuai type | ✅ Pass |
| System validasi optional fields | Field optional = undefined | Type checker terima undefined untuk optional fields | ✅ Pass |
| System validasi required fields tidak boleh null | Field required = null | Type checker error (compile-time) | ✅ Pass |
| System validasi foreign key types | FK user_id, tim_id | Type FK harus UUID string | ✅ Pass |
| System validasi date types | Field tanggal | Type harus string ISO (TIMESTAMPTZ di DB) | ✅ Pass |
| System validasi decimal types | Field anggaran | Type harus number (DECIMAL di DB) | ✅ Pass |
| System validasi JSONB types | Field detail | Type harus object atau any | ✅ Pass |
| System validasi UUID format | ID fields | Format UUID v4 valid (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx) | ✅ Pass |

---

## 📊 Ringkasan Statistik

| Kategori | Jumlah Test | Status |
|----------|-------------|--------|
| **Server Actions** | **119** | ✅ All Pass |
| ├─ Autentikasi | 18 | ✅ |
| ├─ Proposal | 23 | ✅ |
| ├─ Tim | 23 | ✅ |
| ├─ Hibah | 19 | ✅ |
| ├─ Pencairan | 20 | ✅ |
| └─ Admin | 16 | ✅ |
| **Business Logic** | **51** | ✅ All Pass |
| ├─ Proposal Logic | 18 | ✅ |
| ├─ Hibah Logic | 16 | ✅ |
| └─ Pencairan Logic | 17 | ✅ |
| **Infrastructure** | **66** | ✅ All Pass |
| ├─ Middleware | 21 | ✅ |
| ├─ Database Queries | 23 | ✅ |
| └─ Database Types | 22 | ✅ |
| **TOTAL** | **236** | ✅ **100% Pass** |

---

## 🎯 Kesimpulan

Semua **236 test cases** telah diverifikasi dan **PASS 100%**. Dokumentasi ini mencakup:

✅ **Validasi Input** - Semua input form tervalidasi dengan benar  
✅ **Logika Bisnis** - Aturan bisnis (status transitions, budget calculations, team composition) berjalan sesuai spesifikasi  
✅ **Integritas Data** - Constraint database (unique, foreign key, required fields) terjaga  
✅ **Keamanan** - Autentikasi dan otorisasi role-based berfungsi dengan baik  
✅ **Konsistensi** - Format data (currency, date, nomor surat) konsisten  

---

**Generated**: January 8, 2026  
**Test Framework**: Vitest 4.0.16  
**Total Test Duration**: ~2.21 seconds  
**Project**: Sistem Informasi LPPM - Research & Community Service
