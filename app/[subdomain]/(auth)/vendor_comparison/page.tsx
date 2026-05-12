import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import VendorComparison from '@/components/VendorComparison/VendorComparisonInteractive';

export default async function Page() {
  const session = await auth();
  if (!session) {
    return redirect('/sign_in');
  }
  const token = (session?.user as { accessToken: string })?.accessToken;
  const tenantId = (session?.user as unknown as { apiKey: string })?.apiKey;
  return (
    <VendorComparison tenantId={tenantId} token={token} />
  );
}
