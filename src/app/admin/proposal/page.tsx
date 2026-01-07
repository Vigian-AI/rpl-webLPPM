'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, CheckCircle, XCircle, Edit, Clock } from 'lucide-react';
import { getProposalList, reviewProposal } from '@/lib/actions/proposal';
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

export default function ProposalReviewPage() {
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('submitted');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalWithRelations | null>(null);
  const [reviewData, setReviewData] = useState({
    status: 'review' as StatusProposal,
    catatan: '',
    anggaranDisetujui: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadProposals();
  }, [activeTab]);

  const loadProposals = async () => {
    setLoading(true);
    const status = activeTab === 'all' ? undefined : activeTab as StatusProposal;
    const { data, error } = await getProposalList(status);
    if (data) {
      setProposals(data);
    }
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const handleOpenReview = (proposal: ProposalWithRelations) => {
    setSelectedProposal(proposal);
    setReviewData({
      status: proposal.status_proposal === 'submitted' ? 'review' : proposal.status_proposal,
      catatan: proposal.catatan_evaluasi || '',
      anggaranDisetujui: proposal.anggaran_disetujui || proposal.anggaran_diajukan || 0,
    });
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedProposal) return;
    
    setError('');
    const { error } = await reviewProposal(
      selectedProposal.id,
      reviewData.status as 'review' | 'revision' | 'accepted' | 'rejected',
      reviewData.catatan,
      reviewData.anggaranDisetujui
    );

    if (error) {
      setError(error);
    } else {
      setIsReviewDialogOpen(false);
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

  const getKetuaNama = (proposal: ProposalWithRelations) => {
    const ketua = proposal.ketua as { nama?: string } | undefined;
    return ketua?.nama || 'N/A';
  };

  const getHibahNama = (proposal: ProposalWithRelations) => {
    const hibah = proposal.hibah as { nama_hibah?: string } | undefined;
    return hibah?.nama_hibah || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Proposal</h1>
        <p className="text-gray-600 mt-1">Kelola dan review proposal yang diajukan</p>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Proposal</DialogTitle>
            <DialogDescription>
              {selectedProposal?.judul}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Ketua Peneliti</Label>
                <p className="font-medium">{selectedProposal && getKetuaNama(selectedProposal)}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Program Hibah</Label>
                <p className="font-medium">{selectedProposal && getHibahNama(selectedProposal)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Anggaran Diajukan</Label>
                <p className="font-medium">{formatCurrency(selectedProposal?.anggaran_diajukan || null)}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Tanggal Submit</Label>
                <p className="font-medium">
                  {selectedProposal?.tanggal_submit 
                    ? new Date(selectedProposal.tanggal_submit).toLocaleDateString('id-ID')
                    : '-'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status Keputusan *</Label>
              <Select 
                value={reviewData.status} 
                onValueChange={(value) => setReviewData({ ...reviewData, status: value as StatusProposal })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">Dalam Review</SelectItem>
                  <SelectItem value="revision">Perlu Revisi</SelectItem>
                  <SelectItem value="accepted">Diterima</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reviewData.status === 'accepted' && (
              <div className="space-y-2">
                <Label htmlFor="anggaran">Anggaran Disetujui (Rp)</Label>
                <Input
                  id="anggaran"
                  type="number"
                  value={reviewData.anggaranDisetujui}
                  onChange={(e) => setReviewData({ ...reviewData, anggaranDisetujui: parseInt(e.target.value) })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan Evaluasi</Label>
              <Textarea
                id="catatan"
                value={reviewData.catatan}
                onChange={(e) => setReviewData({ ...reviewData, catatan: e.target.value })}
                placeholder="Berikan catatan atau feedback untuk proposal ini..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmitReview}>
              Simpan Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="submitted">Diajukan</TabsTrigger>
          <TabsTrigger value="review">Direview</TabsTrigger>
          <TabsTrigger value="revision">Revisi</TabsTrigger>
          <TabsTrigger value="accepted">Diterima</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Memuat data...</div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada proposal dengan status ini.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Proposal</TableHead>
                      <TableHead>Ketua</TableHead>
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
                        <TableCell>{getKetuaNama(proposal)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{getHibahNama(proposal)}</span>
                        </TableCell>
                        <TableCell>{formatCurrency(proposal.anggaran_diajukan)}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig[proposal.status_proposal].color}>
                            {statusConfig[proposal.status_proposal].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {proposal.tanggal_submit
                              ? new Date(proposal.tanggal_submit).toLocaleDateString('id-ID')
                              : new Date(proposal.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/proposal/${proposal.id}`}>
                              <Button variant="ghost" size="icon" title="Lihat Detail">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenReview(proposal)}
                              title="Review"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
