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
    slug?: string; // Added: slug can come from query parameter
    isAccount?: string;
  };
}) {
  const headersList = headers();
  const host = headersList.get('host');
  
  // Get slug from either query parameter OR subdomain
  // Priority: query parameter > subdomain
  const slug = searchParams?.slug || host?.split('.')[0] || '';

  console.log('=== Accept Invitation Page ===');
  console.log('Token:', searchParams?.token);
  console.log('Slug (from query):', searchParams?.slug);
  console.log('Slug (from subdomain):', host?.split('.')[0]);
  console.log('Final Slug:', slug);
  console.log('Host:', host);
  console.log('isAccount:', searchParams?.isAccount);

  // Validate required parameters
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

  // Verify the invitation token and get employee details
  try {
    const isAccount = searchParams?.isAccount === 'true';

    if (isAccount) {
      // Account invitation (tenant owner)
      const res = await AuthService.verifyAccountInvitation(searchParams.token, slug);
      console.log('Account Verification Response:', res);

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

    // Regular employee invitation
    console.log(`Calling verify API: GET /v1/auth/${searchParams.token}/verify`);
    console.log(`With header: x-tenant-id: ${slug}`);
    
    const res = await AuthService.verifyInvitation(searchParams.token, slug);
    console.log('Employee Verification Response:', res);
    console.log('Response Status:', res?.status);
    console.log('Response Data:', JSON.stringify(res?.data, null, 2));

    // Handle different response structures
    const responseData = res?.data as any;
    
    // Check if it's a success response
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

    // Extract user and account data from response
    // Try different possible response structures
    const user = responseData?.user || responseData?.employee || responseData?.data || {};
    const account = responseData?.account || responseData?.tenant || {};

    console.log('Extracted User:', user);
    console.log('Extracted Account:', account);

    return (
      <AcceptInvitationForm
        slug={slug}
        token={searchParams.token}
        user={user as IUser}
        account={account as IAccount}
        isAccount={false}
      />
    );
  } catch (error) {
    console.error('=== Accept Invitation Error ===');
    console.error(error);

    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <h4 className="text-danger mb-3">Error Loading Invitation</h4>
        <p className="text-muted">Unable to verify your invitation. Please try again or contact your administrator.</p>
        <details className="mt-3" style={{ maxWidth: '600px' }}>
          <summary className="text-muted" style={{ cursor: 'pointer' }}>Error Details</summary>
          <pre className="text-start mt-2 p-3 bg-light rounded" style={{ fontSize: '12px', overflow: 'auto' }}>
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </details>
      </div>
    );
  }
}

