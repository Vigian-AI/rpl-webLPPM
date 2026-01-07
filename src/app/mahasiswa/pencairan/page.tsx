'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Eye, FileText, Wallet, AlertCircle } from 'lucide-react';
import { getMySuratPencairan } from '@/lib/actions/pencairan';
import type { SuratPencairan } from '@/types/database.types';

interface SuratPencairanWithProposal extends SuratPencairan {
  proposal: {
    id: string;
    judul: string;
    ketua: { id: string; nama: string }[];
    hibah: { nama_hibah: string };
  };
}

export default function MahasiswaPencairanPage() {
  const [suratList, setSuratList] = useState<SuratPencairanWithProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurat, setSelectedSurat] = useState<SuratPencairanWithProposal | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getMySuratPencairan();
    
    if (result.data) {
      setSuratList(result.data as SuratPencairanWithProposal[]);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleViewDetail = (surat: SuratPencairanWithProposal) => {
    setSelectedSurat(surat);
    setIsDetailDialogOpen(true);
  };

  const handleDownload = (surat: SuratPencairanWithProposal) => {
    if (surat.dokumen_url) {
      window.open(surat.dokumen_url, '_blank');
    }
  };

  const totalDana = suratList.reduce((sum, surat) => sum + surat.jumlah_dana, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Surat Pencairan Dana</h1>
        <p className="text-gray-600 mt-1">
          Lihat dan unduh surat pencairan dana untuk proposal tim yang Anda ikuti
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-green-100 text-sm">Total Surat Pencairan</p>
                <p className="text-3xl font-bold mt-1">{suratList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Dana Tim</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalDana)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Surat Pencairan</DialogTitle>
            <DialogDescription>
              Informasi lengkap surat pencairan dana
            </DialogDescription>
          </DialogHeader>
          {selectedSurat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nomor Surat</p>
                  <p className="font-medium">{selectedSurat.nomor_surat}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Surat</p>
                  <p className="font-medium">{formatDate(selectedSurat.tanggal_surat)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Judul Proposal</p>
                <p className="font-medium">{selectedSurat.proposal.judul}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Nama Hibah</p>
                <p className="font-medium">{selectedSurat.proposal.hibah?.nama_hibah || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Ketua Peneliti</p>
                <p className="font-medium">{selectedSurat.proposal.ketua?.[0]?.nama || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Jumlah Dana</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(selectedSurat.jumlah_dana)}
                </p>
              </div>
              
              {selectedSurat.keterangan && (
                <div>
                  <p className="text-sm text-gray-500">Keterangan</p>
                  <p className="text-gray-700">{selectedSurat.keterangan}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                {selectedSurat.dokumen_url ? (
                  <Button 
                    className="w-full" 
                    onClick={() => handleDownload(selectedSurat)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Unduh Surat Pencairan
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">Dokumen surat pencairan belum tersedia</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Daftar Surat Pencairan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : suratList.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Surat Pencairan
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Surat pencairan dana akan muncul di sini setelah proposal tim Anda disetujui
                dan admin membuat surat pencairan.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Judul Proposal</TableHead>
                  <TableHead>Ketua Peneliti</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah Dana</TableHead>
                  <TableHead>Status Dokumen</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suratList.map((surat) => (
                  <TableRow key={surat.id}>
                    <TableCell className="font-medium">{surat.nomor_surat}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate font-medium">{surat.proposal.judul}</p>
                        <p className="text-sm text-gray-500">
                          {surat.proposal.hibah?.nama_hibah || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{surat.proposal.ketua?.[0]?.nama || '-'}</TableCell>
                    <TableCell>
                      {new Date(surat.tanggal_surat).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(surat.jumlah_dana)}
                    </TableCell>
                    <TableCell>
                      {surat.dokumen_url ? (
                        <Badge className="bg-green-100 text-green-700">
                          Tersedia
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          Belum Tersedia
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Lihat Detail"
                          onClick={() => handleViewDetail(surat)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {surat.dokumen_url && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Unduh Dokumen"
                            onClick={() => handleDownload(surat)}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
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
