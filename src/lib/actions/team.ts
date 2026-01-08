'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import type { AnggotaTim, AnggotaTimWithUser, InviteTeamMemberInput, TimInput } from '@/types/database.types';

// ==================== TIM MANAGEMENT ====================

// Create a new team
export async function createTeam(input: TimInput) {
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

  // Create the team
  const { data: timData, error: timError } = await supabase
    .from('tim')
    .insert({
      nama_tim: input.nama_tim,
      deskripsi: input.deskripsi || null,
      ketua_id: dosenData.id,
    })
    .select()
    .single();

  if (timError) {
    return { data: null, error: timError.message };
  }

  // Add the creator as team leader (Ketua)
  const { error: memberError } = await supabase
    .from('anggota_tim')
    .insert({
      tim_id: timData.id,
      user_id: user.id,
      peran: 'Ketua',
      status: 'accepted',
      invited_at: new Date().toISOString(),
      responded_at: new Date().toISOString(),
    });

  if (memberError) {
    return { data: null, error: memberError.message };
  }

  revalidatePath('/dosen/tim');
  return { data: timData, error: null };
}

// Get teams where user is ketua
export async function getMyLeadTeams() {
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

  const { data, error } = await supabase
    .from('tim')
    .select(`
      *,
      ketua:dosen!tim_ketua_id_fkey(nama, email_institusi),
      anggota_tim(
        *,
        user:users!inner(
          id,
          username,
          email,
          is_active,
          dosen(nama),
          mahasiswa(nama)
        )
      )
    `)
    .eq('ketua_id', dosenData.id)
    .eq('is_archived', false)
    .eq('anggota_tim.user.is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Get all teams for proposal selection (where user is ketua or Asisten Dosen)
export async function getTeamsForProposal() {
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

  // First, get teams where user is ketua
  const { data: ketuaTeams, error: ketuaError } = await supabase
    .from('tim')
    .select(`
      id,
      nama_tim,
      deskripsi,
      anggota_tim(
        id,
        peran,
        status,
        user:users!inner(
          id,
          username,
          is_active,
          dosen(nama),
          mahasiswa(nama)
        )
      )
    `)
    .eq('ketua_id', dosenData.id)
    .eq('is_archived', false)
    .eq('anggota_tim.user.is_active', true)
    .order('created_at', { ascending: false });

  if (ketuaError) {
    return { data: null, error: ketuaError.message };
  }

  // Second, get teams where user is Asisten Dosen
  const { data: asistenMembership } = await supabase
    .from('anggota_tim')
    .select('tim_id')
    .eq('user_id', user.id)
    .eq('peran', 'Asisten Dosen')
    .eq('status', 'accepted');

  let asistenTeams: typeof ketuaTeams = [];
  if (asistenMembership && asistenMembership.length > 0) {
    const asistenTimIds = asistenMembership.map(m => m.tim_id);
    
    const { data: teamsData } = await supabase
      .from('tim')
      .select(`
        id,
        nama_tim,
        deskripsi,
        anggota_tim(
          id,
          peran,
          status,
          user:users!inner(
            id,
            username,
            is_active,
            dosen(nama),
            mahasiswa(nama)
          )
        )
      `)
      .in('id', asistenTimIds)
      .eq('is_archived', false)
      .eq('anggota_tim.user.is_active', true)
      .order('created_at', { ascending: false });
    
    if (teamsData) {
      asistenTeams = teamsData;
    }
  }

  // Merge and deduplicate teams
  const allTeams = [...(ketuaTeams || [])];
  const ketuaTeamIds = new Set(ketuaTeams?.map(t => t.id) || []);
  
  for (const team of asistenTeams) {
    if (!ketuaTeamIds.has(team.id)) {
      allTeams.push(team);
    }
  }

  return { data: allTeams, error: null };
}

// Get archived teams
export async function getArchivedTeams() {
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

  const { data, error } = await supabase
    .from('tim')
    .select(`
      *,
      ketua:dosen!tim_ketua_id_fkey(nama, email_institusi),
      anggota_tim(
        *,
        user:users!inner(
          id,
          username,
          email,
          is_active,
          dosen(nama),
          mahasiswa(nama)
        )
      )
    `)
    .eq('ketua_id', dosenData.id)
    .eq('is_archived', true)
    .eq('anggota_tim.user.is_active', true)
    .order('updated_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Delete a team
export async function deleteTeam(timId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('tim')
    .delete()
    .eq('id', timId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dosen/tim');
  return { error: null };
}

// Archive/unarchive a team
export async function archiveTeam(timId: string, isArchived: boolean) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get dosen ID to verify ownership
  const { data: dosenData } = await supabase
    .from('dosen')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!dosenData) {
    return { error: 'Dosen profile not found' };
  }

  // Verify user is the team leader
  const { data: timData } = await supabase
    .from('tim')
    .select('ketua_id')
    .eq('id', timId)
    .single();

  if (!timData || timData.ketua_id !== dosenData.id) {
    return { error: 'Anda tidak memiliki akses untuk mengarsipkan tim ini' };
  }

  const { error } = await supabase
    .from('tim')
    .update({ is_archived: isArchived, updated_at: new Date().toISOString() })
    .eq('id', timId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dosen/tim');
  return { error: null };
}

// ==================== TEAM MEMBER MANAGEMENT ====================

// Get team members
export async function getTeamMembers(timId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('anggota_tim')
    .select(`
      *,
      user:users!inner(
        *,
        dosen(*),
        mahasiswa(*)
      )
    `)
    .eq('tim_id', timId)
    .eq('user.is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as AnggotaTimWithUser[], error: null };
}

// Invite team member
export async function inviteTeamMember(input: InviteTeamMemberInput) {
  const supabase = await createClient();
  
  // Check current team member count (max 7)
  const { count: memberCount } = await supabase
    .from('anggota_tim')
    .select('*', { count: 'exact', head: true })
    .eq('tim_id', input.tim_id)
    .in('status', ['pending', 'accepted']);

  if (memberCount && memberCount >= 7) {
    return { data: null, error: 'Tim sudah mencapai batas maksimal 7 anggota' };
  }

  // Find user by username
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, username, email, role')
    .eq('username', input.username)
    .single();

  if (userError || !userData) {
    return { data: null, error: 'Pengguna dengan username tersebut tidak ditemukan' };
  }

  // Check if user is already a team member
  const { data: existingMember } = await supabase
    .from('anggota_tim')
    .select('id')
    .eq('tim_id', input.tim_id)
    .eq('user_id', userData.id)
    .single();

  if (existingMember) {
    return { data: null, error: 'Pengguna sudah menjadi anggota tim' };
  }

  // Add team member with pending status
  const { data, error } = await supabase
    .from('anggota_tim')
    .insert({
      tim_id: input.tim_id,
      user_id: userData.id,
      peran: input.peran,
      status: 'pending',
      invited_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/dosen/tim');
  return { data: data as AnggotaTim, error: null };
}

// Remove team member
export async function removeTeamMember(memberId: string, timId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('anggota_tim')
    .delete()
    .eq('id', memberId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dosen/tim');
  return { error: null };
}

// Update member role
export async function updateMemberRole(memberId: string, peran: string, timId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('anggota_tim')
    .update({ peran })
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/dosen/tim');
  return { data: data as AnggotaTim, error: null };
}

// ==================== INVITATION MANAGEMENT (FOR MAHASISWA AND DOSEN) ====================

// Get pending invitations for current user (works for both mahasiswa and dosen)
export async function getMyInvitations() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('anggota_tim')
    .select(`
      *,
      tim:tim(
        id,
        nama_tim,
        deskripsi,
        ketua:dosen!tim_ketua_id_fkey(nama, email_institusi)
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Respond to invitation (works for both mahasiswa and dosen)
export async function respondToInvitation(memberId: string, status: 'accepted' | 'rejected') {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  // Verify the invitation belongs to this user
  const { data: member } = await supabase
    .from('anggota_tim')
    .select('user_id')
    .eq('id', memberId)
    .single();

  if (!member || member.user_id !== user.id) {
    return { data: null, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('anggota_tim')
    .update({
      status,
      responded_at: new Date().toISOString(),
    })
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/mahasiswa/undangan');
  revalidatePath('/mahasiswa/tim');
  revalidatePath('/dosen/undangan');
  revalidatePath('/dosen/tim');
  return { data: data as AnggotaTim, error: null };
}

// Get my teams (accepted invitations) - for mahasiswa
export async function getMyTeams() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('anggota_tim')
    .select(`
      *,
      tim:tim(
        id,
        nama_tim,
        deskripsi,
        ketua:dosen!tim_ketua_id_fkey(nama, email_institusi),
        proposal(
          id,
          judul,
          status_proposal,
          dokumen_proposal_url,
          anggaran_disetujui,
          hibah:master_hibah(nama_hibah)
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('responded_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
