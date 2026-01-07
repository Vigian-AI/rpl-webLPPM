import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Download, BookOpen, HelpCircle } from 'lucide-react';

const quickLinks = [
  {
    icon: FileText,
    title: 'Ajukan Proposal',
    description: 'Mulai pengajuan proposal penelitian atau pengabdian',
    href: '/login',
    color: 'bg-blue-500',
  },
  {
    icon: Download,
    title: 'Unduh Formulir',
    description: 'Template dan formulir yang diperlukan',
    href: '/unduhan',
    color: 'bg-green-500',
  },
  {
    icon: BookOpen,
    title: 'Panduan',
    description: 'Petunjuk penggunaan sistem LPPM',
    href: '/panduan',
    color: 'bg-purple-500',
  },
  {
    icon: HelpCircle,
    title: 'FAQ',
    description: 'Pertanyaan yang sering diajukan',
    href: '/faq',
    color: 'bg-orange-500',
  },
];

export function QuickLinksSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Akses Cepat
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Akses cepat ke fitur-fitur utama sistem LPPM.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="group p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-lg ${link.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-blue-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-gray-600 text-sm">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
