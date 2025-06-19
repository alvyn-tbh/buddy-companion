import { redirect } from 'next/navigation';

export default function SupabaseRedirect() {
  redirect('/admin/storage');
}
