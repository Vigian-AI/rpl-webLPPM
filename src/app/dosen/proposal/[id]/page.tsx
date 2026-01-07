'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  ExternalLink
} from 'lucide-react';
import { getProposalById } from '@/lib/actions/proposal';
import type { StatusProposal } from '@/types/database.types';

interface TeamMember {
  id: string;
  peran: string;
  status: string;
  user: {
    id: string;
    username: string;
    email: string;
    dosen?: { nama: string }[];
    mahasiswa?: { nama: string }[];
  };
}

interface ProposalDetail {
  id: string;
  judul: string;
  abstrak: string | null;
  latar_belakang: string | null;
  tujuan: string | null;
  metodologi: string | null;
  luaran: string | null;
  anggaran_diajukan: number | null;
  anggaran_disetujui: number | null;
  dokumen_proposal_url: string | null;
  status_proposal: StatusProposal;
  catatan_evaluasi: string | null;
  tanggal_submit: string | null;
  tanggal_review: string | null;
  created_at: string;
  hibah?: {
    nama_hibah: string;
    jenis: string;
    tahun_anggaran: number;
  };
  ketua?: {
    nama: string;
    nidn: string;
    fakultas: string;
    prodi: string;
  };
  tim?: {
    id: string;
    nama_tim: string;
    deskripsi: string | null;
    anggota_tim: TeamMember[];
  };
}

const statusConfig: Record<StatusProposal, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  submitted: { label: 'Diajukan', color: 'bg-blue-100 text-blue-700', icon: Clock },
  review: { label: 'Direview', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  revision: { label: 'Revisi', color: 'bg-orange-100 text-orange-700', icon: Clock },
  accepted: { label: 'Diterima', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
  completed: { label: 'Selesai', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
};

export default function ProposalDetailPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProposal();
  }, [params.id]);

  const loadProposal = async () => {
    setLoading(true);
    const { data, error } = await getProposalById(params.id as string);
    if (data) {
      setProposal(data as ProposalDetail);
    }
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getMemberName = (member: TeamMember) => {
    return member.user.dosen?.[0]?.nama || member.user.mahasiswa?.[0]?.nama || member.user.username;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Bergabung</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" /> Menunggu</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" /> Ditolak</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dosen/proposal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Proposal</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dosen/proposal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Proposal</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || 'Proposal tidak ditemukan'}</p>
            <Link href="/dosen/proposal">
              <Button className="mt-4">Kembali ke Daftar Proposal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[proposal.status_proposal].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dosen/proposal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{proposal.judul}</h1>
            <p className="text-gray-600 mt-1">{proposal.hibah?.nama_hibah}</p>
          </div>
        </div>
        <Badge className={`${statusConfig[proposal.status_proposal].color} text-base px-4 py-2`}>
          <StatusIcon className="h-4 w-4 mr-2" />
          {statusConfig[proposal.status_proposal].label}
        </Badge>
      </div>

      {/* Catatan Evaluasi */}
      {proposal.catatan_evaluasi && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Catatan Evaluasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-900">{proposal.catatan_evaluasi}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Abstrak */}
          {proposal.abstrak && (
            <Card>
              <CardHeader>
                <CardTitle>Abstrak</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.abstrak}</p>
              </CardContent>
            </Card>
          )}

          {/* Latar Belakang */}
          {proposal.latar_belakang && (
            <Card>
              <CardHeader>
                <CardTitle>Latar Belakang</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.latar_belakang}</p>
              </CardContent>
            </Card>
          )}

          {/* Tujuan */}
          {proposal.tujuan && (
            <Card>
              <CardHeader>
                <CardTitle>Tujuan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.tujuan}</p>
              </CardContent>
            </Card>
          )}

          {/* Metodologi */}
          {proposal.metodologi && (
            <Card>
              <CardHeader>
                <CardTitle>Metodologi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.metodologi}</p>
              </CardContent>
            </Card>
          )}

          {/* Luaran */}
          {proposal.luaran && (
            <Card>
              <CardHeader>
                <CardTitle>Luaran yang Diharapkan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.luaran}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                  <p className="font-medium">{formatDate(proposal.created_at)}</p>
                </div>
              </div>
              
              {proposal.tanggal_submit && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Submit</p>
                    <p className="font-medium">{formatDate(proposal.tanggal_submit)}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Anggaran Diajukan</p>
                  <p className="font-medium">{formatCurrency(proposal.anggaran_diajukan)}</p>
                </div>
              </div>

              {proposal.anggaran_disetujui && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Anggaran Disetujui</p>
                    <p className="font-medium text-green-600">{formatCurrency(proposal.anggaran_disetujui)}</p>
                  </div>
                </div>
              )}

              {proposal.dokumen_proposal_url && (
                <>
                  <Separator />
                  <a 
                    href={proposal.dokumen_proposal_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-600">Dokumen Proposal</span>
                    <ExternalLink className="h-4 w-4 text-blue-600 ml-auto" />
                  </a>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tim Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tim Penelitian
              </CardTitle>
              {proposal.tim && (
                <CardDescription>{proposal.tim.nama_tim}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {proposal.tim?.anggota_tim && proposal.tim.anggota_tim.length > 0 ? (
                <div className="space-y-3">
                  {proposal.tim.anggota_tim
                    .filter(m => m.status === 'accepted')
                    .map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            member.peran === 'Ketua' ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            <User className={`h-5 w-5 ${
                              member.peran === 'Ketua' ? 'text-green-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{getMemberName(member)}</p>
                            <p className="text-sm text-gray-500">@{member.user.username}</p>
                          </div>
                        </div>
                        <Badge variant={member.peran === 'Ketua' ? 'default' : 'outline'}>
                          {member.peran}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Tidak ada anggota tim</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
