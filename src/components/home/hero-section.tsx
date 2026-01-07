import { Globe, Phone, Mail, Building2 } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 border-2 border-white/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 border-2 border-white/20 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              LEMBAGA PENELITIAN<br />
              DAN PENGABDIAN<br />
              MASYARAKAT{' '}
              <span className="text-yellow-400">(LPPM)</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-white/90">
              UNIVERSITAS PUTRA BANGSA KEBUMEN
            </h2>
            
            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
                <span>lppm.upb.ac.id</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <span>0877-3274-6000</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <span>upb@universitasputrabangsa.ac.id</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative flex justify-center md:justify-end">
            <div className="relative">
              {/* Yellow decorative circle behind image */}
              <div className="absolute -top-4 -right-4 w-full h-full rounded-full bg-yellow-400/30"></div>
              
              {/* Main image container */}
              <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl bg-blue-800 flex items-center justify-center">
                {/* Placeholder building icon - replace with actual image */}
                <Building2 className="w-32 h-32 text-blue-600" />
                {/* Uncomment below when you have the actual image */}
                {/* <Image
                  src="/gedung-upb.jpg"
                  alt="Gedung Universitas Putra Bangsa"
                  fill
                  className="object-cover"
                  priority
                /> */}
              </div>
              
              {/* University logo overlay */}
              <div className="absolute -top-2 right-1/2 translate-x-1/2 md:right-0 md:translate-x-0 bg-white rounded-lg p-2 shadow-lg">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-lg md:text-xl">UPB</span>
                </div>
                <p className="text-center text-xs font-bold text-blue-900 mt-1">UNIVERSITAS PUTRA BANGSA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
