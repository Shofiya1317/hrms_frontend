import { auth } from '@/lib/auth';
import { IUser } from '@/lib/interface/IUser.interface';
import { UserService } from '@/lib/service';
import { redirect } from 'next/navigation';
import NotificationPage from '@/components/Notification/Notification';

export default async function page() {
  const session = await auth();
  if (!session) return redirect('/sign_in');

  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  const accessToken = (session?.user as unknown as { accessToken: string })?.accessToken;

  const userRes = await UserService.getCurrentUser(apiKey, accessToken);
  const { user } = userRes?.data as { user: IUser; success: boolean };

  return (
    <NotificationPage
      userRole={user?.role?.toLowerCase() === 'admin' ? 'admin' : 'employee'}
      userName={`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}
    />
  );
}
