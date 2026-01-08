# Rangkuman Unit Test - LPPM Web System
## Database & Server Handling Tests

Dokumen ini berisi rangkuman unit test untuk sistem LPPM (Lembaga Penelitian dan Pengabdian Masyarakat) yang berfokus pada pengujian **database operations** dan **server-side handling**. Unit test ini memastikan bahwa semua operasi CRUD, validasi data, dan business logic berjalan dengan benar.

---

## Informasi Umum

| Item | Detail |
|------|--------|
| **Total Test Files** | 12 files |
| **Total Tests** | 236 tests |
| **Framework** | Vitest 4.0.16 |
| **Database** | Supabase (PostgreSQL) |
| **Environment** | jsdom |

### Apa yang Diuji?
1. **Server Actions** - Fungsi server-side untuk operasi database (CRUD)
2. **Business Logic** - Logika bisnis seperti validasi proposal, perhitungan anggaran
3. **Database Types** - Validasi struktur tipe data sesuai schema database
4. **Middleware** - Proteksi route dan validasi session

---

## Struktur Folder Test

```
src/__tests__/
├── business/                    # Pengujian logika bisnis
│   ├── hibah-logic.test.ts      # Logika program hibah (16 tests)
│   ├── pencairan-logic.test.ts  # Logika pencairan dana (17 tests)
│   └── proposal-logic.test.ts   # Logika proposal penelitian (18 tests)
├── lib/
│   ├── actions/                 # Pengujian server actions (API handlers)
│   │   ├── admin.test.ts        # Operasi admin (16 tests)
│   │   ├── auth.test.ts         # Autentikasi & registrasi (18 tests)
│   │   ├── hibah.test.ts        # CRUD hibah (19 tests)
│   │   ├── pencairan.test.ts    # CRUD pencairan (20 tests)
│   │   ├── proposal.test.ts     # CRUD proposal (23 tests)
│   │   └── team.test.ts         # CRUD tim penelitian (23 tests)
│   └── supabase/                # Pengujian query database
│       └── queries.test.ts      # Filter, pagination, RLS (23 tests)
├── middleware/                  # Pengujian middleware
│   └── middleware.test.ts       # Proteksi route (21 tests)
├── types/                       # Pengujian tipe database
│   └── database.types.test.ts   # Validasi struktur entity (22 tests)
└── setup.ts                     # Konfigurasi mock & setup
```

---

## Ringkasan Per Kategori

### 1. Server Actions (119 tests)

Server Actions adalah fungsi yang berjalan di server untuk menangani operasi database. Setiap action diuji untuk memastikan validasi input dan respons yang benar.

| File | Tests | Deskripsi |
|------|-------|-----------|
| `auth.test.ts` | 18 | **Autentikasi**: Validasi login/register, pembuatan session, redirect berdasarkan role |
| `proposal.test.ts` | 23 | **Proposal**: Pembuatan proposal, perubahan status (draft→submitted→review→accepted), validasi anggaran |
| `team.test.ts` | 23 | **Tim**: Pembuatan tim, undang anggota, terima/tolak undangan, validasi komposisi tim |
| `hibah.test.ts` | 19 | **Hibah**: Pembuatan program hibah, validasi tanggal buka/tutup, batasan anggaran |
| `pencairan.test.ts` | 20 | **Pencairan**: Pembuatan surat pencairan, generate nomor surat, tracking status |
| `admin.test.ts` | 16 | **Admin**: Statistik dashboard, manajemen user, overview proposal |

### 2. Business Logic (51 tests)

Business Logic menguji aturan bisnis yang harus dipenuhi dalam sistem, termasuk validasi kompleks dan perhitungan.

| File | Tests | Deskripsi |
|------|-------|-----------|
| `proposal-logic.test.ts` | 18 | **Aturan Proposal**: Transisi status yang valid, perhitungan anggaran per kategori, validasi komposisi tim (min. 1 mahasiswa), skor review |
| `hibah-logic.test.ts` | 16 | **Aturan Hibah**: Status aktif/tutup berdasarkan tanggal, alokasi anggaran tersedia, filtering hibah |
| `pencairan-logic.test.ts` | 17 | **Aturan Pencairan**: Format nomor surat (SP/XXXX/LPPM/YYYY), timeline pencairan, kalkulasi total dana |

### 3. Database & Middleware (66 tests)

Pengujian yang berkaitan langsung dengan database schema dan keamanan route.

| File | Tests | Deskripsi |
|------|-------|-----------|
| `queries.test.ts` | 23 | **Query Database**: Filter (eq, gt, like, in), ordering, pagination, simulasi Row Level Security (RLS) |
| `database.types.test.ts` | 22 | **Tipe Data**: Validasi struktur User, Dosen, Mahasiswa, Admin, Proposal, Tim, AnggotaTim |
| `middleware.test.ts` | 21 | **Middleware**: Proteksi route berdasarkan role, validasi session, redirect unauthorized |

