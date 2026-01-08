/**
 * ============================================================================
 * HIBAH BUSINESS LOGIC TESTS
 * ============================================================================
 * 
 * File ini berisi unit test untuk logika bisnis program Hibah (Grant).
 * Hibah adalah program pendanaan penelitian/pengabdian yang disediakan oleh LPPM.
 * 
 * Kategori Test:
 * 1. Hibah Status      - Menentukan status hibah (active/upcoming/closed/inactive)
 * 2. Budget Allocation - Menghitung dan validasi alokasi anggaran
 * 3. Hibah Validation  - Validasi input data hibah baru
 * 4. Hibah Filtering   - Filter dan pencarian hibah
 * 
 * Total Tests: 16
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';

describe('Hibah Business Logic Tests', () => {
  /**
   * -------------------------------------------------------------------------
   * HIBAH STATUS TESTS
   * -------------------------------------------------------------------------
   * Menguji penentuan status hibah berdasarkan:
   * - Flag is_active (aktif/nonaktif oleh admin)
   * - Tanggal buka dan tutup pendaftaran
   * 
   * Status yang mungkin:
   * - 'active'   : Hibah sedang dibuka untuk pendaftaran
   * - 'upcoming' : Hibah belum dibuka (tanggal buka di masa depan)
   * - 'closed'   : Hibah sudah ditutup (tanggal tutup sudah lewat)
   * - 'inactive' : Hibah dinonaktifkan oleh admin
   * -------------------------------------------------------------------------
   */
  describe('Hibah Status', () => {
    // Interface untuk data Hibah minimal yang diperlukan untuk penentuan status
    interface Hibah {
      is_active: boolean;       // Flag aktif/nonaktif dari admin
      tanggal_buka: string;     // Tanggal mulai pendaftaran (ISO format)
      tanggal_tutup: string;    // Tanggal akhir pendaftaran (ISO format)
    }

    /**
     * Fungsi untuk menentukan status hibah saat ini
     * @param hibah - Data hibah
     * @returns Status hibah: 'active' | 'upcoming' | 'closed' | 'inactive'
     */
    const getHibahStatus = (hibah: Hibah): 'active' | 'upcoming' | 'closed' | 'inactive' => {
      // Jika admin menonaktifkan hibah, langsung return 'inactive'
      if (!hibah.is_active) return 'inactive';

      const now = new Date();
      const openDate = new Date(hibah.tanggal_buka);
      const closeDate = new Date(hibah.tanggal_tutup);

      // Cek apakah tanggal sekarang dalam rentang pendaftaran
      if (now < openDate) return 'upcoming';  // Belum buka
      if (now > closeDate) return 'closed';   // Sudah tutup
      return 'active';                         // Sedang dibuka
    };

    /**
     * Fungsi untuk mengecek apakah proposal bisa disubmit ke hibah ini
     * @param hibah - Data hibah
     * @returns true jika hibah sedang aktif dan dibuka
     */
    const canSubmitProposal = (hibah: Hibah): boolean => {
      return getHibahStatus(hibah) === 'active';
    };

    // Test: Hibah dengan tanggal yang mencakup hari ini harus return 'active'
    // Test: Hibah dengan tanggal yang mencakup hari ini harus return 'active'
    it('should return active for open hibah', () => {
      const hibah: Hibah = {
        is_active: true,
        tanggal_buka: '2020-01-01',   // Sudah lewat
        tanggal_tutup: '2099-12-31',  // Masih lama
      };
      expect(getHibahStatus(hibah)).toBe('active');
    });

    // Test: Hibah yang belum dibuka harus return 'upcoming'
    it('should return upcoming for future hibah', () => {
      const hibah: Hibah = {
        is_active: true,
        tanggal_buka: '2099-01-01',   // Di masa depan
        tanggal_tutup: '2099-12-31',
      };
      expect(getHibahStatus(hibah)).toBe('upcoming');
    });

    // Test: Hibah yang sudah lewat tanggal tutupnya harus return 'closed'
    it('should return closed for past hibah', () => {
      const hibah: Hibah = {
        is_active: true,
        tanggal_buka: '2020-01-01',
        tanggal_tutup: '2020-12-31',  // Sudah lewat
      };
      expect(getHibahStatus(hibah)).toBe('closed');
    });

    // Test: Hibah yang dinonaktifkan admin harus return 'inactive' meskipun tanggalnya valid
    it('should return inactive for deactivated hibah', () => {
      const hibah: Hibah = {
        is_active: false,             // Dinonaktifkan oleh admin
        tanggal_buka: '2020-01-01',
        tanggal_tutup: '2099-12-31',
      };
      expect(getHibahStatus(hibah)).toBe('inactive');
    });

    // Test: Proposal hanya bisa disubmit ke hibah yang statusnya 'active'
    it('should allow proposal submission only for active hibah', () => {
      // Hibah yang sedang aktif - proposal bisa disubmit
      const activeHibah: Hibah = {
        is_active: true,
        tanggal_buka: '2020-01-01',
        tanggal_tutup: '2099-12-31',
      };
      // Hibah yang sudah tutup - proposal tidak bisa disubmit
      const closedHibah: Hibah = {
        is_active: true,
        tanggal_buka: '2020-01-01',
        tanggal_tutup: '2020-12-31',  // Sudah lewat
      };

      expect(canSubmitProposal(activeHibah)).toBe(true);   // Bisa submit
      expect(canSubmitProposal(closedHibah)).toBe(false);  // Tidak bisa submit
    });
  });

  /**
   * -------------------------------------------------------------------------
   * BUDGET ALLOCATION TESTS
   * -------------------------------------------------------------------------
   * Menguji perhitungan dan validasi alokasi anggaran hibah:
   * - Menghitung sisa anggaran tersedia
   * - Menghitung maksimal proposal yang bisa didanai
   * - Validasi apakah anggaran bisa dialokasikan
   * - Menghitung persentase utilisasi anggaran
   * -------------------------------------------------------------------------
   */
  describe('Budget Allocation', () => {
    // Interface untuk data anggaran hibah
    interface HibahBudget {
      anggaran_total: number;         // Total anggaran hibah (Rp)
      anggaran_per_proposal: number;  // Batas maksimal per proposal (Rp)
      anggaran_terpakai: number;      // Anggaran yang sudah dialokasikan (Rp)
    }

    /**
     * Menghitung sisa anggaran yang tersedia
     * @returns Sisa anggaran dalam Rupiah
     */
    const getAvailableBudget = (budget: HibahBudget): number => {
      return budget.anggaran_total - budget.anggaran_terpakai;
    };

    /**
     * Menghitung berapa proposal lagi yang bisa didanai dengan anggaran tersisa
     * @returns Jumlah proposal maksimal
     */
    const getMaxProposals = (budget: HibahBudget): number => {
      const available = getAvailableBudget(budget);
      return Math.floor(available / budget.anggaran_per_proposal);
    };

    /**
     * Mengecek apakah anggaran yang diminta bisa dialokasikan
     * @param requested - Jumlah anggaran yang diminta
     * @returns true jika bisa dialokasikan
     */
    const canAllocateBudget = (budget: HibahBudget, requested: number): boolean => {
      // Tidak boleh melebihi batas per proposal
      if (requested > budget.anggaran_per_proposal) return false;
      // Tidak boleh melebihi sisa anggaran
      if (requested > getAvailableBudget(budget)) return false;
      return true;
    };

    /**
     * Menghitung persentase utilisasi anggaran
     * @returns Persentase (0-100)
     */
    const getBudgetUtilization = (budget: HibahBudget): number => {
      return (budget.anggaran_terpakai / budget.anggaran_total) * 100;
    };

    // Test: Hitung sisa anggaran = total - terpakai
    it('should calculate available budget', () => {
      const budget: HibahBudget = {
        anggaran_total: 1000000000,       // 1 Milyar total
        anggaran_per_proposal: 100000000, // 100 Juta per proposal
        anggaran_terpakai: 300000000,     // 300 Juta sudah terpakai
      };
      // Sisa = 1M - 300Jt = 700Jt
      expect(getAvailableBudget(budget)).toBe(700000000);
    });

    // Test: Hitung berapa proposal yang masih bisa didanai
    it('should calculate max proposals', () => {
      const budget: HibahBudget = {
        anggaran_total: 1000000000,
        anggaran_per_proposal: 100000000,
        anggaran_terpakai: 300000000,
      };
      // Sisa 700Jt / 100Jt per proposal = 7 proposal
      expect(getMaxProposals(budget)).toBe(7);
    });

    // Test: Validasi apakah anggaran yang diminta bisa dialokasikan
    it('should validate budget allocation', () => {
      const budget: HibahBudget = {
        anggaran_total: 1000000000,
        anggaran_per_proposal: 100000000,
        anggaran_terpakai: 900000000,     // Sisa hanya 100Jt
      };

      // 50Jt - OK, masih di bawah batas dan tersedia
      expect(canAllocateBudget(budget, 50000000)).toBe(true);
      // 150Jt - GAGAL, melebihi batas per proposal (100Jt)
      expect(canAllocateBudget(budget, 150000000)).toBe(false);
      // 100.000.001 - GAGAL, melebihi sisa (100Jt)
      expect(canAllocateBudget(budget, 100000001)).toBe(false);
    });

    // Test: Hitung persentase utilisasi anggaran
    it('should calculate budget utilization', () => {
      const budget: HibahBudget = {
        anggaran_total: 1000000000,
        anggaran_per_proposal: 100000000,
        anggaran_terpakai: 750000000,     // 750Jt terpakai
      };
      // Utilisasi = 750Jt / 1M * 100 = 75%
      expect(getBudgetUtilization(budget)).toBe(75);
    });
  });

  /**
   * -------------------------------------------------------------------------
   * HIBAH VALIDATION TESTS
   * -------------------------------------------------------------------------
   * Menguji validasi input saat membuat/mengupdate program hibah:
   * - Nama hibah tidak boleh kosong
   * - Jenis hibah wajib dipilih
   * - Tahun anggaran dalam range yang valid
   * - Anggaran total dan per proposal harus positif
   * - Tanggal tutup harus setelah tanggal buka
   * -------------------------------------------------------------------------
   */
  describe('Hibah Validation', () => {
    // Interface untuk data input hibah baru
    interface HibahData {
      nama_hibah: string;           // Nama program hibah
      jenis: string;                // Jenis: 'Penelitian' | 'Pengabdian'
      tahun_anggaran: number;       // Tahun anggaran (misal: 2024)
      anggaran_total: number;       // Total anggaran program (Rp)
      anggaran_per_proposal: number; // Batas per proposal (Rp)
      tanggal_buka: string;         // Tanggal buka pendaftaran
      tanggal_tutup: string;        // Tanggal tutup pendaftaran
    }

    /**
     * Validasi data hibah sebelum disimpan ke database
     * @returns Object dengan status valid dan daftar error per field
     */
    const validateHibah = (data: HibahData): { valid: boolean; errors: Record<string, string> } => {
      const errors: Record<string, string> = {};

      // Validasi: Nama hibah wajib diisi
      if (!data.nama_hibah.trim()) {
        errors.nama_hibah = 'Nama hibah wajib diisi';
      }

      // Validasi: Jenis hibah wajib dipilih
      if (!data.jenis.trim()) {
        errors.jenis = 'Jenis hibah wajib dipilih';
      }

      // Validasi: Tahun anggaran harus dalam range wajar (tahun lalu s/d 5 tahun ke depan)
      const currentYear = new Date().getFullYear();
      if (data.tahun_anggaran < currentYear - 1 || data.tahun_anggaran > currentYear + 5) {
        errors.tahun_anggaran = 'Tahun anggaran tidak valid';
      }

      // Validasi: Anggaran total harus lebih dari 0
      if (data.anggaran_total <= 0) {
        errors.anggaran_total = 'Anggaran total harus lebih dari 0';
      }

      // Validasi: Anggaran per proposal harus lebih dari 0
      if (data.anggaran_per_proposal <= 0) {
        errors.anggaran_per_proposal = 'Anggaran per proposal harus lebih dari 0';
      }

      // Validasi: Anggaran per proposal tidak boleh melebihi total
      if (data.anggaran_per_proposal > data.anggaran_total) {
        errors.anggaran_per_proposal = 'Anggaran per proposal tidak boleh melebihi total';
      }

      // Validasi: Tanggal buka wajib diisi
      if (!data.tanggal_buka) {
        errors.tanggal_buka = 'Tanggal buka wajib diisi';
      }

      // Validasi: Tanggal tutup wajib diisi
      if (!data.tanggal_tutup) {
        errors.tanggal_tutup = 'Tanggal tutup wajib diisi';
      }

      // Validasi: Tanggal tutup harus setelah tanggal buka
      if (data.tanggal_buka && data.tanggal_tutup) {
        if (new Date(data.tanggal_tutup) <= new Date(data.tanggal_buka)) {
          errors.tanggal_tutup = 'Tanggal tutup harus setelah tanggal buka';
        }
      }

      return { valid: Object.keys(errors).length === 0, errors };
    };

    // Test: Data hibah yang lengkap dan valid harus lolos validasi
    it('should validate complete hibah data', () => {
      const data: HibahData = {
        nama_hibah: 'Hibah Penelitian 2024',
        jenis: 'Penelitian',
        tahun_anggaran: new Date().getFullYear(), // Tahun berjalan
        anggaran_total: 1000000000,               // 1 Milyar
        anggaran_per_proposal: 100000000,         // 100 Juta
        tanggal_buka: '2024-01-01',
        tanggal_tutup: '2024-06-30',              // Setelah tanggal buka ✓
      };

      const result = validateHibah(data);
      expect(result.valid).toBe(true);
    });

    // Test: Tanggal tutup tidak boleh sebelum tanggal buka
    it('should reject invalid date range', () => {
      const data: HibahData = {
        nama_hibah: 'Hibah Test',
        jenis: 'Penelitian',
        tahun_anggaran: new Date().getFullYear(),
        anggaran_total: 1000000000,
        anggaran_per_proposal: 100000000,
        tanggal_buka: '2024-06-30',    // Lebih akhir dari tutup
        tanggal_tutup: '2024-01-01',   // Sebelum buka - SALAH!
      };

      const result = validateHibah(data);
      expect(result.errors.tanggal_tutup).toBeDefined();
    });

    // Test: Anggaran per proposal tidak boleh melebihi total
    it('should reject invalid budget', () => {
      const data: HibahData = {
        nama_hibah: 'Hibah Test',
        jenis: 'Penelitian',
        tahun_anggaran: new Date().getFullYear(),
        anggaran_total: 100000000,        // 100 Juta total
        anggaran_per_proposal: 200000000, // 200 Juta per proposal - MELEBIHI TOTAL!
        tanggal_buka: '2024-01-01',
        tanggal_tutup: '2024-06-30',
      };

      const result = validateHibah(data);
      expect(result.errors.anggaran_per_proposal).toBeDefined();
    });
  });

  /**
   * -------------------------------------------------------------------------
   * HIBAH FILTERING TESTS
   * -------------------------------------------------------------------------
   * Menguji fungsi filter dan pencarian hibah:
   * - Filter berdasarkan jenis (Penelitian/Pengabdian)
   * - Filter berdasarkan tahun anggaran
   * - Filter hanya yang aktif
   * - Pencarian berdasarkan nama
   * -------------------------------------------------------------------------
   */
  describe('Hibah Filtering', () => {
    // Interface untuk data hibah dalam list
    interface Hibah {
      id: string;
      nama_hibah: string;
      jenis: string;            // 'Penelitian' | 'Pengabdian'
      tahun_anggaran: number;
      is_active: boolean;
    }

    /**
     * Filter hibah berdasarkan jenis
     */
    const filterByJenis = (list: Hibah[], jenis: string): Hibah[] => {
      return list.filter((h) => h.jenis === jenis);
    };

    /**
     * Filter hibah berdasarkan tahun anggaran
     */
    const filterByTahun = (list: Hibah[], tahun: number): Hibah[] => {
      return list.filter((h) => h.tahun_anggaran === tahun);
    };

    /**
     * Filter hanya hibah yang aktif
     */
    const filterActive = (list: Hibah[]): Hibah[] => {
      return list.filter((h) => h.is_active);
    };

    /**
     * Cari hibah berdasarkan nama (case-insensitive)
     */
    const searchHibah = (list: Hibah[], query: string): Hibah[] => {
      const lowerQuery = query.toLowerCase();
      return list.filter((h) => h.nama_hibah.toLowerCase().includes(lowerQuery));
    };

    // Data sample untuk testing
    const hibahList: Hibah[] = [
      { id: '1', nama_hibah: 'Hibah Penelitian Internal', jenis: 'Penelitian', tahun_anggaran: 2024, is_active: true },
      { id: '2', nama_hibah: 'Hibah Pengabdian Masyarakat', jenis: 'Pengabdian', tahun_anggaran: 2024, is_active: true },
      { id: '3', nama_hibah: 'Hibah Penelitian 2023', jenis: 'Penelitian', tahun_anggaran: 2023, is_active: false },
      { id: '4', nama_hibah: 'Hibah DIKTI', jenis: 'Penelitian', tahun_anggaran: 2024, is_active: true },
    ];

    // Test: Filter berdasarkan jenis menghasilkan hanya hibah dengan jenis tersebut
    it('should filter by jenis', () => {
      const result = filterByJenis(hibahList, 'Penelitian');
      expect(result.length).toBe(3); // 3 hibah dengan jenis 'Penelitian'
    });

    // Test: Filter berdasarkan tahun menghasilkan hanya hibah tahun tersebut
    it('should filter by tahun', () => {
      const result = filterByTahun(hibahList, 2024);
      expect(result.length).toBe(3); // 3 hibah tahun 2024
    });

    // Test: Filter aktif menghasilkan hanya hibah yang is_active = true
    it('should filter active only', () => {
      const result = filterActive(hibahList);
      expect(result.length).toBe(3); // 3 hibah aktif (1 tidak aktif)
    });

    // Test: Pencarian berdasarkan nama (case-insensitive)
    it('should search by name', () => {
      const result = searchHibah(hibahList, 'internal'); // Cari 'internal'
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1'); // 'Hibah Penelitian Internal'
    });
  });
});
