import { auth } from '@/lib/auth';
import { getEmployeeMe } from '@/lib/service/employee';
import EmployeeProfileEdit from '@/components/EmployeePortal/EmployeeProfile/EmployeeProfileEdit';

export default async function Page() {
  const session = await auth();
  const token = (session as any)?.user?.accessToken;
  const slug = (session as any)?.user?.apiKey;

  const res = await getEmployeeMe(slug, token).catch(() => null);
  const employee = res?.data?.data ?? null;

  return <EmployeeProfileEdit employee={employee} token={token} slug={slug} />;
}
