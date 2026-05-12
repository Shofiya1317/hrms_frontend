// import { auth } from '@/lib/auth';
// import { redirect } from 'next/navigation';
// import React from 'react';
// import TaskList from '@/components/TaskList/TaskList';
// import { TaskService } from '@/lib/service';

// export default async function Page() {
//   const session = await auth();
//   if (!session || !session.user?.id) {
//     return redirect('/sign_in');
//   }

//   const token = (session.user as { accessToken: string }).accessToken;
//   const { apiKey } = (session.user as { apiKey: string });
//   const userId = session.user.id; // now guaranteed string

//   const response = await TaskService.getTaskByUserId(userId, apiKey, token);

//   const tasks = response?.data?.tasks || [];

//   return <TaskList taskList={tasks} />;
// }
