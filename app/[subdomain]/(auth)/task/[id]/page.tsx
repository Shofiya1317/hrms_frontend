import TaskDataEntryForm from '@/components/TaskDataEntryForm/TaskDataEntryForm';
import { auth } from '@/lib/auth';
import { ITask } from '@/lib/interface/ITask.interface';
import { IUser } from '@/lib/interface/IUser.interface';
import { TaskService, UserService } from '@/lib/service';
import { redirect } from 'next/navigation';

export default async function page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const session = await auth();
  if (!session) {
    return redirect('/sign_in');
  }
  const token = (session?.user as { accessToken: string })?.accessToken;
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;

  const userResponse = await UserService.getCurrentUser(apiKey, token);
  const { success } = userResponse?.data as {
    user: IUser;
    success: boolean;
  };

  if (!success) {
    return redirect('/sign_in');
  }

  const res = await TaskService.getTaskById(params?.id, apiKey, token);

  const task = res?.data as ITask;

  return (
    <TaskDataEntryForm
      apiKey={apiKey}
      token={token}
      currentTask={task}
    />
  );
}
