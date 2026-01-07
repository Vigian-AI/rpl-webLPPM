'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Trash2, FileText, Upload } from 'lucide-react';
import { 
  getSuratPencairanList, 
  createSuratPencairan, 
  deleteSuratPencairan, 
  getAcceptedProposals,
  generateNomorSurat,
  uploadSuratPencairanDokumen 
} from '@/lib/actions/pencairan';
import { createClient } from '@/lib/supabase/client';
import type { SuratPencairan, SuratPencairanInput } from '@/types/database.types';

interface AcceptedProposal {
  id: string;
  judul: string;
  anggaran_disetujui: number | null;
  ketua: { nama: string }[];
}

interface SuratPencairanWithProposal extends SuratPencairan {
  proposal: {
    judul: string;
    ketua: { nama: string }[];
  };
}

export default function PencairanDanaPage() {
  const [suratList, setSuratList] = useState<SuratPencairanWithProposal[]>([]);
  const [proposals, setProposals] = useState<AcceptedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<SuratPencairanWithProposal | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState<SuratPencairanInput>({
    proposal_id: '',
    nomor_surat: '',
    tanggal_surat: new Date().toISOString().split('T')[0],
    jumlah_dana: 0,
    keterangan: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [suratResult, proposalResult] = await Promise.all([
      getSuratPencairanList(),
      getAcceptedProposals(),
    ]);
    
    if (suratResult.data) {
      setSuratList(suratResult.data);
    }
    if (proposalResult.data) {
      setProposals(proposalResult.data);
    }
    setLoading(false);
  };

  const handleOpenDialog = async () => {
    const nomorSurat = await generateNomorSurat();
    setFormData({
      proposal_id: '',
      nomor_surat: nomorSurat,
      tanggal_surat: new Date().toISOString().split('T')[0],
      jumlah_dana: 0,
      keterangan: '',
    });
    setIsDialogOpen(true);
  };

  const handleProposalChange = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    setFormData({
      ...formData,
      proposal_id: proposalId,
      jumlah_dana: proposal?.anggaran_disetujui || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.proposal_id) {
      setError('Pilih proposal terlebih dahulu');
      return;
    }

    try {
      const { error } = await createSuratPencairan(formData);
      if (error) throw new Error(error);
      
      setIsDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!selectedSurat) return;
    
    const { error } = await deleteSuratPencairan(selectedSurat.id);
    if (error) {
      setError(error);
    } else {
      setIsDeleteDialogOpen(false);
      setSelectedSurat(null);
      loadData();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSurat || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
      setError('Hanya file PDF yang diperbolehkan');
      return;
    }

    setUploadingFile(true);
    setError('');

    try {
      const supabase = createClient();
      const fileName = `surat-pencairan/${selectedSurat.id}/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path);

      const { error: updateError } = await uploadSuratPencairanDokumen(
        selectedSurat.id, 
        urlData.publicUrl
      );

      if (updateError) throw new Error(updateError);

      setIsUploadDialogOpen(false);
      setSelectedSurat(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleOpenUploadDialog = (surat: SuratPencairanWithProposal) => {
    setSelectedSurat(surat);
    setError('');
    setIsUploadDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalDisbursed = suratList.reduce((sum, surat) => sum + surat.jumlah_dana, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pencairan Dana</h1>
          <p className="text-gray-600 mt-1">Kelola surat pencairan dana hibah</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Surat Pencairan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Buat Surat Pencairan</DialogTitle>
                <DialogDescription>
                  Buat surat pencairan dana untuk proposal yang telah disetujui
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="proposal">Proposal *</Label>
                  <Select 
                    value={formData.proposal_id} 
                    onValueChange={handleProposalChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih proposal" />
                    </SelectTrigger>
                    <SelectContent>
                      {proposals.map((proposal) => (
                        <SelectItem key={proposal.id} value={proposal.id}>
                          {proposal.judul} - {proposal.ketua?.[0]?.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomor_surat">Nomor Surat *</Label>
                  <Input
                    id="nomor_surat"
                    value={formData.nomor_surat}
                    onChange={(e) => setFormData({ ...formData, nomor_surat: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_surat">Tanggal Surat *</Label>
                    <Input
                      id="tanggal_surat"
                      type="date"
                      value={formData.tanggal_surat}
                      onChange={(e) => setFormData({ ...formData, tanggal_surat: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumlah_dana">Jumlah Dana (Rp) *</Label>
                    <Input
                      id="jumlah_dana"
                      type="number"
                      value={formData.jumlah_dana}
                      onChange={(e) => setFormData({ ...formData, jumlah_dana: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keterangan">Keterangan</Label>
                  <Textarea
                    id="keterangan"
                    value={formData.keterangan || ''}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Keterangan tambahan..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Buat Surat</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-100 text-sm">Total Surat Pencairan</p>
              <p className="text-3xl font-bold mt-1">{suratList.length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Total Dana Tersalurkan</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalDisbursed)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Proposal Menunggu Pencairan</p>
              <p className="text-3xl font-bold mt-1">{proposals.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Surat Pencairan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus surat pencairan "{selectedSurat?.nomor_surat}"?
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

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Dokumen Surat Pencairan</DialogTitle>
            <DialogDescription>
              Upload file PDF surat pencairan untuk "{selectedSurat?.nomor_surat}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {error && (
              <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
            )}
            {selectedSurat?.dokumen_url && (
              <div className="p-3 mb-4 text-sm text-blue-600 bg-blue-50 rounded-lg">
                <p>Dokumen saat ini: <a href={selectedSurat.dokumen_url} target="_blank" rel="noopener noreferrer" className="underline">Lihat Dokumen</a></p>
                <p className="text-xs text-gray-500 mt-1">Upload file baru untuk mengganti dokumen yang ada</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="dokumen">File Surat Pencairan (PDF) *</Label>
              <Input
                id="dokumen"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
              <p className="text-xs text-gray-500">Maksimal 10MB, format PDF</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={uploadingFile}>
              {uploadingFile ? 'Mengunggah...' : 'Tutup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : suratList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada surat pencairan. Klik "Buat Surat Pencairan" untuk membuat surat baru.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Ketua Peneliti</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah Dana</TableHead>
                  <TableHead>Dokumen</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suratList.map((surat) => (
                  <TableRow key={surat.id}>
                    <TableCell className="font-medium">{surat.nomor_surat}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{surat.proposal.judul}</div>
                    </TableCell>
                    <TableCell>{surat.proposal.ketua?.[0]?.nama}</TableCell>
                    <TableCell>
                      {new Date(surat.tanggal_surat).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(surat.jumlah_dana)}</TableCell>
                    <TableCell>
                      {surat.dokumen_url ? (
                        <Badge className="bg-green-100 text-green-700">
                          <a href={surat.dokumen_url} target="_blank" rel="noopener noreferrer">
                            Tersedia
                          </a>
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          Belum Upload
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Upload Dokumen"
                          onClick={() => handleOpenUploadDialog(surat)}
                        >
                          <Upload className="h-4 w-4 text-blue-600" />
                        </Button>
                        {surat.dokumen_url && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Lihat Dokumen"
                            onClick={() => window.open(surat.dokumen_url!, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Hapus"
                          onClick={() => { setSelectedSurat(surat); setIsDeleteDialogOpen(true); }}
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
