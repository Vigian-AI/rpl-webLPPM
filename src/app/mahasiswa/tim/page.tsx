'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  User, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  FileText, 
  Download,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { getMyTeams } from '@/lib/actions/team';
import type { StatusProposal } from '@/types/database.types';

interface Proposal {
  id: string;
  judul: string;
  status_proposal: StatusProposal;
  dokumen_proposal_url: string | null;
  anggaran_disetujui: number | null;
  hibah?: {
    nama_hibah: string;
  };
}

interface TeamMembership {
  id: string;
  peran: string;
  status: string;
  responded_at: string | null;
  tim: {
    id: string;
    nama_tim: string;
    deskripsi: string | null;
    ketua: { nama: string; email_institusi: string | null };
    proposal?: Proposal[];
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

export default function TimSayaPage() {
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    const { data, error } = await getMyTeams();
    if (data) {
      setTeams(data as TeamMembership[]);
    }
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tim Saya</h1>
        <p className="text-gray-600 mt-1">Daftar tim penelitian yang Anda ikuti</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Anda belum bergabung dengan tim manapun</p>
            <p className="text-sm text-gray-400 mt-1">
              Terima undangan dari dosen untuk bergabung dengan tim penelitian
            </p>
            <Link href="/mahasiswa/undangan">
              <Button variant="outline" className="mt-4">
                Lihat Undangan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {team.tim.nama_tim}
                    </CardTitle>
                    <CardDescription>
                      {team.tim.deskripsi || 'Tidak ada deskripsi'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Bergabung
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Ketua Tim */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{team.tim.ketua?.nama || 'Ketua Tim'}</p>
                      <p className="text-sm text-gray-500">Ketua Tim</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Peran Anda</p>
                      <Badge variant="outline">{team.peran}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Bergabung Sejak</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(team.responded_at)}
                      </p>
                    </div>
                  </div>

                  {/* Proposals Section */}
                  {team.tim.proposal && team.tim.proposal.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Proposal Penelitian ({team.tim.proposal.length})
                        </h4>
                        <div className="space-y-3">
                          {team.tim.proposal.map((proposal) => (
                            <div 
                              key={proposal.id}
                              className="p-4 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {proposal.judul}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {proposal.hibah?.nama_hibah || 'Program Hibah'}
                                  </p>
                                </div>
                                <Badge className={statusConfig[proposal.status_proposal].color}>
                                  {statusConfig[proposal.status_proposal].label}
                                </Badge>
                              </div>

                              {proposal.anggaran_disetujui && (
                                <p className="text-sm text-gray-600 mb-3">
                                  <span className="font-medium">Anggaran Disetujui:</span>{' '}
                                  {formatCurrency(proposal.anggaran_disetujui)}
                                </p>
                              )}

                              {/* Dokumen Proposal */}
                              {proposal.dokumen_proposal_url ? (
                                <a 
                                  href={proposal.dokumen_proposal_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                  <FileText className="h-5 w-5 text-blue-600" />
                                  <div className="flex-1">
                                    <p className="font-medium text-blue-700">Dokumen Proposal</p>
                                    <p className="text-xs text-blue-600">Klik untuk mengunduh/melihat</p>
                                  </div>
                                  <Download className="h-5 w-5 text-blue-600" />
                                </a>
                              ) : (
                                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-gray-500">
                                  <FolderOpen className="h-5 w-5" />
                                  <p className="text-sm">Dokumen belum diunggah</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* No Proposals */}
                  {(!team.tim.proposal || team.tim.proposal.length === 0) && (
                    <>
                      <Separator className="my-4" />
                      <div className="text-center py-4 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Belum ada proposal untuk tim ini</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
