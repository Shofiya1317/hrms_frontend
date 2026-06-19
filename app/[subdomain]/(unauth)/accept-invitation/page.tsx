import AcceptInvitationForm from '@/components/AcceptInvitation/AcceptInvitationForm';
import { IAccount } from '@/lib/interface/IAccount.interface';
import { IUser } from '@/lib/interface/IUser.interface';
import { AuthService } from '@/lib/service';
import { headers } from 'next/headers';

export default async function page({
  searchParams,
}: {
  searchParams: {
    token: string;
    slug?: string;
    isAccount?: string;
  };
}) {
  const headersList = headers();
  const host = headersList.get('host');
  const slug = searchParams?.slug || host?.split('.')[0] || '';

  if (!searchParams?.token) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <h4 className="text-danger mb-3">Invalid Invitation Link</h4>
        <p className="text-muted">The invitation token is missing from the URL.</p>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <h4 className="text-danger mb-3">Invalid Tenant</h4>
        <p className="text-muted">
          The tenant information is missing. Please use the invitation link from your email.
        </p>
      </div>
    );
  }

  try {
    const isAccount = searchParams?.isAccount === 'true';

    if (isAccount) {
      const res = await AuthService.verifyAccountInvitation(searchParams.token, slug);
      const { success, error, user, account } = (res?.data || {}) as {
        success: boolean;
        error?: string[];
        user: IUser;
        account: IAccount;
      };

      if (!success) {
        return (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
            <h4 className="text-danger mb-3">Invalid Invitation</h4>
            <p className="text-muted">{error?.[0] || 'This invitation link is invalid or has expired.'}</p>
          </div>
        );
      }

      return (
        <AcceptInvitationForm
          slug={slug}
          token={searchParams.token}
          user={user || ({} as IUser)}
          account={account}
          isAccount={true}
        />
      );
    }

    const res = await AuthService.verifyInvitation(searchParams.token, slug);
    const responseData = res?.data as any;
    
    if (responseData?.success === false || res?.status === 400 || res?.status === 404) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
          <h4 className="text-danger mb-3">Invalid Invitation</h4>
          <p className="text-muted">
            {responseData?.error?.[0] || responseData?.message || 'This invitation link is invalid or has expired.'}
          </p>
        </div>
      );
    }

    const user = responseData?.user || responseData?.employee || responseData?.data || {};
    const account = responseData?.account || responseData?.tenant || user?.account || {};

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AcceptInvitationForm
          slug={slug}
          token={searchParams.token}
          user={user as IUser}
          account={account as IAccount}
          isAccount={false}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <h4 className="text-danger mb-3">Error Loading Invitation</h4>
        <p className="text-muted">Unable to verify your invitation. Please try again or contact your administrator.</p>
      </div>
    );
  }
}
