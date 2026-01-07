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
