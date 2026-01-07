import { redirect } from 'next/navigation';

// Registration is disabled for public users
// Only admin can create new accounts at /admin/users
export default function RegisterPage() {
  redirect('/login');
}
