'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, FolderOpen, Users } from 'lucide-react';
import { getMyTeams } from '@/lib/actions/team';
import type { StatusProposal } from '@/types/database.types';

interface Proposal {
  id: string;
  judul: string;
  status_proposal: StatusProposal;
  dokumen_proposal_url: string | null;
  hibah?: {
    nama_hibah: string;
  };
}

interface TeamWithDocs {
  id: string;
  peran: string;
  tim: {
    id: string;
    nama_tim: string;
    ketua: { nama: string };
    proposal?: Proposal[];
  };
}

interface DocumentItem {
  proposalId: string;
  proposalJudul: string;
  timNama: string;
  ketuaNama: string;
  hibahNama: string;
  status: StatusProposal;
  dokumenUrl: string;
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

export default function DokumenPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const { data, error } = await getMyTeams();
    if (data) {
      // Extract documents from all proposals in all teams
      const docs: DocumentItem[] = [];
      
      (data as TeamWithDocs[]).forEach((team) => {
        if (team.tim?.proposal) {
          team.tim.proposal.forEach((proposal) => {
            if (proposal.dokumen_proposal_url) {
              docs.push({
                proposalId: proposal.id,
                proposalJudul: proposal.judul,
                timNama: team.tim.nama_tim,
                ketuaNama: team.tim.ketua?.nama || 'Ketua',
                hibahNama: proposal.hibah?.nama_hibah || 'Program Hibah',
                status: proposal.status_proposal,
                dokumenUrl: proposal.dokumen_proposal_url,
              });
            }
          });
        }
      });
      
      setDocuments(docs);
    }
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dokumen</h1>
        <p className="text-gray-600 mt-1">Akses dokumen proposal dari tim penelitian yang Anda ikuti</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada dokumen tersedia</p>
            <p className="text-sm text-gray-400 mt-1">
              Dokumen proposal dari tim penelitian yang Anda ikuti akan muncul di sini
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dokumen Proposal ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <a
                    key={doc.proposalId}
                    href={doc.dokumenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.proposalJudul}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {doc.timNama}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{doc.hibahNama}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Ketua: {doc.ketuaNama}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className={statusConfig[doc.status].color}>
                        {statusConfig[doc.status].label}
                      </Badge>
                      <Download className="h-5 w-5 text-blue-600" />
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
