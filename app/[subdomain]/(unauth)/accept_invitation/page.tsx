import AcceptInvitationForm from '@/components/AcceptInvitation/AcceptInvitationForm';
import { IAccount } from '@/lib/interface/IAccount.interface';
import { IUser } from '@/lib/interface/IUser.interface';
import { AuthService } from '@/lib/service';
import { headers } from 'next/headers';

export default async function page({
  searchParams,
}: {
  searchParams: {
    token: string,
    isAccount: string
  }
}) {
  const headersList = headers();
  const host = headersList.get('host');
  const slug = host?.split('.')[0] ?? '';

  // Debug logging
  console.log('Accept Invitation Page - Debug Info:');
  console.log('Token:', searchParams?.token);
  console.log('Slug:', slug);
  console.log('Host:', host);
  console.log('isAccount:', searchParams?.isAccount);

  // Validate required parameters
  if (!searchParams?.token) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <h4 className="text-danger mb-3">Invalid Invitation Link</h4>
        <p className="text-muted">The invitation token is missing.</p>
      </div>
    );
  }

  try {
    const res = searchParams?.isAccount === 'true'
      ? await AuthService.getVerifyAdminToken(searchParams?.token)
      : await AuthService.verifyInvitation(
        searchParams?.token,
        slug,
      );

    console.log('API Response:', res);

    const {
      success,
      error,
      user,
      account,
    } = res?.data as {
      success: boolean;
      error: string[];
      user: IUser;
      account: IAccount;
    };

    console.log('Success:', success);
    console.log('Error:', error);
    console.log('User:', user);

    return (
      <div>
        {success
          ? (
            <AcceptInvitationForm
              slug={slug}
              token={searchParams?.token}
              user={user}
              account={account}
              isAccount={searchParams?.isAccount === 'true'}
            />
          )
          : (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
              <h4 className="text-danger mb-3">Invitation Verification Failed</h4>
              <p className="text-muted">{error?.[0] || 'Invalid or expired invitation token.'}</p>
            </div>
          )}
      </div>
    );
  } catch (err) {
    console.error('Accept Invitation Error:', err);
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <h4 className="text-danger mb-3">Error</h4>
        <p className="text-muted">Failed to verify invitation. Please contact your administrator.</p>
        <pre className="text-start mt-3" style={{ fontSize: '12px', maxWidth: '600px', overflow: 'auto' }}>
          {err instanceof Error ? err.message : String(err)}
        </pre>
      </div>
    );
  }
}
