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
import { Eye, FileText, Users, ExternalLink } from 'lucide-react';
import { getMyProposalsAsAsisten } from '@/lib/actions/proposal';
import type { ProposalWithRelations, StatusProposal } from '@/types/database.types';

const statusConfig: Record<StatusProposal, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Diajukan', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Direview', color: 'bg-yellow-100 text-yellow-700' },
  revision: { label: 'Revisi', color: 'bg-orange-100 text-orange-700' },
  accepted: { label: 'Diterima', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Selesai', color: 'bg-purple-100 text-purple-700' },
};

export default function MahasiswaProposalPage() {
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    const { data, error } = await getMyProposalsAsAsisten();
    if (data) {
      setProposals(data);
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

  const getHibahNama = (proposal: ProposalWithRelations) => {
    const hibah = proposal.hibah as { nama_hibah?: string } | undefined;
    return hibah?.nama_hibah || 'N/A';
  };

  const getKetuaNama = (proposal: ProposalWithRelations) => {
    const ketua = proposal.ketua as { nama?: string } | undefined;
    return ketua?.nama || 'N/A';
  };

  const acceptedProposals = proposals.filter(p => p.status_proposal === 'accepted' || p.status_proposal === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proposal Tim</h1>
        <p className="text-gray-600 mt-1">Proposal penelitian dari tim yang Anda ikuti sebagai asisten peneliti</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposal</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : proposals.length}</div>
            <p className="text-xs text-muted-foreground">Proposal tim Anda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposal Diterima</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : acceptedProposals.length}</div>
            <p className="text-xs text-muted-foreground">Proposal berhasil</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Sebagai asisten peneliti, Anda dapat melihat dan mengunduh dokumen proposal tim.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Proposals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Daftar Proposal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Proposal</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Anda belum tergabung sebagai asisten peneliti di tim mana pun yang memiliki proposal.
                Terima undangan tim untuk melihat proposal.
              </p>
              <Link href="/mahasiswa/undangan" className="mt-4 inline-block">
                <Button variant="outline">
                  Lihat Undangan Tim
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Proposal</TableHead>
                  <TableHead>Ketua Peneliti</TableHead>
                  <TableHead>Program Hibah</TableHead>
                  <TableHead>Anggaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{proposal.judul}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getKetuaNama(proposal)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getHibahNama(proposal)}</span>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(proposal.anggaran_diajukan)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[proposal.status_proposal].color}>
                        {statusConfig[proposal.status_proposal].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/mahasiswa/proposal/${proposal.id}`}>
                          <Button variant="ghost" size="icon" title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {proposal.dokumen_proposal_url && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Unduh Dokumen"
                            onClick={() => window.open(proposal.dokumen_proposal_url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 text-blue-600" />
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
