import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import VendorAnalytics from '@/components/VendorAnalytics/VendorAnalyticsDashboardInteractive';

export default async function Page() {
  const session = await auth();
  if (!session) {
    return redirect('/sign_in');
  }
  const token = (session?.user as { accessToken: string })?.accessToken;
  const apiKey = (session?.user as unknown as { apiKey: string })?.apiKey;
  return (
    <VendorAnalytics apiKey={apiKey} token={token} />
  );
}
