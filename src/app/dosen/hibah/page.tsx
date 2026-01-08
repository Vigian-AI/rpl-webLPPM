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
import { Gift, Calendar, DollarSign, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { getActiveHibah } from '@/lib/actions/hibah';
import type { MasterHibah } from '@/types/database.types';

export default function DosenHibahPage() {
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
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Cara Mendaftar Hibah</h3>
              <ol className="mt-2 space-y-1 text-sm text-blue-800">
                <li>1. Buat tim penelitian terlebih dahulu di menu "Tim Penelitian"</li>
                <li>2. Klik tombol "Ajukan Proposal" pada hibah yang ingin didaftar</li>
                <li>3. Isi formulir proposal dengan lengkap</li>
                <li>4. Submit proposal untuk direview</li>
              </ol>
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
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{hibah.nama_hibah}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-blue-100">
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

                    <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Periode Pendaftaran</span>
                      </div>
                      <div className="text-sm text-blue-800">
                        <div>{formatDate(hibah.tanggal_buka)}</div>
                        <div className="flex items-center gap-2">
                          <span>sampai</span>
                        </div>
                        <div>{formatDate(hibah.tanggal_tutup)}</div>
                      </div>
                    </div>

                    {isOpen(hibah) && (
                      <Link href="/dosen/proposal/new">
                        <Button className="w-full" size="lg">
                          <FileText className="h-4 w-4 mr-2" />
                          Ajukan Proposal
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
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
