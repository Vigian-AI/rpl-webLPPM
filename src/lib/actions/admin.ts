'use server';

import { createClient } from '@/lib/supabase/server';

export interface AdminStats {
  totalProposals: number;
  pendingReview: number;
  acceptedProposals: number;
  rejectedProposals: number;
  activeHibah: number;
  totalDisbursed: number;
}

export async function getAdminStats(): Promise<{ data: AdminStats | null; error: string | null }> {
  const supabase = await createClient();

  try {
    // Get total proposals
    const { count: totalProposals } = await supabase
      .from('proposal')
      .select('*', { count: 'exact', head: true });

    // Get pending review (submitted + review status)
    const { count: pendingReview } = await supabase
      .from('proposal')
      .select('*', { count: 'exact', head: true })
      .in('status_proposal', ['submitted', 'review']);

    // Get accepted proposals
    const { count: acceptedProposals } = await supabase
      .from('proposal')
      .select('*', { count: 'exact', head: true })
      .eq('status_proposal', 'accepted');

    // Get rejected proposals
    const { count: rejectedProposals } = await supabase
      .from('proposal')
      .select('*', { count: 'exact', head: true })
      .eq('status_proposal', 'rejected');

    // Get active hibah
    const today = new Date().toISOString().split('T')[0];
    const { count: activeHibah } = await supabase
      .from('master_hibah')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('tanggal_buka', today)
      .gte('tanggal_tutup', today);

    // Get total disbursed amount
    const { data: pencairanData } = await supabase
      .from('surat_pencairan')
      .select('jumlah_dana');

    const totalDisbursed = pencairanData?.reduce((sum, item) => sum + (item.jumlah_dana || 0), 0) || 0;

    return {
      data: {
        totalProposals: totalProposals || 0,
        pendingReview: pendingReview || 0,
        acceptedProposals: acceptedProposals || 0,
        rejectedProposals: rejectedProposals || 0,
        activeHibah: activeHibah || 0,
        totalDisbursed,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: 'Gagal mengambil statistik' };
  }
}

export interface RecentProposal {
  id: string;
  judul: string;
  ketua: string;
  status: string;
  tanggal: string;
}

export async function getRecentProposals(limit = 5): Promise<{ data: RecentProposal[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('proposal')
    .select(`
      id,
      judul,
      status_proposal,
      tanggal_submit,
      created_at,
      ketua:dosen!proposal_ketua_id_fkey(nama)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: error.message };
  }

  const proposals: RecentProposal[] = (data || []).map((p: any) => ({
    id: p.id,
    judul: p.judul,
    ketua: p.ketua?.nama || 'Unknown',
    status: p.status_proposal,
    tanggal: p.tanggal_submit || p.created_at,
  }));

  return { data: proposals, error: null };
}

export interface ActiveHibahInfo {
  id: string;
  nama: string;
  totalProposal: number;
  tanggalTutup: string;
}

export async function getActiveHibahWithStats(): Promise<{ data: ActiveHibahInfo[] | null; error: string | null }> {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];

  // Get active hibah
  const { data: hibahData, error: hibahError } = await supabase
    .from('master_hibah')
    .select('id, nama_hibah, tanggal_tutup')
    .eq('is_active', true)
    .lte('tanggal_buka', today)
    .gte('tanggal_tutup', today)
    .order('tanggal_tutup', { ascending: true })
    .limit(4);

  if (hibahError) {
    return { data: null, error: hibahError.message };
  }

  // Get proposal counts for each hibah
  const hibahWithStats: ActiveHibahInfo[] = await Promise.all(
    (hibahData || []).map(async (h: any) => {
      const { count } = await supabase
        .from('proposal')
        .select('*', { count: 'exact', head: true })
        .eq('hibah_id', h.id)
        .eq('status_proposal', 'accepted');

      return {
        id: h.id,
        nama: h.nama_hibah,
        totalProposal: count || 0,
        tanggalTutup: h.tanggal_tutup,
      };
    })
  );

  return { data: hibahWithStats, error: null };
}
