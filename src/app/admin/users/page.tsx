'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, Trash2, Users, GraduationCap, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAllUsers, createUserByAdmin, deleteUser, toggleUserStatus } from '@/lib/actions/auth';
import type { UserRole } from '@/types/database.types';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  dosen: { nama: string; nidn: string; fakultas: string | null; prodi: string | null }[] | null;
  mahasiswa: { nama: string; nim: string; fakultas: string | null; prodi: string | null }[] | null;
  admin: { nama: string; nip: string | null }[] | null;
}

const roleConfig: Record<UserRole, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Shield },
  dosen: { label: 'Dosen', color: 'bg-blue-100 text-blue-700', icon: Users },
  mahasiswa: { label: 'Mahasiswa', color: 'bg-green-100 text-green-700', icon: GraduationCap },
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nama: '',
    role: 'dosen' as UserRole,
    nidn: '',
    nim: '',
    nip: '',
    fakultas: '',
    prodi: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await getAllUsers();
    if (data) {
      setUsers(data);
    }
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    setError('');
    setSuccess('');

    if (!formData.username || !formData.email || !formData.password || !formData.nama) {
      setError('Username, email, password, dan nama wajib diisi');
      return;
    }

    if (formData.role === 'dosen' && !formData.nidn) {
      setError('NIDN wajib diisi untuk dosen');
      return;
    }

    if (formData.role === 'mahasiswa' && !formData.nim) {
      setError('NIM wajib diisi untuk mahasiswa');
      return;
    }

    const result = await createUserByAdmin({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      nama: formData.nama,
      role: formData.role,
      nidn: formData.nidn || undefined,
      nim: formData.nim || undefined,
      nip: formData.nip || undefined,
      fakultas: formData.fakultas || undefined,
      prodi: formData.prodi || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Pengguna berhasil dibuat');
      setFormData({
        username: '',
        email: '',
        password: '',
        nama: '',
        role: 'dosen',
        nidn: '',
        nim: '',
        nip: '',
        fakultas: '',
        prodi: '',
      });
      setIsDialogOpen(false);
      loadUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setError('');
    const result = await deleteUser(selectedUser.id);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Pengguna berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setError('');
    const result = await toggleUserStatus(userId);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Status pengguna berhasil ${result.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadUsers();
    }
  };

  const getUserName = (user: UserData) => {
    return user.admin?.[0]?.nama || user.dosen?.[0]?.nama || user.mahasiswa?.[0]?.nama || '-';
  };

  const getUserIdentifier = (user: UserData) => {
    if (user.role === 'admin') return user.admin?.[0]?.nip || '-';
    if (user.role === 'dosen') return user.dosen?.[0]?.nidn || '-';
    if (user.role === 'mahasiswa') return user.mahasiswa?.[0]?.nim || '-';
    return '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-1">Kelola akun dosen, mahasiswa, dan admin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Akun Baru</DialogTitle>
              <DialogDescription>
                Buat akun untuk dosen, mahasiswa, atau admin baru
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
              )}

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dosen">Dosen</SelectItem>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username untuk login"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@universitas.ac.id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>

              {formData.role === 'dosen' && (
                <div className="space-y-2">
                  <Label htmlFor="nidn">NIDN *</Label>
                  <Input
                    id="nidn"
                    value={formData.nidn}
                    onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                    placeholder="Nomor Induk Dosen Nasional"
                  />
                </div>
              )}

              {formData.role === 'mahasiswa' && (
                <div className="space-y-2">
                  <Label htmlFor="nim">NIM *</Label>
                  <Input
                    id="nim"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Nomor Induk Mahasiswa"
                  />
                </div>
              )}

              {(formData.role === 'dosen' || formData.role === 'admin') && (
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP</Label>
                  <Input
                    id="nip"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="Nomor Induk Pegawai"
                  />
                </div>
              )}

              {(formData.role === 'dosen' || formData.role === 'mahasiswa') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fakultas">Fakultas</Label>
                    <Input
                      id="fakultas"
                      value={formData.fakultas}
                      onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                      placeholder="Nama fakultas"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prodi">Program Studi</Label>
                    <Input
                      id="prodi"
                      value={formData.prodi}
                      onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                      placeholder="Nama program studi"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Buat Akun
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">{success}</div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus akun "{selectedUser && getUserName(selectedUser)}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admin</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dosen</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'dosen').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'mahasiswa').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>Semua pengguna yang terdaftar dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada pengguna terdaftar
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{getUserName(user)}</TableCell>
                    <TableCell className="text-blue-600 font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-gray-500">{getUserIdentifier(user)}</TableCell>
                    <TableCell>
                      <Badge className={roleConfig[user.role].color}>
                        {roleConfig[user.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.is_active ? 'Nonaktifkan pengguna' : 'Aktifkan pengguna'}
                      >
                        {user.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                        title="Hapus pengguna"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
