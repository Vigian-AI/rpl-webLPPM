'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  UserPlus, 
  Trash2,
  Archive,
  ArchiveRestore,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  createTeam, 
  getMyLeadTeams, 
  getArchivedTeams,
  inviteTeamMember, 
  removeTeamMember,
  archiveTeam 
} from '@/lib/actions/team';

interface TeamMember {
  id: string;
  peran: string;
  status: 'pending' | 'accepted' | 'rejected';
  user: {
    id: string;
    username: string;
    email: string;
    dosen: { nama: string }[] | null;
    mahasiswa: { nama: string }[] | null;
  };
}

interface Team {
  id: string;
  nama_tim: string;
  deskripsi: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  ketua: {
    nama: string;
    email_institusi: string;
  };
  anggota_tim: TeamMember[];
}

export default function TimDosenPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [archivedTeams, setArchivedTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({ nama_tim: '', deskripsi: '' });
  const [inviteData, setInviteData] = useState({ tim_id: '', username: '', peran: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setIsLoading(true);
    const [activeResult, archivedResult] = await Promise.all([
      getMyLeadTeams(),
      getArchivedTeams()
    ]);
    
    if (activeResult.data) {
      setTeams(activeResult.data as Team[]);
    }
    if (archivedResult.data) {
      setArchivedTeams(archivedResult.data as Team[]);
    }
    setIsLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!newTeam.nama_tim.trim()) {
      toast.error('Nama tim harus diisi');
      return;
    }

    setIsSubmitting(true);
    const result = await createTeam(newTeam);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Tim berhasil dibuat');
      setNewTeam({ nama_tim: '', deskripsi: '' });
      setIsCreateDialogOpen(false);
      loadTeams();
    }
    setIsSubmitting(false);
  };

  const handleInviteMember = async () => {
    if (!inviteData.tim_id || !inviteData.username || !inviteData.peran) {
      toast.error('Semua field harus diisi');
      return;
    }

    setIsSubmitting(true);
    const result = await inviteTeamMember(inviteData);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Undangan berhasil dikirim');
      setInviteData({ tim_id: '', username: '', peran: '' });
      setIsInviteDialogOpen(false);
      loadTeams();
    }
    setIsSubmitting(false);
  };

  const handleRemoveMember = async (memberId: string, timId: string) => {
    const result = await removeTeamMember(memberId, timId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Anggota berhasil dihapus');
      loadTeams();
    }
  };

  const handleArchiveTeam = async () => {
    if (!selectedTeam) return;

    setIsSubmitting(true);
    const result = await archiveTeam(selectedTeam.id, !selectedTeam.is_archived);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(selectedTeam.is_archived ? 'Tim berhasil dipulihkan' : 'Tim berhasil diarsipkan');
      setIsArchiveDialogOpen(false);
      setSelectedTeam(null);
      loadTeams();
    }
    setIsSubmitting(false);
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

  const getMemberName = (member: TeamMember) => {
    return member.user.dosen?.[0]?.nama || member.user.mahasiswa?.[0]?.nama || member.user.username;
  };

  const TeamCard = ({ team, isArchived = false }: { team: Team; isArchived?: boolean }) => (
    <Card className={isArchived ? 'opacity-75' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {team.nama_tim}
              {isArchived && <Badge variant="secondary"><Archive className="h-3 w-3 mr-1" /> Diarsipkan</Badge>}
            </CardTitle>
            <CardDescription>{team.deskripsi || 'Tidak ada deskripsi'}</CardDescription>
          </div>
          <div className="flex gap-2">
            {!isArchived && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setInviteData({ ...inviteData, tim_id: team.id });
                  setIsInviteDialogOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Undang
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedTeam(team);
                setIsArchiveDialogOpen(true);
              }}
            >
              {isArchived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 mr-1" />
                  Pulihkan
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-1" />
                  Arsipkan
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Badge variant="outline">{team.anggota_tim.length} anggota</Badge>
          </div>
          
          <div className="space-y-2">
            {team.anggota_tim.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {getMemberName(member).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getMemberName(member)}</p>
                    <p className="text-xs text-gray-500">@{member.user.username} • {member.peran}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(member.status)}
                  {member.peran !== 'Ketua' && !isArchived && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveMember(member.id, team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Tim</h1>
            <p className="text-gray-600">Kelola tim penelitian Anda</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Tim</h1>
          <p className="text-gray-600">Kelola tim penelitian Anda</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-900 hover:bg-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Buat Tim
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Tim Baru</DialogTitle>
              <DialogDescription>
                Buat tim penelitian baru untuk proposal Anda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nama_tim">Nama Tim</Label>
                <Input
                  id="nama_tim"
                  placeholder="Masukkan nama tim"
                  value={newTeam.nama_tim}
                  onChange={(e) => setNewTeam({ ...newTeam, nama_tim: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Masukkan deskripsi tim"
                  value={newTeam.deskripsi}
                  onChange={(e) => setNewTeam({ ...newTeam, deskripsi: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                className="bg-blue-900 hover:bg-blue-800"
                onClick={handleCreateTeam}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Buat Tim'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for Active and Archived Teams */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tim Aktif ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Diarsipkan ({archivedTeams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {teams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Tim</h3>
                <p className="text-gray-500 text-center mb-4">
                  Anda belum memiliki tim penelitian. Buat tim baru untuk memulai.
                </p>
                <Button 
                  className="bg-blue-900 hover:bg-blue-800"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Tim Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {archivedTeams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Tim Diarsipkan</h3>
                <p className="text-gray-500 text-center">
                  Tim yang sudah tidak aktif akan muncul di sini setelah diarsipkan.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {archivedTeams.map((team) => (
                <TeamCard key={team.id} team={team} isArchived />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undang Anggota Tim</DialogTitle>
            <DialogDescription>
              Undang dosen atau mahasiswa untuk bergabung dengan tim Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tim">Tim</Label>
              <Select 
                value={inviteData.tim_id} 
                onValueChange={(value) => setInviteData({ ...inviteData, tim_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tim" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.nama_tim}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Masukkan username pengguna"
                value={inviteData.username}
                onChange={(e) => setInviteData({ ...inviteData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peran">Peran</Label>
              <Select 
                value={inviteData.peran} 
                onValueChange={(value) => setInviteData({ ...inviteData, peran: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asisten Dosen">Asisten Dosen</SelectItem>
                  <SelectItem value="Anggota">Anggota</SelectItem>
                  <SelectItem value="Asisten Peneliti">Asisten Peneliti</SelectItem>
                  <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              className="bg-blue-900 hover:bg-blue-800"
              onClick={handleInviteMember}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Undangan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              {selectedTeam?.is_archived ? 'Pulihkan Tim' : 'Arsipkan Tim'}
            </DialogTitle>
            <DialogDescription>
              {selectedTeam?.is_archived 
                ? `Apakah Anda yakin ingin memulihkan tim "${selectedTeam?.nama_tim}"? Tim akan kembali muncul di daftar tim aktif.`
                : `Apakah Anda yakin ingin mengarsipkan tim "${selectedTeam?.nama_tim}"? Tim yang diarsipkan tidak akan muncul di daftar tim aktif dan tidak dapat digunakan untuk proposal baru.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              variant={selectedTeam?.is_archived ? 'default' : 'destructive'}
              onClick={handleArchiveTeam}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Memproses...' 
                : selectedTeam?.is_archived 
                  ? 'Pulihkan Tim' 
                  : 'Arsipkan Tim'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
