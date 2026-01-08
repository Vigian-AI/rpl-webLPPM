'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#03045E] shadow-sm border-b-2 border-[#F59E0B]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 flex items-center justify-center">
            <img src="/logoUPB.svg" alt="UPB Logo" className="h-10 w-10 object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-white">LPPM PUTRA</p>
            <p className="text-xs font-bold text-white">BANGSA</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <Link
            href="/"
            className="text-sm font-bold text-[#F59E0B] hover:text-[#D97706] transition-colors uppercase tracking-wide"
          >
            Beranda
          </Link>
        </nav>

        {/* Desktop Login Button */}
        <div className="hidden md:flex items-center">
          <Link href="/login">
            <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-[#03045E] font-semibold uppercase">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-8">
              <Link
                href="/"
                className="text-lg font-bold text-[#F59E0B] hover:text-[#D97706] transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                BERANDA
              </Link>
              <div className="pt-4 border-t">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#03045E] hover:bg-[#020338] text-white font-semibold">
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
