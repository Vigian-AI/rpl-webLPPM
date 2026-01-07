'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Save, Mail, Phone, GraduationCap, Building, Briefcase, Award } from 'lucide-react';

// In production this would come from Supabase/database
const initialProfile = {
  nidn: '',
  nama: '',
  email_institusi: '',
  program_studi: '',
  fakultas: '',
  jabatan_fungsional: '',
  bidang_keahlian: '',
  no_telepon: '',
  alamat: '',
};

export default function DosenProfilPage() {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call - in production this would save to Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setIsEditing(false);
    setSuccess('Profil berhasil diperbarui');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-600 mt-1">Kelola informasi profil dosen</p>
      </div>

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">{success}</div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">{profile.nama || 'Nama Dosen'}</h3>
              <p className="text-sm text-gray-500">{profile.nidn || 'NIDN'}</p>
              <p className="text-sm text-gray-500 mt-1">{profile.jabatan_fungsional || 'Jabatan Fungsional'}</p>
              <p className="text-sm text-blue-600 mt-2">{profile.program_studi || 'Program Studi'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Info Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informasi Personal</CardTitle>
                <CardDescription>Data diri dan kontak dosen</CardDescription>
              </div>
              <Button 
                variant={isEditing ? 'outline' : 'default'} 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Batal' : 'Edit Profil'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="nidn">NIDN</Label>
                  <div className="flex items-center mt-1.5">
                    <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="nidn"
                      value={profile.nidn}
                      onChange={(e) => setProfile({ ...profile, nidn: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Masukkan NIDN"
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <div className="flex items-center mt-1.5">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="nama"
                      value={profile.nama}
                      onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Masukkan nama lengkap"
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email_institusi">Email Institusi</Label>
                  <div className="flex items-center mt-1.5">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="email_institusi"
                      type="email"
                      value={profile.email_institusi}
                      onChange={(e) => setProfile({ ...profile, email_institusi: e.target.value })}
                      disabled={!isEditing}
                      placeholder="email@universitas.ac.id"
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="no_telepon">No. Telepon</Label>
                  <div className="flex items-center mt-1.5">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="no_telepon"
                      value={profile.no_telepon}
                      onChange={(e) => setProfile({ ...profile, no_telepon: e.target.value })}
                      disabled={!isEditing}
                      placeholder="08xxxxxxxxxx"
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="program_studi">Program Studi</Label>
                  <div className="flex items-center mt-1.5">
                    <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="program_studi"
                      value={profile.program_studi}
                      onChange={(e) => setProfile({ ...profile, program_studi: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Masukkan program studi"
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fakultas">Fakultas</Label>
                  <div className="flex items-center mt-1.5">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="fakultas"
                      value={profile.fakultas}
                      onChange={(e) => setProfile({ ...profile, fakultas: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Masukkan fakultas"
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="jabatan_fungsional">Jabatan Fungsional</Label>
                  <div className="flex items-center mt-1.5">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="jabatan_fungsional"
                      value={profile.jabatan_fungsional}
                      onChange={(e) => setProfile({ ...profile, jabatan_fungsional: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Contoh: Lektor, Lektor Kepala"
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bidang_keahlian">Bidang Keahlian</Label>
                  <div className="flex items-center mt-1.5">
                    <Award className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="bidang_keahlian"
                      value={profile.bidang_keahlian}
                      onChange={(e) => setProfile({ ...profile, bidang_keahlian: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Contoh: Machine Learning, IoT"
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={profile.alamat}
                  onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>

              {isEditing && (
                <div className="pt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Keamanan Akun</CardTitle>
          <CardDescription>Kelola kata sandi dan pengaturan keamanan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Ubah Kata Sandi</p>
              <p className="text-sm text-gray-500">Terakhir diubah: Belum pernah</p>
            </div>
            <Button variant="outline">Ubah</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
