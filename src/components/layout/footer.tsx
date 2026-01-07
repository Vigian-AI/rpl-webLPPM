import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Logo and University Name */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-xl">UPB</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-yellow-400">UNIVERSITAS</h3>
              <h3 className="font-bold text-lg text-yellow-400">PUTRA BANGSA</h3>
              <h3 className="font-bold text-lg text-yellow-400">KEBUMEN</h3>
              <p className="text-sm text-blue-200 mt-1">Universitas Putra Bangsa</p>
              <p className="text-sm text-blue-200">Kebumen</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <p className="text-sm text-blue-100">
              Jalan Ronggowarsito No 18 Pejagoan,
            </p>
            <p className="text-sm text-blue-100">
              Kebumen - Jawa Tengah. Telpon/ WA
            </p>
            <p className="text-sm text-blue-100">
              087732746000. Email:
            </p>
            <Link 
              href="mailto:upb@universitasputrabangsa.ac.id" 
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              upb@universitasputrabangsa.ac.id
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
