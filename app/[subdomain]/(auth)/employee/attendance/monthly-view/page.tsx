import MonthlyView from '@/components/EmployeePortal/EmployeeAttendance/MonthlyView';
import { auth } from '@/lib/auth';
import { getSessions } from '@/lib/service/auth';

export default async function Page() {
  const session = await auth();
  const token = (session as any)?.user?.accessToken;
  const apiKey = (session as any)?.user?.apiKey;

  const sessionRes = await getSessions(apiKey, token);
  const employeeId = sessionRes?.data?.user?.employee_id;

  return <MonthlyView employeeId={employeeId} apiKey={apiKey} token={token} />;
}
