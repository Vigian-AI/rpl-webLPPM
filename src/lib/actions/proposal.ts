'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import type { ProposalInput, Proposal, ProposalWithRelations, StatusProposal } from '@/types/database.types';

export async function getProposalList(status?: StatusProposal) {
  const supabase = await createClient();
  
  let query = supabase
    .from('proposal')
    .select(`
      *,
      hibah:master_hibah(*),
      ketua:dosen!proposal_ketua_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status_proposal', status);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as ProposalWithRelations[], error: null };
}

export async function getProposalById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('proposal')
    .select(`
      *,
      hibah:master_hibah(*),
      ketua:dosen!proposal_ketua_id_fkey(*),
      tim:tim(
        *,
        anggota_tim(
          *,
          user:users(
            *,
            dosen(*),
            mahasiswa(*)
          )
        )
      ),
      surat_pencairan(*),
      dokumen(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as ProposalWithRelations, error: null };
}

export async function getMyProposals() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  // Get dosen ID
  const { data: dosenData } = await supabase
    .from('dosen')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!dosenData) {
    return { data: null, error: 'Dosen profile not found' };
  }

  // Get proposals where user is ketua
  const { data: ketuaProposals, error: ketuaError } = await supabase
    .from('proposal')
    .select(`
      *,
      hibah:master_hibah(*),
      tim:tim(
        *,
        anggota_tim(count)
      )
    `)
    .eq('ketua_id', dosenData.id)
    .order('created_at', { ascending: false });

  if (ketuaError) {
    return { data: null, error: ketuaError.message };
  }

  // Get proposals where user is Asisten Dosen in the team
  const { data: asistenMembership } = await supabase
    .from('anggota_tim')
    .select('tim_id')
    .eq('user_id', user.id)
    .eq('peran', 'Asisten Dosen')
    .eq('status', 'accepted');

  let asistenProposals: typeof ketuaProposals = [];
  if (asistenMembership && asistenMembership.length > 0) {
    const asistenTimIds = asistenMembership.map(m => m.tim_id);
    
    const { data: proposalsData } = await supabase
      .from('proposal')
      .select(`
        *,
        hibah:master_hibah(*),
        tim:tim(
          *,
          anggota_tim(count)
        )
      `)
      .in('tim_id', asistenTimIds)
      .order('created_at', { ascending: false });
    
    if (proposalsData) {
      asistenProposals = proposalsData;
    }
  }

  // Merge and deduplicate
  const allProposals = [...(ketuaProposals || [])];
  const ketuaProposalIds = new Set(ketuaProposals?.map(p => p.id) || []);
  
  for (const proposal of asistenProposals) {
    if (!ketuaProposalIds.has(proposal.id)) {
      allProposals.push(proposal);
    }
  }

  // Sort by created_at descending
  allProposals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { data: allProposals as ProposalWithRelations[], error: null };
}

