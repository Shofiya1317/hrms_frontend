import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import SKUAnalytics from '@/components/SKUAnalytics/SKUAnalyticsDashboardInteractive';

export default async function Page() {
  const session = await auth();
  if (!session) {
    return redirect('/sign_in');
  }
  const token = (session?.user as { accessToken: string })?.accessToken;
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  return (
    <SKUAnalytics apiKey={apiKey} token={token} />
  );
}
