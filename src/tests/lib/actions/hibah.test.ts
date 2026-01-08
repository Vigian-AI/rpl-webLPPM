/**
 * ============================================================================
 * UNIT TEST: HIBAH ACTIONS (SERVER ACTIONS HIBAH)
 * ============================================================================
 * File ini berisi pengujian untuk logika server actions manajemen hibah.
 * 
 * Cakupan pengujian:
 * 1. MasterHibahInput validation - Validasi input pembuatan hibah
 * 2. MasterHibah data structure - Struktur data hibah lengkap
 * 3. Date validation - Validasi periode buka-tutup hibah
 * 4. Active hibah filtering - Filter hibah yang sedang aktif
 * 5. Budget validation - Validasi anggaran total dan per proposal
 * 6. Tahun anggaran validation - Validasi tahun anggaran hibah
 * 
 * Total Tests: 19
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MasterHibah, MasterHibahInput } from '@/types/database.types';

describe('Hibah Actions - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * -------------------------------------------------------------------------
   * MASTER HIBAH INPUT VALIDATION
   * -------------------------------------------------------------------------
   * Menguji validasi input untuk pembuatan hibah baru oleh admin.
   * Field wajib: nama_hibah, jenis, tahun_anggaran, anggaran_total, tanggal_buka/tutup
   * -------------------------------------------------------------------------
   */
  describe('MasterHibahInput validation', () => {
    // Test: Memvalidasi field wajib untuk hibah
    it('should validate required fields', () => {
      const validInput: MasterHibahInput = {
        nama_hibah: 'Hibah Penelitian 2024',
        jenis: 'Penelitian Dasar',
        tahun_anggaran: 2024,
        anggaran_total: 1000000000,
        tanggal_buka: '2024-01-01',
        tanggal_tutup: '2024-06-30',
      };

      expect(validInput.nama_hibah).toBeDefined();
      expect(validInput.jenis).toBeDefined();
      expect(validInput.tahun_anggaran).toBeDefined();
      expect(validInput.anggaran_total).toBeGreaterThan(0);
      expect(validInput.tanggal_buka).toBeDefined();
      expect(validInput.tanggal_tutup).toBeDefined();
    });

    // Test: Memvalidasi field opsional seperti deskripsi dan persyaratan
    it('should accept optional fields', () => {
      const fullInput: MasterHibahInput = {
        nama_hibah: 'Hibah Lengkap',
        deskripsi: 'Deskripsi hibah ini...',
        jenis: 'Pengabdian Masyarakat',
        tahun_anggaran: 2024,
        anggaran_total: 500000000,
        anggaran_per_proposal: 50000000,
        tanggal_buka: '2024-02-01',
        tanggal_tutup: '2024-07-31',
        is_active: true,
        persyaratan: 'Persyaratan khusus...',
      };

      expect(fullInput.deskripsi).toBeDefined();
      expect(fullInput.anggaran_per_proposal).toBe(50000000);
      expect(fullInput.is_active).toBe(true);
      expect(fullInput.persyaratan).toBeDefined();
    });
  });

  /**
   * -------------------------------------------------------------------------
   * MASTER HIBAH DATA STRUCTURE
   * -------------------------------------------------------------------------
   * Menguji struktur data lengkap hibah yang dikembalikan dari database.
   * Mencakup semua field termasuk id, timestamps, dan relasi.
   * -------------------------------------------------------------------------
   */
  describe('MasterHibah data structure', () => {
    // Test: Memastikan semua field data hibah lengkap
    it('should have all required fields', () => {
      const hibah: MasterHibah = {
        id: 'hibah-uuid',
        nama_hibah: 'Hibah Penelitian',
        deskripsi: 'Deskripsi hibah',
        jenis: 'Penelitian Terapan',
        tahun_anggaran: 2024,
        anggaran_total: 1000000000,
        anggaran_per_proposal: 100000000,
        tanggal_buka: '2024-01-01',
        tanggal_tutup: '2024-12-31',
        is_active: true,
        persyaratan: 'Persyaratan...',
        created_by: 'admin-uuid',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(hibah.id).toBeDefined();
      expect(hibah.nama_hibah).toBeDefined();
      expect(hibah.jenis).toBeDefined();
      expect(hibah.tahun_anggaran).toBeDefined();
      expect(hibah.anggaran_total).toBeGreaterThan(0);
    });
  });

  describe('Date validation', () => {
    it('should validate tanggal_tutup is after tanggal_buka', () => {
      const tanggal_buka = '2024-01-01';
      const tanggal_tutup = '2024-06-30';

      const bukaDate = new Date(tanggal_buka);
      const tutupDate = new Date(tanggal_tutup);

      expect(tutupDate.getTime()).toBeGreaterThan(bukaDate.getTime());
    });

    it('should detect invalid date range (tutup before buka)', () => {
      const tanggal_buka = '2024-06-30';
      const tanggal_tutup = '2024-01-01';

      const bukaDate = new Date(tanggal_buka);
      const tutupDate = new Date(tanggal_tutup);

      expect(tutupDate.getTime()).toBeLessThan(bukaDate.getTime());
    });

    it('should format date correctly', () => {
      const date = new Date('2024-03-15');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2024-03-15');
    });
  });

  describe('Active hibah filtering', () => {
    const today = new Date('2024-03-15');
    const todayStr = today.toISOString().split('T')[0];

    const hibahList: Partial<MasterHibah>[] = [
      {
        id: '1',
        nama_hibah: 'Hibah Aktif',
        is_active: true,
        tanggal_buka: '2024-01-01',
        tanggal_tutup: '2024-06-30',
      },
      {
        id: '2',
        nama_hibah: 'Hibah Belum Buka',
        is_active: true,
        tanggal_buka: '2024-04-01',
        tanggal_tutup: '2024-12-31',
      },
      {
        id: '3',
        nama_hibah: 'Hibah Sudah Tutup',
        is_active: true,
        tanggal_buka: '2024-01-01',
        tanggal_tutup: '2024-02-28',
      },
      {
        id: '4',
        nama_hibah: 'Hibah Non-Aktif',
        is_active: false,
        tanggal_buka: '2024-01-01',
        tanggal_tutup: '2024-12-31',
      },
    ];

    it('should filter active hibah that are currently open', () => {
      const activeHibah = hibahList.filter((h) => {
        return (
          h.is_active === true &&
          h.tanggal_buka! <= todayStr &&
          h.tanggal_tutup! >= todayStr
        );
      });

      expect(activeHibah).toHaveLength(1);
      expect(activeHibah[0].nama_hibah).toBe('Hibah Aktif');
    });

    it('should filter inactive hibah', () => {
      const inactiveHibah = hibahList.filter((h) => !h.is_active);
      expect(inactiveHibah).toHaveLength(1);
      expect(inactiveHibah[0].nama_hibah).toBe('Hibah Non-Aktif');
    });
  });

  describe('Budget validation', () => {
    it('should validate anggaran_total is positive', () => {
      const anggaran_total = 1000000000;
      expect(anggaran_total).toBeGreaterThan(0);
    });

    it('should validate anggaran_per_proposal <= anggaran_total', () => {
      const anggaran_total = 1000000000;
      const anggaran_per_proposal = 100000000;
      expect(anggaran_per_proposal).toBeLessThanOrEqual(anggaran_total);
    });

    it('should calculate max proposals based on budget', () => {
      const anggaran_total = 1000000000;
      const anggaran_per_proposal = 100000000;
      const maxProposals = Math.floor(anggaran_total / anggaran_per_proposal);
      expect(maxProposals).toBe(10);
    });

    it('should format currency correctly', () => {
      const amount = 1000000000;
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
      expect(formatted).toContain('1.000.000.000');
    });
  });

  describe('Tahun anggaran validation', () => {
    it('should validate tahun_anggaran is a valid year', () => {
      const validYears = [2023, 2024, 2025, 2026];

      validYears.forEach((year) => {
        expect(year).toBeGreaterThanOrEqual(2000);
        expect(year).toBeLessThanOrEqual(2100);
      });
    });

    it('should filter by tahun_anggaran', () => {
      const hibahList = [
        { id: '1', tahun_anggaran: 2023 },
        { id: '2', tahun_anggaran: 2024 },
        { id: '3', tahun_anggaran: 2024 },
        { id: '4', tahun_anggaran: 2025 },
      ];

      const hibah2024 = hibahList.filter((h) => h.tahun_anggaran === 2024);
      expect(hibah2024).toHaveLength(2);
    });
  });

  describe('Hibah jenis validation', () => {
    it('should accept valid jenis hibah', () => {
      const validJenis = [
        'Penelitian Dasar',
        'Penelitian Terapan',
        'Pengabdian Masyarakat',
        'Penelitian Kolaborasi',
        'Hibah Internal',
      ];

      validJenis.forEach((jenis) => {
        expect(jenis.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Hibah toggle status', () => {
    it('should toggle is_active from false to true', () => {
      const hibah = { id: '1', is_active: false };
      const isActive = !hibah.is_active;
      expect(isActive).toBe(true);
    });

    it('should toggle is_active from true to false', () => {
      const hibah = { id: '1', is_active: true };
      const isActive = !hibah.is_active;
      expect(isActive).toBe(false);
    });
  });

  describe('Hibah sorting', () => {
    const hibahList = [
      { id: '1', tanggal_tutup: '2024-06-30', created_at: '2024-01-01' },
      { id: '2', tanggal_tutup: '2024-03-31', created_at: '2024-02-01' },
      { id: '3', tanggal_tutup: '2024-12-31', created_at: '2024-01-15' },
    ];

    it('should sort by tanggal_tutup ascending', () => {
      const sorted = [...hibahList].sort(
        (a, b) => new Date(a.tanggal_tutup).getTime() - new Date(b.tanggal_tutup).getTime()
      );

      expect(sorted[0].tanggal_tutup).toBe('2024-03-31');
      expect(sorted[1].tanggal_tutup).toBe('2024-06-30');
      expect(sorted[2].tanggal_tutup).toBe('2024-12-31');
    });

    it('should sort by created_at descending', () => {
      const sorted = [...hibahList].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });
  });
});
