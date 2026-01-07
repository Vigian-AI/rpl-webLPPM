'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, Mail, Phone, GraduationCap, Building } from 'lucide-react';

// Sample profile data - in production this would come from Supabase
const initialProfile = {
  nim: '2021001234',
  nama: 'John Doe',
  email: 'john.doe@university.ac.id',
  program_studi: 'Informatika',
  fakultas: 'Fakultas Teknik',
  angkatan: 2021,
  no_telepon: '08123456789',
};

export default function ProfilPage() {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
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
        <p className="text-gray-600 mt-1">Kelola informasi profil Anda</p>
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
              <h3 className="font-semibold text-lg">{profile.nama}</h3>
              <p className="text-sm text-gray-500">{profile.nim}</p>
              <p className="text-sm text-gray-500 mt-1">{profile.program_studi}</p>
            </div>
          </CardContent>
        </Card>

        {/* Info Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informasi Personal</CardTitle>
                <CardDescription>Data diri dan kontak</CardDescription>
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
                  <Label htmlFor="nim">NIM</Label>
                  <div className="flex items-center mt-1.5">
                    <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="nim"
                      value={profile.nim}
                      disabled
                      className="bg-gray-50"
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
                      className={isEditing ? '' : 'bg-gray-50'}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center mt-1.5">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
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
                      disabled
                      className="bg-gray-50"
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
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="angkatan">Angkatan</Label>
                <Input
                  id="angkatan"
                  type="number"
                  value={profile.angkatan}
                  disabled
                  className="bg-gray-50 w-32"
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
              <p className="text-sm text-gray-500">Terakhir diubah: 30 hari yang lalu</p>
            </div>
            <Button variant="outline">Ubah</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
