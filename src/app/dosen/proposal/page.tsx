'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Plus, Eye, Edit, Trash2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMyProposals, deleteProposal, submitProposal } from '@/lib/actions/proposal';
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

export default function DosenProposalPage() {
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<ProposalWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    const { data, error } = await getMyProposals();
    if (data) {
      setProposals(data);
    }
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedProposal) return;
    
    const { error } = await deleteProposal(selectedProposal.id);
    if (error) {
      setError(error);
    } else {
      setIsDeleteDialogOpen(false);
      setSelectedProposal(null);
      loadProposals();
    }
  };

  const handleSubmit = async () => {
    if (!selectedProposal) return;
    
    const { error } = await submitProposal(selectedProposal.id);
    if (error) {
      setError(error);
    } else {
      setIsSubmitDialogOpen(false);
      setSelectedProposal(null);
      loadProposals();
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposal Saya</h1>
          <p className="text-gray-600 mt-1">Kelola proposal penelitian dan pengabdian Anda</p>
        </div>
        <Link href="/dosen/proposal/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Proposal Baru
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Proposal</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus proposal "{selectedProposal?.judul}"? 
              Tindakan ini tidak dapat dibatalkan.
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

      {/* Submit Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Proposal</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengajukan proposal "{selectedProposal?.judul}"? 
              Setelah diajukan, proposal tidak dapat diedit kecuali diminta revisi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              Ya, Ajukan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proposals Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Anda belum memiliki proposal.</p>
              <Link href="/dosen/proposal/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Proposal Pertama Anda
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Proposal</TableHead>
                  <TableHead>Program Hibah</TableHead>
                  <TableHead>Anggaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
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
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(proposal.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dosen/proposal/${proposal.id}`}>
                          <Button variant="ghost" size="icon" title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(proposal.status_proposal === 'draft' || proposal.status_proposal === 'revision') && (
                          <>
                            <Link href={`/dosen/proposal/${proposal.id}/edit`}>
                              <Button variant="ghost" size="icon" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Ajukan"
                              onClick={() => { setSelectedProposal(proposal); setIsSubmitDialogOpen(true); }}
                            >
                              <Send className="h-4 w-4 text-blue-600" />
                            </Button>
                          </>
                        )}
                        {proposal.status_proposal === 'draft' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Hapus"
                            onClick={() => { setSelectedProposal(proposal); setIsDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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
