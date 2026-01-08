'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText,
  CheckCircle,
  Mail,
  Clock,
  ArrowRight,
  User,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { getMyTeams, getMyInvitations } from '@/lib/actions/team';

interface TeamMembership {
  id: string;
  peran: string;
  status: string;
  tim: {
    id: string;
    nama_tim: string;
    deskripsi: string | null;
    ketua: { nama: string; email_institusi: string | null };
  };
}

interface Invitation {
  id: string;
  peran: string;
  tim: {
    id: string;
    nama_tim: string;
    ketua: { nama: string };
  };
}

export default function MahasiswaDashboard() {
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [teamsResult, invitationsResult] = await Promise.all([
      getMyTeams(),
      getMyInvitations()
    ]);
    
    if (teamsResult.data) {
      setTeams(teamsResult.data as TeamMembership[]);
    }
    if (invitationsResult.data) {
      setInvitations(invitationsResult.data as Invitation[]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#03045E]">Dashboard Mahasiswa</h1>
        <p className="text-gray-600 mt-1">Selamat datang di portal penelitian dan pengabdian</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-[#03045E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tim Aktif</CardTitle>
            <div className="p-2 bg-[#03045E] rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#03045E]">{loading ? '-' : teams.length}</div>
            <p className="text-xs text-muted-foreground">Tim yang diikuti</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#F59E0B]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Undangan Pending</CardTitle>
            <div className="p-2 bg-[#F59E0B] rounded-lg">
              <Mail className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#03045E]">{loading ? '-' : invitations.length}</div>
            <p className="text-xs text-muted-foreground">Menunggu respon</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#03045E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Proyek Selesai</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#03045E]">0</div>
            <p className="text-xs text-muted-foreground">Total kontribusi</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="border-[#F59E0B] bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#03045E]">
              <Mail className="h-5 w-5" />
              Undangan Tim ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.slice(0, 3).map((invitation) => (
                <div 
                  key={invitation.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#F59E0B]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F59E0B] flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#03045E]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#03045E]">{invitation.tim.nama_tim}</p>
                      <p className="text-sm text-gray-500">
                        Dari: {invitation.tim.ketua?.nama} • Peran: {invitation.peran}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-[#F59E0B] text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    Menunggu
                  </Badge>
                </div>
              ))}
              {invitations.length > 3 && (
                <p className="text-sm text-center text-gray-500">
                  +{invitations.length - 3} undangan lainnya
                </p>
              )}
            </div>
            <Link href="/mahasiswa/undangan">
              <Button className="w-full mt-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#03045E] font-semibold">
                Lihat Semua Undangan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* My Teams */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#03045E]">
            <Users className="h-5 w-5 text-[#03045E]" />
            Tim Saya
          </CardTitle>
          <Link href="/mahasiswa/tim">
            <Button variant="ghost" size="sm" className="text-[#F59E0B] hover:text-[#D97706]">
              Lihat Semua
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#03045E]"></div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Anda belum bergabung dengan tim manapun</p>
              <Link href="/mahasiswa/undangan">
                <Button variant="outline" size="sm" className="mt-3 border-[#03045E] text-[#03045E] hover:bg-[#03045E] hover:text-white">
                  Lihat Undangan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.slice(0, 3).map((team) => (
                <div 
                  key={team.id} 
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-[#03045E]/10 hover:border-[#F59E0B] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F59E0B] flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#03045E]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#03045E]">{team.tim.nama_tim}</p>
                      <p className="text-sm text-gray-500">
                        Ketua: {team.tim.ketua?.nama} • {team.peran}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aktif
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link href="/mahasiswa/undangan">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Mail className="h-6 w-6 text-yellow-600" />
                <span>Undangan</span>
              </Button>
            </Link>
            <Link href="/mahasiswa/tim">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                <span>Tim Saya</span>
              </Button>
            </Link>
            <Link href="/mahasiswa/proposal">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span>Proposal Tim</span>
              </Button>
            </Link>
            <Link href="/mahasiswa/pencairan">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Wallet className="h-6 w-6 text-emerald-600" />
                <span>Pencairan Dana</span>
              </Button>
            </Link>
            <Link href="/mahasiswa/profil">
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
