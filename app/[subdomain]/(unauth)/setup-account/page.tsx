import AcceptInvitationForm from '@/components/AcceptInvitation/AcceptInvitationForm';
import { IAccount } from '@/lib/interface/IAccount.interface';
import { IUser } from '@/lib/interface/IUser.interface';
import { AuthService } from '@/lib/service';
import { headers } from 'next/headers';

export default async function page({
  searchParams,
}: {
  searchParams: { token: string; isAccount?: string };
}) {
  const headersList = headers();
  const host = headersList.get('host');
  const slug = host?.split('.')[0] ?? '';

  if (!searchParams?.token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h4 className="text-red-500 text-lg font-semibold mb-2">Invalid Invitation Link</h4>
        <p className="text-gray-500">The invitation token is missing.</p>
      </div>
    );
  }

  try {
    const res = await AuthService.verifyInvitation(searchParams.token, slug);
    const responseData = res?.data as any;

    if (!responseData?.success || res?.status === 400 || res?.status === 404) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h4 className="text-red-500 text-lg font-semibold mb-2">Invalid Invitation</h4>
          <p className="text-gray-500">
            {responseData?.error?.[0] || responseData?.message || 'This invitation link is invalid or has expired.'}
          </p>
        </div>
      );
    }

    const user = responseData?.user || responseData?.employee || responseData?.data?.user || responseData?.data || {};
    const account = responseData?.account || responseData?.tenant || responseData?.data?.account || {};

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AcceptInvitationForm
          slug={slug}
          token={searchParams.token}
          user={user as IUser}
          account={account as IAccount}
          isAccount={searchParams?.isAccount === 'true'}
        />
      </div>
    );
  } catch (err) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h4 className="text-red-500 text-lg font-semibold mb-2">Error</h4>
        <p className="text-gray-500">Failed to verify invitation. Please contact your administrator.</p>
      </div>
    );
  }
}