export async function createProposal(input: ProposalInput) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  // Get the team to verify access and get ketua_id
  const { data: teamData } = await supabase
    .from('tim')
    .select('id, ketua_id')
    .eq('id', input.tim_id)
    .single();

  if (!teamData) {
    return { data: null, error: 'Tim tidak ditemukan' };
  }

  // Get dosen ID of current user
  const { data: dosenData } = await supabase
    .from('dosen')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // Check if user is ketua or Asisten Dosen
  const isKetua = dosenData?.id === teamData.ketua_id;
  
  let isAsistenDosen = false;
  if (!isKetua) {
    const { data: membership } = await supabase
      .from('anggota_tim')
      .select('id')
      .eq('tim_id', input.tim_id)
      .eq('user_id', user.id)
      .eq('peran', 'Asisten Dosen')
      .eq('status', 'accepted')
      .single();
    
    isAsistenDosen = !!membership;
  }

  if (!isKetua && !isAsistenDosen) {
    return { data: null, error: 'Anda tidak memiliki akses untuk membuat proposal untuk tim ini' };
  }

  const { data, error } = await supabase
    .from('proposal')
    .insert({
      ...input,
      ketua_id: teamData.ketua_id, // Always use team's ketua as proposal ketua
      status_proposal: 'draft',
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/dosen/proposal');
  return { data: data as Proposal, error: null };
}

export async function updateProposal(id: string, input: Partial<ProposalInput>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('proposal')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/dosen/proposal');
  revalidatePath(`/dosen/proposal/${id}`);
  return { data: data as Proposal, error: null };
}

export async function submitProposal(id: string) {
  const supabase = await createClient();
  
  // Get proposal with tim_id
  const { data: proposalData } = await supabase
    .from('proposal')
    .select('tim_id')
    .eq('id', id)
    .single();

  if (!proposalData) {
    return { data: null, error: 'Proposal tidak ditemukan' };
  }

  // Count team members (including ketua) - only active users
  // First get all accepted members (ketua is also in anggota_tim)
  const { data: allMembers } = await supabase
    .from('anggota_tim')
    .select('user_id')
    .eq('tim_id', proposalData.tim_id)
    .eq('status', 'accepted');

  // Then check which users are active
  let totalMembers = 0;
  if (allMembers && allMembers.length > 0) {
    const userIds = allMembers.map(m => m.user_id);
    const { data: activeUsers } = await supabase
      .from('users')
      .select('id')
      .in('id', userIds)
      .eq('is_active', true);
    
    totalMembers = activeUsers?.length || 0;
  }

  if (totalMembers < 5) {
    return { 
      data: null, 
      error: `Tim harus memiliki minimal 5 anggota. Saat ini tim Anda memiliki ${totalMembers} anggota. Tambahkan ${5 - totalMembers} anggota lagi.` 
    };
  }

  if (totalMembers > 7) {
    return { 
      data: null, 
      error: `Tim tidak boleh lebih dari 7 anggota. Saat ini tim Anda memiliki ${totalMembers} anggota. Kurangi ${totalMembers - 7} anggota.` 
    };
  }

  const { data, error } = await supabase
    .from('proposal')
    .update({
      status_proposal: 'submitted',
      tanggal_submit: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/dosen/proposal');
  return { data: data as Proposal, error: null };
}

export async function reviewProposal(
  id: string, 
  status: 'review' | 'revision' | 'accepted' | 'rejected',
  catatan?: string,
  anggaranDisetujui?: number
) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: 'User tidak terautentikasi' };
  }

  const updateData: Record<string, unknown> = {
    status_proposal: status,
    catatan_evaluasi: catatan,
    tanggal_review: new Date().toISOString(),
    reviewer_id: user.id, // Use user.id directly since reviewer_id references users(id)
  };

  if (status === 'accepted' && anggaranDisetujui) {
    updateData.anggaran_disetujui = anggaranDisetujui;
  }

  const { data, error } = await supabase
    .from('proposal')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/proposal');
  revalidatePath(`/admin/proposal/${id}`);
  return { data: data as Proposal, error: null };
}

export async function deleteProposal(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('proposal')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dosen/proposal');
  return { error: null };
}

export async function uploadProposalDocument(proposalId: string, file: File) {
  const supabase = await createClient();
  
  const fileName = `proposals/${proposalId}/${Date.now()}_${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);

  // Update proposal with document URL
  await supabase
    .from('proposal')
    .update({ dokumen_proposal_url: publicUrl })
    .eq('id', proposalId);

  revalidatePath(`/dosen/proposal/${proposalId}`);
  revalidatePath(`/mahasiswa/proposal/${proposalId}`);
  return { url: publicUrl, error: null };
}

// Get proposals for mahasiswa as Asisten Peneliti
export async function getMyProposalsAsAsisten() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  // Get tim IDs where user is Asisten Peneliti
  const { data: asistenMembership } = await supabase
    .from('anggota_tim')
    .select('tim_id')
    .eq('user_id', user.id)
    .eq('peran', 'Asisten Peneliti')
    .eq('status', 'accepted');

  if (!asistenMembership || asistenMembership.length === 0) {
    return { data: [], error: null };
  }

  const timIds = asistenMembership.map(m => m.tim_id);

  // Get proposals for these teams
  const { data: proposals, error } = await supabase
    .from('proposal')
    .select(`
      *,
      hibah:master_hibah(*),
      ketua:dosen!proposal_ketua_id_fkey(*),
      tim:tim(
        *,
        anggota_tim(count)
      )
    `)
    .in('tim_id', timIds)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: proposals as ProposalWithRelations[], error: null };
}

// Check if user can edit proposal (ketua, asisten dosen, or asisten peneliti)
export async function canEditProposal(proposalId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Get proposal with tim info
  const { data: proposal } = await supabase
    .from('proposal')
    .select('id, ketua_id, tim_id')
    .eq('id', proposalId)
    .single();

  if (!proposal) {
    return false;
  }

  // Check if user is ketua (dosen)
  const { data: dosenData } = await supabase
    .from('dosen')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (dosenData && dosenData.id === proposal.ketua_id) {
    return true;
  }

  // Check if user is Asisten Dosen or Asisten Peneliti in the team
  const { data: membership } = await supabase
    .from('anggota_tim')
    .select('id')
    .eq('tim_id', proposal.tim_id)
    .eq('user_id', user.id)
    .in('peran', ['Asisten Dosen', 'Asisten Peneliti'])
    .eq('status', 'accepted')
    .single();

  return !!membership;
}
