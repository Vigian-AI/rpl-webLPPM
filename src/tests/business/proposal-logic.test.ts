/**
 * ============================================================================
 * PROPOSAL BUSINESS LOGIC TESTS
 * ============================================================================
 * 
 * File ini berisi unit test untuk logika bisnis Proposal Penelitian.
 * Proposal adalah dokumen pengajuan penelitian/pengabdian yang disubmit
 * oleh dosen ke program hibah.
 * 
 * Kategori Test:
 * 1. Status Transitions    - Alur perubahan status proposal
 * 2. Budget Calculations   - Perhitungan anggaran proposal
 * 3. Team Composition      - Aturan komposisi tim penelitian
 * 4. Submission Validation - Validasi kelengkapan proposal
 * 5. Review Scoring        - Perhitungan skor review
 * 
 * Total Tests: 18
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';

describe('Proposal Business Logic Tests', () => {
  /**
   * -------------------------------------------------------------------------
   * STATUS TRANSITIONS TESTS
   * -------------------------------------------------------------------------
   * Menguji alur perubahan status proposal yang valid.
   * 
   * Alur Status Proposal:
   * draft → submitted → review → [revision/accepted/rejected]
   *                       ↑          ↓
   *                       ←← revision
   * accepted → completed
   * 
   * Terminal states: rejected, completed (tidak bisa berubah lagi)
   * -------------------------------------------------------------------------
   */
  describe('Status Transitions', () => {
    // Type untuk semua status proposal yang mungkin
    type ProposalStatus = 'draft' | 'submitted' | 'review' | 'revision' | 'accepted' | 'rejected' | 'completed';

    // Mapping status → status yang bisa dituju
    const validTransitions: Record<ProposalStatus, ProposalStatus[]> = {
      draft: ['submitted'],                          // Draft hanya bisa disubmit
      submitted: ['review', 'rejected'],             // Submitted bisa direview atau ditolak langsung
      review: ['revision', 'accepted', 'rejected'],  // Review bisa revisi, diterima, atau ditolak
      revision: ['submitted'],                       // Revisi harus disubmit ulang
      accepted: ['completed'],                       // Diterima bisa diselesaikan
      rejected: [],                                  // TERMINAL: tidak bisa berubah
      completed: [],                                 // TERMINAL: tidak bisa berubah
    };

    /**
     * Cek apakah transisi dari status A ke B valid
     * @param from - Status awal
     * @param to - Status tujuan
     * @returns true jika transisi diizinkan
     */
    const canTransition = (from: ProposalStatus, to: ProposalStatus): boolean => {
      return validTransitions[from].includes(to);
    };

    /**
     * Dapatkan daftar status yang bisa dituju dari status saat ini
     */
    const getNextStatuses = (current: ProposalStatus): ProposalStatus[] => {
      return validTransitions[current];
    };

    // Test: Draft bisa disubmit
    it('should allow draft to submitted', () => {
      expect(canTransition('draft', 'submitted')).toBe(true);
    });

    // Test: Status review bisa menuju 3 status berbeda
    it('should allow review to multiple states', () => {
      expect(canTransition('review', 'revision')).toBe(true);  // Minta revisi
      expect(canTransition('review', 'accepted')).toBe(true);  // Diterima
      expect(canTransition('review', 'rejected')).toBe(true);  // Ditolak
    });

    // Test: Tidak boleh mundur ke status sebelumnya
    it('should not allow backward transitions', () => {
      expect(canTransition('submitted', 'draft')).toBe(false);   // Tidak bisa kembali ke draft
      expect(canTransition('accepted', 'review')).toBe(false);   // Tidak bisa kembali ke review
    });

    // Test: Status terminal (rejected, completed) tidak bisa berubah
    it('should not allow transitions from terminal states', () => {
      expect(getNextStatuses('rejected')).toEqual([]);   // Tidak ada transisi
      expect(getNextStatuses('completed')).toEqual([]);  // Tidak ada transisi
    });

    // Test: Fungsi getNextStatuses mengembalikan status yang valid
    it('should get next statuses', () => {
      expect(getNextStatuses('draft')).toEqual(['submitted']);
      expect(getNextStatuses('submitted')).toEqual(['review', 'rejected']);
    });
  });

  /**
   * -------------------------------------------------------------------------
   * BUDGET CALCULATIONS TESTS
   * -------------------------------------------------------------------------
   * Menguji perhitungan anggaran proposal:
   * - Total anggaran dari item-item
   * - Validasi batas anggaran
   * - Breakdown per kategori
   * -------------------------------------------------------------------------
   */
  describe('Budget Calculations', () => {
    // Interface untuk item anggaran
    interface BudgetItem {
      kategori: string;  // 'Peralatan' | 'Bahan' | 'Perjalanan' | 'Lainnya'
      jumlah: number;    // Nominal dalam Rupiah
    }

    /**
     * Hitung total anggaran dari semua item
     */
    const calculateTotalBudget = (items: BudgetItem[]): number => {
      return items.reduce((sum, item) => sum + item.jumlah, 0);
    };

    /**
     * Validasi apakah anggaran yang diminta valid
     * @param requested - Anggaran yang diminta
     * @param max - Batas maksimal dari hibah
     */
    const validateBudget = (requested: number, max: number): { valid: boolean; message?: string } => {
      if (requested <= 0) {
        return { valid: false, message: 'Anggaran harus lebih dari 0' };
      }
      if (requested > max) {
        return { valid: false, message: `Anggaran melebihi batas maksimal ${max.toLocaleString('id-ID')}` };
      }
      return { valid: true };
    };

    /**
     * Hitung total per kategori
     * @returns Object dengan key = kategori, value = total
     */
    const calculateBudgetByCategory = (items: BudgetItem[]): Record<string, number> => {
      return items.reduce(
        (acc, item) => {
          acc[item.kategori] = (acc[item.kategori] || 0) + item.jumlah;
          return acc;
        },
        {} as Record<string, number>
      );
    };

    // Test: Total anggaran = sum dari semua item
    it('should calculate total budget', () => {
      const items: BudgetItem[] = [
        { kategori: 'Peralatan', jumlah: 10000000 },   // 10 Juta
        { kategori: 'Bahan', jumlah: 5000000 },        // 5 Juta
        { kategori: 'Perjalanan', jumlah: 3000000 },   // 3 Juta
      ];
      // Total = 10 + 5 + 3 = 18 Juta
      expect(calculateTotalBudget(items)).toBe(18000000);
    });

    // Test: Validasi anggaran dalam batas
    it('should validate budget within limits', () => {
      expect(validateBudget(50000000, 100000000).valid).toBe(true);   // 50Jt < 100Jt ✓
      expect(validateBudget(100000001, 100000000).valid).toBe(false); // Melebihi batas
      expect(validateBudget(0, 100000000).valid).toBe(false);         // Harus > 0
    });

    // Test: Breakdown anggaran per kategori
    it('should calculate budget by category', () => {
      const items: BudgetItem[] = [
        { kategori: 'Peralatan', jumlah: 10000000 },
        { kategori: 'Bahan', jumlah: 5000000 },
        { kategori: 'Peralatan', jumlah: 3000000 },  // Kategori sama, harus digabung
      ];

      const byCategory = calculateBudgetByCategory(items);
      expect(byCategory['Peralatan']).toBe(13000000); // 10 + 3 = 13 Juta
      expect(byCategory['Bahan']).toBe(5000000);      // 5 Juta
    });
  });

  /**
   * -------------------------------------------------------------------------
   * TEAM COMPOSITION RULES TESTS
   * -------------------------------------------------------------------------
   * Menguji aturan komposisi tim penelitian:
   * - Minimal 2 anggota yang sudah accepted
   * - Maksimal 10 anggota
   * - Minimal 1 mahasiswa
   * - Maksimal 3 dosen
   * -------------------------------------------------------------------------
   */
  describe('Team Composition Rules', () => {
    // Interface untuk anggota tim
    interface TeamMember {
      id: string;
      role: 'dosen' | 'mahasiswa';
      status: 'pending' | 'accepted' | 'rejected';  // Status undangan
    }

    // Konstanta aturan tim
    const MIN_TEAM_SIZE = 2;    // Minimal anggota
    const MAX_TEAM_SIZE = 10;   // Maksimal anggota
    const MIN_MAHASISWA = 1;    // Minimal mahasiswa
    const MAX_DOSEN = 3;        // Maksimal dosen

    /**
     * Validasi komposisi tim
     * @returns Object dengan status valid dan daftar error
     */
    const validateTeamComposition = (
      members: TeamMember[]
    ): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      // Hanya hitung yang sudah accepted (bukan pending/rejected)
      const acceptedMembers = members.filter((m) => m.status === 'accepted');

      // Validasi: Minimal 2 anggota
      if (acceptedMembers.length < MIN_TEAM_SIZE) {
        errors.push(`Tim minimal ${MIN_TEAM_SIZE} anggota`);
      }

      // Validasi: Maksimal 10 anggota
      if (acceptedMembers.length > MAX_TEAM_SIZE) {
        errors.push(`Tim maksimal ${MAX_TEAM_SIZE} anggota`);
      }

      // Validasi: Maksimal 3 dosen
      const dosenCount = acceptedMembers.filter((m) => m.role === 'dosen').length;
      if (dosenCount > MAX_DOSEN) {
        errors.push(`Maksimal ${MAX_DOSEN} dosen dalam tim`);
      }

      // Validasi: Minimal 1 mahasiswa
      const mahasiswaCount = acceptedMembers.filter((m) => m.role === 'mahasiswa').length;
      if (mahasiswaCount < MIN_MAHASISWA) {
        errors.push(`Minimal ${MIN_MAHASISWA} mahasiswa dalam tim`);
      }

      return { valid: errors.length === 0, errors };
    };

    // Test: Tim dengan komposisi yang valid
    it('should validate valid team composition', () => {
      const members: TeamMember[] = [
        { id: '1', role: 'dosen', status: 'accepted' },
        { id: '2', role: 'mahasiswa', status: 'accepted' },
        { id: '3', role: 'mahasiswa', status: 'accepted' },
      ];
      // 1 dosen + 2 mahasiswa = 3 anggota ✓

      const result = validateTeamComposition(members);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    // Test: Tim dengan anggota terlalu sedikit
    it('should reject team with too few members', () => {
      const members: TeamMember[] = [{ id: '1', role: 'dosen', status: 'accepted' }];
      // Hanya 1 anggota, minimal 2

      const result = validateTeamComposition(members);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tim minimal 2 anggota');
    });

    // Test: Tim tanpa mahasiswa
    it('should reject team without mahasiswa', () => {
      const members: TeamMember[] = [
        { id: '1', role: 'dosen', status: 'accepted' },
        { id: '2', role: 'dosen', status: 'accepted' },
      ];
      // 2 dosen, 0 mahasiswa - tidak valid!

      const result = validateTeamComposition(members);
      expect(result.errors).toContain('Minimal 1 mahasiswa dalam tim');
    });

    // Test: Anggota pending tidak dihitung
    it('should ignore pending members', () => {
      const members: TeamMember[] = [
        { id: '1', role: 'dosen', status: 'accepted' },     // Dihitung
        { id: '2', role: 'mahasiswa', status: 'pending' },  // TIDAK dihitung
        { id: '3', role: 'mahasiswa', status: 'pending' },  // TIDAK dihitung
      ];
      // Hanya 1 accepted (dosen), minimal 2 dan minimal 1 mahasiswa

      const result = validateTeamComposition(members);
      expect(result.valid).toBe(false);
    });
  });

  /**
   * -------------------------------------------------------------------------
   * SUBMISSION VALIDATION TESTS
   * -------------------------------------------------------------------------
   * Menguji validasi kelengkapan proposal sebelum submit:
   * - Judul wajib diisi
   * - Abstrak dengan panjang karakter tertentu
   * - Latar belakang, tujuan, metodologi, luaran wajib diisi
   * - Anggaran harus positif
   * - Hibah dan Tim harus dipilih
   * -------------------------------------------------------------------------
   */
  describe('Submission Validation', () => {
    // Interface untuk data proposal
    interface ProposalData {
      judul: string;              // Judul penelitian
      abstrak: string;            // Ringkasan (100-500 karakter)
      latar_belakang: string;     // Latar belakang masalah (min 200 karakter)
      tujuan: string;             // Tujuan penelitian
      metodologi: string;         // Metodologi yang digunakan
      luaran: string;             // Luaran yang diharapkan
      anggaran_diajukan: number;  // Total anggaran (Rp)
      hibah_id: string;           // ID program hibah
      tim_id: string;             // ID tim penelitian
    }

    const MIN_ABSTRAK_LENGTH = 100;
    const MAX_ABSTRAK_LENGTH = 500;
    const MIN_CONTENT_LENGTH = 200;

    const validateProposal = (data: ProposalData): { valid: boolean; errors: Record<string, string> } => {
      const errors: Record<string, string> = {};

      if (!data.judul.trim()) {
        errors.judul = 'Judul wajib diisi';
      }

      if (!data.abstrak.trim()) {
        errors.abstrak = 'Abstrak wajib diisi';
      } else if (data.abstrak.length < MIN_ABSTRAK_LENGTH) {
        errors.abstrak = `Abstrak minimal ${MIN_ABSTRAK_LENGTH} karakter`;
      } else if (data.abstrak.length > MAX_ABSTRAK_LENGTH) {
        errors.abstrak = `Abstrak maksimal ${MAX_ABSTRAK_LENGTH} karakter`;
      }

      if (!data.latar_belakang.trim()) {
        errors.latar_belakang = 'Latar belakang wajib diisi';
      } else if (data.latar_belakang.length < MIN_CONTENT_LENGTH) {
        errors.latar_belakang = `Latar belakang minimal ${MIN_CONTENT_LENGTH} karakter`;
      }

      if (!data.tujuan.trim()) {
        errors.tujuan = 'Tujuan wajib diisi';
      }

      if (!data.metodologi.trim()) {
        errors.metodologi = 'Metodologi wajib diisi';
      }

      if (!data.luaran.trim()) {
        errors.luaran = 'Luaran wajib diisi';
      }

      if (data.anggaran_diajukan <= 0) {
        errors.anggaran_diajukan = 'Anggaran harus lebih dari 0';
      }

      if (!data.hibah_id) {
        errors.hibah_id = 'Hibah wajib dipilih';
      }

      if (!data.tim_id) {
        errors.tim_id = 'Tim wajib dipilih';
      }

      return { valid: Object.keys(errors).length === 0, errors };
    };

    // Test: Proposal yang lengkap harus lolos validasi
    it('should validate complete proposal', () => {
      const data: ProposalData = {
        judul: 'Penelitian Tentang AI',
        abstrak: 'A'.repeat(150),           // 150 karakter (valid: 100-500)
        latar_belakang: 'B'.repeat(250),    // 250 karakter (valid: min 200)
        tujuan: 'Tujuan penelitian ini adalah...',
        metodologi: 'Metodologi yang digunakan...',
        luaran: 'Luaran yang diharapkan...',
        anggaran_diajukan: 50000000,        // 50 Juta
        hibah_id: 'hibah-123',
        tim_id: 'tim-456',
      };

      const result = validateProposal(data);
      expect(result.valid).toBe(true);
    });

    // Test: Field kosong harus menghasilkan error
    it('should reject empty required fields', () => {
      const data: ProposalData = {
        judul: '',              // Kosong!
        abstrak: '',            // Kosong!
        latar_belakang: '',
        tujuan: '',
        metodologi: '',
        luaran: '',
        anggaran_diajukan: 0,   // Nol!
        hibah_id: '',
        tim_id: '',
      };

      const result = validateProposal(data);
      expect(result.valid).toBe(false);
      expect(result.errors.judul).toBeDefined();
      expect(result.errors.abstrak).toBeDefined();
    });

    // Test: Abstrak terlalu pendek
    it('should validate abstrak length', () => {
      const data: ProposalData = {
        judul: 'Test',
        abstrak: 'Too short',               // Hanya ~9 karakter, minimal 100
        latar_belakang: 'B'.repeat(250),
        tujuan: 'Tujuan',
        metodologi: 'Metode',
        luaran: 'Luaran',
        anggaran_diajukan: 50000000,
        hibah_id: 'hibah-123',
        tim_id: 'tim-456',
      };

      const result = validateProposal(data);
      expect(result.errors.abstrak).toContain('minimal');
    });
  });

  /**
   * -------------------------------------------------------------------------
   * REVIEW SCORING TESTS
   * -------------------------------------------------------------------------
   * Menguji perhitungan skor review proposal:
   * - Perhitungan skor tertimbang (weighted score)
   * - Kategorisasi skor (Sangat Baik, Baik, dll)
   * - Penentuan kelayakan pendanaan
   * 
   * Komponen Penilaian:
   * - Originalitas (25%)
   * - Metodologi (30%)
   * - Kelayakan (25%)
   * - Dampak (20%)
   * -------------------------------------------------------------------------
   */
  describe('Review Scoring', () => {
    // Interface untuk skor review
    interface ReviewScore {
      originalitas: number;  // Skor 0-100
      metodologi: number;    // Skor 0-100
      kelayakan: number;     // Skor 0-100
      dampak: number;        // Skor 0-100
    }

    // Bobot masing-masing komponen (total = 1.0)
    const SCORE_WEIGHTS = {
      originalitas: 0.25,  // 25%
      metodologi: 0.30,    // 30%
      kelayakan: 0.25,     // 25%
      dampak: 0.20,        // 20%
    };

    /**
     * Hitung skor tertimbang
     * @returns Skor akhir (0-100)
     */
    const calculateWeightedScore = (scores: ReviewScore): number => {
      const weighted =
        scores.originalitas * SCORE_WEIGHTS.originalitas +
        scores.metodologi * SCORE_WEIGHTS.metodologi +
        scores.kelayakan * SCORE_WEIGHTS.kelayakan +
        scores.dampak * SCORE_WEIGHTS.dampak;
      return Math.round(weighted * 100) / 100;  // Bulatkan 2 desimal
    };

    /**
     * Kategorisasi skor
     * @returns Kategori: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' | 'Sangat Kurang'
     */
    const getScoreCategory = (score: number): string => {
      if (score >= 85) return 'Sangat Baik';
      if (score >= 70) return 'Baik';
      if (score >= 55) return 'Cukup';
      if (score >= 40) return 'Kurang';
      return 'Sangat Kurang';
    };

    /**
     * Cek apakah skor memenuhi syarat pendanaan
     * @param minScore - Skor minimal (default 70)
     */
    const isEligibleForFunding = (score: number, minScore: number = 70): boolean => {
      return score >= minScore;
    };

    // Test: Perhitungan skor tertimbang
    it('should calculate weighted score', () => {
      const scores: ReviewScore = {
        originalitas: 80,
        metodologi: 85,
        kelayakan: 75,
        dampak: 70,
      };

      const weighted = calculateWeightedScore(scores);
      // 80*0.25 + 85*0.30 + 75*0.25 + 70*0.20 = 20 + 25.5 + 18.75 + 14 = 78.25
      expect(weighted).toBe(78.25);
    });

    // Test: Kategorisasi skor
    it('should get score category', () => {
      expect(getScoreCategory(90)).toBe('Sangat Baik');   // >= 85
      expect(getScoreCategory(75)).toBe('Baik');          // >= 70
      expect(getScoreCategory(60)).toBe('Cukup');         // >= 55
      expect(getScoreCategory(45)).toBe('Kurang');        // >= 40
      expect(getScoreCategory(30)).toBe('Sangat Kurang'); // < 40
    });

    // Test: Kelayakan pendanaan
    it('should check funding eligibility', () => {
      expect(isEligibleForFunding(80)).toBe(true);       // 80 >= 70 ✓
      expect(isEligibleForFunding(70)).toBe(true);       // 70 >= 70 ✓
      expect(isEligibleForFunding(65)).toBe(false);      // 65 < 70 ✗
      expect(isEligibleForFunding(75, 75)).toBe(true);   // Custom threshold
    });
  });
});
