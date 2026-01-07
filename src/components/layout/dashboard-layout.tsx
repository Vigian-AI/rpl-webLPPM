'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/actions/auth';
import {
  LayoutDashboard,
  FileText,
  Users,
  Menu,
  LogOut,
  User,
  Gift,
  Wallet,
  Mail,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  userName?: string;
}

const getNavLinks = (role: 'admin' | 'dosen' | 'mahasiswa') => {
  if (role === 'admin') {
    return [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/hibah', label: 'Kelola Hibah', icon: Gift },
      { href: '/admin/proposal', label: 'Review Proposal', icon: FileText },
      { href: '/admin/pencairan', label: 'Pencairan Dana', icon: Wallet },
      { href: '/admin/users', label: 'Pengguna', icon: Users },
    ];
  } else if (role === 'dosen') {
    return [
      { href: '/dosen', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dosen/proposal', label: 'Proposal Saya', icon: FileText },
      { href: '/dosen/proposal/new', label: 'Ajukan Proposal', icon: FileText },
      { href: '/dosen/tim', label: 'Tim Penelitian', icon: Users },
      { href: '/dosen/pencairan', label: 'Pencairan Dana', icon: Wallet },
      { href: '/dosen/undangan', label: 'Undangan Tim', icon: Mail },
      { href: '/dosen/profil', label: 'Profil', icon: User },
    ];
  } else {
    return [
      { href: '/mahasiswa', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/mahasiswa/undangan', label: 'Undangan Tim', icon: Mail },
      { href: '/mahasiswa/tim', label: 'Tim Saya', icon: Users },
      { href: '/mahasiswa/proposal', label: 'Proposal Tim', icon: FileText },
      { href: '/mahasiswa/pencairan', label: 'Pencairan Dana', icon: Wallet },
      { href: '/mahasiswa/dokumen', label: 'Dokumen', icon: FileText },
      { href: '/mahasiswa/profil', label: 'Profil', icon: User },
    ];
  }
};

const getRoleLabel = (role: 'admin' | 'dosen' | 'mahasiswa') => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'dosen':
      return 'Dosen';
    case 'mahasiswa':
      return 'Mahasiswa';
  }
};

const getRoleColor = (role: 'admin' | 'dosen' | 'mahasiswa') => {
  switch (role) {
    case 'admin':
      return 'bg-red-600';
    case 'dosen':
      return 'bg-blue-600';
    case 'mahasiswa':
      return 'bg-green-600';
  }
};

export function DashboardLayout({ children, userRole, userName = 'User' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const navLinks = getNavLinks(userRole);

  const handleLogout = async () => {
    await logout();
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <Link href={`/${userRole}`} className="flex items-center space-x-3">
          <div className={`h-10 w-10 rounded-full ${getRoleColor(userRole)} flex items-center justify-center`}>
            <span className="text-lg font-bold text-white">LP</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-900">LPPM</h1>
            <p className="text-xs text-gray-500">{getRoleLabel(userRole)}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 px-3 py-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={getRoleColor(userRole)}>
              {userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500">{getRoleLabel(userRole)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Page Title - visible on desktop */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">
                {navLinks.find((link) => link.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={getRoleColor(userRole)}>
                        {userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${userRole}/profil`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
