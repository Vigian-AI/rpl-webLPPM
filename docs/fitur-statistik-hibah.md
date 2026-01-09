# Fitur Statistik Hibah - Admin Dashboard

## Deskripsi
Halaman manajemen hibah admin telah ditingkatkan dengan fitur statistik interaktif yang memberikan gambaran komprehensif tentang setiap program hibah.

## Fitur Utama

### 1. Dashboard Statistik Overview
Menampilkan 4 card statistik utama di bagian atas halaman:
- **Hibah Aktif**: Jumlah hibah yang sedang berjalan
- **Total Proposal**: Total proposal yang terdaftar di semua hibah
- **Menunggu Review**: Proposal dengan status submitted atau review
- **Proposal Diterima**: Total proposal yang telah disetujui

### 2. Kolom Proposal di Tabel
Setiap baris hibah di tabel menampilkan:
- **Jumlah Total Proposal**: Badge menunjukkan berapa proposal yang diajukan
- **Proposal Diterima**: Informasi tambahan jumlah proposal yang diterima

### 3. Detail Statistik Expandable
Klik pada setiap baris hibah untuk melihat detail lengkap:

#### Status Proposal:
- **Draft**: Proposal yang masih dalam tahap penyusunan
- **Diajukan**: Proposal yang telah disubmit dan menunggu review
- **Review**: Proposal yang sedang dalam proses review
- **Diterima**: Proposal yang telah disetujui
- **Ditolak**: Proposal yang ditolak

#### Informasi Anggaran:
- **Total Anggaran Diajukan**: Jumlah total dana yang diminta dari semua proposal
- **Sisa Anggaran**: Kalkulasi otomatis sisa anggaran hibah

## Fungsi Backend Baru

### `getHibahStatistics(hibahId?: string)`
Mengambil statistik proposal untuk hibah tertentu atau semua hibah.

**Return:**
```typescript
{
  hibahId: string;
  totalProposals: number;
  draftProposals: number;
  submittedProposals: number;
  reviewProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  totalRequested: number;
}
```

### `getHibahListWithStats()`
Mengambil daftar hibah beserta statistik masing-masing.

**Return:**
```typescript
{
  data: (MasterHibah & { stats: HibahStatistics })[];
  error: string | null;
}
```

## Interaksi Pengguna

1. **Melihat Overview**: Statistik keseluruhan langsung terlihat di card overview
2. **Melihat Jumlah Proposal**: Kolom "Proposal" di tabel menampilkan jumlah per hibah
3. **Expand Detail**: Klik pada baris hibah untuk melihat breakdown detail
4. **Kelola Hibah**: Tombol aksi (toggle status, edit, hapus) tidak terpengaruh oleh fitur baru

## Manfaat

- ✅ **Visibilitas**: Admin dapat langsung melihat berapa proposal yang masuk untuk setiap hibah
- ✅ **Monitoring**: Mudah memantau status review dan persetujuan proposal
- ✅ **Kontrol Anggaran**: Dapat melihat penggunaan anggaran secara real-time
- ✅ **Efisiensi**: Tidak perlu membuka halaman terpisah untuk melihat statistik
- ✅ **Interaktif**: Expand/collapse untuk detail yang diperlukan saja

## Teknologi

- **React Hooks**: useState untuk state management
- **Server Actions**: getHibahListWithStats untuk data fetching
- **Supabase**: Query agregasi untuk efisiensi
- **TypeScript**: Type safety untuk data statistik
- **Tailwind CSS**: Styling responsive dan modern
- **Lucide Icons**: Icon set untuk visual yang menarik
