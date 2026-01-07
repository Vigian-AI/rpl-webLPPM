'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Check, X, User } from 'lucide-react';
import { getMyInvitations, respondToInvitation } from '@/lib/actions/team';

interface Invitation {
  id: string;
  peran: string;
  status: string;
  invited_at: string;
  tim: {
    id: string;
    nama_tim: string;
    deskripsi: string | null;
    ketua: { nama: string; email_institusi: string | null } | null;
  };
}

export default function UndanganPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setLoading(true);
    const { data, error } = await getMyInvitations();
    if (data) {
      setInvitations(data);
    }
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!selectedInvitation) return;

    setError('');
    const { error } = await respondToInvitation(selectedInvitation.id, 'accepted');

    if (error) {
      setError(error);
    } else {
      setSuccess('Undangan berhasil diterima. Anda sekarang menjadi anggota tim.');
      setIsAcceptDialogOpen(false);
      setSelectedInvitation(null);
      loadInvitations();
    }
  };

  const handleReject = async () => {
    if (!selectedInvitation) return;

    setError('');
    const { error } = await respondToInvitation(selectedInvitation.id, 'rejected');

    if (error) {
      setError(error);
    } else {
      setSuccess('Undangan berhasil ditolak.');
      setIsRejectDialogOpen(false);
      setSelectedInvitation(null);
      loadInvitations();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Undangan Tim</h1>
        <p className="text-gray-600 mt-1">Kelola undangan bergabung tim penelitian</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}
      
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">{success}</div>
      )}

      {/* Accept Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terima Undangan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin bergabung dengan tim "{selectedInvitation?.tim?.nama_tim}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Ketua Tim:</strong> {selectedInvitation?.tim?.ketua?.nama || '-'}
              </p>
              <p className="text-sm">
                <strong>Peran Anda:</strong> {selectedInvitation?.peran}
              </p>
              <p className="text-sm">
                <strong>Deskripsi:</strong> {selectedInvitation?.tim?.deskripsi || '-'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Ya, Terima
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Undangan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menolak undangan untuk bergabung dengan tim "{selectedInvitation?.tim?.nama_tim}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <X className="h-4 w-4 mr-2" />
              Ya, Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitations List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat data...</div>
      ) : invitations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada undangan menunggu</p>
            <p className="text-sm text-gray-400 mt-1">
              Undangan dari dosen akan muncul di sini
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{invitation.tim?.nama_tim || 'Tim Penelitian'}</CardTitle>
                    <CardDescription>
                      {invitation.tim?.deskripsi || 'Tidak ada deskripsi'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Menunggu</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.tim?.ketua?.nama || 'Ketua Tim'}</p>
                      <p className="text-sm text-gray-500">Ketua Tim</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Peran yang ditawarkan:</span>
                    <Badge variant="outline">{invitation.peran}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tanggal undangan:</span>
                    <span>{new Date(invitation.invited_at).toLocaleDateString('id-ID')}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => { setSelectedInvitation(invitation); setIsAcceptDialogOpen(true); }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Terima
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setSelectedInvitation(invitation); setIsRejectDialogOpen(true); }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Tolak
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
