import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Sample data - in production this would come from Supabase
const researchInfo = [
  { id: 1, title: 'INFO PELAKSANAAN RISET DAN PENGABDIAN KEPADA MASYARAKAT' },
  { id: 2, title: 'INFO PELAKSANAAN RISET DAN PENGABDIAN KEPADA MASYARAKAT' },
  { id: 3, title: 'INFO PELAKSANAAN RISET DAN PENGABDIAN KEPADA MASYARAKAT' },
  { id: 4, title: 'INFO PELAKSANAAN RISET DAN PENGABDIAN KEPADA MASYARAKAT' },
  { id: 5, title: 'INFO PELAKSANAAN RISET DAN PENGABDIAN KEPADA MASYARAKAT' },
  { id: 6, title: 'INFO PELAKSANAAN RISET DAN PENGABDIAN KEPADA MASYARAKAT' },
  { id: 7, title: 'INFO PELAKSANAAN RISET DAN PENGABDIAN KEPADA MASYARAKAT' },
  { id: 8, title: 'INFO PELAKSANAAN RISET DAN PENGABDIAN KEPADA MASYARAKAT' },
];

export function InfoSection() {
  return (
    <section className="py-12 bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
            Informasi
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {researchInfo.map((info) => (
            <div 
              key={info.id} 
              className="bg-blue-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Yellow header bar */}
              <div className="bg-yellow-400 h-2"></div>
              
              {/* Content */}
              <div className="p-4 md:p-5">
                <h3 className="text-yellow-400 font-bold text-sm md:text-base leading-tight mb-4">
                  {info.title}
                </h3>
                
                {/* Button */}
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-auto cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Selengkapnya
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8">
          <Button 
            className="bg-blue-900 hover:bg-blue-950 text-white font-semibold px-8 cursor-pointer"
          >
            Lihat Informasi Lainnya
          </Button>
        </div>
      </div>
    </section>
  );
}