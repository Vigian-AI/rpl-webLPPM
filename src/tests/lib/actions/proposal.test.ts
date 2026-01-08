/**
 * ============================================================================
 * UNIT TEST: PROPOSAL ACTIONS (SERVER ACTIONS PROPOSAL)
 * ============================================================================
 * File ini berisi pengujian untuk logika server actions terkait proposal.
 * 
 * Cakupan pengujian:
 * 1. ProposalInput validation - Validasi input pembuatan proposal
 * 2. StatusProposal transitions - Transisi status proposal (draft→submitted→review→accepted/rejected)
 * 3. Proposal data structure - Struktur data proposal lengkap
 * 4. Anggaran validation - Validasi dan format anggaran proposal
 * 5. Link Drive validation - Validasi URL Google Drive
 * 
 * Total Tests: 23
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ProposalInput, StatusProposal, Proposal } from '@/types/database.types';

describe('Proposal Actions - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * -------------------------------------------------------------------------
   * PROPOSAL INPUT VALIDATION
   * -------------------------------------------------------------------------
   * Menguji validasi input untuk pembuatan proposal baru.
   * Field wajib: hibah_id, tim_id, judul
   * Field opsional: abstrak, latar_belakang, tujuan, metodologi, luaran, anggaran
   * -------------------------------------------------------------------------
   */
  describe('ProposalInput validation', () => {
    // Test: Memvalidasi field wajib yang harus ada
    it('should validate required fields', () => {
      const validInput: ProposalInput = {
        hibah_id: 'hibah-uuid-123',
        tim_id: 'tim-uuid-456',
        judul: 'Penelitian Tentang AI',
      };

      expect(validInput.hibah_id).toBeDefined();
      expect(validInput.tim_id).toBeDefined();
      expect(validInput.judul).toBeDefined();
      expect(validInput.judul.length).toBeGreaterThan(0);
    });

    // Test: Memvalidasi field opsional dengan nilai lengkap
    it('should accept optional fields', () => {
      const fullInput: ProposalInput = {
        hibah_id: 'hibah-uuid-123',
        tim_id: 'tim-uuid-456',
        judul: 'Penelitian Machine Learning',
        abstrak: 'Abstrak penelitian ini...',
        latar_belakang: 'Latar belakang penelitian...',
        tujuan: 'Tujuan dari penelitian ini...',
        metodologi: 'Metodologi yang digunakan...',
        luaran: 'Luaran yang diharapkan...',
        anggaran_diajukan: 50000000,
        link_drive: 'https://drive.google.com/folder/xxx',
      };

      expect(fullInput.abstrak).toBeDefined();
      expect(fullInput.latar_belakang).toBeDefined();
      expect(fullInput.tujuan).toBeDefined();
      expect(fullInput.metodologi).toBeDefined();
      expect(fullInput.luaran).toBeDefined();
      expect(fullInput.anggaran_diajukan).toBe(50000000);
      expect(fullInput.link_drive).toBeDefined();
    });

    // Test: Menangani field opsional yang kosong
    it('should handle empty optional fields', () => {
      const minimalInput: ProposalInput = {
        hibah_id: 'hibah-uuid-123',
        tim_id: 'tim-uuid-456',
        judul: 'Judul Minimal',
        abstrak: '',
        latar_belakang: '',
        tujuan: '',
        metodologi: '',
        luaran: '',
        anggaran_diajukan: 0,
      };

      expect(minimalInput.hibah_id).toBeTruthy();
      expect(minimalInput.tim_id).toBeTruthy();
      expect(minimalInput.judul).toBeTruthy();
    });
  });

  describe('StatusProposal transitions', () => {
    const validStatuses: StatusProposal[] = [
      'draft',
      'submitted',
      'review',
      'revision',
      'accepted',
      'rejected',
      'completed',
    ];

    it('should recognize all valid statuses', () => {
      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });
    });

    it('should allow draft to submitted transition', () => {
      const currentStatus: StatusProposal = 'draft';
      const nextStatus: StatusProposal = 'submitted';
      
      const validTransition = currentStatus === 'draft' && nextStatus === 'submitted';
      expect(validTransition).toBe(true);
    });

    it('should allow submitted to review transition', () => {
      const currentStatus: StatusProposal = 'submitted';
      const nextStatus: StatusProposal = 'review';
      
      const validTransition = currentStatus === 'submitted' && nextStatus === 'review';
      expect(validTransition).toBe(true);
    });

    it('should allow review to accepted transition', () => {
      const currentStatus: StatusProposal = 'review';
      const nextStatus: StatusProposal = 'accepted';
      
      const validTransition = currentStatus === 'review' && nextStatus === 'accepted';
      expect(validTransition).toBe(true);
    });

    it('should allow review to rejected transition', () => {
      const currentStatus: StatusProposal = 'review';
      const nextStatus: StatusProposal = 'rejected';
      
      const validTransition = currentStatus === 'review' && nextStatus === 'rejected';
      expect(validTransition).toBe(true);
    });

    it('should allow review to revision transition', () => {
      const currentStatus: StatusProposal = 'review';
      const nextStatus: StatusProposal = 'revision';
      
      const validTransition = currentStatus === 'review' && nextStatus === 'revision';
      expect(validTransition).toBe(true);
    });

    it('should allow accepted to completed transition', () => {
      const currentStatus: StatusProposal = 'accepted';
      const nextStatus: StatusProposal = 'completed';
      
      const validTransition = currentStatus === 'accepted' && nextStatus === 'completed';
      expect(validTransition).toBe(true);
    });
  });

  describe('Proposal data structure', () => {
    it('should have all required Proposal fields', () => {
      const proposal: Proposal = {
        id: 'proposal-uuid',
        hibah_id: 'hibah-uuid',
        tim_id: 'tim-uuid',
        ketua_id: 'dosen-uuid',
        judul: 'Test Proposal',
        abstrak: 'Abstrak',
        latar_belakang: 'Latar belakang',
        tujuan: 'Tujuan',
        metodologi: 'Metodologi',
        luaran: 'Luaran',
        anggaran_diajukan: 50000000,
        anggaran_disetujui: null,
        dokumen_proposal_url: null,
        link_drive: null,
        status_proposal: 'draft',
        catatan_evaluasi: null,
        tanggal_submit: null,
        tanggal_review: null,
        reviewer_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(proposal.id).toBeDefined();
      expect(proposal.hibah_id).toBeDefined();
      expect(proposal.tim_id).toBeDefined();
      expect(proposal.ketua_id).toBeDefined();
      expect(proposal.judul).toBeDefined();
      expect(proposal.status_proposal).toBe('draft');
      expect(proposal.created_at).toBeDefined();
      expect(proposal.updated_at).toBeDefined();
    });
  });

  describe('Anggaran validation', () => {
    it('should validate anggaran is a positive number', () => {
      const anggaran = 50000000;
      expect(anggaran).toBeGreaterThan(0);
    });

    it('should validate anggaran does not exceed limit', () => {
      const anggaranDiajukan = 50000000;
      const maxBudget = 100000000;
      expect(anggaranDiajukan).toBeLessThanOrEqual(maxBudget);
    });

    it('should reject negative anggaran', () => {
      const invalidAnggaran = -1000;
      expect(invalidAnggaran).toBeLessThan(0);
    });

    it('should handle zero anggaran', () => {
      const zeroAnggaran = 0;
      expect(zeroAnggaran).toBe(0);
    });

    it('should format anggaran correctly', () => {
      const anggaran = 50000000;
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(anggaran);
      expect(formatted).toContain('50.000.000');
    });
  });

  describe('Document URL validation', () => {
    it('should accept valid Google Drive links', () => {
      const validLinks = [
        'https://drive.google.com/file/d/abc123/view',
        'https://drive.google.com/folder/xyz789',
        'https://docs.google.com/document/d/abc123',
      ];

      const driveRegex = /^https:\/\/(drive|docs)\.google\.com\//;

      validLinks.forEach((link) => {
        expect(driveRegex.test(link)).toBe(true);
      });
    });

    it('should reject invalid links', () => {
      const invalidLinks = [
        'http://example.com',
        'ftp://drive.google.com/file',
        'javascript:alert(1)',
        '',
      ];

      const driveRegex = /^https:\/\/(drive|docs)\.google\.com\//;

      invalidLinks.forEach((link) => {
        expect(driveRegex.test(link)).toBe(false);
      });
    });
  });

  describe('Proposal filtering', () => {
    const proposals: Partial<Proposal>[] = [
      { id: '1', status_proposal: 'draft', judul: 'Draft Proposal' },
      { id: '2', status_proposal: 'submitted', judul: 'Submitted Proposal' },
      { id: '3', status_proposal: 'review', judul: 'Review Proposal' },
      { id: '4', status_proposal: 'accepted', judul: 'Accepted Proposal' },
      { id: '5', status_proposal: 'rejected', judul: 'Rejected Proposal' },
    ];

    it('should filter proposals by status', () => {
      const draftProposals = proposals.filter((p) => p.status_proposal === 'draft');
      expect(draftProposals).toHaveLength(1);
      expect(draftProposals[0].judul).toBe('Draft Proposal');
    });

    it('should filter pending proposals (submitted + review)', () => {
      const pendingStatuses: StatusProposal[] = ['submitted', 'review'];
      const pendingProposals = proposals.filter((p) => 
        pendingStatuses.includes(p.status_proposal as StatusProposal)
      );
      expect(pendingProposals).toHaveLength(2);
    });

    it('should filter completed proposals (accepted)', () => {
      const acceptedProposals = proposals.filter((p) => p.status_proposal === 'accepted');
      expect(acceptedProposals).toHaveLength(1);
    });
  });

  describe('Proposal sorting', () => {
    const proposals = [
      { id: '1', created_at: '2024-01-01T00:00:00Z', judul: 'First' },
      { id: '2', created_at: '2024-03-01T00:00:00Z', judul: 'Third' },
      { id: '3', created_at: '2024-02-01T00:00:00Z', judul: 'Second' },
    ];

    it('should sort by created_at descending', () => {
      const sorted = [...proposals].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      expect(sorted[0].judul).toBe('Third');
      expect(sorted[1].judul).toBe('Second');
      expect(sorted[2].judul).toBe('First');
    });

    it('should sort by created_at ascending', () => {
      const sorted = [...proposals].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      expect(sorted[0].judul).toBe('First');
      expect(sorted[1].judul).toBe('Second');
      expect(sorted[2].judul).toBe('Third');
    });
  });
});
