'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Calendar, DollarSign, FileText, CheckCircle, Info } from 'lucide-react';
import { getActiveHibah } from '@/lib/actions/hibah';
import type { MasterHibah } from '@/types/database.types';

export default function MahasiswaHibahPage() {
  const [hibahList, setHibahList] = useState<MasterHibah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHibah();
  }, []);

  const loadHibah = async () => {
    setLoading(true);
    const { data } = await getActiveHibah();
    if (data) {
      setHibahList(data);
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

  const isOpen = (hibah: MasterHibah) => {
    const today = new Date();
    const buka = new Date(hibah.tanggal_buka);
    const tutup = new Date(hibah.tanggal_tutup);
    return today >= buka && today <= tutup;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Program Hibah</h1>
        <p className="text-gray-600 mt-1">
          Lihat program hibah penelitian dan pengabdian yang sedang aktif
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Info className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Informasi untuk Mahasiswa</h3>
              <p className="mt-2 text-sm text-green-800">
                Sebagai mahasiswa, Anda dapat bergabung sebagai <strong>Asisten Peneliti</strong> dalam 
                tim yang dibentuk oleh dosen. Untuk berpartisipasi dalam hibah, terima undangan dari 
                dosen yang membentuk tim penelitian.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hibah List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : hibahList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak Ada Hibah Aktif
              </h3>
              <p className="text-gray-500">
                Saat ini belum ada program hibah yang sedang dibuka. Silakan cek kembali nanti.
              </p>
            </CardContent>
          </Card>
        ) : (
          hibahList.map((hibah) => (
            <Card key={hibah.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{hibah.nama_hibah}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-green-100">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {hibah.jenis}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Tahun {hibah.tahun_anggaran}
                      </span>
                    </div>
                  </div>
                  {isOpen(hibah) ? (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pendaftaran Dibuka
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-white">
                      Akan Dibuka
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Deskripsi</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {hibah.deskripsi || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                    {hibah.persyaratan && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Persyaratan</h4>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                          {hibah.persyaratan}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Anggaran</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(hibah.anggaran_total)}
                        </span>
                      </div>
                      {hibah.anggaran_per_proposal && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Per Proposal</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(hibah.anggaran_per_proposal)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900">Periode Pendaftaran</span>
                      </div>
                      <div className="text-sm text-green-800">
                        <div>{formatDate(hibah.tanggal_buka)}</div>
                        <div className="flex items-center gap-2">
                          <span>sampai</span>
                        </div>
                        <div>{formatDate(hibah.tanggal_tutup)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
