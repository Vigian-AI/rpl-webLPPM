'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Save, Send, Users, AlertCircle, Info, Upload, FileText, X, Plus } from 'lucide-react';
import { getActiveHibah } from '@/lib/actions/hibah';
import { createProposal, submitProposal, uploadProposalDocument } from '@/lib/actions/proposal';
import { getTeamsForProposal } from '@/lib/actions/team';
import type { MasterHibah, ProposalInput } from '@/types/database.types';
import Link from 'next/link';

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

export default function NewProposalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('team');
  const [hibahList, setHibahList] = useState<MasterHibah[]>([]);
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProposalInput>({
    hibah_id: '',
    tim_id: '',
    judul: '',
    abstrak: '',
    latar_belakang: '',
    tujuan: '',
    metodologi: '',
    luaran: '',
    anggaran_diajukan: 0,
    link_drive: '',
  });

  useEffect(() => {
    loadHibah();
    loadTeams();
  }, []);

  const loadHibah = async () => {
    const { data } = await getActiveHibah();
    if (data) {
      setHibahList(data);
    }
  };

  const loadTeams = async () => {
    const { data } = await getTeamsForProposal();
    if (data) {
      setTeamList(data);
    }
  };

  const handleChange = (field: keyof ProposalInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await createProposal(formData);
      if (error) throw new Error(error);
      
      // Upload PDF if selected
      if (data && pdfFile) {
        const { error: uploadError } = await uploadProposalDocument(data.id, pdfFile);
        if (uploadError) {
          console.error('Upload error:', uploadError);
        }
      }
      
      router.push(`/dosen/proposal/${data?.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate PDF is uploaded
    if (!pdfFile) {
      setError('Dokumen proposal PDF wajib diupload sebelum mengajukan');
      setActiveTab('content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await createProposal(formData);
      if (error) throw new Error(error);
      
      if (data) {
        // Upload PDF
        const { error: uploadError } = await uploadProposalDocument(data.id, pdfFile);
        if (uploadError) {
          throw new Error(`Gagal upload dokumen: ${uploadError}`);
        }

        const { error: submitError } = await submitProposal(data.id);
        if (submitError) throw new Error(submitError);
      }
      
      router.push('/dosen/proposal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['team', 'basic', 'content', 'budget'];
  const currentIndex = tabs.indexOf(activeTab);
  
  const goNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };
  
  const goPrev = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const selectedHibah = hibahList.find(h => h.id === formData.hibah_id);
  const selectedTeam = teamList.find(t => t.id === formData.tim_id);
  const maxBudget = selectedHibah?.anggaran_per_proposal || 0;
  const isTeamSelected = !!formData.tim_id;

  const getMemberName = (member: TeamMember) => {
    return member.user.dosen?.[0]?.nama || member.user.mahasiswa?.[0]?.nama || member.user.username;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dosen/proposal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Proposal Baru</h1>
          <p className="text-gray-600 mt-1">Lengkapi formulir berikut untuk mengajukan proposal</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="team">1. Tim Penelitian</TabsTrigger>
              <TabsTrigger value="basic">2. Informasi Dasar</TabsTrigger>
              <TabsTrigger value="content">3. Konten Proposal</TabsTrigger>
              <TabsTrigger value="budget">4. Anggaran & Review</TabsTrigger>
            </TabsList>

            {/* Step 1: Team */}
            <TabsContent value="team" className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Pilih Tim Penelitian</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Pilih tim yang akan mengerjakan proposal ini. Tim harus dibuat terlebih dahulu di menu Tim Penelitian.
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tim Penelitian
                  </CardTitle>
                  <CardDescription>
                    Pilih tim yang akan mengerjakan proposal ini
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamList.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tim_id">Pilih Tim *</Label>
                        <Select 
                          value={formData.tim_id} 
                          onValueChange={(value) => handleChange('tim_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tim penelitian" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamList.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.nama_tim} ({team.anggota_tim.filter(m => m.status === 'accepted').length} anggota)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Show selected team members */}
                      {selectedTeam && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-medium text-gray-900 mb-3">Anggota Tim: {selectedTeam.nama_tim}</h4>
                          {selectedTeam.deskripsi && (
                            <p className="text-sm text-gray-500 mb-3">{selectedTeam.deskripsi}</p>
                          )}
                          <div className="space-y-2">
                            {selectedTeam.anggota_tim
                              .filter(m => m.status === 'accepted')
                              .map((member) => (
                                <div 
                                  key={member.id} 
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    member.peran === 'Ketua' 
                                      ? 'bg-green-50 border border-green-200' 
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      member.peran === 'Ketua' ? 'bg-green-600' : 'bg-gray-400'
                                    }`}>
                                      <span className="text-white font-medium">
                                        {getMemberName(member).charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{getMemberName(member)}</p>
                                      <p className="text-sm text-gray-500">@{member.user.username}</p>
                                    </div>
                                  </div>
                                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                                    member.peran === 'Ketua' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {member.peran}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900">Belum Ada Tim</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-4">
                        Anda belum memiliki tim penelitian. Silakan buat tim terlebih dahulu.
                      </p>
                      <Link href="/dosen/tim">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Buat Tim
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={goNext} disabled={!isTeamSelected}>
                  Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            {/* Step 2: Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hibah_id">Program Hibah *</Label>
                <Select 
                  value={formData.hibah_id} 
                  onValueChange={(value) => handleChange('hibah_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih program hibah" />
                  </SelectTrigger>
                  <SelectContent>
                    {hibahList.map((hibah) => (
                      <SelectItem key={hibah.id} value={hibah.id}>
                        {hibah.nama_hibah} - {hibah.jenis}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedHibah && (
                  <div className="p-4 bg-blue-50 rounded-lg mt-2">
                    <p className="text-sm text-blue-800">
                      <strong>Periode:</strong>{' '}
                      {new Date(selectedHibah.tanggal_buka).toLocaleDateString('id-ID')} -{' '}
                      {new Date(selectedHibah.tanggal_tutup).toLocaleDateString('id-ID')}
                    </p>
                    {selectedHibah.anggaran_per_proposal && (
                      <p className="text-sm text-blue-800">
                        <strong>Maksimal Anggaran:</strong>{' '}
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedHibah.anggaran_per_proposal)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="judul">Judul Proposal *</Label>
                <Input
                  id="judul"
                  value={formData.judul}
                  onChange={(e) => handleChange('judul', e.target.value)}
                  placeholder="Masukkan judul proposal yang jelas dan spesifik"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstrak">Abstrak</Label>
                <Textarea
                  id="abstrak"
                  value={formData.abstrak || ''}
                  onChange={(e) => handleChange('abstrak', e.target.value)}
                  placeholder="Ringkasan singkat tentang penelitian/pengabdian yang akan dilakukan (maks. 300 kata)"
                  rows={5}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goPrev}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
                <Button onClick={goNext}>
                  Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            {/* Step 3: Content */}
            <TabsContent value="content" className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Dokumen Proposal</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Anda dapat mengunggah dokumen proposal dalam format PDF dan/atau memberikan link Google Drive untuk dokumen pendukung.
                    </p>
                  </div>
                </div>
              </div>

              {/* Link Drive */}
              <div className="space-y-2">
                <Label htmlFor="link_drive">Link Google Drive (Opsional)</Label>
                <Input
                  id="link_drive"
                  type="url"
                  value={formData.link_drive || ''}
                  onChange={(e) => handleChange('link_drive', e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
                <p className="text-xs text-gray-500">
                  Masukkan link Google Drive jika ada dokumen pendukung tambahan (pastikan akses link sudah dibuka untuk publik atau &quot;Anyone with link&quot;)
                </p>
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label htmlFor="pdf_file">Upload Dokumen Proposal (PDF) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {pdfFile ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{pdfFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPdfFile(null)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="pdf_file" className="cursor-pointer">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="text-blue-600 font-medium">Klik untuk upload</span> atau drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF (Maksimal 10MB)</p>
                      <input
                        id="pdf_file"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              setError('Ukuran file maksimal 10MB');
                              return;
                            }
                            if (file.type !== 'application/pdf') {
                              setError('Hanya file PDF yang diperbolehkan');
                              return;
                            }
                            setPdfFile(file);
                            setError('');
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload dokumen proposal lengkap dalam format PDF. Dokumen ini wajib diupload.
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goPrev}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
                <Button onClick={goNext}>
                  Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            {/* Step 4: Budget & Review */}
            <TabsContent value="budget" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="anggaran_diajukan">Anggaran yang Diajukan (Rp) *</Label>
                <Input
                  id="anggaran_diajukan"
                  type="number"
                  value={formData.anggaran_diajukan || ''}
                  onChange={(e) => handleChange('anggaran_diajukan', parseInt(e.target.value) || 0)}
                  placeholder="Masukkan jumlah anggaran"
                />
                {maxBudget > 0 && formData.anggaran_diajukan && formData.anggaran_diajukan > maxBudget && (
                  <p className="text-sm text-red-600">
                    Anggaran melebihi batas maksimal ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(maxBudget)})
                  </p>
                )}
              </div>

              {/* Review Summary */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan Proposal</CardTitle>
                  <CardDescription>Periksa kembali sebelum menyimpan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Program Hibah</p>
                      <p className="font-medium">{selectedHibah?.nama_hibah || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Anggaran Diajukan</p>
                      <p className="font-medium">
                        {formData.anggaran_diajukan 
                          ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.anggaran_diajukan)
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Judul</p>
                    <p className="font-medium">{formData.judul || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Abstrak</p>
                    <p className="text-sm">{formData.abstrak || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goPrev}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Draft
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading || !formData.hibah_id || !formData.judul}>
                    <Send className="h-4 w-4 mr-2" />
                    Ajukan Proposal
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
