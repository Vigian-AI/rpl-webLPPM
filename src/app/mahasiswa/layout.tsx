import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getUserProfile } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getUserProfile();

  if (!userProfile || userProfile.user.role !== 'mahasiswa') {
    redirect('/login');
  }

  const userName = userProfile.profile?.nama || 'Mahasiswa';

  return (
    <DashboardLayout userRole="mahasiswa" userName={userName}>
      {children}
    </DashboardLayout>
  );
}
