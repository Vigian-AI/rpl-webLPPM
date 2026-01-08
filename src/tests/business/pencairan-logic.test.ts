/**
 * ============================================================================
 * PENCAIRAN (DISBURSEMENT) BUSINESS LOGIC TESTS
 * ============================================================================
 * 
 * File ini berisi unit test untuk logika bisnis Pencairan Dana.
 * Pencairan adalah proses penyaluran dana untuk proposal yang sudah disetujui.
 * 
 * Kategori Test:
 * 1. Disbursement Status    - Manajemen status pencairan
 * 2. Nomor Surat Generation - Generate dan validasi nomor surat
 * 3. Disbursement Calculations - Perhitungan total dana
 * 4. Disbursement Validation - Validasi input pencairan
 * 5. Disbursement Timeline - Tracking alur waktu pencairan
 * 
 * Total Tests: 17
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';

describe('Pencairan (Disbursement) Business Logic Tests', () => {
  /**
   * -------------------------------------------------------------------------
   * DISBURSEMENT STATUS TESTS
   * -------------------------------------------------------------------------
   * Menguji manajemen status pencairan:
   * - Label status dalam Bahasa Indonesia
   * - Warna badge untuk UI
   * - Aturan perubahan status
   * 
   * Alur Status:
   * pending → processing → completed
   *    ↓
   * cancelled
   * -------------------------------------------------------------------------
   */
  describe('Disbursement Status', () => {
    // Type untuk status pencairan
    type PencairanStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

    // Interface untuk data pencairan
    interface Pencairan {
      status: PencairanStatus;
      tanggal_surat: string;   // Tanggal surat pencairan
      tanggal_cair?: string;   // Tanggal dana cair (opsional, diisi saat completed)
    }

    /**
     * Mendapatkan label status dalam Bahasa Indonesia
     * @returns Label yang ditampilkan di UI
     */
    const getStatusLabel = (status: PencairanStatus): string => {
      switch (status) {
        case 'pending':
          return 'Menunggu Proses';
        case 'processing':
          return 'Sedang Diproses';
        case 'completed':
          return 'Selesai';
        case 'cancelled':
          return 'Dibatalkan';
      }
    };

    /**
     * Mendapatkan warna untuk badge status
     * @returns Nama warna untuk styling
     */
    const getStatusColor = (status: PencairanStatus): string => {
      switch (status) {
        case 'pending':
          return 'yellow';   // Kuning - menunggu
        case 'processing':
          return 'blue';     // Biru - proses
        case 'completed':
          return 'green';    // Hijau - selesai
        case 'cancelled':
          return 'red';      // Merah - batal
      }
    };

    /**
     * Cek apakah pencairan bisa dibatalkan
     * @returns true jika masih pending
     */
    const canCancel = (pencairan: Pencairan): boolean => {
      return pencairan.status === 'pending';
    };

    /**
     * Cek apakah pencairan bisa diselesaikan
     * @returns true jika sedang processing
     */
    const canComplete = (pencairan: Pencairan): boolean => {
      return pencairan.status === 'processing';
    };

    // Test: Label status dalam Bahasa Indonesia
    it('should return correct status labels', () => {
      expect(getStatusLabel('pending')).toBe('Menunggu Proses');
      expect(getStatusLabel('processing')).toBe('Sedang Diproses');
      expect(getStatusLabel('completed')).toBe('Selesai');
      expect(getStatusLabel('cancelled')).toBe('Dibatalkan');
    });

    // Test: Warna untuk masing-masing status
    it('should return correct status colors', () => {
      expect(getStatusColor('pending')).toBe('yellow');
      expect(getStatusColor('processing')).toBe('blue');
      expect(getStatusColor('completed')).toBe('green');
      expect(getStatusColor('cancelled')).toBe('red');
    });

    // Test: Hanya bisa cancel saat masih pending
    it('should allow cancel only when pending', () => {
      expect(canCancel({ status: 'pending', tanggal_surat: '2024-01-01' })).toBe(true);
      expect(canCancel({ status: 'processing', tanggal_surat: '2024-01-01' })).toBe(false);
      expect(canCancel({ status: 'completed', tanggal_surat: '2024-01-01' })).toBe(false);
    });

    // Test: Hanya bisa complete saat sedang processing
    it('should allow complete only when processing', () => {
      expect(canComplete({ status: 'processing', tanggal_surat: '2024-01-01' })).toBe(true);
      expect(canComplete({ status: 'pending', tanggal_surat: '2024-01-01' })).toBe(false);
      expect(canComplete({ status: 'completed', tanggal_surat: '2024-01-01' })).toBe(false);
    });
  });

  /**
   * -------------------------------------------------------------------------
   * NOMOR SURAT GENERATION TESTS
   * -------------------------------------------------------------------------
   * Menguji pembuatan dan validasi nomor surat pencairan.
   * 
   * Format Nomor Surat: SP/XXXX/LPPM/YYYY
   * - SP      : Kode Surat Pencairan
   * - XXXX    : Nomor urut (4 digit dengan padding 0)
   * - LPPM    : Kode institusi
   * - YYYY    : Tahun (4 digit)
   * 
   * Contoh: SP/0001/LPPM/2024, SP/0123/LPPM/2025
   * -------------------------------------------------------------------------
   */
  describe('Nomor Surat Generation', () => {
    /**
     * Generate nomor surat baru
     * @param sequence - Nomor urut (1, 2, 3, ...)
     * @param year - Tahun (2024, 2025, ...)
     * @returns Nomor surat dengan format SP/XXXX/LPPM/YYYY
     */
    const generateNomorSurat = (sequence: number, year: number): string => {
      const paddedSeq = String(sequence).padStart(4, '0');  // 1 → 0001
      return `SP/${paddedSeq}/LPPM/${year}`;
    };

    /**
     * Parse nomor surat untuk mendapatkan sequence dan year
     * @returns Object { sequence, year } atau null jika tidak valid
     */
    const parseNomorSurat = (nomor: string): { sequence: number; year: number } | null => {
      const match = nomor.match(/^SP\/(\d{4})\/LPPM\/(\d{4})$/);
      if (!match) return null;
      return {
        sequence: parseInt(match[1], 10),  // 0001 → 1
        year: parseInt(match[2], 10),      // 2024 → 2024
      };
    };

    /**
     * Validasi apakah format nomor surat valid
     * @returns true jika format sesuai
     */
    const isValidNomorSurat = (nomor: string): boolean => {
      return /^SP\/\d{4}\/LPPM\/\d{4}$/.test(nomor);
    };

    // Test: Generate nomor surat dengan format yang benar
    it('should generate nomor surat correctly', () => {
      expect(generateNomorSurat(1, 2024)).toBe('SP/0001/LPPM/2024');     // Padding 0
      expect(generateNomorSurat(123, 2024)).toBe('SP/0123/LPPM/2024');   // Padding 0
      expect(generateNomorSurat(9999, 2024)).toBe('SP/9999/LPPM/2024');  // Maksimal
    });

    // Test: Parse nomor surat kembali ke komponen
    it('should parse nomor surat correctly', () => {
      const parsed = parseNomorSurat('SP/0001/LPPM/2024');
      expect(parsed).toEqual({ sequence: 1, year: 2024 });

      const parsed2 = parseNomorSurat('SP/0123/LPPM/2025');
      expect(parsed2).toEqual({ sequence: 123, year: 2025 });
    });

    // Test: Return null untuk format yang tidak valid
    it('should return null for invalid nomor surat', () => {
      expect(parseNomorSurat('INVALID')).toBeNull();
      expect(parseNomorSurat('SP/123/LPPM/2024')).toBeNull(); // 3 digit, harus 4
    });

    // Test: Validasi format nomor surat
    it('should validate nomor surat format', () => {
      expect(isValidNomorSurat('SP/0001/LPPM/2024')).toBe(true);   // Valid
      expect(isValidNomorSurat('SP/9999/LPPM/2025')).toBe(true);   // Valid
      expect(isValidNomorSurat('INVALID')).toBe(false);            // Tidak valid
      expect(isValidNomorSurat('')).toBe(false);                    // Kosong
    });
  });

  /**
   * -------------------------------------------------------------------------
   * DISBURSEMENT CALCULATIONS TESTS
   * -------------------------------------------------------------------------
   * Menguji perhitungan total dana pencairan:
   * - Total dana yang sudah dicairkan (completed)
   * - Total dana yang masih pending/processing
   * - Ringkasan jumlah per status
   * -------------------------------------------------------------------------
   */
  describe('Disbursement Calculations', () => {
    // Interface untuk item pencairan
    interface DisbursementItem {
      jumlah_dana: number;  // Nominal dalam Rupiah
      status: string;       // Status pencairan
    }

    /**
     * Hitung total dana yang sudah dicairkan (completed)
     */
    const calculateTotalDisbursed = (items: DisbursementItem[]): number => {
      return items
        .filter((i) => i.status === 'completed')
        .reduce((sum, i) => sum + i.jumlah_dana, 0);
    };

    /**
     * Hitung total dana yang masih dalam proses (pending + processing)
     */
    const calculatePendingAmount = (items: DisbursementItem[]): number => {
      return items
        .filter((i) => i.status === 'pending' || i.status === 'processing')
        .reduce((sum, i) => sum + i.jumlah_dana, 0);
    };

    /**
     * Dapatkan ringkasan jumlah pencairan per status
     */
    const getDisbursementSummary = (items: DisbursementItem[]): {
      completed: number;
      pending: number;
      cancelled: number;
    } => {
      return {
        completed: items.filter((i) => i.status === 'completed').length,
        pending: items.filter((i) => i.status === 'pending' || i.status === 'processing').length,
        cancelled: items.filter((i) => i.status === 'cancelled').length,
      };
    };

    // Data sample untuk testing
    const items: DisbursementItem[] = [
      { jumlah_dana: 50000000, status: 'completed' },   // 50 Juta - selesai
      { jumlah_dana: 75000000, status: 'completed' },   // 75 Juta - selesai
      { jumlah_dana: 30000000, status: 'pending' },     // 30 Juta - pending
      { jumlah_dana: 25000000, status: 'processing' },  // 25 Juta - proses
      { jumlah_dana: 20000000, status: 'cancelled' },   // 20 Juta - batal
    ];

    // Test: Total yang sudah dicairkan = 50 + 75 = 125 Juta
    it('should calculate total disbursed', () => {
      expect(calculateTotalDisbursed(items)).toBe(125000000);
    });

    // Test: Total yang masih pending = 30 + 25 = 55 Juta
    it('should calculate pending amount', () => {
      expect(calculatePendingAmount(items)).toBe(55000000);
    });

    // Test: Ringkasan jumlah per status
    it('should get disbursement summary', () => {
      const summary = getDisbursementSummary(items);
      expect(summary.completed).toBe(2);  // 2 completed
      expect(summary.pending).toBe(2);    // 1 pending + 1 processing
      expect(summary.cancelled).toBe(1);  // 1 cancelled
    });
  });

  /**
   * -------------------------------------------------------------------------
   * DISBURSEMENT VALIDATION TESTS
   * -------------------------------------------------------------------------
   * Menguji validasi input saat membuat pencairan baru:
   * - Proposal wajib dipilih
   * - Format nomor surat harus valid
   * - Jumlah dana harus positif dan tidak melebihi anggaran
   * -------------------------------------------------------------------------
   */
  describe('Disbursement Validation', () => {
    // Interface untuk data input pencairan
    interface PencairanData {
      proposal_id: string;    // ID proposal yang akan dicairkan
      nomor_surat: string;    // Nomor surat pencairan (SP/XXXX/LPPM/YYYY)
      tanggal_surat: string;  // Tanggal surat dikeluarkan
      jumlah_dana: number;    // Jumlah dana yang dicairkan (Rp)
      keterangan: string;     // Keterangan tambahan (opsional)
    }

    /**
     * Validasi data pencairan sebelum disimpan
     * @param maxAmount - Batas maksimal dana yang bisa dicairkan (anggaran disetujui)
     * @returns Object dengan status valid dan error per field
     */
    const validatePencairan = (data: PencairanData, maxAmount: number): { valid: boolean; errors: Record<string, string> } => {
      const errors: Record<string, string> = {};

      // Validasi: Proposal wajib dipilih
      if (!data.proposal_id) {
        errors.proposal_id = 'Proposal wajib dipilih';
      }

      // Validasi: Nomor surat wajib diisi dan format valid
      if (!data.nomor_surat.trim()) {
        errors.nomor_surat = 'Nomor surat wajib diisi';
      } else if (!/^SP\/\d{4}\/LPPM\/\d{4}$/.test(data.nomor_surat)) {
        errors.nomor_surat = 'Format nomor surat tidak valid';
      }

      // Validasi: Tanggal surat wajib diisi
      if (!data.tanggal_surat) {
        errors.tanggal_surat = 'Tanggal surat wajib diisi';
      }

      // Validasi: Jumlah dana harus positif dan tidak melebihi batas
      if (data.jumlah_dana <= 0) {
        errors.jumlah_dana = 'Jumlah dana harus lebih dari 0';
      } else if (data.jumlah_dana > maxAmount) {
        errors.jumlah_dana = 'Jumlah dana melebihi anggaran yang disetujui';
      }

      return { valid: Object.keys(errors).length === 0, errors };
    };

    // Test: Data pencairan yang lengkap dan valid
    it('should validate complete pencairan data', () => {
      const data: PencairanData = {
        proposal_id: 'prop-123',
        nomor_surat: 'SP/0001/LPPM/2024',   // Format valid
        tanggal_surat: '2024-06-15',
        jumlah_dana: 50000000,               // 50 Juta (di bawah max 100 Juta)
        keterangan: 'Pencairan tahap 1',
      };

      const result = validatePencairan(data, 100000000);  // Max 100 Juta
      expect(result.valid).toBe(true);
    });

    // Test: Format nomor surat tidak valid
    it('should reject invalid nomor surat format', () => {
      const data: PencairanData = {
        proposal_id: 'prop-123',
        nomor_surat: 'INVALID-FORMAT',       // Format salah!
        tanggal_surat: '2024-06-15',
        jumlah_dana: 50000000,
        keterangan: '',
      };

      const result = validatePencairan(data, 100000000);
      expect(result.errors.nomor_surat).toContain('Format');
    });

    // Test: Jumlah dana melebihi anggaran yang disetujui
    it('should reject amount exceeding max', () => {
      const data: PencairanData = {
        proposal_id: 'prop-123',
        nomor_surat: 'SP/0001/LPPM/2024',
        tanggal_surat: '2024-06-15',
        jumlah_dana: 150000000,              // 150 Juta > 100 Juta (max)
        keterangan: '',
      };

      const result = validatePencairan(data, 100000000);
      expect(result.errors.jumlah_dana).toContain('melebihi');
    });
  });

  /**
   * -------------------------------------------------------------------------
   * DISBURSEMENT TIMELINE TESTS
   * -------------------------------------------------------------------------
   * Menguji pembuatan timeline pencairan untuk tracking alur waktu.
   * 
   * Event dalam Timeline:
   * 1. created   - Pencairan dibuat di sistem
   * 2. submitted - Surat diajukan
   * 3. processing - Pencairan diproses oleh admin
   * 4. completed - Dana dicairkan
   * -------------------------------------------------------------------------
   */
  describe('Disbursement Timeline', () => {
    // Interface untuk event dalam timeline
    interface TimelineEvent {
      date: string;        // Tanggal event
      status: string;      // Kode status
      description: string; // Deskripsi dalam Bahasa Indonesia
    }

    /**
     * Buat timeline dari data pencairan
     * @returns Array event yang diurutkan berdasarkan tanggal
     */
    const createTimeline = (pencairan: {
      created_at: string;     // Tanggal dibuat
      tanggal_surat: string;  // Tanggal surat
      tanggal_proses?: string; // Tanggal mulai diproses (opsional)
      tanggal_cair?: string;  // Tanggal dana cair (opsional)
      status: string;
    }): TimelineEvent[] => {
      const timeline: TimelineEvent[] = [
        { date: pencairan.created_at, status: 'created', description: 'Pencairan dibuat' },
        { date: pencairan.tanggal_surat, status: 'submitted', description: 'Surat diajukan' },
      ];

      // Tambahkan event processing jika ada
      if (pencairan.tanggal_proses) {
        timeline.push({
          date: pencairan.tanggal_proses,
          status: 'processing',
          description: 'Pencairan diproses',
        });
      }

      // Tambahkan event completed jika ada
      if (pencairan.tanggal_cair) {
        timeline.push({
          date: pencairan.tanggal_cair,
          status: 'completed',
          description: 'Dana dicairkan',
        });
      }

      // Urutkan berdasarkan tanggal
      return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    // Test: Timeline untuk pencairan yang masih pending (hanya 2 event)
    it('should create timeline for pending pencairan', () => {
      const timeline = createTimeline({
        created_at: '2024-06-01',
        tanggal_surat: '2024-06-05',
        status: 'pending',
      });

      expect(timeline.length).toBe(2);                  // created + submitted
      expect(timeline[0].status).toBe('created');       // Event pertama
      expect(timeline[1].status).toBe('submitted');     // Event kedua
    });

    // Test: Timeline lengkap untuk pencairan yang sudah selesai (4 event)
    it('should create complete timeline', () => {
      const timeline = createTimeline({
        created_at: '2024-06-01',
        tanggal_surat: '2024-06-05',
        tanggal_proses: '2024-06-10',
        tanggal_cair: '2024-06-15',
        status: 'completed',
      });

      expect(timeline.length).toBe(4);                  // Semua event
      expect(timeline[3].status).toBe('completed');     // Event terakhir
    });

    // Test: Timeline diurutkan berdasarkan tanggal
    it('should sort timeline by date', () => {
      const timeline = createTimeline({
        created_at: '2024-06-10',    // Dibuat lebih akhir
        tanggal_surat: '2024-06-01', // Surat lebih awal (antisipasi data salah)
        tanggal_proses: '2024-06-05',
        status: 'processing',
      });

      // Pastikan urutan berdasarkan tanggal, bukan urutan insert
      expect(new Date(timeline[0].date) <= new Date(timeline[1].date)).toBe(true);
    });
  });
});
