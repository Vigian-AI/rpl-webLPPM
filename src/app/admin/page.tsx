'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Gift, 
  Wallet,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  getAdminStats,
  getRecentProposals,
  getActiveHibahWithStats,
  type AdminStats,
  type RecentProposal,
  type ActiveHibahInfo,
} from '@/lib/actions/admin';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
    case 'submitted':
      return <Badge className="bg-blue-100 text-blue-700">Diajukan</Badge>;
    case 'review':
      return <Badge className="bg-yellow-100 text-yellow-700">Direview</Badge>;
    case 'revision':
      return <Badge className="bg-orange-100 text-orange-700">Revisi</Badge>;
    case 'accepted':
      return <Badge className="bg-green-100 text-green-700">Diterima</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700">Ditolak</Badge>;
    case 'completed':
      return <Badge className="bg-purple-100 text-purple-700">Selesai</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalProposals: 0,
    pendingReview: 0,
    acceptedProposals: 0,
    rejectedProposals: 0,
    activeHibah: 0,
    totalDisbursed: 0,
  });
  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([]);
  const [activeHibah, setActiveHibah] = useState<ActiveHibahInfo[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsResult, proposalsResult, hibahResult] = await Promise.all([
          getAdminStats(),
          getRecentProposals(5),
          getActiveHibahWithStats(),
        ]);

        if (statsResult.data) {
          setStats(statsResult.data);
        }
        if (proposalsResult.data) {
          setRecentProposals(proposalsResult.data);
        }
        if (hibahResult.data) {
          setActiveHibah(hibahResult.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#03045E]" />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#03045E]">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Selamat datang di panel administrasi LPPM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-[#03045E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Proposal</CardTitle>
            <div className="p-2 bg-[#03045E] rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#03045E]">{stats.totalProposals}</div>
            <p className="text-xs text-muted-foreground">Semua proposal terdaftar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#F59E0B]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Menunggu Review</CardTitle>
            <div className="p-2 bg-[#F59E0B] rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#03045E]">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">Perlu ditindaklanjuti</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#03045E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Proposal Diterima</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#03045E]">{stats.acceptedProposals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProposals > 0 
                ? `${Math.round((stats.acceptedProposals / stats.totalProposals) * 100)}% tingkat penerimaan`
                : 'Belum ada proposal'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#F59E0B]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dana Tersalurkan</CardTitle>
            <div className="p-2 bg-[#03045E] rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#03045E]">
              Rp {(stats.totalDisbursed / 1000000).toFixed(0)}Jt
            </div>
            <p className="text-xs text-muted-foreground">Total pencairan tahun ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Proposals */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-[#03045E]">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/hibah/new">
              <Button className="w-full justify-start bg-[#03045E] hover:bg-[#020338] text-white">
                <Gift className="mr-2 h-4 w-4" />
                Buat Program Hibah Baru
              </Button>
            </Link>
            <Link href="/admin/proposal">
              <Button className="w-full justify-start bg-[#F59E0B] hover:bg-[#D97706] text-[#03045E] font-semibold">
                <FileText className="mr-2 h-4 w-4" />
                Review Proposal
              </Button>
            </Link>
            <Link href="/admin/pencairan/new">
              <Button className="w-full justify-start border-[#03045E] text-[#03045E] hover:bg-[#03045E] hover:text-white" variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                Buat Surat Pencairan
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Proposals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#03045E]">Proposal Terbaru</CardTitle>
            <Link href="/admin/proposal">
              <Button variant="ghost" size="sm" className="text-[#F59E0B] hover:text-[#D97706]">
                Lihat Semua
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProposals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Belum ada proposal yang masuk</p>
                </div>
              ) : (
                recentProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-[#03045E]/10 hover:border-[#F59E0B] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#03045E] truncate">
                        {proposal.judul}
                      </p>
                      <p className="text-sm text-gray-500">{proposal.ketua}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">
                        {new Date(proposal.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Grants Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#03045E]">Program Hibah Aktif</CardTitle>
          <Link href="/admin/hibah">
            <Button variant="ghost" size="sm" className="text-[#F59E0B] hover:text-[#D97706]">
              Kelola Hibah
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {activeHibah.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Tidak ada program hibah yang sedang aktif</p>
              <Link href="/admin/hibah/new">
                <Button className="mt-4 bg-[#03045E] hover:bg-[#020338] text-white">
                  Buat Program Hibah Baru
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {activeHibah.map((hibah, index) => {
                const colors = [
                  { bg: 'bg-blue-50', border: 'border-[#03045E]', title: 'text-[#03045E]', text: 'text-[#03045E]', sub: 'text-gray-600' },
                  { bg: 'bg-yellow-50', border: 'border-[#F59E0B]', title: 'text-[#03045E]', text: 'text-[#F59E0B]', sub: 'text-gray-600' },
                  { bg: 'bg-blue-100', border: 'border-[#03045E]', title: 'text-[#03045E]', text: 'text-[#03045E]', sub: 'text-gray-600' },
                  { bg: 'bg-yellow-100', border: 'border-[#F59E0B]', title: 'text-[#03045E]', text: 'text-[#F59E0B]', sub: 'text-gray-600' },
                ];
                const color = colors[index % colors.length];
                return (
                  <div key={hibah.id} className={`p-4 ${color.bg} rounded-lg border ${color.border}`}>
                    <h4 className={`font-medium ${color.title} truncate`}>{hibah.nama}</h4>
                    <p className={`text-sm ${color.text} mt-1 font-semibold`}>{hibah.totalProposal} proposal diterima</p>
                    <p className={`text-xs ${color.sub} mt-2`}>
                      Berakhir: {new Date(hibah.tanggalTutup).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
