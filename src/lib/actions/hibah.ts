'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import type { MasterHibahInput, MasterHibah } from '@/types/database.types';

export async function getHibahList() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('master_hibah')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as MasterHibah[], error: null };
}

export async function getHibahById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('master_hibah')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as MasterHibah, error: null };
}

export async function getActiveHibah() {
  const supabase = await createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('master_hibah')
    .select('*')
    .eq('is_active', true)
    .lte('tanggal_buka', today)
    .gte('tanggal_tutup', today)
    .order('tanggal_tutup', { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as MasterHibah[], error: null };
}

export async function createHibah(input: MasterHibahInput) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  const { data, error } = await supabase
    .from('master_hibah')
    .insert({
      ...input,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/hibah');
  return { data: data as MasterHibah, error: null };
}

export async function updateHibah(id: string, input: Partial<MasterHibahInput>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('master_hibah')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/hibah');
  revalidatePath(`/admin/hibah/${id}`);
  return { data: data as MasterHibah, error: null };
}

export async function deleteHibah(id: string) {
  const supabase = await createClient();
  
  // Check if there are any proposals using this hibah
  const { data: proposals, error: checkError } = await supabase
    .from('proposal')
    .select('id')
    .eq('hibah_id', id)
    .limit(1);

  if (checkError) {
    return { error: checkError.message };
  }

  if (proposals && proposals.length > 0) {
    return { 
      error: 'Hibah tidak dapat dihapus karena sudah digunakan oleh proposal. Anda bisa menonaktifkan hibah ini sebagai gantinya.' 
    };
  }

  // If no proposals are using this hibah, proceed with deletion
  const { error } = await supabase
    .from('master_hibah')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/hibah');
  return { error: null };
}

export async function toggleHibahStatus(id: string, isActive: boolean) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('master_hibah')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/hibah');
  return { data: data as MasterHibah, error: null };
}

export interface HibahStatistics {
  hibahId: string;
  totalProposals: number;
  draftProposals: number;
  submittedProposals: number;
  reviewProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  totalRequested: number;
}

export async function getHibahStatistics(hibahId?: string) {
  const supabase = await createClient();
  
  try {
    let query = supabase.from('proposal').select('hibah_id, status_proposal, anggaran_diajukan');
    
    if (hibahId) {
      query = query.eq('hibah_id', hibahId);
    }
    
    const { data: proposals, error } = await query;
    
    if (error) {
      return { data: null, error: error.message };
    }
    
    if (!proposals) {
      return { data: null, error: 'No proposals found' };
    }
    
    // Group by hibah_id if not specified
    const statsByHibah = proposals.reduce((acc, proposal) => {
      const hibahId = proposal.hibah_id;
      if (!acc[hibahId]) {
        acc[hibahId] = {
          hibahId,
          totalProposals: 0,
          draftProposals: 0,
          submittedProposals: 0,
          reviewProposals: 0,
          acceptedProposals: 0,
          rejectedProposals: 0,
          totalRequested: 0,
        };
      }
      
      acc[hibahId].totalProposals++;
      
      switch (proposal.status_proposal) {
        case 'draft':
          acc[hibahId].draftProposals++;
          break;
        case 'submitted':
          acc[hibahId].submittedProposals++;
          break;
        case 'review':
          acc[hibahId].reviewProposals++;
          break;
        case 'accepted':
          acc[hibahId].acceptedProposals++;
          break;
        case 'rejected':
          acc[hibahId].rejectedProposals++;
          break;
      }
      
      if (proposal.anggaran_diajukan) {
        acc[hibahId].totalRequested += proposal.anggaran_diajukan;
      }
      
      return acc;
    }, {} as Record<string, HibahStatistics>);
    
    if (hibahId) {
      return { data: statsByHibah[hibahId] || null, error: null };
    }
    
    return { data: statsByHibah, error: null };
  } catch (error) {
    return { data: null, error: 'Gagal mengambil statistik hibah' };
  }
}

export async function getHibahListWithStats() {
  const supabase = await createClient();
  
  const { data: hibahList, error: hibahError } = await supabase
    .from('master_hibah')
    .select('*')
    .order('created_at', { ascending: false });

  if (hibahError) {
    return { data: null, error: hibahError.message };
  }

  const { data: statsData, error: statsError } = await getHibahStatistics();
  
  if (statsError) {
    return { data: null, error: statsError };
  }

  const stats = statsData as Record<string, HibahStatistics>;

  const hibahWithStats = hibahList.map((hibah) => ({
    ...hibah,
    stats: stats?.[hibah.id] || {
      hibahId: hibah.id,
      totalProposals: 0,
      draftProposals: 0,
      submittedProposals: 0,
      reviewProposals: 0,
      acceptedProposals: 0,
      rejectedProposals: 0,
      totalRequested: 0,
    },
  }));

  return { data: hibahWithStats, error: null };
}
