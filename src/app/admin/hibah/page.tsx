'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import { getHibahList, createHibah, updateHibah, deleteHibah, toggleHibahStatus } from '@/lib/actions/hibah';
import type { MasterHibah, MasterHibahInput } from '@/types/database.types';

const emptyForm: MasterHibahInput = {
  nama_hibah: '',
  deskripsi: '',
  jenis: '',
  tahun_anggaran: new Date().getFullYear(),
  anggaran_total: 0,
  anggaran_per_proposal: 0,
  tanggal_buka: '',
  tanggal_tutup: '',
  persyaratan: '',
};

export default function HibahManagementPage() {
  const [hibahList, setHibahList] = useState<MasterHibah[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHibah, setSelectedHibah] = useState<MasterHibah | null>(null);
  const [formData, setFormData] = useState<MasterHibahInput>(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHibah();
  }, []);

  const loadHibah = async () => {
    setLoading(true);
    const { data, error } = await getHibahList();
    if (data) {
      setHibahList(data);
    }
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (selectedHibah) {
        const { error } = await updateHibah(selectedHibah.id, formData);
        if (error) throw new Error(error);
      } else {
        const { error } = await createHibah(formData);
        if (error) throw new Error(error);
      }
      setIsDialogOpen(false);
      setFormData(emptyForm);
      setSelectedHibah(null);
      loadHibah();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEdit = (hibah: MasterHibah) => {
    setSelectedHibah(hibah);
    setFormData({
      nama_hibah: hibah.nama_hibah,
      deskripsi: hibah.deskripsi || '',
      jenis: hibah.jenis,
      tahun_anggaran: hibah.tahun_anggaran,
      anggaran_total: hibah.anggaran_total,
      anggaran_per_proposal: hibah.anggaran_per_proposal || 0,
      tanggal_buka: hibah.tanggal_buka,
      tanggal_tutup: hibah.tanggal_tutup,
      persyaratan: hibah.persyaratan || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedHibah) return;
    
    const { error } = await deleteHibah(selectedHibah.id);
    if (error) {
      setError(error);
    } else {
      setIsDeleteDialogOpen(false);
      setSelectedHibah(null);
      loadHibah();
    }
  };

  const handleToggleStatus = async (hibah: MasterHibah) => {
    const { error } = await toggleHibahStatus(hibah.id, !hibah.is_active);
    if (error) {
      setError(error);
    } else {
      loadHibah();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Hibah</h1>
          <p className="text-gray-600 mt-1">Manajemen program hibah penelitian dan pengabdian</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedHibah(null); setFormData(emptyForm); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Hibah
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{selectedHibah ? 'Edit Hibah' : 'Tambah Hibah Baru'}</DialogTitle>
                <DialogDescription>
                  {selectedHibah ? 'Perbarui informasi program hibah' : 'Buat program hibah baru untuk penelitian atau pengabdian'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="nama_hibah">Nama Hibah *</Label>
                  <Input
                    id="nama_hibah"
                    value={formData.nama_hibah}
                    onChange={(e) => setFormData({ ...formData, nama_hibah: e.target.value })}
                    placeholder="Hibah Penelitian Internal 2025"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jenis">Jenis Hibah *</Label>
                    <Input
                      id="jenis"
                      value={formData.jenis}
                      onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                      placeholder="Penelitian / Pengabdian"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tahun_anggaran">Tahun Anggaran *</Label>
                    <Input
                      id="tahun_anggaran"
                      type="number"
                      value={formData.tahun_anggaran}
                      onChange={(e) => setFormData({ ...formData, tahun_anggaran: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="anggaran_total">Total Anggaran (Rp) *</Label>
                    <Input
                      id="anggaran_total"
                      type="number"
                      value={formData.anggaran_total}
                      onChange={(e) => setFormData({ ...formData, anggaran_total: parseInt(e.target.value) })}
                      placeholder="500000000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anggaran_per_proposal">Anggaran per Proposal (Rp)</Label>
                    <Input
                      id="anggaran_per_proposal"
                      type="number"
                      value={formData.anggaran_per_proposal || ''}
                      onChange={(e) => setFormData({ ...formData, anggaran_per_proposal: parseInt(e.target.value) || 0 })}
                      placeholder="50000000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_buka">Tanggal Buka *</Label>
                    <Input
                      id="tanggal_buka"
                      type="date"
                      value={formData.tanggal_buka}
                      onChange={(e) => setFormData({ ...formData, tanggal_buka: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_tutup">Tanggal Tutup *</Label>
                    <Input
                      id="tanggal_tutup"
                      type="date"
                      value={formData.tanggal_tutup}
                      onChange={(e) => setFormData({ ...formData, tanggal_tutup: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi || ''}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Deskripsi program hibah..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="persyaratan">Persyaratan</Label>
                  <Textarea
                    id="persyaratan"
                    value={formData.persyaratan || ''}
                    onChange={(e) => setFormData({ ...formData, persyaratan: e.target.value })}
                    placeholder="Persyaratan pengajuan..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {selectedHibah ? 'Simpan Perubahan' : 'Buat Hibah'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Hibah</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus hibah "{selectedHibah?.nama_hibah}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hibah Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : hibahList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada program hibah. Klik "Tambah Hibah" untuk membuat program baru.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Hibah</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Anggaran Total</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hibahList.map((hibah) => (
                  <TableRow key={hibah.id}>
                    <TableCell className="font-medium">{hibah.nama_hibah}</TableCell>
                    <TableCell>{hibah.jenis}</TableCell>
                    <TableCell>{hibah.tahun_anggaran}</TableCell>
                    <TableCell>{formatCurrency(hibah.anggaran_total)}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(hibah.tanggal_buka).toLocaleDateString('id-ID')} -{' '}
                        {new Date(hibah.tanggal_tutup).toLocaleDateString('id-ID')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={hibah.is_active ? 'default' : 'secondary'}>
                        {hibah.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(hibah)}
                          title={hibah.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {hibah.is_active ? (
                            <PowerOff className="h-4 w-4 text-orange-600" />
                          ) : (
                            <Power className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(hibah)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedHibah(hibah); setIsDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
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
