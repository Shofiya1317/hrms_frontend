// import EmployeeRegularization from '@/components/EmployeePortal/EmployeeAttendance/EmployeeRegularization';

// export default function Page() {
//   return <EmployeeRegularization />;
// }


import EmployeeRegularization from '@/components/EmployeePortal/EmployeeAttendance/EmployeeRegularization';
import { auth } from '@/lib/auth';
import { getSessions } from '@/lib/service/auth';

export default async function Page() {
  const session = await auth();
  const token = (session as any)?.user?.accessToken;
  const slug = (session as any)?.user?.apiKey;

  const sessionRes = await getSessions(slug, token);
  const employeeId = sessionRes?.data?.user?.employee_id;

  return <EmployeeRegularization employeeId={employeeId} />;
}