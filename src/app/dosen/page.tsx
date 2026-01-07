'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Clock,
  CheckCircle,
  Wallet,
  Plus,
  ArrowRight,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { getMyProposals } from '@/lib/actions/proposal';
import { getMyLeadTeams } from '@/lib/actions/team';
import type { StatusProposal } from '@/types/database.types';

interface TeamMember {
  id: string;
  peran: string;
  status: string;
  user: {
    id: string;
    username: string;
    dosen: { nama: string }[] | null;
    mahasiswa: { nama: string }[] | null;
  };
}

interface Team {
  id: string;
  nama_tim: string;
  deskripsi: string | null;
  anggota_tim: TeamMember[];
}

interface ProposalData {
  id: string;
  judul: string;
  status_proposal: StatusProposal;
  anggaran_disetujui: number | null;
  tim?: {
    nama_tim: string;
  };
  hibah?: {
    nama_hibah: string;
  };
}

const statusConfig: Record<StatusProposal, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Diajukan', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Direview', color: 'bg-yellow-100 text-yellow-700' },
  revision: { label: 'Revisi', color: 'bg-orange-100 text-orange-700' },
  accepted: { label: 'Diterima', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Selesai', color: 'bg-purple-100 text-purple-700' },
};

export default function DosenDashboard() {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [proposalsResult, teamsResult] = await Promise.all([
      getMyProposals(),
      getMyLeadTeams()
    ]);
    
    if (proposalsResult.data) {
      setProposals(proposalsResult.data as ProposalData[]);
    }
    if (teamsResult.data) {
      setTeams(teamsResult.data as Team[]);
    }
    setLoading(false);
  };

  const acceptedProposals = proposals.filter(p => p.status_proposal === 'accepted' || p.status_proposal === 'completed');
  const pendingProposals = proposals.filter(p => ['submitted', 'review'].includes(p.status_proposal));
  const totalFunding = proposals
    .filter(p => p.anggaran_disetujui)
    .reduce((sum, p) => sum + (p.anggaran_disetujui || 0), 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}M`;
    } else if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getMemberName = (member: TeamMember) => {
    return member.user.dosen?.[0]?.nama || member.user.mahasiswa?.[0]?.nama || member.user.username;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Dosen</h1>
        <p className="text-gray-600 mt-1">Selamat datang di portal penelitian dan pengabdian</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposal</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : proposals.length}</div>
            <p className="text-xs text-muted-foreground">Proposal saya</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposal Diterima</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : acceptedProposals.length}</div>
            <p className="text-xs text-muted-foreground">
              {acceptedProposals.length === 0 ? 'Belum ada proposal diterima' : 'Proposal berhasil'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : pendingProposals.length}</div>
            <p className="text-xs text-muted-foreground">Dalam proses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendanaan</CardTitle>
            <Wallet className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : formatCurrency(totalFunding)}</div>
            <p className="text-xs text-muted-foreground">Dana yang diterima</p>
          </CardContent>
        </Card>
      </div>

      {/* Panduan Pengajuan Proposal */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileText className="h-5 w-5" />
            Cara Mengajukan Proposal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Buat Tim Penelitian</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Bentuk tim dengan mengundang dosen atau mahasiswa sebagai anggota
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-blue-400" />
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Ajukan Proposal</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Isi formulir proposal dan pilih tim yang sudah dibuat
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Link href="/dosen/tim">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Users className="h-4 w-4 mr-2" />
                Mulai Buat Tim
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tim Saya */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Tim Saya ({teams.length})
          </CardTitle>
          <Link href="/dosen/tim">
            <Button variant="ghost" size="sm">
              Lihat Semua
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500 mb-4">
                Anda belum memiliki tim penelitian
              </p>
              <Link href="/dosen/tim">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Tim Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.slice(0, 3).map((team) => (
                <div 
                  key={team.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{team.nama_tim}</p>
                      <p className="text-sm text-gray-500">
                        {team.anggota_tim.filter(m => m.status === 'accepted').length} anggota aktif
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {team.anggota_tim.length} total
                  </Badge>
                </div>
              ))}
              {teams.length > 3 && (
                <p className="text-sm text-center text-gray-500">
                  +{teams.length - 3} tim lainnya
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposal Terbaru */}
      {proposals.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Proposal Terbaru
            </CardTitle>
            <Link href="/dosen/proposal">
              <Button variant="ghost" size="sm">
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proposals.slice(0, 3).map((proposal) => (
                <div 
                  key={proposal.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{proposal.judul}</p>
                    <p className="text-sm text-gray-500">
                      {proposal.tim?.nama_tim || 'Tim'} • {proposal.hibah?.nama_hibah || 'Hibah'}
                    </p>
                  </div>
                  <Badge className={statusConfig[proposal.status_proposal].color}>
                    {statusConfig[proposal.status_proposal].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link href="/dosen/tim">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                <span>Kelola Tim</span>
              </Button>
            </Link>
            <Link href="/dosen/proposal/new">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Plus className="h-6 w-6 text-blue-600" />
                <span>Ajukan Proposal</span>
              </Button>
            </Link>
            <Link href="/dosen/proposal">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-yellow-600" />
                <span>Lihat Proposal</span>
              </Button>
            </Link>
            <Link href="/dosen/pencairan">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Wallet className="h-6 w-6 text-emerald-600" />
                <span>Pencairan Dana</span>
              </Button>
            </Link>
            <Link href="/dosen/profil">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <User className="h-6 w-6 text-purple-600" />
                <span>Edit Profil</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
