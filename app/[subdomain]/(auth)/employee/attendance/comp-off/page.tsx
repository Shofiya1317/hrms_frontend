import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSessions } from '@/lib/service/auth';
import CompOff from '@/components/EmployeePortal/EmployeeAttendance/CompOff';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const token = (session as any)?.user?.accessToken;
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  const slug = (session as any)?.user?.apiKey;

  const sessionRes = await getSessions(slug, token);
  const employeeId = sessionRes?.data?.user?.employee_id;

  if (!employeeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Employee ID not found in session</p>
        </div>
      </div>
    );
  }

  return (
    <CompOff 
      apiKey={apiKey} 
      token={token} 
      employeeId={employeeId}
    />
  );
}