---

## Detail Test Cases

### 1. Authentication Tests (`auth.test.ts`)

Menguji proses login, registrasi, dan manajemen session.

```
✓ Login Input Validation
  - Menolak username kosong
  - Menolak password kosong
  - Menolak username terlalu pendek (< 3 karakter)
  - Menolak password terlalu pendek (< 8 karakter)
  - Menerima input login yang valid

✓ Register Input Validation
  - Menolak format email tidak valid
  - Menolak password lemah (tanpa huruf besar/angka)
  - Menolak role dosen tanpa NIDN
  - Menolak role mahasiswa tanpa NIM
  - Menerima registrasi dosen dengan data lengkap
  - Menerima registrasi mahasiswa dengan data lengkap

✓ Session Handling
  - Membuat session dengan struktur yang benar (userId, username, role)
  - Memvalidasi session expiry
  - Menangani refresh session

✓ Role-based Redirects
  - Redirect admin ke /admin setelah login
  - Redirect dosen ke /dosen setelah login
  - Redirect mahasiswa ke /mahasiswa setelah login
```

### 2. Proposal Tests (`proposal.test.ts`)

Menguji operasi CRUD proposal penelitian dan aturan transisi status.

```
✓ Proposal Input Validation
  - Menolak judul kosong
  - Menolak hibah_id tidak valid (bukan UUID)
  - Menolak tim_id tidak valid
  - Memvalidasi range anggaran (> 0, ≤ batas hibah)
  - Menerima input proposal yang valid

✓ Status Transitions (Alur Status)
  - draft → submitted ✓ (diizinkan)
  - submitted → review ✓ (diizinkan)
  - review → accepted/rejected/revision ✓ (diizinkan)
  - submitted → draft ✗ (tidak diizinkan - mundur)
  - rejected → review ✗ (tidak diizinkan - status terminal)

✓ Anggaran Validation
  - Menolak anggaran negatif
  - Menolak anggaran melebihi batas per proposal
  - Menghitung total anggaran dengan benar
```

### 3. Team Tests (`team.test.ts`)

Menguji manajemen tim penelitian dan undangan anggota.

```
✓ Team Input Validation
  - Menolak nama_tim kosong
  - Memvalidasi panjang nama_tim (3-100 karakter)
  - Menerima input tim yang valid

✓ Member Management
  - Memvalidasi batas maksimal anggota (10 orang)
  - Memvalidasi komposisi role (min. 1 mahasiswa, max. 3 dosen)
  - Menangani duplikasi anggota (tidak boleh undang user yang sama)

✓ Invitation Handling
  - Membuat undangan dengan status 'pending'
  - Mengizinkan accept/reject undangan
  - Memvalidasi expiry undangan
```

### 4. Hibah Tests (`hibah.test.ts`)

Menguji program hibah/grant penelitian.

```
✓ Hibah Input Validation
  - Menolak nama_hibah kosong
  - Memvalidasi tahun_anggaran (tahun berjalan ± 5)
  - Memvalidasi tanggal_buka < tanggal_tutup
  - Memvalidasi anggaran_per_proposal ≤ anggaran_total

✓ Status Management
  - Menentukan status active/inactive berdasarkan is_active
  - Mengecek open/closed berdasarkan tanggal
  - Menghitung sisa anggaran tersedia
```

### 5. Pencairan Tests (`pencairan.test.ts`)

Menguji pencairan dana untuk proposal yang disetujui.

```
✓ Pencairan Input Validation
  - Menolak proposal_id tidak valid
  - Memvalidasi format nomor_surat (SP/XXXX/LPPM/YYYY)
  - Menolak jumlah_dana negatif atau melebihi anggaran disetujui

✓ Nomor Surat Generation
  - Generate nomor berurutan (0001, 0002, ...)
  - Menyertakan tahun dalam format
  - Padding dengan nol (0001 bukan 1)

✓ Status Transitions
  - Tracking status: pending → processing → completed
  - Menghitung total dana yang sudah dicairkan
```

---

## Database Types Tested (`database.types.test.ts`)

Memastikan struktur tipe data sesuai dengan schema database PostgreSQL.

### Entity Types (Tabel Utama)
```
✓ User Type
  - Required: id (UUID), username, email, password, role (enum)
  - Optional: last_login
  - Timestamps: created_at, updated_at

✓ Dosen Type
  - Required: id, user_id (FK), nama, nidn
  - Optional: nip, fakultas, prodi, jabatan_fungsional, bidang_keahlian

✓ Mahasiswa Type
  - Required: id, user_id (FK), nama, nim
  - Optional: fakultas, prodi, angkatan

✓ Admin Type
  - Required: id, user_id (FK), nama
  - Optional: nip, jabatan
```

