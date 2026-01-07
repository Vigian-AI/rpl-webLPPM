import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getUserProfile } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getUserProfile();

  if (!userProfile || userProfile.user.role !== 'admin') {
    redirect('/login');
  }

  const userName = userProfile.profile?.nama || 'Admin';

  return (
    <DashboardLayout userRole="admin" userName={userName}>
      {children}
    </DashboardLayout>
  );
}
