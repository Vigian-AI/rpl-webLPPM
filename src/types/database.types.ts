// Database Types generated from SQL Schema
// LPPM Web System - Research and Community Service Institute

export type UserRole = 'admin' | 'dosen' | 'mahasiswa';
export type StatusAnggota = 'pending' | 'accepted' | 'rejected';
export type StatusProposal = 'draft' | 'submitted' | 'review' | 'revision' | 'accepted' | 'rejected' | 'completed';

// ==================== Core Tables ====================

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dosen {
  id: string;
  user_id: string;
  nama: string;
  nidn: string;
  nip: string | null;
  fakultas: string | null;
  prodi: string | null;
  jabatan_fungsional: string | null;
  bidang_keahlian: string | null;
  email_institusi: string | null;
  no_telepon: string | null;
  alamat: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mahasiswa {
  id: string;
  user_id: string;
  nama: string;
  nim: string;
  fakultas: string | null;
  prodi: string | null;
  angkatan: number | null;
  email_institusi: string | null;
  no_telepon: string | null;
  alamat: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== Grant & Proposal Tables ====================

export interface MasterHibah {
  id: string;
  nama_hibah: string;
  deskripsi: string | null;
  jenis: string;
  tahun_anggaran: number;
  anggaran_total: number;
  anggaran_per_proposal: number | null;
  tanggal_buka: string;
  tanggal_tutup: string;
  is_active: boolean;
  persyaratan: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tim {
  id: string;
  nama_tim: string;
  deskripsi: string | null;
  ketua_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  hibah_id: string;
  tim_id: string;
  ketua_id: string;
  judul: string;
  abstrak: string | null;
  latar_belakang: string | null;
  tujuan: string | null;
  metodologi: string | null;
  luaran: string | null;
  anggaran_diajukan: number | null;
  anggaran_disetujui: number | null;
  dokumen_proposal_url: string | null;
  link_drive: string | null;
  status_proposal: StatusProposal;
  catatan_evaluasi: string | null;
  tanggal_submit: string | null;
  tanggal_review: string | null;
  reviewer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnggotaTim {
  id: string;
  tim_id: string;
  user_id: string;
  peran: string;
  status: StatusAnggota;
  invited_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== Document Tables ====================

export interface SuratPencairan {
  id: string;
  proposal_id: string;
  nomor_surat: string;
  tanggal_surat: string;
  jumlah_dana: number;
  keterangan: string | null;
  dokumen_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dokumen {
  id: string;
  proposal_id: string | null;
  nama_dokumen: string;
  jenis_dokumen: string | null;
  deskripsi: string | null;
  file_url: string;
  uploaded_by: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  konten: string;
  kategori: string | null;
  is_published: boolean;
  tanggal_publish: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LogAktivitas {
  id: string;
  user_id: string | null;
  aksi: string;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
}

// ==================== Extended Types with Relations ====================

export interface UserWithProfile extends User {
  admin?: Admin;
  dosen?: Dosen;
  mahasiswa?: Mahasiswa;
}

export interface ProposalWithRelations extends Proposal {
  hibah?: MasterHibah;
  tim?: TimWithMembers;
  ketua?: Dosen;
  reviewer?: Admin;
  anggota_tim?: AnggotaTimWithUser[];
  surat_pencairan?: SuratPencairan[];
  dokumen?: Dokumen[];
}

export interface TimWithMembers extends Tim {
  ketua?: Dosen;
  anggota_tim?: AnggotaTimWithUser[];
}

export interface AnggotaTimWithUser extends AnggotaTim {
  user?: UserWithProfile;
}

export interface AnggotaTimWithProposal extends AnggotaTim {
  proposal?: ProposalWithRelations;
}

// ==================== Form Input Types ====================

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  nama: string;
  // Role-specific fields
  nidn?: string; // for dosen
  nim?: string; // for mahasiswa
  nip?: string;
  fakultas?: string;
  prodi?: string;
}

export interface ProposalInput {
  hibah_id: string;
  tim_id: string;
  judul: string;
  abstrak?: string;
  latar_belakang?: string;
  tujuan?: string;
  metodologi?: string;
  luaran?: string;
  anggaran_diajukan?: number;
  link_drive?: string;
  dokumen_proposal_url?: string;
}

export interface TimInput {
  nama_tim: string;
  deskripsi?: string;
}

export interface InviteTeamMemberInput {
  tim_id: string;
  username: string;
  peran: string;
}

export interface MasterHibahInput {
  nama_hibah: string;
  deskripsi?: string;
  jenis: string;
  tahun_anggaran: number;
  anggaran_total: number;
  anggaran_per_proposal?: number;
  tanggal_buka: string;
  tanggal_tutup: string;
  is_active?: boolean;
  persyaratan?: string;
}

export interface SuratPencairanInput {
  proposal_id: string;
  nomor_surat: string;
  tanggal_surat: string;
  jumlah_dana: number;
  keterangan?: string;
}

export interface PengumumanInput {
  judul: string;
  konten: string;
  kategori?: string;
  is_published?: boolean;
  tanggal_publish?: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== Dashboard Statistics ====================

export interface AdminDashboardStats {
  totalProposals: number;
  pendingReview: number;
  acceptedProposals: number;
  rejectedProposals: number;
  activeGrants: number;
  totalDisbursed: number;
}

export interface DosenDashboardStats {
  myProposals: number;
  acceptedProposals: number;
  pendingProposals: number;
  totalFunding: number;
}

export interface MahasiswaDashboardStats {
  pendingInvitations: number;
  activeTeams: number;
  completedProjects: number;
}
