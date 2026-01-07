'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <span className="text-blue-900 font-bold text-sm">UPB</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-700">UNIVERSITAS</p>
            <p className="text-xs font-bold text-blue-900">PUTRA BANGSA</p>
            <p className="text-xs font-medium text-gray-700">KEBUMEN</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <Link
            href="/"
            className="text-sm font-bold text-yellow-500 hover:text-yellow-600 transition-colors uppercase tracking-wide"
          >
            Beranda
          </Link>
        </nav>

        {/* Desktop Login Button */}
        <div className="hidden md:flex items-center">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-semibold uppercase">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-8">
              <Link
                href="/"
                className="text-lg font-bold text-yellow-500 hover:text-yellow-600 transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                BERANDA
              </Link>
              <div className="pt-4 border-t">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Login
                  </Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
