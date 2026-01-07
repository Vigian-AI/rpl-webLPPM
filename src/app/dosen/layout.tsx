import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getUserProfile } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getUserProfile();

  if (!userProfile || userProfile.user.role !== 'dosen') {
    redirect('/login');
  }

  const userName = userProfile.profile?.nama || 'Dosen';

  return (
    <DashboardLayout userRole="dosen" userName={userName}>
      {children}
    </DashboardLayout>
  );
}
