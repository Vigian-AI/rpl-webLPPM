import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#03045E] text-white border-t-4 border-[#F59E0B]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Logo and University Name */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-[#F59E0B] rounded-full flex items-center justify-center overflow-hidden">
              <img src="/logoUPB.svg" alt="UPB Logo" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#F59E0B]">UNIVERSITAS</h3>
              <h3 className="font-bold text-lg text-[#F59E0B]">PUTRA BANGSA</h3>
              <h3 className="font-bold text-lg text-[#F59E0B]">KEBUMEN</h3>
              <p className="text-sm text-white/70 mt-1">Universitas Putra Bangsa</p>
              <p className="text-sm text-white/70">Kebumen</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <p className="text-sm text-white/90">
              Jalan Ronggowarsito No 18 Pejagoan,
            </p>
            <p className="text-sm text-white/90">
              Kebumen - Jawa Tengah. Telpon/ WA
            </p>
            <p className="text-sm text-white/90">
              087732746000. Email:
            </p>
            <Link 
              href="mailto:upb@universitasputrabangsa.ac.id" 
              className="text-sm text-[#F59E0B] hover:text-[#D97706] transition-colors"
            >
              upb@universitasputrabangsa.ac.id
            </Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-white/60">
            Copyright © 2024 UNIVERSITAS PUTRA BANGSA KEBUMEN All Right Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
