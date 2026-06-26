import EmployeeDashboard from '@/components/EmployeePortal/EmployeeDashboard';
import { auth } from '@/lib/auth';
import { getSessions } from '@/lib/service/auth';
import { getEmployeeById } from '@/lib/service/employee';
import { getCurrentUser } from '@/lib/service/user';

export default async function Page() {
  const session = await auth();
  const token = (session as any)?.user?.accessToken;
  const slug = (session as any)?.user?.apiKey;
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;

  const [sessionRes, meRes] = await Promise.all([
    getSessions(slug, token),
    getCurrentUser(slug, token),
  ]);

  const employeeId = sessionRes?.data?.user?.employee_id;
  const employeeRes = employeeId
    ? await getEmployeeById(employeeId, slug, token)
    : null;
  const employee = employeeRes?.data?.data ?? null;
  const reportingManager = (meRes?.data as any)?.user?.reporting_manager ?? null;

  return <EmployeeDashboard employee={employee} apiKey={apiKey} token={token} reportingManager={reportingManager} />;
}
