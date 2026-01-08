'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/actions/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({ username, password });
      if (result?.error) {
        setError(result.error);
      } else if (result?.success && result?.redirectPath) {
        router.push(result.redirectPath);
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center">
            <img src="/logoUPB.svg" alt="UPB Logo" className="h-20 w-20 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#03045E]">Masuk ke LPPM</CardTitle>
          <CardDescription className="text-[#03045E]/70">
            Lembaga Penelitian dan Pengabdian Masyarakat
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#03045E]">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-[#03045E]/20 focus:border-[#F59E0B]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#03045E]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#03045E]/20 focus:border-[#F59E0B]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-[#03045E] hover:bg-[#020338] text-white font-semibold" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
            <Link href="/" className="text-sm text-center text-[#03045E]/70 hover:text-[#03045E]">
              ← Kembali ke Beranda
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
