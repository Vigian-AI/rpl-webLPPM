'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Akses Ditolak</CardTitle>
          <CardDescription>
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Halaman yang Anda coba akses memerlukan level akses yang berbeda.
            Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="default" className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" onClick={() => window.history.back()}>
              <span className="cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