### Relation Types (Tabel Relasi)
```
✓ Proposal Type
  - Foreign Keys: hibah_id, tim_id, ketua_id
  - Enum: status_proposal (draft/submitted/review/revision/accepted/rejected/completed)
  - Decimal: anggaran_diajukan, anggaran_disetujui

✓ Tim Type
  - Foreign Key: ketua_id (ke tabel dosen)
  - Boolean: is_archived

✓ AnggotaTim Type
  - Foreign Keys: tim_id, user_id
  - Enum: status (pending/accepted/rejected)
```

---

## Database Query Tests (`queries.test.ts`)

Menguji pembangunan query Supabase dan simulasi keamanan.

### Query Filters
```
✓ Filter Operations
  - eq: status = 'accepted'
  - gt/gte/lt/lte: anggaran > 50000000
  - like/ilike: judul ILIKE '%penelitian%'
  - in: status IN ('submitted', 'review')
  - is: deleted_at IS NULL

✓ Query Ordering
  - Single: ORDER BY created_at DESC
  - Multiple: ORDER BY status ASC, created_at DESC

✓ Pagination
  - Offset calculation: page 2, size 10 → offset 10
  - Total pages: 95 items / 10 per page = 10 pages
```

### Row Level Security (RLS) Simulation
```
✓ Access Control (Siapa bisa akses apa)
  - Admin: dapat melihat semua proposal ✓
  - Ketua Tim: dapat melihat proposal timnya ✓
  - Anggota Tim: dapat melihat proposal timnya ✓
  - Non-member: TIDAK dapat melihat proposal tim lain ✗
  - Ketua: dapat edit proposal status 'draft' ✓
  - Ketua: TIDAK dapat edit proposal status 'submitted' ✗
```

---

## Middleware Tests (`middleware.test.ts`)

Menguji proteksi route dan validasi akses.

### Route Protection
```
✓ Protected Routes (Route yang dilindungi)
  - /admin/* → hanya untuk role 'admin'
  - /dosen/* → hanya untuk role 'dosen'
  - /mahasiswa/* → hanya untuk role 'mahasiswa'
  - /, /login, /register → public (semua bisa akses)

✓ Role-based Access Control
  - Admin akses /admin ✓
  - Dosen akses /admin → redirect ke /unauthorized ✗
  - Mahasiswa akses /dosen → redirect ke /unauthorized ✗

✓ Session Validation
  - Session valid: { userId, username, role } ✓
  - Session invalid: null, {}, { userId: 123 } ✗
  - Role invalid: role = 'superuser' ✗
```

---

## NPM Scripts

```bash
# Jalankan semua test sekali
npm run test:run

# Jalankan dengan laporan coverage
npm run test:coverage
```

---

## Test Configuration

### vitest.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Supabase Mock (`setup.ts`)

Mock Supabase client untuk testing tanpa koneksi database:

```typescript
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));
```

---

## Coverage Areas

| Area | Status | Tests | Keterangan |
|------|--------|-------|------------|
| Server Actions - Auth | ✅ | 18 | Login, register, session |
| Server Actions - Proposal | ✅ | 23 | CRUD proposal, status |
| Server Actions - Team | ✅ | 23 | CRUD tim, undangan |
| Server Actions - Hibah | ✅ | 19 | CRUD hibah, budget |
| Server Actions - Pencairan | ✅ | 20 | CRUD pencairan |
| Server Actions - Admin | ✅ | 16 | Dashboard, statistik |
| Business Logic - Proposal | ✅ | 18 | Aturan proposal |
| Business Logic - Hibah | ✅ | 16 | Aturan hibah |
| Business Logic - Pencairan | ✅ | 17 | Aturan pencairan |
| Database Queries | ✅ | 23 | Filter, pagination |
| Database Types | ✅ | 22 | Schema validation |
| Middleware | ✅ | 21 | Route protection |
| **Total** | ✅ | **236** | |

---

## Kesimpulan

Unit test ini memastikan bahwa:

1. **Validasi Input** - Semua input dari user divalidasi dengan benar sebelum disimpan ke database
2. **Business Rules** - Aturan bisnis seperti transisi status dan batasan anggaran diterapkan dengan benar
3. **Database Operations** - Operasi CRUD berjalan dengan benar dan mengembalikan respons yang sesuai
4. **Security** - Route dilindungi berdasarkan role dan session divalidasi dengan benar
5. **Data Integrity** - Struktur data sesuai dengan schema database

---

*Generated: January 7, 2026*
*LPPM Web System - Research and Community Service Institute*
