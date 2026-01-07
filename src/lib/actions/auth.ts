'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { LoginInput, RegisterInput, UserRole } from '@/types/database.types';

// Session cookie configuration
const SESSION_COOKIE = 'lppm_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ==================== LOGIN ====================

export async function login(formData: LoginInput) {
  const supabase = await createClient();

  console.log('Login attempt:', formData.username);
  console.log('Using service key:', process.env.SUPABASE_SERVICE_KEY ? 'YES' : 'NO');

  // Query user by username and password (simple comparison)
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, role, is_active')
    .eq('username', formData.username)
    .eq('password', formData.password)
    .single();

  console.log('Query result:', { user, error });

  if (error || !user) {
    console.log('Login failed - user not found or error');
    return { error: 'Username atau password salah', success: false };
  }

  if (!user.is_active) {
    return { error: 'Akun Anda tidak aktif. Hubungi administrator.', success: false };
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify({
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  revalidatePath('/', 'layout');

  // Return success with redirect path (let client handle redirect)
  const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'dosen' ? '/dosen' : '/mahasiswa';
  return { success: true, redirectPath };
}

// ==================== LOGOUT ====================

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath('/', 'layout');
  redirect('/');
}

// ==================== GET CURRENT USER ====================

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return {
      id: session.userId,
      username: session.username,
      email: session.email,
      role: session.role as UserRole,
    };
  } catch {
    return null;
  }
}

// ==================== GET USER PROFILE ====================

export async function getUserProfile() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const supabase = await createClient();

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (!userData) return null;

  // Get role-specific profile
  let profile = null;

  if (userData.role === 'admin') {
    const { data } = await supabase
      .from('admin')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();
    profile = data;
  } else if (userData.role === 'dosen') {
    const { data } = await supabase
      .from('dosen')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();
    profile = data;
  } else if (userData.role === 'mahasiswa') {
    const { data } = await supabase
      .from('mahasiswa')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();
    profile = data;
  }

  return { user: userData, profile };
}

// ==================== ADMIN: CREATE USER ====================

export async function createUserByAdmin(formData: RegisterInput) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Hanya admin yang dapat membuat akun baru' };
  }

  const supabase = await createClient();

  // Check if username already exists
  const { data: existingUsername } = await supabase
    .from('users')
    .select('id')
    .eq('username', formData.username)
    .single();

  if (existingUsername) {
    return { error: 'Username sudah digunakan' };
  }

  // Check if email already exists
  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', formData.email)
    .single();

  if (existingEmail) {
    return { error: 'Email sudah digunakan' };
  }

  // Create user
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      username: formData.username,
      password: formData.password,
      email: formData.email,
      role: formData.role,
      is_active: true,
    })
    .select()
    .single();

  if (userError || !newUser) {
    return { error: userError?.message || 'Gagal membuat akun pengguna' };
  }

  // Insert role-specific data
  if (formData.role === 'dosen') {
    const { error: dosenError } = await supabase.from('dosen').insert({
      user_id: newUser.id,
      nama: formData.nama,
      nidn: formData.nidn!,
      nip: formData.nip,
      fakultas: formData.fakultas,
      prodi: formData.prodi,
    });

    if (dosenError) {
      // Rollback user
      await supabase.from('users').delete().eq('id', newUser.id);
      return { error: dosenError.message };
    }
  } else if (formData.role === 'mahasiswa') {
    const { error: mahasiswaError } = await supabase.from('mahasiswa').insert({
      user_id: newUser.id,
      nama: formData.nama,
      nim: formData.nim!,
      fakultas: formData.fakultas,
      prodi: formData.prodi,
    });

    if (mahasiswaError) {
      await supabase.from('users').delete().eq('id', newUser.id);
      return { error: mahasiswaError.message };
    }
  } else if (formData.role === 'admin') {
    const { error: adminError } = await supabase.from('admin').insert({
      user_id: newUser.id,
      nama: formData.nama,
      nip: formData.nip,
    });

    if (adminError) {
      await supabase.from('users').delete().eq('id', newUser.id);
      return { error: adminError.message };
    }
  }

  revalidatePath('/admin/users', 'layout');
  return { success: true, userId: newUser.id };
}

// ==================== ADMIN: GET ALL USERS ====================

export async function getAllUsers() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return { data: null, error: 'Hanya admin yang dapat melihat daftar pengguna' };
  }

  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      email,
      role,
      is_active,
      last_login,
      created_at,
      dosen ( nama, nidn, fakultas, prodi ),
      mahasiswa ( nama, nim, fakultas, prodi ),
      admin ( nama, nip )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: users, error: null };
}

// ==================== ADMIN: DELETE USER ====================

export async function deleteUser(userId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Hanya admin yang dapat menghapus pengguna' };
  }

  if (userId === currentUser.id) {
    return { error: 'Tidak dapat menghapus akun sendiri' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/users', 'layout');
  return { success: true };
}

// ==================== ADMIN: TOGGLE USER STATUS ====================

export async function toggleUserStatus(userId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Hanya admin yang dapat mengubah status pengguna' };
  }

  if (userId === currentUser.id) {
    return { error: 'Tidak dapat mengubah status akun sendiri' };
  }

  const supabase = await createClient();

  // Get current status
  const { data: user } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', userId)
    .single();

  if (!user) {
    return { error: 'Pengguna tidak ditemukan' };
  }

  // Toggle status
  const { error } = await supabase
    .from('users')
    .update({ is_active: !user.is_active })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/users', 'layout');
  return { success: true, is_active: !user.is_active };
}

// ==================== CHANGE PASSWORD ====================

export async function changePassword(oldPassword: string, newPassword: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { error: 'Anda harus login terlebih dahulu' };
  }

  const supabase = await createClient();

  // Verify old password
  const { data: user } = await supabase
    .from('users')
    .select('password')
    .eq('id', currentUser.id)
    .single();

  if (!user || user.password !== oldPassword) {
    return { error: 'Password lama tidak sesuai' };
  }

  // Update password
  const { error } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', currentUser.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
