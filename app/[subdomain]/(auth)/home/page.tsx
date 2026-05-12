import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TaskService, UserService } from '@/lib/service';
import { IUser } from '@/lib/interface/IUser.interface';
import DashboardOverviewInteractive from '@/components/AdminCockpit/DashboardOverviewInteractive';
import VendorCockpitInteractive from '@/components/VendorCockpit/VendorCockpitInteractive';

export default async function DashboardOverviewPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return redirect('/sign_in');
  }

  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  const accessToken = (session?.user as unknown as { accessToken: string })
    ?.accessToken;
  const userRes = await UserService.getCurrentUser(apiKey, accessToken);

  const { user } = userRes?.data as {
    user: IUser;
    success: boolean;
  };

  const token = (session.user as { accessToken: string }).accessToken;
  // const { apiKey } = session.user as { apiKey: string };
  const userRole = (session.user as { role: string }).role;
  const userId = session.user.id;

  const response = await TaskService.getTaskByUserId(
    userId,
    apiKey,
    {
      page: 1,
      limit: 100,
      // search: "search",
      // status: "status",
      // vendorId: "vendorId",
      // productId: "productId",
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
    token,
  );
  const tasks = response?.data?.tasks || [];

  const cockpitResponse = await TaskService.getVendorCockpit(apiKey, token);
  const cockpitData = cockpitResponse?.data || {};

  // Render based on role with props
  switch (userRole) {
    case 'VENDOR':
      return (
        <VendorCockpitInteractive
          tasks={tasks}
          apiKey={apiKey}
          token={token}
          cockpitData={cockpitData}
          user={user?.account}
        />
      );
    case 'ADMIN':
      return <DashboardOverviewInteractive />;
    default:
      return null;
  }
}
