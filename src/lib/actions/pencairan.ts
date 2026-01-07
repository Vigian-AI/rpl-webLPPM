'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import type { SuratPencairanInput, SuratPencairan } from '@/types/database.types';

export async function getSuratPencairanList() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('surat_pencairan')
    .select(`
      *,
      proposal:proposal(
        judul,
        ketua:dosen!proposal_ketua_id_fkey(nama)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as (SuratPencairan & { proposal: { judul: string; ketua: { nama: string }[] } })[], error: null };
}

export async function getSuratPencairanById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('surat_pencairan')
    .select(`
      *,
      proposal:proposal(
        *,
        ketua:dosen!proposal_ketua_id_fkey(*),
        hibah:master_hibah(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getAcceptedProposals() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('proposal')
    .select(`
      id,
      judul,
      anggaran_disetujui,
      ketua:dosen!proposal_ketua_id_fkey(nama)
    `)
    .eq('status_proposal', 'accepted')
    .order('updated_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createSuratPencairan(input: SuratPencairanInput) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  const { data, error } = await supabase
    .from('surat_pencairan')
    .insert({
      ...input,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/pencairan');
  return { data: data as SuratPencairan, error: null };
}

export async function updateSuratPencairan(id: string, input: Partial<SuratPencairanInput>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('surat_pencairan')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/pencairan');
  return { data: data as SuratPencairan, error: null };
}

export async function deleteSuratPencairan(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('surat_pencairan')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/pencairan');
  return { error: null };
}

export async function generateNomorSurat() {
  const supabase = await createClient();
  
  // Get count of surat pencairan this year
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('surat_pencairan')
    .select('*', { count: 'exact', head: true })
    .gte('tanggal_surat', `${year}-01-01`)
    .lte('tanggal_surat', `${year}-12-31`);

  const nextNumber = (count || 0) + 1;
  const paddedNumber = String(nextNumber).padStart(4, '0');
  
  return `SP/${paddedNumber}/LPPM/${year}`;
}

// Get surat pencairan for ketua, asisten dosen, and asisten peneliti (mahasiswa)
export async function getMySuratPencairan() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  let ketuaProposalIds: string[] = [];

  // Check if user is a dosen (ketua)
  const { data: dosenData } = await supabase
    .from('dosen')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (dosenData) {
    // Get proposals where user is ketua
    const { data: ketuaProposals } = await supabase
      .from('proposal')
      .select('id')
      .eq('ketua_id', dosenData.id);
    
    ketuaProposalIds = ketuaProposals?.map(p => p.id) || [];
  }

  // Get proposals where user is Asisten Dosen or Asisten Peneliti in the team
  const { data: asistenMembership } = await supabase
    .from('anggota_tim')
    .select('tim_id')
    .eq('user_id', user.id)
    .in('peran', ['Asisten Dosen', 'Asisten Peneliti'])
    .eq('status', 'accepted');

  let asistenProposalIds: string[] = [];
  if (asistenMembership && asistenMembership.length > 0) {
    const asistenTimIds = asistenMembership.map(m => m.tim_id);
    
    const { data: proposalsData } = await supabase
      .from('proposal')
      .select('id')
      .in('tim_id', asistenTimIds);
    
    if (proposalsData) {
      asistenProposalIds = proposalsData.map(p => p.id);
    }
  }

  // Combine all proposal IDs
  const allProposalIds = [...new Set([...ketuaProposalIds, ...asistenProposalIds])];

  if (allProposalIds.length === 0) {
    return { data: [], error: null };
  }

  // Get surat pencairan for these proposals
  const { data, error } = await supabase
    .from('surat_pencairan')
    .select(`
      *,
      proposal:proposal(
        id,
        judul,
        ketua:dosen!proposal_ketua_id_fkey(id, nama),
        hibah:master_hibah(nama_hibah)
      )
    `)
    .in('proposal_id', allProposalIds)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Upload dokumen surat pencairan (admin only)
export async function uploadSuratPencairanDokumen(id: string, dokumenUrl: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('surat_pencairan')
    .update({ dokumen_url: dokumenUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/pencairan');
  return { data: data as SuratPencairan, error: null };
}
