import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar } from 'lucide-react';

// Sample data - in production this would come from Supabase
const announcements = [
  {
    id: 1,
    title: 'Pengumuman Penerimaan pendanaan Program Penelitian dan Pengabdian Masyarakat Tahun Anggaran 2025',
    date: '10 Desember 2025',
  },
  {
    id: 2,
    title: 'Pengumuman Penerimaan pendanaan Program Penelitian dan Pengabdian Masyarakat Tahun Anggaran 2025',
    date: '10 Desember 2025',
  },
  {
    id: 3,
    title: 'Pengumuman Penerimaan pendanaan Program Penelitian dan Pengabdian Masyarakat Tahun Anggaran 2025',
    date: '10 Desember 2025',
  },
  {
    id: 4,
    title: 'Pengumuman Penerimaan pendanaan Program Penelitian dan Pengabdian Masyarakat Tahun Anggaran 2025',
    date: '10 Desember 2025',
  },
  {
    id: 5,
    title: 'Pengumuman Penerimaan pendanaan Program Penelitian dan Pengabdian Masyarakat Tahun Anggaran 2025',
    date: '10 Desember 2025',
  },
  {
    id: 6,
    title: 'Pengumuman Penerimaan pendanaan Program Penelitian dan Pengabdian Masyarakat Tahun Anggaran 2025',
    date: '10 Desember 2025',
  },
  {
    id: 7,
    title: 'Pengumuman Penerimaan pendanaan Program Penelitian dan Pengabdian Masyarakat Tahun Anggaran 2025',
    date: '10 Desember 2025',
  },
  {
    id: 8,
    title: 'Pengumuman Penerimaan pendanaan Program Penelitian dan Pengabdian Masyarakat Tahun Anggaran 2025',
    date: '10 Desember 2025',
  },
];

export function AnnouncementSection() {
  return (
    <section className="py-12 bg-gradient-to-b from-gray-200 to-gray-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
            Pengumuman
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Content */}
              <div className="p-4 md:p-5 flex-grow">
                <h3 className="text-blue-900 font-semibold text-sm md:text-base leading-tight mb-4">
                  {announcement.title}
                </h3>
              </div>
              
              {/* Footer with button and date */}
              <div className="p-4 pt-0">
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-auto cursor-pointer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Selengkapnya
                  </Button>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {announcement.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8">
          <Button 
            className="bg-blue-900 hover:bg-blue-950 text-white font-semibold px-8 cursor-pointer"
          >
            Lihat Pengumuman Lainnya
          </Button>
        </div>
      </div>
    </section>
  );
}
