import AttendanceLeave from '@/components/AdminPortal/AdminAttendance/AttendanceLeave/AttendanceLeave';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function page() {
  const session = await auth();

  if (!session) {
    return redirect('/sign_in');
  }

  const token = (session?.user as { accessToken: string })?.accessToken;
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  return <AttendanceLeave apiKey={apiKey} token={token} />;
}
